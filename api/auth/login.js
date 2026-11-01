import bcrypt from 'bcryptjs'
import { getSql } from '../_lib/db.js'
import { HttpError, body, handler } from '../_lib/http.js'
import { publicUser, setSession } from '../_lib/auth.js'

// Compared against when the email is unknown, so response time doesn't reveal which emails exist
const DUMMY_HASH = '$2b$12$MqhGqYtRCKIXakjdLkNW8OtVLbbKv9Y/4PBG9icflgkxaWbIRsXJa'

export default handler(['POST'], async (req, res) => {
  const b = body(req)
  const email = String(b.email ?? '').trim().toLowerCase()
  const password = String(b.password ?? '')
  if (!email || !password) throw new HttpError(400, 'Enter your email and password.')

  const sql = getSql()
  const [user] = await sql`SELECT * FROM users WHERE email = ${email}`
  const ok = await bcrypt.compare(password, user?.password_hash ?? DUMMY_HASH)
  if (!user || !ok) throw new HttpError(401, 'That email and password don’t match. Please try again.')

  await setSession(res, user.id)
  res.status(200).json({ user: publicUser(user) })
})
