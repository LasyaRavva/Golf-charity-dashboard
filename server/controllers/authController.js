const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const supabase = require('../config/supabase')
const {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPasswordResetOtpEmail
} = require('../utils/emailService')

// SIGNUP
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

  if (charity_percentage < 10 || charity_percentage > 100)
    return res.status(400).json({ message: 'Charity percentage must be between 10 and 100' })

  try {
    // Check if user exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Insert user
    const { data: user, error } = await supabase
      .from('users')
      .insert([{
        name,
        email,
        password: hashedPassword,
        charity_id,
        charity_percentage
      }])
      .select()
      .single()

    if (error) throw error

    await sendWelcomeEmail(user)

    // Generate token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// LOGIN
const login = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password)
    return res.status(400).json({ message: 'All fields required' })

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !user)
      return res.status(401).json({ message: 'Invalid email or password' })

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch)
      return res.status(401).json({ message: 'Invalid email or password' })

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// FORGOT PASSWORD
const forgotPassword = async (req, res) => {
  const { email } = req.body

  if (!email)
    return res.status(400).json({ message: 'Email is required' })

  try {
    const { data: user } = await supabase
      .from('users')
      .select('id, name, email, password')
      .eq('email', email)
      .single()

    if (user) {
      const code = String(Math.floor(100000 + Math.random() * 900000))
      const secret = `${process.env.JWT_SECRET}${user.password}`
      const token = jwt.sign(
        { id: user.id, email: user.email, code, type: 'password-reset-otp' },
        secret,
        { expiresIn: '15m' }
      )

      await sendPasswordResetOtpEmail(user, code)

      return res.json({
        message: 'We sent a 6-digit reset code to your email.',
        resetSession: token
      })
    }

    res.json({
      message: 'If an account exists for that email, a reset code has been sent.'
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// RESET PASSWORD
const resetPassword = async (req, res) => {
  const { id, token, password } = req.body

  if (!id || !token || !password)
    return res.status(400).json({ message: 'All fields required' })

  if (password.length < 6)
    return res.status(400).json({ message: 'Password must be at least 6 characters' })

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, password')
      .eq('id', id)
      .single()

    if (error || !user)
      return res.status(400).json({ message: 'Invalid or expired reset link' })

    const secret = `${process.env.JWT_SECRET}${user.password}`

    try {
      const payload = jwt.verify(token, secret)
      if (payload.type !== 'password-reset' || String(payload.id) !== String(user.id))
        return res.status(400).json({ message: 'Invalid or expired reset link' })
    } catch {
      return res.status(400).json({ message: 'Invalid or expired reset link' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const { error: updateError } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('id', id)

    if (updateError) throw updateError

    res.json({ message: 'Password reset successful. You can now sign in.' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const resetPasswordWithCode = async (req, res) => {
  const { email, code, resetSession, password } = req.body

  if (!email || !code || !resetSession || !password)
    return res.status(400).json({ message: 'All fields required' })

  if (password.length < 6)
    return res.status(400).json({ message: 'Password must be at least 6 characters' })

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, password')
      .eq('email', email)
      .single()

    if (error || !user)
      return res.status(400).json({ message: 'Invalid or expired reset code' })

    const secret = `${process.env.JWT_SECRET}${user.password}`
    let payload

    try {
      payload = jwt.verify(resetSession, secret)
    } catch {
      return res.status(400).json({ message: 'Invalid or expired reset code' })
    }

    if (
      payload.type !== 'password-reset-otp' ||
      String(payload.id) !== String(user.id) ||
      String(payload.email).toLowerCase() !== String(email).toLowerCase() ||
      String(payload.code) !== String(code).trim()
    ) {
      return res.status(400).json({ message: 'Invalid or expired reset code' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const { error: updateError } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('id', user.id)

    if (updateError) throw updateError

    res.json({ message: 'Password reset successful. You can now sign in.' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// GET CURRENT USER
const getMe = async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, role, charity_id, charity_percentage, created_at')
      .eq('id', req.user.id)
      .single()

    if (error || !user)
      return res.status(404).json({ message: 'User not found' })

    res.json({ user })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

module.exports = {
  signup,
  login,
  forgotPassword,
  resetPassword,
  resetPasswordWithCode,
  getMe
}
