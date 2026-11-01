// Local development: one command runs the /api functions (Express) and the Vite frontend.
// Each /api/*.js file is loaded exactly as Vercel will load it: a default-exported (req, res) handler.
import { existsSync, statSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import express from 'express'
import { createServer as createViteServer } from 'vite'
import { loadEnv, root } from '../scripts/env.js'
import { runSetup } from '../scripts/setup.js'
import { getSql, isLocalDatabase } from '../api/_lib/db.js'

loadEnv()

// The local database lives in a folder inside the project: make sure tables and sample data exist,
// and close it cleanly on Ctrl+C so nothing is lost.
if (isLocalDatabase()) {
  const sql = getSql()
  try {
    const counts = await runSetup(sql, { log: () => {} })
    console.log(`  ➜  Local DB: ready (${counts.exercises} exercises, ${counts.classes} classes, ${counts.users} users)`)
  } catch (err) {
    console.error('  ✖ Local database failed to start:', err.message)
  }
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.on(signal, async () => {
      await sql.close().catch(() => {})
      process.exit(0)
    })
  }
}

const API_PORT = Number(process.env.API_PORT) || 3001
const apiDir = path.join(root, 'api')

// Map /api/auth/login -> api/auth/login.js (or api/auth/login/index.js). Files and folders starting with _ are private.
function resolveRoute(urlPath) {
  const rel = urlPath.replace(/^\/api\/?/, '').replace(/\/$/, '')
  if (!rel || rel.split('/').some((seg) => seg.startsWith('_') || seg.startsWith('.') || !/^[\w-]+$/.test(seg))) return null
  for (const candidate of [`${rel}.js`, `${rel}/index.js`]) {
    const file = path.join(apiDir, candidate)
    if (existsSync(file)) return file
  }
  return null
}

const app = express()
app.disable('x-powered-by')
app.use(express.json({ limit: '100kb' }))

app.all('/api/*', async (req, res) => {
  const file = resolveRoute(req.path)
  if (!file) return res.status(404).json({ error: 'Not found' })
  try {
    // Cache-bust on change so edits to route files apply without restarting
    const mod = await import(`${pathToFileURL(file).href}?v=${statSync(file).mtimeMs}`)
    await mod.default(req, res)
  } catch (err) {
    console.error(`[api] ${req.method} ${req.path}`, err)
    if (!res.headersSent) res.status(500).json({ error: 'Something went wrong on our side. Please try again.' })
  }
})

app.listen(API_PORT, () => console.log(`  ➜  API:     http://localhost:${API_PORT}/api`))

const vite = await createViteServer({ root })
await vite.listen()
vite.printUrls()
