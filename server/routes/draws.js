const express = require('express')
const router = express.Router()
const {
  createDraw,
  simulateDraw,
  publishDraw,
  getDraws,
  getDraw,
  getAdminDraws
} = require('../controllers/drawController')
const authMiddleware = require('../middleware/authMiddleware')
const adminMiddleware = require('../middleware/adminMiddleware')

// Public
router.get('/', getDraws)

// Admin only
router.get('/admin/all', authMiddleware, adminMiddleware, getAdminDraws)
router.post('/', authMiddleware, adminMiddleware, createDraw)
router.post('/:id/simulate', authMiddleware, adminMiddleware, simulateDraw)
router.post('/:id/publish', authMiddleware, adminMiddleware, publishDraw)
router.get('/:id', getDraw)

module.exports = router
