// server/routes/winners.js
const express = require('express')
const router = express.Router()
const { uploadProof } = require('../controllers/adminController')
const authMiddleware = require('../middleware/authMiddleware')

router.put('/:id/proof', authMiddleware, uploadProof)

module.exports = router