const supabase = require('../config/supabase')

const subscriptionMiddleware = async (req, res, next) => {
  try {
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status')
      .eq('user_id', req.user.id)
      .single()

    if (!subscription || subscription.status !== 'active')
      return res.status(403).json({ message: 'Active subscription required' })

    next()
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

module.exports = subscriptionMiddleware