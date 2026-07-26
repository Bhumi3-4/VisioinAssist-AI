import { useEffect, useRef, useState, useCallback } from 'react'
import { Search, FileText, RotateCcw, Square, HelpCircle, TriangleAlert, User, LogOut, History, Monitor } from 'lucide-react'
import Header from './components/Header'
import CameraView from './components/CameraView'
import VoiceOrb from './components/VoiceOrb'
import StatusReadout from './components/StatusReadout'
import AccessibilityBar from './components/AccessibilityBar'
import CaptionDisplay from './components/CaptionDisplay'
import AuthPanel from './components/AuthPanel'
import HistoryPanel from './components/HistoryPanel'
import ActionButton from './components/ActionButton'
import { useCamera } from './hooks/useCamera'
import { useObjectDetection } from './hooks/useObjectDetection'
import { useTextRecognition } from './hooks/useTextRecognition'
import { useObstacleWatch } from './hooks/useObstacleWatch'
import { useScreenCapture } from './hooks/useScreenCapture'
import { useVoiceCommands } from './hooks/useVoiceCommands'
import { describeObjects } from './utils/describeObjects'
import { drawDetections } from './utils/drawDetections'
import { captureFrame } from './utils/captureFrame'
import { isLikelyValidText } from './utils/textValidation'
import { matchCommand } from './utils/commands'
import { speak, stopSpeaking } from './utils/speech'
import { saveHistoryEntry, updatePreferences } from './utils/api'

const TEXT_SCALES = [100, 125, 150, 200]
const HELP_TEXT =
  'You can say: what\'s around me, read this, read the screen, repeat, stop, zoom in, zoom out, bigger text, smaller text, watch for obstacles, stop obstacle watch, or help.'

export default function App() {
  const [status, setStatus] = useState('Point the camera, then tap a button below.')
  const [caption, setCaption] = useState('')
  const [fontScale, setFontScale] = useState(100)
  const [highContrast, setHighContrast] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [obstacleOn, setObstacleOn] = useState(false)

  // --- Account state ---
  // token lives in localStorage so a page refresh keeps the user logged
  // in. The app is fully usable with token === null (guest mode).
  const [token, setToken] = useState(() => localStorage.getItem('vaToken'))
  const [user, setUser] = useState(null)
  const [showAuthPanel, setShowAuthPanel] = useState(false)
  const [showHistoryPanel, setShowHistoryPanel] = useState(false)

  const { videoRef, status: cameraStatus, errorMessage } = useCamera()
  const canvasRef = useRef(null)
  const { modelStatus, detect } = useObjectDetection()
  const { ocrStatus, recognize } = useTextRecognition()
  const { isSupported: screenCaptureSupported, captureScreenFrame } = useScreenCapture()

  const obstacleEnabled = obstacleOn && modelStatus === 'ready' && cameraStatus === 'ready'
  const { lastAlert } = useObstacleWatch({ videoRef, canvasRef, detect, enabled: obstacleEnabled })

  useEffect(() => {
    if (lastAlert) {
      setCaption(lastAlert)
      if (token) saveHistoryEntry(token, { type: 'obstacle-alert', resultText: lastAlert }).catch(() => {})
    }
  }, [lastAlert, token])

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontScale}%`
  }, [fontScale])

  useEffect(() => {
    document.body.classList.toggle('high-contrast', highContrast)
  }, [highContrast])

  // Sync accessibility preferences to the backend whenever they change,
  // but only if logged in -- guests just keep their settings locally.
  useEffect(() => {
    if (!token) return
    const timeout = setTimeout(() => {
      updatePreferences(token, { fontScale, highContrast }).catch(() => {})
    }, 600) // small debounce so dragging the zoom slider doesn't spam requests
    return () => clearTimeout(timeout)
  }, [token, fontScale, highContrast])

  useEffect(() => {
    if (modelStatus === 'loading') setStatus('Loading detection model… (first time only)')
    if (modelStatus === 'ready' && cameraStatus === 'ready') {
      setStatus('Point the camera, then tap a button below.')
    }
    if (modelStatus === 'error') setStatus('Could not load the detection model. Check your connection and reload.')
  }, [modelStatus, cameraStatus])

  function handleAuthSuccess(newToken, newUser) {
    localStorage.setItem('vaToken', newToken)
    setToken(newToken)
    setUser(newUser)
    setShowAuthPanel(false)
    if (newUser?.preferences) {
      setFontScale(newUser.preferences.fontScale ?? 100)
      setHighContrast(Boolean(newUser.preferences.highContrast))
    }
    speak(`Welcome, ${newUser.name}`)
  }

  function handleLogout() {
    localStorage.removeItem('vaToken')
    setToken(null)
    setUser(null)
    setShowHistoryPanel(false)
    speak('Logged out')
  }

  // --- Core actions, each with a button AND a matching voice command ---

  const handleDetect = useCallback(async () => {
    if (!videoRef.current || modelStatus !== 'ready') return
    setStatus('Looking…')
    const predictions = await detect(videoRef.current)
    drawDetections(canvasRef.current, videoRef.current, predictions)
    const description = describeObjects(predictions)
    setCaption(description)
    setStatus('Done.')
    speak(description)
    if (token) saveHistoryEntry(token, { type: 'object-detection', resultText: description }).catch(() => {})
  }, [detect, modelStatus, videoRef, token])

  const handleRead = useCallback(async () => {
    if (!videoRef.current || ocrStatus !== 'ready') {
      const message = ocrStatus === 'loading' ? 'The text reader is still loading, one moment.' : 'Text reader is not available.'
      setCaption(message)
      speak(message)
      return
    }
    setStatus('Reading… hold the camera steady.')
    const frame = captureFrame(videoRef.current)
    const { text, confidence } = await recognize(frame)

    if (!isLikelyValidText(text, confidence)) {
      const message = "I couldn't find any readable text. Try moving closer, holding steady, or improving lighting."
      setCaption(message)
      setStatus('Done.')
      speak(message)
      return
    }

    setCaption(text)
    setStatus('Done.')
    speak(text)
    if (token) saveHistoryEntry(token, { type: 'text-recognition', resultText: text }).catch(() => {})
  }, [ocrStatus, recognize, videoRef, token])

  const handleReadScreen = useCallback(async () => {
    if (!screenCaptureSupported) {
      const message = "Reading the screen isn't supported in this browser. Try Chrome or Edge on a computer."
      setCaption(message)
      speak(message)
      return
    }
    if (ocrStatus !== 'ready') {
      const message = 'The text reader is still loading, one moment.'
      setCaption(message)
      speak(message)
      return
    }

    try {
      setStatus('Choose a screen, window, or tab to read…')
      const frame = await captureScreenFrame()
      setStatus('Reading the screen…')
      const { text, confidence } = await recognize(frame)

      if (!isLikelyValidText(text, confidence)) {
        const message = "I couldn't find any readable text on that screen."
        setCaption(message)
        setStatus('Done.')
        speak(message)
        return
      }

      setCaption(text)
      setStatus('Done.')
      speak(text)
      if (token) saveHistoryEntry(token, { type: 'text-recognition', resultText: text }).catch(() => {})
    } catch (err) {
      // User cancelled the picker, or denied permission -- not an error worth alarming over
      setStatus('Screen reading cancelled.')
    }
  }, [screenCaptureSupported, ocrStatus, captureScreenFrame, recognize, token])

  const handleRepeat = useCallback(() => {
    if (!caption) {
      speak('Nothing to repeat yet.')
      return
    }
    speak(caption)
  }, [caption])

  const handleStop = useCallback(() => {
    stopSpeaking()
    setStatus('Stopped.')
  }, [])

  const handleZoomIn = useCallback(() => setZoom((z) => Math.min(3, +(z + 0.2).toFixed(1))), [])
  const handleZoomOut = useCallback(() => setZoom((z) => Math.max(1, +(z - 0.2).toFixed(1))), [])

  const handleTextBigger = useCallback(() => {
    setFontScale((s) => {
      const idx = TEXT_SCALES.indexOf(s)
      return TEXT_SCALES[Math.min(TEXT_SCALES.length - 1, idx + 1)]
    })
  }, [])

  const handleTextSmaller = useCallback(() => {
    setFontScale((s) => {
      const idx = TEXT_SCALES.indexOf(s)
      return TEXT_SCALES[Math.max(0, idx - 1)]
    })
  }, [])

  const handleObstacleOn = useCallback(() => {
    setObstacleOn(true)
    setStatus('Obstacle watch on. Alerts will interrupt speech.')
    speak('Obstacle watch on')
  }, [])

  const handleObstacleOff = useCallback(() => {
    setObstacleOn(false)
    setStatus('Obstacle watch off.')
    speak('Obstacle watch off')
  }, [])

  const handleHelp = useCallback(() => {
    setCaption(HELP_TEXT)
    speak(HELP_TEXT)
  }, [])

  const runAction = useCallback(
    (action) => {
      const actions = {
        detect: handleDetect,
        read: handleRead,
        readScreen: handleReadScreen,
        repeat: handleRepeat,
        stop: handleStop,
        zoomIn: handleZoomIn,
        zoomOut: handleZoomOut,
        textBigger: handleTextBigger,
        textSmaller: handleTextSmaller,
        obstacleOn: handleObstacleOn,
        obstacleOff: handleObstacleOff,
        help: handleHelp,
      }
      actions[action]?.()
    },
    [
      handleDetect,
      handleRead,
      handleReadScreen,
      handleRepeat,
      handleStop,
      handleZoomIn,
      handleZoomOut,
      handleTextBigger,
      handleTextSmaller,
      handleObstacleOn,
      handleObstacleOff,
      handleHelp,
    ],
  )

  const handleTranscript = useCallback(
    (transcript) => {
      const action = matchCommand(transcript)
      if (action) {
        setStatus(`Heard: "${transcript}" → running command.`)
        runAction(action)
      } else {
        setStatus(`Heard: "${transcript}" — didn't recognize that. Say "help" to hear commands.`)
        speak("Sorry, I didn't understand that. Say help to hear what you can say.")
      }
    },
    [runAction],
  )

  const { isSupported: voiceSupported, isListening, start, stop } = useVoiceCommands({
    onTranscript: handleTranscript,
  })

  function handleOrbClick() {
    if (isListening) {
      stop()
      setStatus('Stopped listening.')
    } else {
      setStatus('Listening…')
      start()
    }
  }

  const detectDisabled = modelStatus !== 'ready' || cameraStatus !== 'ready'

  return (
    <div
      style={{
        maxWidth: 640,
        margin: '0 auto',
        padding: 'var(--space-lg) var(--space-md)',
        textAlign: 'center',
      }}
    >
      <Header />

      {/* --- Account controls --- */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)', flexWrap: 'wrap' }}>
        {token ? (
          <>
            <span style={{ color: 'var(--text-secondary)' }}>{user ? `Logged in as ${user.name}` : 'Logged in'}</span>
            <ActionButton icon={History} onClick={() => setShowHistoryPanel((v) => !v)}>
              {showHistoryPanel ? 'Hide history' : 'View history'}
            </ActionButton>
            <ActionButton icon={LogOut} onClick={handleLogout}>
              Log out
            </ActionButton>
          </>
        ) : (
          <ActionButton icon={User} onClick={() => setShowAuthPanel((v) => !v)}>
            {showAuthPanel ? 'Close' : 'Log in / Register'}
          </ActionButton>
        )}
      </div>

      {showAuthPanel && !token && <AuthPanel onAuthSuccess={handleAuthSuccess} onSkip={() => setShowAuthPanel(false)} />}
      {showHistoryPanel && token && <HistoryPanel token={token} />}

      <AccessibilityBar
        fontScale={fontScale}
        onFontScaleChange={setFontScale}
        highContrast={highContrast}
        onToggleContrast={setHighContrast}
        zoom={zoom}
        onZoomChange={setZoom}
      />

      <CameraView
        videoRef={videoRef}
        canvasRef={canvasRef}
        status={cameraStatus}
        errorMessage={errorMessage}
        zoom={zoom}
      />

      <div
        className="card"
        style={{
          margin: 'var(--space-md) 0',
          padding: 'var(--space-sm)',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 'var(--space-sm)',
        }}
      >
        <ActionButton icon={Search} variant="accent" onClick={handleDetect} disabled={detectDisabled}>
          What's around me
        </ActionButton>
        <ActionButton icon={FileText} onClick={handleRead} disabled={ocrStatus !== 'ready'}>
          Read this
        </ActionButton>
        <ActionButton icon={Monitor} onClick={handleReadScreen} disabled={ocrStatus !== 'ready' || !screenCaptureSupported}>
          Read screen text
        </ActionButton>
        <ActionButton icon={RotateCcw} onClick={handleRepeat}>
          Repeat
        </ActionButton>
        <ActionButton icon={Square} variant="stop" onClick={handleStop}>
          Stop
        </ActionButton>
        <ActionButton icon={HelpCircle} onClick={handleHelp}>
          Help
        </ActionButton>
        <ActionButton
          icon={TriangleAlert}
          variant="danger"
          active={obstacleOn}
          aria-pressed={obstacleOn}
          onClick={obstacleOn ? handleObstacleOff : handleObstacleOn}
          disabled={detectDisabled}
        >
          Obstacle watch: {obstacleOn ? 'On' : 'Off'}
        </ActionButton>
      </div>

      <CaptionDisplay text={caption} />

      <div style={{ margin: 'var(--space-lg) 0' }}>
        <VoiceOrb listening={isListening} supported={voiceSupported} onClick={handleOrbClick} />
      </div>

      <StatusReadout message={status} />
    </div>
  )
}