// Thin fetch wrapper for the /api backend. The browser never talks to the database directly.

export class ApiError extends Error {
  constructor(message, status, code) {
    super(message)
    this.status = status
    this.code = code
  }
}

export async function api(path, { method = 'GET', body } = {}) {
  let res
  try {
    res = await fetch(`/api${path}`, {
      method,
      credentials: 'same-origin',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError('We can’t reach PulseFit right now. Check your connection and try again.', 0, 'NETWORK')
  }

  let data = null
  try {
    data = await res.json()
  } catch {
    // Non-JSON response (e.g. the dev proxy couldn't reach the API server)
  }

  if (!res.ok) {
    if (res.status === 401) window.dispatchEvent(new Event('pulsefit:unauthorized'))
    const fallback =
      res.status >= 500 ? 'The PulseFit server isn’t responding. Make sure `npm run dev` is running.' : 'Something went wrong.'
    throw new ApiError(data?.error ?? fallback, res.status, data?.code ?? (res.status >= 500 && !data ? 'SERVER_DOWN' : undefined))
  }
  return data
}

const pad = (n) => String(n).padStart(2, '0')

// The user's local calendar date as YYYY-MM-DD, so "today" matches their timezone.
export const localDate = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

// Tell other parts of the UI (e.g. the sidebar streak) that workout data changed.
export const notifyActivity = () => window.dispatchEvent(new Event('pulsefit:activity'))

export const initials = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('') || '?'
