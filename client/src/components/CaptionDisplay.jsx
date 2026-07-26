/**
 * CaptionDisplay
 * Shows the actual result content (what was detected/read) in LARGE
 * text, separate from StatusReadout's small system-status text -- the
 * on-screen equivalent of what's spoken aloud, for low-vision users
 * who want to read it rather than only hear it.
 */
export default function CaptionDisplay({ text }) {
  if (!text) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="card"
      style={{
        marginTop: 'var(--space-md)',
        padding: 'var(--space-md)',
        borderLeft: '4px solid var(--accent)',
        fontSize: '1.4rem',
        fontWeight: 500,
        lineHeight: 1.5,
        textAlign: 'left',
      }}
    >
      {text}
    </div>
  )
}