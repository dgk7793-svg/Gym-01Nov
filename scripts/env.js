// Loads .env for local scripts. Creates the file if needed, fills in JWT_SECRET when it's missing,
// and explains where to find DATABASE_URL when it hasn't been set yet.
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { randomBytes } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const envPath = path.join(root, '.env')

const neonHelp = `
  ┌──────────────────────────────────────────────────────────────────────┐
  │  DATABASE_URL is missing from .env                                    │
  └──────────────────────────────────────────────────────────────────────┘
  1. Go to https://console.neon.tech and sign in (the free plan is fine).
  2. Create a project (any name, e.g. "pulsefit"), or open your existing one.
  3. On the project dashboard, click the "Connect" button (top right).
  4. In the "Connect to your database" window, leave Branch = main and
     Database = neondb, keep "Connection string" selected, then click
     "Copy snippet" to copy the full postgresql://... address.
  5. Open the .env file in this folder and paste it after DATABASE_URL=
       DATABASE_URL=postgresql://neondb_owner:...@ep-....neon.tech/neondb?sslmode=require
  6. Save the file and run:  npm run db:setup

  No Neon account yet? For a database on this computer only, use:
       DATABASE_URL=pglite://.data/pulsefit
`

export function loadEnv({ requireDatabase = false } = {}) {
  if (!existsSync(envPath)) writeFileSync(envPath, 'DATABASE_URL=\nJWT_SECRET=\n')

  let text = readFileSync(envPath, 'utf8')
  const jwt = /^JWT_SECRET=(.*)$/m.exec(text)
  if (!jwt || !jwt[1].trim()) {
    const secret = randomBytes(48).toString('base64url')
    text = jwt
      ? text.replace(/^JWT_SECRET=.*$/m, `JWT_SECRET=${secret}`)
      : `${text.replace(/\s*$/, '')}\nJWT_SECRET=${secret}\n`
    writeFileSync(envPath, text)
    console.log('🔑 Generated a strong random JWT_SECRET and saved it to .env')
  }

  process.loadEnvFile(envPath)

  if (!process.env.DATABASE_URL?.trim()) {
    console.log(neonHelp)
    if (requireDatabase) process.exit(1)
    return false
  }
  return true
}
