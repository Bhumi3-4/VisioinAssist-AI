/**
 * drawDetections
 * Draws bounding boxes + labels onto the canvas overlaid on the video.
 * Visual confirmation for low-vision users who can partially see the
 * screen, in addition to the spoken/captioned description.
 */
export function drawDetections(canvas, video, predictions, { minScore = 0.6 } = {}) {
  if (!canvas || !video) return
  const ctx = canvas.getContext('2d')

  // Match canvas resolution to the video's actual frame size so boxes
  // land in the right place regardless of display size.
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  predictions
    .filter((p) => p.score >= minScore)
    .forEach((p) => {
      const [x, y, width, height] = p.bbox
      const label = `${p.class} ${Math.round(p.score * 100)}%`

      ctx.strokeStyle = '#FFB800'
      ctx.lineWidth = 3
      ctx.strokeRect(x, y, width, height)

      ctx.font = '20px Inter, sans-serif'
      const textWidth = ctx.measureText(label).width
      const labelY = y > 24 ? y - 24 : y

      ctx.fillStyle = '#FFB800'
      ctx.fillRect(x, labelY, textWidth + 10, 24)

      ctx.fillStyle = '#0A0A0F'
      ctx.fillText(label, x + 5, labelY + 18)
    })
}