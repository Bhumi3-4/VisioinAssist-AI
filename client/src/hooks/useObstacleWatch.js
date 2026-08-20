import { useCallback, useEffect, useRef, useState } from 'react'
import { assessObstacleRisk } from '../utils/obstacleDetection'
import { sampleCenterFrame, frameMotionEnergy, rollingBaseline } from '../utils/proximitySensor'
import { playAlertBeep } from '../utils/alertSound'
import { speak } from '../utils/speech'

const CHECK_INTERVAL_MS = 800
const ALERT_COOLDOWN_MS = 4000

// Fallback (classification-free) proximity tuning.
// BASELINE_HISTORY_SIZE ticks are used to learn "normal" noise for
// THIS camera/lighting before any alert can fire at all -- this is
// what fixes the constant false triggers: no fixed magic number, the
// threshold adapts to the actual environment.
const BASELINE_HISTORY_SIZE = 6
const SPIKE_MULTIPLIER = 1.8 // current reading must be this many times the recent (quiet-only) baseline
const MIN_ABSOLUTE_FLOOR = 12 // and still be at least this much change, even if baseline is near-zero
const SUSTAINED_TICKS_REQUIRED = 2 // must stay elevated this many ticks in a row, not one spike

export function useObstacleWatch({ videoRef, canvasRef, detect, enabled }) {
  const [lastAlert, setLastAlert] = useState(null)
  const previousRef = useRef(null)
  const lastAlertTimeRef = useRef(0)
  const intervalRef = useRef(null)

  const prevSampleRef = useRef(null)
  const motionHistoryRef = useRef([])
  const sustainedHighRef = useRef(0)

  const tick = useCallback(async () => {
    const video = videoRef.current
    if (!video || !video.videoWidth) return

    const predictions = await detect(video)
    const result = assessObstacleRisk(predictions, video.videoWidth, video.videoHeight, previousRef.current)
    if (result.label) previousRef.current = { class: result.label, areaRatio: result.areaRatio }

    // --- Fallback: classification-free proximity check ---
    let genericRisk = false
    const currentSample = sampleCenterFrame(video)
    const motion = frameMotionEnergy(prevSampleRef.current, currentSample)
    const baseline = rollingBaseline(motionHistoryRef.current)
    const haveEnoughHistory = motionHistoryRef.current.length >= BASELINE_HISTORY_SIZE

    if (result.risk === 'none') {
      const isSpike = haveEnoughHistory && motion > baseline * SPIKE_MULTIPLIER && motion > MIN_ABSOLUTE_FLOOR
      sustainedHighRef.current = isSpike ? sustainedHighRef.current + 1 : 0
      genericRisk = sustainedHighRef.current >= SUSTAINED_TICKS_REQUIRED

      // Only feed QUIET readings into the baseline -- if we included
      // readings during an actual approach, the baseline would rise
      // right along with it and the spike would never register as
      // "above normal". This keeps the baseline representing what
      // normal/no-obstacle actually looks like for this camera.
      if (!isSpike) {
        motionHistoryRef.current.push(motion)
        if (motionHistoryRef.current.length > BASELINE_HISTORY_SIZE) motionHistoryRef.current.shift()
      }
    } else {
      sustainedHighRef.current = 0 // named-object path handled it, reset fallback counter
    }

    prevSampleRef.current = currentSample

    const now = Date.now()
    const shouldAlert = (result.risk !== 'none' || genericRisk) && now - lastAlertTimeRef.current > ALERT_COOLDOWN_MS

    if (shouldAlert) {
      lastAlertTimeRef.current = now
      playAlertBeep()
      let message
      if (result.risk === 'close') message = `Careful, ${result.label} very close ahead.`
      else if (result.risk === 'approaching') message = `${result.label} approaching.`
      else message = 'Stop. Something is very close ahead.'
      speak(message, { interrupt: true })
      setLastAlert(message)
    }

    const canvas = canvasRef.current
    if (canvas) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      if (result.risk !== 'none' && result.box) {
        const [x, y, w, h] = result.box
        ctx.strokeStyle = '#FF5C4D'
        ctx.lineWidth = 4
        ctx.strokeRect(x, y, w, h)
      } else if (genericRisk) {
        ctx.strokeStyle = '#FF5C4D'
        ctx.lineWidth = 10
        ctx.strokeRect(5, 5, canvas.width - 10, canvas.height - 10)
      }
    }
  }, [videoRef, canvasRef, detect])

  useEffect(() => {
    if (!enabled) {
      clearInterval(intervalRef.current)
      previousRef.current = null
      prevSampleRef.current = null
      motionHistoryRef.current = []
      sustainedHighRef.current = 0
      return
    }
    intervalRef.current = setInterval(tick, CHECK_INTERVAL_MS)
    return () => clearInterval(intervalRef.current)
  }, [enabled, tick])

  return { lastAlert }
}
