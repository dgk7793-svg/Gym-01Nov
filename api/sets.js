import { getSql } from './_lib/db.js'
import { HttpError, body, handler, positiveInt } from './_lib/http.js'
import { requireUserId } from './_lib/auth.js'

// PATCH /api/sets { id, completed } -> tick or untick one set of the user's unfinished workout
export default handler(['PATCH'], async (req, res) => {
  const userId = await requireUserId(req)
  const b = body(req)
  const id = positiveInt(b.id, 'id')
  if (typeof b.completed !== 'boolean') throw new HttpError(400, 'completed must be true or false.')

  const sql = getSql()
  const [row] = await sql`
    UPDATE workout_sets s
    SET completed = ${b.completed}, completed_at = CASE WHEN ${b.completed} THEN now() END
    FROM workout_exercises we, workouts w
    WHERE s.id = ${id} AND we.id = s.workout_exercise_id AND w.id = we.workout_id
      AND w.user_id = ${userId} AND w.status <> 'completed'
    RETURNING s.id, s.completed, s.completed_at, w.id AS workout_id`
  if (!row) throw new HttpError(404, 'We couldn’t find that set in an unfinished workout.')

  // Ticking a set implies the workout has started
  await sql`
    UPDATE workouts SET status = 'in_progress', started_at = COALESCE(started_at, now())
    WHERE id = ${row.workout_id} AND status = 'planned'`

  res.status(200).json({ set: { id: row.id, completed: row.completed, completedAt: row.completed_at } })
})
