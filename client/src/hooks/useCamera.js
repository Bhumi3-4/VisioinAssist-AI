import { useEffect, useRef, useState } from 'react'

/**
 * useCamera
 * Requests the device camera and attaches the stream to a <video> ref.
 * Lives in App.jsx (not CameraView) so other modules -- like object
 * detection -- can read frames from the exact same video element.
 *
 * Returns:
 *  - videoRef: attach to a <video> element
 *  - status: 'idle' | 'requesting' | 'ready' | 'denied' | 'error'
 *  - errorMessage: human-readable error, if any
 */
export function useCamera() {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [status, setStatus] = useState('idle')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let cancelled = false

    async function startCamera() {
      setStatus('requesting')
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }, 
          audio: false,
        })
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
        setStatus('ready')
      } catch (err) {
        if (cancelled) return
        if (err.name === 'NotAllowedError') {
          setStatus('denied')
          setErrorMessage('Camera permission was denied. Please allow camera access and reload.')
        } else {
          setStatus('error')
          setErrorMessage(err.message || 'Could not access the camera.')
        }
      }
    }

    startCamera()

    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [])

  return { videoRef, status, errorMessage }
}