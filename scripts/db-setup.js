// npm run db:setup -> creates tables and sample data in the database named by DATABASE_URL.
import { loadEnv } from './env.js'
import { runSetup } from './setup.js'
import { getSql, isLocalDatabase } from '../api/_lib/db.js'

loadEnv({ requireDatabase: true })

// The local database folder can only be opened by one process at a time
if (isLocalDatabase()) {
  const running = await fetch(`http://localhost:${Number(process.env.API_PORT) || 3001}/api/auth/me`)
    .then(() => true)
    .catch(() => false)
  if (running) {
    console.log('ℹ The app is running and has already set up the local database (it does this on every start).')
    console.log('  To re-run setup by hand, stop "npm run dev" first (Ctrl+C), then run "npm run db:setup".')
    process.exit(0)
  }
}

const sql = getSql()
try {
  const counts = await runSetup(sql)
  console.log('\nRow counts:')
  console.table(counts)
} catch (err) {
  console.error('\n✖ Database setup failed:', err.message)
  if (!isLocalDatabase())
    console.error('  Check that DATABASE_URL in .env is the full connection string from the Neon "Connect" window.')
  process.exitCode = 1
} finally {
  await sql.close?.()
}
