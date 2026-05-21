const express = require('express')
const router = express.Router()
const {
  createCheckoutSession,
  getSubscription,
  cancelSubscription
} = require('../controllers/subscriptionController')
const authMiddleware = require('../middleware/authMiddleware')

router.post('/checkout', authMiddleware, createCheckoutSession)
router.get('/', authMiddleware, getSubscription)
router.post('/cancel', authMiddleware, cancelSubscription)

module.exports = router
