import { getSql } from './_lib/db.js'
import { HttpError, handler, isoDate } from './_lib/http.js'
import { requireUserId } from './_lib/auth.js'
import { findWorkoutForDay, getWorkoutDetail } from './_lib/workouts.js'

const DAY = 86400000
const toDay = (iso) => Math.round(Date.parse(`${iso}T00:00:00Z`) / DAY)

// Current streak counts back from today, or from yesterday if today isn't done yet.
function streaks(dates, today) {
  const days = [...new Set(dates.map(toDay))].sort((a, b) => b - a)
  const t = toDay(today)
  let current = 0
  if (days.length && (days[0] === t || days[0] === t - 1)) {
    current = 1
    while (current < days.length && days[current] === days[0] - current) current++
  }
  let best = 0
  let run = 0
  for (let i = 0; i < days.length; i++) {
    run = i > 0 && days[i] === days[i - 1] - 1 ? run + 1 : 1
    best = Math.max(best, run)
  }
  return { current, best }
}

// GET /api/dashboard?date=YYYY-MM-DD (the user's local "today")
export default handler(['GET'], async (req, res) => {
  const userId = await requireUserId(req)
  const today = isoDate(req.query.date)
  const sql = getSql()

  const [user] = await sql`
    SELECT full_name, weekly_goal_workouts, weekly_goal_minutes FROM users WHERE id = ${userId}`
  if (!user) throw new HttpError(401, 'Please log in to continue.')

  const [activity, week, completedDates, nextClass, todayId] = await Promise.all([
    sql`
      SELECT d::date::text AS date, COALESCE(SUM(w.duration_minutes), 0)::int AS minutes
      FROM generate_series(${today}::date - 6, ${today}::date, interval '1 day') AS d
      LEFT JOIN workouts w ON w.workout_date = d::date AND w.user_id = ${userId} AND w.status = 'completed'
      GROUP BY d ORDER BY d`,
    sql`
      SELECT workout_date::text AS date, COALESCE(SUM(duration_minutes), 0)::int AS minutes, count(*)::int AS workouts
      FROM workouts
      WHERE user_id = ${userId} AND status = 'completed'
        AND workout_date BETWEEN ${today}::date - (EXTRACT(ISODOW FROM ${today}::date)::int - 1)
                             AND ${today}::date - (EXTRACT(ISODOW FROM ${today}::date)::int - 1) + 6
      GROUP BY workout_date`,
    sql`
      SELECT DISTINCT workout_date::text AS date FROM workouts
      WHERE user_id = ${userId} AND status = 'completed' AND workout_date <= ${today}::date
      ORDER BY date DESC LIMIT 400`,
    sql`
      SELECT title, coach_name, start_time, duration_minutes, intensity FROM classes
      WHERE start_time > now() ORDER BY start_time LIMIT 1`,
    findWorkoutForDay(sql, userId, today),
  ])

  const weekWorkouts = week.reduce((s, r) => s + r.workouts, 0)
  const weekMinutes = week.reduce((s, r) => s + r.minutes, 0)
  const goalsHit =
    Number(weekWorkouts >= user.weekly_goal_workouts) + Number(weekMinutes >= user.weekly_goal_minutes)

  // Mon..Sun flags for the current week
  const monday = toDay(today) - ((new Date(`${today}T00:00:00Z`).getUTCDay() + 6) % 7)
  const doneSet = new Set(week.map((r) => toDay(r.date)))
  const weekDone = Array.from({ length: 7 }, (_, i) => doneSet.has(monday + i))

  res.status(200).json({
    user: { fullName: user.full_name },
    today: todayId ? await getWorkoutDetail(sql, userId, todayId) : null,
    activity: activity.map((a) => ({
      date: a.date,
      day: new Date(`${a.date}T00:00:00Z`).toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' }),
      minutes: a.minutes,
    })),
    streak: { ...streaks(completedDates.map((r) => r.date), today), weekDone },
    rings: {
      workouts: { value: weekWorkouts, goal: user.weekly_goal_workouts },
      minutes: { value: weekMinutes, goal: user.weekly_goal_minutes },
      goalsHit: { value: goalsHit, goal: 2 },
    },
    nextClass: nextClass[0]
      ? {
          title: nextClass[0].title,
          coach: nextClass[0].coach_name,
          startTime: nextClass[0].start_time,
          durationMinutes: nextClass[0].duration_minutes,
          intensity: nextClass[0].intensity,
        }
      : null,
  })
})
