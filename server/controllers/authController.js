const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const supabase = require('../config/supabase')
const { sendWelcomeEmail } = require('../utils/emailService')

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  charity_id: user.charity_id,
  charity_percentage: user.charity_percentage,
  created_at: user.created_at
})

const createAuthToken = (user) => jwt.sign(
  { id: user.id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
)

const signup = async (req, res) => {
  const {
    name,
    email,
    password,
    charity_id,
    charity_percentage = 10
  } = req.body

  if (!name || !email || !password || !charity_id)
    return res.status(400).json({ message: 'All fields required' })

  if (password.length < 6)
    return res.status(400).json({ message: 'Password must be at least 6 characters' })

  if (Number(charity_percentage) < 10 || Number(charity_percentage) > 100)
    return res.status(400).json({ message: 'Charity percentage must be between 10 and 100' })

  try {
    const normalizedEmail = String(email).trim().toLowerCase()

    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .single()

    if (existing)
      return res.status(400).json({ message: 'Email already registered' })

    const { data: charity } = await supabase
      .from('charities')
      .select('id')
      .eq('id', charity_id)
      .single()

    if (!charity)
      return res.status(404).json({ message: 'Selected charity not found' })

    const hashedPassword = await bcrypt.hash(password, 10)
    const { data: user, error } = await supabase
      .from('users')
      .insert([{
        name: String(name).trim(),
        email: normalizedEmail,
        password: hashedPassword,
        charity_id,
        charity_percentage: Number(charity_percentage)
      }])
      .select('id, name, email, role, charity_id, charity_percentage, created_at')
      .single()

    if (error) throw error

    await sendWelcomeEmail(user)

    res.status(201).json({
      message: 'Account created successfully',
      token: createAuthToken(user),
      user: sanitizeUser(user)
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const login = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password)
    return res.status(400).json({ message: 'All fields required' })

  try {
    const normalizedEmail = String(email).trim().toLowerCase()
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', normalizedEmail)
      .single()

    if (error || !user)
      return res.status(401).json({ message: 'Invalid email or password' })

    const hashedPassword = String(user.password || '')
    const isHash = hashedPassword.startsWith('$2')
    const isMatch = isHash ? await bcrypt.compare(password, hashedPassword) : false

    if (!isMatch)
      return res.status(401).json({ message: 'Invalid email or password' })

    res.json({
      message: 'Login successful',
      token: createAuthToken(user),
      user: sanitizeUser(user)
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const forgotPassword = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password)
    return res.status(400).json({ message: 'Email and new password are required' })

  if (String(password).length < 6)
    return res.status(400).json({ message: 'Password must be at least 6 characters' })

  try {
    const normalizedEmail = String(email).trim().toLowerCase()
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, role, charity_id, charity_percentage, created_at')
      .eq('email', normalizedEmail)
      .single()

    if (error || !user)
      return res.status(404).json({ message: 'Account not found for that email address' })

    const hashedPassword = await bcrypt.hash(password, 10)
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('id', user.id)
      .select('id, name, email, role, charity_id, charity_percentage, created_at')
      .single()

    if (updateError) throw updateError

    res.json({
      message: 'Password updated successfully. You can now sign in.',
      user: sanitizeUser(updatedUser)
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const getMe = async (req, res) => {
  if (!req.user)
    return res.status(404).json({ message: 'User not found' })

  res.json({ user: sanitizeUser(req.user) })
}

module.exports = {
  signup,
  login,
  forgotPassword,
  getMe
}
