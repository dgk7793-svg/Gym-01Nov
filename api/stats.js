import { getSql } from './_lib/db.js'
import { handler } from './_lib/http.js'

// Public community numbers for the landing page. Aggregates only, no per-user data.
export default handler(['GET'], async (req, res) => {
  const [row] = await getSql()`
    SELECT
      (SELECT count(*) FROM users)::int AS members,
      (SELECT count(*) FROM workouts WHERE status = 'completed')::int AS workouts_completed,
      (SELECT count(*) FROM classes
        WHERE start_time >= date_trunc('week', now())
          AND start_time < date_trunc('week', now()) + interval '7 days')::int AS classes_this_week`
  res.status(200).json({
    members: row.members,
    workoutsCompleted: row.workouts_completed,
    classesThisWeek: row.classes_this_week,
  })
})
