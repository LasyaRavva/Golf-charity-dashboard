const express = require('express')
const router = express.Router()
const {
  getCharities,
  getCharity,
  selectCharity,
  makeDonation,
  getUserDonations,
  createCharity,
  updateCharity,
  deleteCharity,
  addCharityEvent,
  deleteCharityEvent,
  getCharityStats
} = require('../controllers/charityController')
const authMiddleware = require('../middleware/authMiddleware')
const adminMiddleware = require('../middleware/adminMiddleware')

// Public
router.get('/', getCharities)

// User (auth required)
router.post('/select', authMiddleware, selectCharity)
router.post('/donate', authMiddleware, makeDonation)
router.get('/user/donations', authMiddleware, getUserDonations)

// Admin
router.post('/', authMiddleware, adminMiddleware, createCharity)
router.put('/:id', authMiddleware, adminMiddleware, updateCharity)
router.delete('/:id', authMiddleware, adminMiddleware, deleteCharity)
router.post('/:id/events', authMiddleware, adminMiddleware, addCharityEvent)
router.delete('/events/:eventId', authMiddleware, adminMiddleware, deleteCharityEvent)
router.get('/admin/stats', authMiddleware, adminMiddleware, getCharityStats)
router.get('/:id', getCharity)

module.exports = router
