/**
 * describeObjects
 * Converts raw COCO-SSD predictions into one natural sentence, e.g.
 * "I see a chair, 2 people and a bottle." Filters low-confidence noise.
 */
export function describeObjects(predictions, { minScore = 0.6 } = {}) {
  const filtered = predictions.filter((p) => p.score >= minScore)

  if (filtered.length === 0) {
    return "I don't see anything I recognize clearly. Try moving closer or improving lighting."
  }

  const counts = {}
  filtered.forEach((p) => {
    counts[p.class] = (counts[p.class] || 0) + 1
  })

  const parts = Object.entries(counts).map(([name, count]) =>
    count > 1 ? `${count} ${name}s` : `a ${name}`,
  )

  if (parts.length === 1) return `I see ${parts[0]}.`

  const last = parts[parts.length - 1]
  const rest = parts.slice(0, -1).join(', ')
  return `I see ${rest} and ${last}.`
}