import { useCallback, useEffect, useRef, useState } from 'react'
import { assessObstacleRisk } from '../utils/obstacleDetection'
import { playAlertBeep } from '../utils/alertSound'
import { speak } from '../utils/speech'

const CHECK_INTERVAL_MS = 800
const ALERT_COOLDOWN_MS = 4000 
/**
 * useObstacleWatch
 * While `enabled`, repeatedly calls the SAME detect() function from
 * useObjectDetection (no second model load) every CHECK_INTERVAL_MS,
 * assesses risk, and speaks/beeps a warning with a cooldown so it
 * doesn't spam alerts every single tick.
 */
export function useObstacleWatch({ videoRef, canvasRef, detect, enabled }) {
  const [lastAlert, setLastAlert] = useState(null)
  const previousRef = useRef(null)
  const lastAlertTimeRef = useRef(0)
  const intervalRef = useRef(null)

  const tick = useCallback(async () => {
    const video = videoRef.current
    if (!video || !video.videoWidth) return

    const predictions = await detect(video)
    const result = assessObstacleRisk(predictions, video.videoWidth, video.videoHeight, previousRef.current)

    if (result.label) {
      previousRef.current = { class: result.label, areaRatio: result.areaRatio }
    }

    if (result.risk !== 'none') {
      const now = Date.now()
      if (now - lastAlertTimeRef.current > ALERT_COOLDOWN_MS) {
        lastAlertTimeRef.current = now
        playAlertBeep()
        const message =
          result.risk === 'close'
            ? `Careful, ${result.label} very close ahead.`
            : `${result.label} approaching.`
        speak(message, { interrupt: true })
        setLastAlert(message)
      }
    }

    // Draw a red box only when something's actually risky; clear otherwise
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
      }
    }
  }, [videoRef, canvasRef, detect])

  useEffect(() => {
    if (!enabled) {
      clearInterval(intervalRef.current)
      previousRef.current = null
      return
    }
    intervalRef.current = setInterval(tick, CHECK_INTERVAL_MS)
    return () => clearInterval(intervalRef.current)
  }, [enabled, tick])

  return { lastAlert }
}