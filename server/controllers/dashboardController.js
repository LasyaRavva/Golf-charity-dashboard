const supabase = require('../config/supabase')

const getDashboard = async (req, res) => {
  const userId = req.user.id

  try {
    // Get user details
    const { data: user } = await supabase
      .from('users')
      .select('id, name, email, charity_id, charity_percentage')
      .eq('id', userId)
      .single()

    // Get subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()

    // Get scores
    const { data: scores } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })

    // Get charity
    const { data: charity } = user?.charity_id
      ? await supabase
          .from('charities')
          .select('id, name, image_url')
          .eq('id', user.charity_id)
          .single()
      : { data: null }

    // Get draw entries
    const { data: drawEntries } = await supabase
      .from('draw_entries')
      .select('*, draws(month, status)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    // Get winnings
    const { data: winnings } = await supabase
      .from('winners')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    // Calculate total won
    const totalWon = winnings
      ?.filter(w => w.payment_status === 'paid')
      .reduce((sum, w) => sum + (w.prize_amount || 0), 0) || 0

    // Get upcoming draw
    const { data: upcomingDraw } = await supabase
      .from('draws')
      .select('*')
      .eq('status', 'draft')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    res.json({
      user,
      subscription,
      scores,
      charity: charity
        ? { ...charity, contribution_percentage: user.charity_percentage }
        : null,
      drawEntries,
      winnings,
      totalWon,
      upcomingDraw
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

module.exports = { getDashboard }