/**
 * speech.js
 * Thin wrapper around the browser's SpeechSynthesis API. Every module
 * calls speak() instead of touching window.speechSynthesis directly,
 * so voice/rate tuning happens in one place.
 */

export function speak(text, { interrupt = true, rate = 1 } = {}) {
  if (!('speechSynthesis' in window)) {
    console.warn('SpeechSynthesis not supported in this browser.')
    return
  }
  if (interrupt) {
    window.speechSynthesis.cancel()
  }
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = rate
  window.speechSynthesis.speak(utterance)
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
}