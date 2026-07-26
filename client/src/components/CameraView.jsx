/**
 * CameraView
 * Presentational component: camera access (useCamera) lives in App.jsx
 * and is passed down as props, since the detection module also needs
 * direct access to the same video element.
 *
 * Video and canvas share ONE transformed wrapper so bounding boxes stay
 * aligned with the feed even when the magnification (zoom) changes.
 */
export default function CameraView({ videoRef, canvasRef, status, errorMessage, zoom = 1 }) {
  return (
    <div
      className="camera-view card"
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: '#000',
        border: '1px solid var(--border)',
      }}
    >
      <div
        style={{
          position: 'relative',
          transform: `scale(${zoom})`,
          transformOrigin: 'center center',
          transition: 'transform 0.15s ease-out',
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          aria-hidden="true"
          style={{
            width: '100%',
            display: status === 'ready' ? 'block' : 'none',
          }}
        />
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: status === 'ready' ? 'block' : 'none',
            pointerEvents: 'none',
          }}
        />
      </div>

      {status === 'requesting' && (
        <p role="status" style={{ color: 'var(--text-secondary)', padding: 'var(--space-md)' }}>
          Requesting camera access…
        </p>
      )}

      {(status === 'denied' || status === 'error') && (
        <p role="alert" style={{ color: 'var(--danger)', padding: 'var(--space-md)' }}>
          {errorMessage}
        </p>
      )}
    </div>
  )
}