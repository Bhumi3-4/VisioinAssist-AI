/**
 * playAlertBeep
 * A short urgent beep via the Web Audio API -- no audio file needed,
 * plays instantly (faster to notice than waiting for speech to start),
 * used right before the spoken obstacle warning.
 */
let audioCtx = null

export function playAlertBeep() {
  if (typeof window === 'undefined') return
  audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)()

  const oscillator = audioCtx.createOscillator()
  const gain = audioCtx.createGain()
  oscillator.type = 'square'
  oscillator.frequency.value = 880
  gain.gain.setValueAtTime(0.15, audioCtx.currentTime)

  oscillator.connect(gain)
  gain.connect(audioCtx.destination)
  oscillator.start()
  oscillator.stop(audioCtx.currentTime + 0.2)
}