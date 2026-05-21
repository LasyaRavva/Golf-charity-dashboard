const express = require('express')
const router = express.Router()
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  resetPasswordWithCode,
  getMe
} = require('../controllers/authController')
const authMiddleware = require('../middleware/authMiddleware')

router.post('/signup', signup)
router.post('/login', login)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)
router.post('/reset-password-code', resetPasswordWithCode)
router.get('/me', authMiddleware, getMe)

module.exports = router
