import jwt from 'jsonwebtoken'

export function makeToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export function requireAuth(request, response, next) {
  const header = request.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''

  if (!token) {
    return response.status(401).json({ error: 'missing auth token' })
  }

  try {
    request.user = jwt.verify(token, process.env.JWT_SECRET)
    return next()
  } catch (error) {
    return response.status(401).json({ error: 'invalid auth token' })
  }
}
