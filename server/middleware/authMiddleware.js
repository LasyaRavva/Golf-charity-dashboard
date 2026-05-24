const jwt = require('jsonwebtoken')
const supabase = require('../config/supabase')

const getBearerToken = (req) => {
  const authHeader = req.headers.authorization || ''

  if (!authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided')
  }

  return authHeader.slice(7)
}

const authMiddleware = async (req, res, next) => {
  try {
    const token = getBearerToken(req)
    const payload = jwt.verify(token, process.env.JWT_SECRET)

    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, role, charity_id, charity_percentage, created_at')
      .eq('id', payload.id)
      .single()

    if (error || !user)
      return res.status(401).json({ message: 'User not found' })

    req.auth = payload
    req.user = user
    next()
  } catch (error) {
    return res.status(401).json({ message: error.message || 'Invalid or expired token' })
  }
}

module.exports = authMiddleware
