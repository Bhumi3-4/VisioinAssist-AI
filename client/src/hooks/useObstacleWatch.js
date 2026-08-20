import { useCallback, useEffect, useRef, useState } from 'react'
import { assessObstacleRisk } from '../utils/obstacleDetection'
import { sampleCenterFrame, frameMotionEnergy } from '../utils/proximitySensor'
import { playAlertBeep } from '../utils/alertSound'
import { speak } from '../utils/speech'

const CHECK_INTERVAL_MS = 800
const ALERT_COOLDOWN_MS = 4000

// Fallback (classification-free) proximity tuning -- these are starting
// values based on typical webcam noise levels, not lab-measured. If
// this fires too often in normal use, raise MOTION_THRESHOLD; if it
// misses real close obstacles, lower it slightly.
const MOTION_THRESHOLD = 18 // mean grayscale diff (0-255 scale) counted as "significant change"
const SUSTAINED_TICKS_REQUIRED = 2 // must stay elevated this many ticks in a row, not just one spike

export function useObstacleWatch({ videoRef, canvasRef, detect, enabled }) {
  const [lastAlert, setLastAlert] = useState(null)
  const previousRef = useRef(null)
  const lastAlertTimeRef = useRef(0)
  const intervalRef = useRef(null)

  const prevSampleRef = useRef(null)
  const sustainedHighRef = useRef(0)

  const tick = useCallback(async () => {
    const video = videoRef.current
    if (!video || !video.videoWidth) return

    const predictions = await detect(video)
    const result = assessObstacleRisk(predictions, video.videoWidth, video.videoHeight, previousRef.current)
    if (result.label) previousRef.current = { class: result.label, areaRatio: result.areaRatio }

    // --- Fallback: classification-free proximity check ---
    // Only runs its own alert logic when COCO-SSD didn't already find a
    // named risky object this tick -- named objects take priority since
    // "chair very close" is more useful than a generic "stop".
    let genericRisk = false
    const currentSample = sampleCenterFrame(video)
    const motion = frameMotionEnergy(prevSampleRef.current, currentSample)
    prevSampleRef.current = currentSample

    if (result.risk === 'none') {
      if (motion >= MOTION_THRESHOLD) {
        sustainedHighRef.current += 1
      } else {
        sustainedHighRef.current = 0
      }
      genericRisk = sustainedHighRef.current >= SUSTAINED_TICKS_REQUIRED
    } else {
      sustainedHighRef.current = 0 // named-object path handled it, reset fallback counter
    }

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
        // No bounding box for an unclassified obstacle -- draw a full-frame
        // warning vignette instead, so low-vision users get a visual cue too.
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
      sustainedHighRef.current = 0
      return
    }
    intervalRef.current = setInterval(tick, CHECK_INTERVAL_MS)
    return () => clearInterval(intervalRef.current)
  }, [enabled, tick])

  return { lastAlert }
}
