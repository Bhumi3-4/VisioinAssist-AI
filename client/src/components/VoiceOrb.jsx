import { Mic, MicOff } from 'lucide-react'

/**
 * VoiceOrb
 * The app's signature element -- driven by App.jsx's useVoiceCommands
 * hook. If voice isn't supported in this browser, it's disabled with a
 * clear label; every action it would trigger still has a button.
 */
export default function VoiceOrb({ listening, supported, onClick }) {
  const Icon = supported === false ? MicOff : Mic

  return (
    <button
      className="voice-orb"
      onClick={onClick}
      disabled={!supported}
      aria-pressed={listening}
      aria-label={
        !supported
          ? 'Voice commands not supported in this browser, use the buttons instead'
          : listening
            ? 'Stop listening'
            : 'Start listening for a voice command'
      }
      style={{
        width: 180,
        height: 180,
        borderRadius: '50%',
        border: `2px solid ${listening ? 'var(--accent)' : 'var(--border)'}`,
        background: !supported ? 'var(--surface)' : listening ? 'var(--accent-dim)' : 'var(--surface-raised)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-display)',
        fontSize: '1rem',
        fontWeight: 700,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        textAlign: 'center',
        padding: 'var(--space-sm)',
        boxShadow: listening ? '0 0 0 14px rgba(255,184,0,0.12), var(--shadow-card)' : 'var(--shadow-card)',
        animation: listening ? 'pulse 1.8s ease-in-out infinite' : 'none',
        opacity: supported ? 1 : 0.5,
      }}
    >
      <Icon size={32} aria-hidden="true" />
      <span>{!supported ? 'Voice not supported here' : listening ? 'Listening…' : 'Tap to talk (optional)'}</span>

      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 14px rgba(255,184,0,0.12), var(--shadow-card); }
          50% { box-shadow: 0 0 0 22px rgba(255,184,0,0.05), var(--shadow-card); }
        }
      `}</style>
    </button>
  )
}