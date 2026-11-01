export class HttpError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

const unreachable = /fetch failed|connect|ENOTFOUND|ECONNREFUSED|ETIMEDOUT|EAI_AGAIN|timeout|password authentication/i

// Wraps a Vercel-style handler: enforces allowed methods and turns errors into friendly JSON.
export function handler(methods, fn) {
  return async (req, res) => {
    res.setHeader('Cache-Control', 'no-store')
    if (!methods.includes(req.method)) {
      res.setHeader('Allow', methods.join(', '))
      return res.status(405).json({ error: `Method ${req.method} not allowed` })
    }
    try {
      await fn(req, res)
    } catch (err) {
      if (err instanceof HttpError) return res.status(err.status).json({ error: err.message })
      const connectionProblem =
        (!err?.code && unreachable.test(err?.message ?? '')) || ['28P01', '3D000', '57P01', '53300'].includes(err?.code)
      if (connectionProblem) {
        console.error('[db] unreachable:', err.message)
        return res.status(503).json({
          error: 'We can’t reach the database right now. Check your internet connection and DATABASE_URL, then try again.',
          code: 'DB_UNREACHABLE',
        })
      }
      console.error('[api] unexpected error:', err)
      return res.status(500).json({ error: 'Something went wrong on our side. Please try again.' })
    }
  }
}

export const body = (req) => (req.body && typeof req.body === 'object' ? req.body : {})

export function isoDate(value, fallback) {
  if (value == null || value === '') {
    if (fallback !== undefined) return fallback
    throw new HttpError(400, 'A date is required.')
  }
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value))) {
    throw new HttpError(400, 'Dates must look like YYYY-MM-DD.')
  }
  return value
}

export function positiveInt(value, name) {
  const n = Number(value)
  if (!Number.isInteger(n) || n < 1) throw new HttpError(400, `${name} must be a positive whole number.`)
  return n
}
