import { getSql } from '../_lib/db.js'
import { handler } from '../_lib/http.js'
import { clearSession, getUserId, publicUser } from '../_lib/auth.js'

// Always 200: { user } when logged in, { user: null } otherwise.
export default handler(['GET'], async (req, res) => {
  const id = await getUserId(req)
  if (!id) return res.status(200).json({ user: null })

  const [user] = await getSql()`SELECT * FROM users WHERE id = ${id}`
  if (!user) {
    clearSession(res)
    return res.status(200).json({ user: null })
  }
  res.status(200).json({ user: publicUser(user) })
})
