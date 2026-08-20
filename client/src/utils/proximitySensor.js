/**
 * proximitySensor.js
 * A classification-free fallback for obstacles COCO-SSD can't name
 * (walls, beds, doors, furniture -- anything outside its 80 categories
 * is invisible to it, even inches from the camera). This measures how
 * much the CENTER of the frame (what you're walking toward) is
 * changing between ticks -- a cheap proxy for "something is filling my
 * view and getting closer," independent of what it actually is.
 */
const SAMPLE_WIDTH = 48
const SAMPLE_HEIGHT = 36
let sampleCanvas = null

function getSampleCanvas() {
  if (!sampleCanvas) {
    sampleCanvas = document.createElement('canvas')
    sampleCanvas.width = SAMPLE_WIDTH
    sampleCanvas.height = SAMPLE_HEIGHT
  }
  return sampleCanvas
}

/**
 * sampleCenterFrame
 * Downsamples the video's CENTRAL 50% to a tiny grayscale grid --
 * cheap enough to run every tick, small enough to diff instantly.
 */
export function sampleCenterFrame(video) {
  if (!video || !video.videoWidth) return null
  const canvas = getSampleCanvas()
  const ctx = canvas.getContext('2d', { willReadFrequently: true })

  const cropW = video.videoWidth * 0.5
  const cropH = video.videoHeight * 0.5
  const cropX = video.videoWidth * 0.25
  const cropY = video.videoHeight * 0.25

  ctx.drawImage(video, cropX, cropY, cropW, cropH, 0, 0, SAMPLE_WIDTH, SAMPLE_HEIGHT)
  const { data } = ctx.getImageData(0, 0, SAMPLE_WIDTH, SAMPLE_HEIGHT)

  const gray = new Uint8ClampedArray(SAMPLE_WIDTH * SAMPLE_HEIGHT)
  for (let i = 0; i < gray.length; i++) {
    const j = i * 4
    gray[i] = 0.299 * data[j] + 0.587 * data[j + 1] + 0.114 * data[j + 2]
  }
  return gray
}

/**
 * frameMotionEnergy
 * Mean absolute pixel difference between two grayscale samples (0-255
 * scale) -- a cheap proxy for "how much changed in the center of view."
 */
export function frameMotionEnergy(prev, current) {
  if (!prev || !current || prev.length !== current.length) return 0
  let sum = 0
  for (let i = 0; i < current.length; i++) sum += Math.abs(current[i] - prev[i])
  return sum / current.length
}

/**
 * rollingBaseline
 * A fixed noise threshold doesn't work here -- normal webcam sensor
 * noise, auto-exposure adjustment, and hand tremor vary a lot between
 * devices and lighting, and were triggering false alerts constantly.
 * This computes a simple moving average of recent motion readings as
 * an adaptive "ambient noise floor" for THIS camera right now, so a
 * tick only counts as meaningful if it's clearly above what's normal,
 * not above some number guessed without a real camera to test against.
 */
export function rollingBaseline(history) {
  if (history.length === 0) return 0
  return history.reduce((sum, v) => sum + v, 0) / history.length
}
