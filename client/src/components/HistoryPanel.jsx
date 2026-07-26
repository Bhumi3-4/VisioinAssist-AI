import { useEffect, useState } from 'react'
import { History, Trash2, Search, FileText, TriangleAlert } from 'lucide-react'
import { fetchHistory, deleteHistoryEntry } from '../utils/api'

const TYPE_META = {
  'object-detection': { label: 'Object detection', icon: Search },
  'text-recognition': { label: 'Text reading', icon: FileText },
  'obstacle-alert': { label: 'Obstacle alert', icon: TriangleAlert },
}

/**
 * HistoryPanel
 * Shows the logged-in user's past scans. Only rendered when a token
 * exists (see App.jsx) -- guests simply don't have history to show.
 */
export default function HistoryPanel({ token }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const data = await fetchHistory(token)
        if (!cancelled) setEntries(data)
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [token])

  async function handleDelete(id) {
    try {
      await deleteHistoryEntry(token, id)
      setEntries((prev) => prev.filter((e) => e._id !== id))
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div
      className="card"
      style={{
        padding: 'var(--space-md)',
        marginBottom: 'var(--space-md)',
        textAlign: 'left',
        maxHeight: 320,
        overflowY: 'auto',
      }}
    >
      <h2 style={{ fontSize: '1.2rem', marginBottom: 'var(--space-sm)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <History size={20} aria-hidden="true" />
        Scan history
      </h2>

      {loading && <p style={{ color: 'var(--text-secondary)' }}>Loading…</p>}
      {error && (
        <p role="alert" style={{ color: 'var(--danger)' }}>
          {error}
        </p>
      )}
      {!loading && entries.length === 0 && (
        <p style={{ color: 'var(--text-secondary)' }}>No scans saved yet.</p>
      )}

      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {entries.map((entry) => {
          const meta = TYPE_META[entry.type] || { label: entry.type, icon: Search }
          const TypeIcon = meta.icon
          return (
            <li
              key={entry._id}
              style={{
                borderTop: '1px solid var(--border)',
                padding: 'var(--space-sm) 0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 'var(--space-sm)',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-mono)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '2px',
                  }}
                >
                  <TypeIcon size={14} aria-hidden="true" />
                  {meta.label} · {new Date(entry.createdAt).toLocaleString()}
                </div>
                <div>{entry.resultText}</div>
              </div>
              <button
                onClick={() => handleDelete(entry._id)}
                aria-label="Delete this entry"
                style={{ minHeight: 'auto', padding: '6px', background: 'transparent', border: 'none' }}
              >
                <Trash2 size={18} aria-hidden="true" color="var(--danger)" />
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}