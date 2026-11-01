// Shared workout queries. Every lookup is scoped by user_id so users only ever see their own data.

// The workout to show for a given day: the newest unfinished one, otherwise the newest completed one.
export async function findWorkoutForDay(sql, userId, date, { activeOnly = false } = {}) {
  const rows = await sql`
    SELECT id FROM workouts
    WHERE user_id = ${userId} AND workout_date = ${date}
      AND (${!activeOnly} OR status <> 'completed')
    ORDER BY (status = 'completed'), id DESC
    LIMIT 1`
  return rows[0]?.id ?? null
}

export async function getWorkoutDetail(sql, userId, workoutId) {
  const [workout] = await sql`
    SELECT id, name, workout_date::text AS date, status, duration_minutes, started_at, completed_at
    FROM workouts WHERE id = ${workoutId} AND user_id = ${userId}`
  if (!workout) return null

  const rows = await sql`
    SELECT we.id AS workout_exercise_id, we.order_index, e.id AS exercise_id, e.name, e.muscle_group,
           e.reps, e.rest_seconds, e.difficulty,
           s.id AS set_id, s.set_number, s.completed, s.completed_at
    FROM workout_exercises we
    JOIN exercises e ON e.id = we.exercise_id
    LEFT JOIN workout_sets s ON s.workout_exercise_id = we.id
    WHERE we.workout_id = ${workoutId}
    ORDER BY we.order_index, we.id, s.set_number`

  const exercises = []
  const byId = new Map()
  for (const r of rows) {
    let ex = byId.get(r.workout_exercise_id)
    if (!ex) {
      ex = {
        id: r.workout_exercise_id,
        exerciseId: r.exercise_id,
        name: r.name,
        muscleGroup: r.muscle_group,
        reps: r.reps,
        restSeconds: r.rest_seconds,
        difficulty: r.difficulty,
        sets: [],
      }
      byId.set(r.workout_exercise_id, ex)
      exercises.push(ex)
    }
    if (r.set_id) ex.sets.push({ id: r.set_id, setNumber: r.set_number, completed: r.completed, completedAt: r.completed_at })
  }

  return {
    id: workout.id,
    name: workout.name,
    date: workout.date,
    status: workout.status,
    durationMinutes: workout.duration_minutes,
    startedAt: workout.started_at,
    completedAt: workout.completed_at,
    exercises,
  }
}

// Name the workout after the muscle groups in it, e.g. "Back + Chest Day".
export async function renameFromMuscles(sql, workoutId) {
  await sql`
    UPDATE workouts SET name = COALESCE((
      SELECT string_agg(DISTINCT e.muscle_group, ' + ' ORDER BY e.muscle_group) || ' Day'
      FROM workout_exercises we JOIN exercises e ON e.id = we.exercise_id
      WHERE we.workout_id = ${workoutId}
    ), 'Today’s Workout')
    WHERE id = ${workoutId}`
}
