const express = require('express')
const router = express.Router()
const {
  getScores,
  addScore,
  editScore,
  deleteScore
} = require('../controllers/scoreController')
const authMiddleware = require('../middleware/authMiddleware')
const subscriptionMiddleware = require('../middleware/subscriptionMiddleware')

// All score routes require auth + active subscription
router.use(authMiddleware, subscriptionMiddleware)

router.get('/', getScores)
router.post('/', addScore)
router.put('/:id', editScore)
router.delete('/:id', deleteScore)

module.exports = router