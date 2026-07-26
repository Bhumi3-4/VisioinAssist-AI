import { useCallback } from 'react'

/**
 * useScreenCapture
 * Uses the Screen Capture API to grab ONE still frame of whatever
 * screen/window/tab the user picks, then immediately stops sharing --
 * this is a single snapshot for OCR, not a live/ongoing screen share.
 *
 * Desktop Chrome/Edge only: getDisplayMedia isn't available on iOS
 * Safari or most mobile browsers. Callers should check isSupported
 * and disable/hide the feature accordingly (same pattern as voice
 * commands in useVoiceCommands.js).
 */
export function useScreenCapture() {
  const isSupported =
    typeof navigator !== 'undefined' &&
    Boolean(navigator.mediaDevices) &&
    typeof navigator.mediaDevices.getDisplayMedia === 'function'

  const captureScreenFrame = useCallback(async () => {
    if (!isSupported) {
      throw new Error('Screen reading is not supported in this browser.')
    }

    // Prompts the user to pick a screen/window/tab -- this permission
    // prompt cannot be skipped, it's a browser security requirement.
    const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false })

    const video = document.createElement('video')
    video.srcObject = stream
    video.muted = true
    await video.play()

    // Wait for a real frame to actually be available before capturing
    if (video.readyState < 2) {
      await new Promise((resolve) => {
        video.onloadeddata = resolve
      })
    }

    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)

    // Stop sharing immediately -- we only needed one frame, not a live feed
    stream.getTracks().forEach((track) => track.stop())

    return canvas
  }, [isSupported])

  return { isSupported, captureScreenFrame }
}