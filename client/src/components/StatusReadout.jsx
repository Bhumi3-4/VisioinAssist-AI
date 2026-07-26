/**
 * StatusReadout
 * A single small aria-live region announcing SYSTEM status ("Listening…",
 * "Loading model…") to screen readers. Distinct from CaptionDisplay,
 * which shows the actual RESULT content in large text.
 */
export default function StatusReadout({ message }) {
  return (
    <div className="status-readout" style={{ marginTop: 'var(--space-md)' }}>
      <p
        role="status"
        aria-live="polite"
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.95rem',
          color: 'var(--text-secondary)',
          textAlign: 'center',
          minHeight: '1.6em',
        }}
      >
        {message}
      </p>
    </div>
  )
}