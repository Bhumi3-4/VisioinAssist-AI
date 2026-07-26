const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api'

/**
 * request
 * Shared fetch wrapper: attaches the JWT if given, parses JSON, and
 * throws a readable error if the response wasn't ok -- every function
 * below is just a thin, named call to this.
 */
async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong. Please try again.')
  }
  return data
}

export const registerUser = (payload) => request('/auth/register', { method: 'POST', body: payload })
export const loginUser = (payload) => request('/auth/login', { method: 'POST', body: payload })

export const fetchHistory = (token) => request('/history', { token })
export const saveHistoryEntry = (token, payload) => request('/history', { method: 'POST', body: payload, token })
export const deleteHistoryEntry = (token, id) => request(`/history/${id}`, { method: 'DELETE', token })

export const getPreferences = (token) => request('/preferences', { token })
export const updatePreferences = (token, payload) => request('/preferences', { method: 'PUT', body: payload, token })