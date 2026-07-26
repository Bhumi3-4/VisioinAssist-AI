import { useCallback, useRef, useState } from 'react'

/**
 * useVoiceCommands
 * Thin wrapper around the browser's SpeechRecognition API. This is the
 * OPTIONAL layer -- every action it triggers also has an on-screen
 * button (see App.jsx), so nothing in the app depends on this working.
 *
 * isSupported is false in browsers without SpeechRecognition (e.g.
 * Firefox) -- callers should hide/disable voice UI when it's false.
 */
export function useVoiceCommands({ onTranscript } = {}) {
  const recognitionRef = useRef(null)
  const [isListening, setIsListening] = useState(false)

  const SpeechRecognitionAPI =
    typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null
  const isSupported = Boolean(SpeechRecognitionAPI)

  const start = useCallback(() => {
    if (!isSupported || isListening) return

    const recognition = new SpeechRecognitionAPI()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      onTranscript?.(transcript)
    }
    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => setIsListening(false)

    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
  }, [isSupported, isListening, onTranscript, SpeechRecognitionAPI])

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  return { isSupported, isListening, start, stop }
}