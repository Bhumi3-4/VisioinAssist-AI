/**
 * isLikelyValidText
 * Tesseract ALWAYS returns some string, even pointed at a blank wall --
 * it never says "nothing here," it just guesses at noise. This filters
 * that out using two signals together:
 *   1. The engine's own confidence score (0-100)
 *   2. A sanity check that the text is mostly real letters/numbers,
 *      not a handful of stray symbols OCR hallucinated from texture/noise
 */
export function isLikelyValidText(text, confidence, { minConfidence = 55, minLength = 3 } = {}) {
  const trimmed = (text || '').trim()

  if (trimmed.length < minLength) return false
  if (confidence < minConfidence) return false

  const alphanumericCount = (trimmed.match(/[a-zA-Z0-9]/g) || []).length
  const ratio = alphanumericCount / trimmed.length

  return ratio >= 0.4
}