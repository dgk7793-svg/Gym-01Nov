import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { neon } from '@neondatabase/serverless'
import { HttpError } from './http.js'

let sql

// DATABASE_URL decides the driver:
//   postgresql://...       -> Neon over HTTP (what Vercel uses)
//   pglite://.data/pulsefit -> embedded local Postgres stored in that folder (local development only)
export function getSql() {
  const url = process.env.DATABASE_URL?.trim()
  if (!url) {
    throw new HttpError(503, 'The database isn’t configured yet. Add DATABASE_URL to your .env file and restart.')
  }
  sql ??= url.startsWith('pglite://') ? localSql(url.slice('pglite://'.length)) : neon(url)
  return sql
}

export const isLocalDatabase = () => process.env.DATABASE_URL?.trim().startsWith('pglite://') ?? false

let pglite

// A Neon-compatible wrapper around PGlite: sql`...` and sql.query(text, params) both resolve to rows.
function localSql(dir) {
  const db = () => {
    // Module name kept in a variable so deploy bundlers don't pull the local-only driver into functions
    const mod = '@electric-sql/pglite'
    pglite ??= import(mod)
      .then(({ PGlite }) => {
        const dataDir = path.resolve(process.cwd(), dir)
        mkdirSync(path.dirname(dataDir), { recursive: true })
        return PGlite.create(dataDir)
      })
      .catch((err) => {
        pglite = undefined // allow a retry on the next query
        throw err
      })
    return pglite
  }

  const sql = async (strings, ...values) => {
    const text = strings.reduce((acc, s, i) => acc + `$${i}` + s)
    return (await (await db()).query(text, values)).rows
  }
  sql.query = async (text, params = []) => {
    const pg = await db()
    if (params.length) return (await pg.query(text, params)).rows
    const results = await pg.exec(text)
    return results.at(-1)?.rows ?? []
  }
  sql.close = async () => {
    const pending = pglite
    pglite = undefined
    if (pending) await (await pending.catch(() => null))?.close()
  }
  return sql
}
