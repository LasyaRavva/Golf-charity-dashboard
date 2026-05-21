const express = require('express')
const router = express.Router()
const authMiddleware = require('../middleware/authMiddleware')
const supabase = require('../config/supabase')

router.put('/charity-percentage', authMiddleware, async (req, res) => {
  const { percentage } = req.body
  if (percentage < 10 || percentage > 100)
    return res.status(400).json({ message: 'Percentage must be between 10 and 100' })

  try {
    await supabase
      .from('users')
      .update({ charity_percentage: percentage })
      .eq('id', req.user.id)

    res.json({ message: 'Charity percentage updated' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

module.exports = router