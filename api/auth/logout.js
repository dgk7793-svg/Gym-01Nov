import { handler } from '../_lib/http.js'
import { clearSession } from '../_lib/auth.js'

export default handler(['POST'], async (req, res) => {
  clearSession(res)
  res.status(200).json({ ok: true })
})
