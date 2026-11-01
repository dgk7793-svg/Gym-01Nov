// Applies db/schema.sql then db/seed.sql. Both are idempotent, so this is safe to run repeatedly.
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { root } from './env.js'

function statements(file) {
  const text = readFileSync(path.join(root, 'db', file), 'utf8')
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n')
  return text
    .split(/;\s*(?:\n|$)/)
    .map((s) => s.trim())
    .filter(Boolean)
}

export async function runSetup(sql, { log = console.log } = {}) {
  for (const file of ['schema.sql', 'seed.sql']) {
    const list = statements(file)
    for (const stmt of list) await sql.query(stmt)
    log(`✔ ${file} (${list.length} statements)`)
  }
  const [counts] = await sql`
    SELECT
      (SELECT count(*) FROM exercises)::int AS exercises,
      (SELECT count(*) FROM classes)::int AS classes,
      (SELECT count(*) FROM users)::int AS users,
      (SELECT count(*) FROM workouts)::int AS workouts`
  return counts
}
