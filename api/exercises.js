import { getSql } from './_lib/db.js'
import { HttpError, handler } from './_lib/http.js'
import { requireUserId } from './_lib/auth.js'

const GROUPS = ['Chest', 'Back', 'Legs', 'Arms', 'Core', 'Cardio']

export default handler(['GET'], async (req, res) => {
  await requireUserId(req)
  const muscle = req.query.muscle
  if (muscle && !GROUPS.includes(muscle)) throw new HttpError(400, `Muscle group must be one of ${GROUPS.join(', ')}.`)

  const rows = await getSql()`
    SELECT id, name, muscle_group, sets, reps, difficulty, rest_seconds, description
    FROM exercises
    WHERE (${muscle ?? null}::text IS NULL OR muscle_group = ${muscle ?? null})
    ORDER BY array_position(${GROUPS}::text[], muscle_group), id`

  res.status(200).json({
    exercises: rows.map((e) => ({
      id: e.id,
      name: e.name,
      muscleGroup: e.muscle_group,
      sets: e.sets,
      reps: e.reps,
      difficulty: e.difficulty,
      restSeconds: e.rest_seconds,
      description: e.description,
    })),
  })
})
