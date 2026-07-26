import { Eye } from 'lucide-react'

export default function Header() {
  return (
    <header style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'var(--surface-raised)',
          border: '2px solid var(--accent)',
          marginBottom: 'var(--space-sm)',
        }}
      >
        <Eye size={28} color="var(--accent)" aria-hidden="true" />
      </div>
      <h1 style={{ fontSize: '1.8rem', marginBottom: 'var(--space-xs)' }}>VisionAssist AI</h1>
      <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
        Every voice command below also works as a button — use whichever you prefer.
      </p>
    </header>
  )
}
