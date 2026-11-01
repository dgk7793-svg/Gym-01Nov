import { getSql } from './_lib/db.js'
import { HttpError, body, handler, isoDate, positiveInt } from './_lib/http.js'
import { requireUserId } from './_lib/auth.js'
import { findWorkoutForDay, getWorkoutDetail, renameFromMuscles } from './_lib/workouts.js'

// GET    /api/workouts?date=YYYY-MM-DD           -> that day's workout with exercises and sets (or null)
// POST   /api/workouts { date, exerciseId }      -> add an exercise to that day's unfinished workout (created if needed)
// DELETE /api/workouts?workoutExerciseId=123     -> remove an exercise from an unfinished workout
// PATCH  /api/workouts { id, action }            -> action "start" or "complete"
export default handler(['GET', 'POST', 'DELETE', 'PATCH'], async (req, res) => {
  const userId = await requireUserId(req)
  const sql = getSql()

  if (req.method === 'GET') {
    const date = isoDate(req.query.date)
    const id = await findWorkoutForDay(sql, userId, date)
    return res.status(200).json({ workout: id ? await getWorkoutDetail(sql, userId, id) : null })
  }

  if (req.method === 'POST') {
    const b = body(req)
    const date = isoDate(b.date)
    const exerciseId = positiveInt(b.exerciseId, 'exerciseId')

    const [exercise] = await sql`SELECT id, name, sets FROM exercises WHERE id = ${exerciseId}`
    if (!exercise) throw new HttpError(404, 'That exercise no longer exists.')

    let workoutId = await findWorkoutForDay(sql, userId, date, { activeOnly: true })
    if (!workoutId) {
      const [w] = await sql`
        INSERT INTO workouts (user_id, name, workout_date) VALUES (${userId}, 'Today’s Workout', ${date}) RETURNING id`
      workoutId = w.id
    }

    const [we] = await sql`
      INSERT INTO workout_exercises (workout_id, exercise_id, order_index)
      SELECT ${workoutId}, ${exerciseId}, COALESCE(MAX(order_index) + 1, 0)
      FROM workout_exercises WHERE workout_id = ${workoutId}
      ON CONFLICT (workout_id, exercise_id) DO NOTHING
      RETURNING id`
    if (!we) throw new HttpError(409, `${exercise.name} is already in today’s workout.`)

    await sql`
      INSERT INTO workout_sets (workout_exercise_id, set_number)
      SELECT ${we.id}, n FROM generate_series(1, ${exercise.sets}::int) AS n
      ON CONFLICT DO NOTHING`
    await renameFromMuscles(sql, workoutId)

    return res.status(201).json({ workout: await getWorkoutDetail(sql, userId, workoutId) })
  }

  if (req.method === 'DELETE') {
    const weId = positiveInt(req.query.workoutExerciseId, 'workoutExerciseId')
    const [row] = await sql`
      DELETE FROM workout_exercises we
      USING workouts w
      WHERE we.id = ${weId} AND we.workout_id = w.id AND w.user_id = ${userId} AND w.status <> 'completed'
      RETURNING w.id AS workout_id`
    if (!row) throw new HttpError(404, 'We couldn’t find that exercise in an unfinished workout.')

    // Drop the workout entirely if it's now empty and was never started
    const [gone] = await sql`
      DELETE FROM workouts w
      WHERE w.id = ${row.workout_id} AND w.status = 'planned'
        AND NOT EXISTS (SELECT 1 FROM workout_exercises WHERE workout_id = w.id)
      RETURNING id`
    if (gone) return res.status(200).json({ workout: null })

    await renameFromMuscles(sql, row.workout_id)
    return res.status(200).json({ workout: await getWorkoutDetail(sql, userId, row.workout_id) })
  }

  // PATCH
  const b = body(req)
  const id = positiveInt(b.id, 'id')

  if (b.action === 'start') {
    const [w] = await sql`
      UPDATE workouts SET status = 'in_progress', started_at = COALESCE(started_at, now())
      WHERE id = ${id} AND user_id = ${userId} AND status <> 'completed'
      RETURNING id`
    if (!w) throw new HttpError(404, 'That workout can’t be started. It may already be finished.')
  } else if (b.action === 'complete') {
    const [w] = await sql`
      UPDATE workouts
      SET status = 'completed',
          completed_at = now(),
          started_at = COALESCE(started_at, now()),
          duration_minutes = GREATEST(1, ROUND(EXTRACT(EPOCH FROM (now() - COALESCE(started_at, now()))) / 60))::int
      WHERE id = ${id} AND user_id = ${userId} AND status <> 'completed'
      RETURNING id`
    if (!w) throw new HttpError(404, 'That workout is already finished.')
  } else {
    throw new HttpError(400, 'action must be "start" or "complete".')
  }

  res.status(200).json({ workout: await getWorkoutDetail(sql, userId, id) })
})
