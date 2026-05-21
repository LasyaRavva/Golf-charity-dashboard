const express = require('express')
const router = express.Router()
const {
  getAdminStats,
  getUsers,
  getUser,
  updateUser,
  updateUserScore,
  updateSubscription,
  getWinners,
  verifyWinner,
  markPayout,
  uploadProof,
  getReports
} = require('../controllers/adminController')
const authMiddleware = require('../middleware/authMiddleware')
const adminMiddleware = require('../middleware/adminMiddleware')

// All admin routes require auth + admin role
router.use(authMiddleware, adminMiddleware)

// Stats
router.get('/stats', getAdminStats)
router.get('/reports', getReports)

// Users
router.get('/users', getUsers)
router.get('/users/:id', getUser)
router.put('/users/:id', updateUser)
router.put('/users/:id/subscription', updateSubscription)
router.put('/scores/:scoreId', updateUserScore)

// Winners
router.get('/winners', getWinners)
router.put('/winners/:id/verify', verifyWinner)
router.put('/winners/:id/payout', markPayout)

module.exports = router