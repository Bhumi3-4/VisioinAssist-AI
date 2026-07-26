/**
 * captureFrame
 * Draws the current video frame onto an offscreen canvas, then applies
 * grayscale + contrast enhancement -- raw camera frames have far more
 * lighting variation than a scanned document, and this measurably
 * improves OCR accuracy. Small frames are also upscaled since Tesseract
 * performs better with more pixels of text to work with.
 */
export function captureFrame(video) {
  if (!video || !video.videoWidth) return null

  const scale = video.videoWidth < 1000 ? 1.5 : 1
  const canvas = document.createElement('canvas')
  canvas.width = video.videoWidth * scale
  canvas.height = video.videoHeight * scale

  const ctx = canvas.getContext('2d')
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data
  const CONTRAST = 1.6 

  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
    const contrasted = Math.min(255, Math.max(0, (gray - 128) * CONTRAST + 128))
    data[i] = data[i + 1] = data[i + 2] = contrasted
  }
  ctx.putImageData(imageData, 0, 0)

  return canvas
}