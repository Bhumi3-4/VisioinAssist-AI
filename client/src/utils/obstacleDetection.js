/**
 * assessObstacleRisk
 * Distance estimation without a depth sensor: we track the LARGEST
 * detected box each tick (the closest thing in view) and reason about
 * risk from its size, position, and how fast it's growing:
 *   - "close"       -> box already fills a large chunk of frame + centered
 *   - "approaching" -> smaller box, but growing fast + centered
 *   - "none"        -> nothing risky right now
 */
const CLOSE_AREA_RATIO = 0.35 // box takes up >35% of frame => already very close
const APPROACHING_MIN_RATIO = 0.15 // ignore tiny/background objects
const GROWTH_RATIO_THRESHOLD = 1.25 // 25%+ bigger than last reading => approaching fast

export function assessObstacleRisk(predictions, frameWidth, frameHeight, previous) {
  if (!predictions.length || !frameWidth || !frameHeight) {
    return { risk: 'none', label: null, box: null, areaRatio: 0 }
  }

  const frameArea = frameWidth * frameHeight

  const largest = predictions.reduce((a, b) => {
    const areaA = a.bbox[2] * a.bbox[3]
    const areaB = b.bbox[2] * b.bbox[3]
    return areaB > areaA ? b : a
  })

  const [x, y, width, height] = largest.bbox
  const areaRatio = (width * height) / frameArea
  const centerX = x + width / 2
  const isCentered = centerX > frameWidth * 0.25 && centerX < frameWidth * 0.75

  let risk = 'none'

  if (areaRatio >= CLOSE_AREA_RATIO && isCentered) {
    risk = 'close'
  } else if (
    isCentered &&
    areaRatio >= APPROACHING_MIN_RATIO &&
    previous?.class === largest.class &&
    areaRatio / previous.areaRatio >= GROWTH_RATIO_THRESHOLD
  ) {
    risk = 'approaching'
  }

  return { risk, label: largest.class, box: largest.bbox, areaRatio }
}