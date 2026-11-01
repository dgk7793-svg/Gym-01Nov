import bcrypt from 'bcryptjs'
import { getSql } from '../_lib/db.js'
import { HttpError, body, handler } from '../_lib/http.js'
import { publicUser, setSession } from '../_lib/auth.js'

export default handler(['POST'], async (req, res) => {
  const b = body(req)
  const email = String(b.email ?? '').trim().toLowerCase()
  const password = String(b.password ?? '')
  const fullName = String(b.fullName ?? '').trim()
  const goalWorkouts = Number(b.weeklyGoalWorkouts ?? 4)
  const goalMinutes = Number(b.weeklyGoalMinutes ?? 150)

  if (!fullName || fullName.length > 80) throw new HttpError(400, 'Please tell us your name (up to 80 characters).')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) throw new HttpError(400, 'That email address doesn’t look right.')
  if (password.length < 8 || password.length > 72) throw new HttpError(400, 'Your password needs 8 to 72 characters.')
  if (!Number.isInteger(goalWorkouts) || goalWorkouts < 1 || goalWorkouts > 14)
    throw new HttpError(400, 'Weekly workouts goal should be between 1 and 14.')
  if (!Number.isInteger(goalMinutes) || goalMinutes < 10 || goalMinutes > 3000)
    throw new HttpError(400, 'Weekly minutes goal should be between 10 and 3000.')

  const sql = getSql()
  const hash = await bcrypt.hash(password, 12)
  const [user] = await sql`
    INSERT INTO users (email, password_hash, full_name, weekly_goal_workouts, weekly_goal_minutes)
    VALUES (${email}, ${hash}, ${fullName}, ${goalWorkouts}, ${goalMinutes})
    ON CONFLICT (email) DO NOTHING
    RETURNING *`
  if (!user) throw new HttpError(409, 'An account with that email already exists. Try logging in instead.')

  await setSession(res, user.id)
  res.status(201).json({ user: publicUser(user) })
})
