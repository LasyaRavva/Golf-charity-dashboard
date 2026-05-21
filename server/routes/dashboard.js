const express = require('express')
const router = express.Router()
const { getDashboard } = require('../controllers/dashboardController')
const authMiddleware = require('../middleware/authMiddleware')
const subscriptionMiddleware = require('../middleware/subscriptionMiddleware')

router.get('/', authMiddleware, subscriptionMiddleware, getDashboard)

module.exports = router