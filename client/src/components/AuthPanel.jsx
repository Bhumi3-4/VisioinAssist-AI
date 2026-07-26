import { useState } from 'react'
import { LogIn, UserPlus } from 'lucide-react'
import { registerUser, loginUser } from '../utils/api'

/**
 * AuthPanel
 * Optional account creation -- the app is fully usable as a guest
 * (see the "Continue without an account" button). Logging in only
 * unlocks saved history and synced preferences across devices.
 */
export default function AuthPanel({ onAuthSuccess, onSkip }) {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result =
        mode === 'login' ? await loginUser({ email, password }) : await registerUser({ name, email, password })
      onAuthSuccess(result.token, result.user)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="card"
      style={{
        padding: 'var(--space-md)',
        marginBottom: 'var(--space-md)',
        textAlign: 'left',
      }}
    >
      <h2 style={{ fontSize: '1.2rem', marginBottom: 'var(--space-sm)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        {mode === 'login' ? <LogIn size={20} aria-hidden="true" /> : <UserPlus size={20} aria-hidden="true" />}
        {mode === 'login' ? 'Log in' : 'Create an account'}
      </h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
        {mode === 'register' && (
          <label>
            Name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={inputStyle}
            />
          </label>
        )}

        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            style={inputStyle}
          />
        </label>

        {error && (
          <p role="alert" style={{ color: 'var(--danger)' }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            border: '2px solid var(--accent)',
            background: 'var(--surface-raised)',
            color: 'var(--text-primary)',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          {loading ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
        </button>
      </form>

      <div style={{ marginTop: 'var(--space-sm)', display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
        <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')} style={linkButtonStyle}>
          {mode === 'login' ? 'Need an account? Register' : 'Already have an account? Log in'}
        </button>
        <button onClick={onSkip} style={linkButtonStyle}>
          Continue without an account
        </button>
      </div>
    </div>
  )
}

const inputStyle = {
  display: 'block',
  width: '100%',
  marginTop: '4px',
  padding: '10px',
  background: 'var(--bg)',
  color: 'var(--text-primary)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  fontSize: '1rem',
}

const linkButtonStyle = {
  background: 'none',
  border: 'none',
  color: 'var(--accent)',
  textDecoration: 'underline',
  minHeight: 'auto',
  padding: 0,
}