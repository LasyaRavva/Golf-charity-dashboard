const supabase = require('../config/supabase')
const {
  sendVerificationApprovedEmail,
  sendVerificationRejectedEmail,
  sendPayoutEmail
} = require('../utils/emailService')

// ─── DASHBOARD STATS ───
const getAdminStats = async (req, res) => {
  try {
    // Total users
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    // Active subscribers
    const { count: activeSubscribers } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    // Total prize pool paid out
    const { data: prizePools } = await supabase
      .from('prize_pools')
      .select('total_amount')

    const totalPrizePool = prizePools?.reduce(
      (sum, p) => sum + (p.total_amount || 0), 0
    ) || 0

    // Total charity contributions
    const { data: donations } = await supabase
      .from('donations')
      .select('amount')

    const totalDonations = donations?.reduce(
      (sum, d) => sum + (d.amount || 0), 0
    ) || 0

    // Total draws
    const { count: totalDraws } = await supabase
      .from('draws')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published')

    // Pending winners
    const { count: pendingWinners } = await supabase
      .from('winners')
      .select('*', { count: 'exact', head: true })
      .eq('verification_status', 'pending')

    res.json({
      totalUsers,
      activeSubscribers,
      totalPrizePool: totalPrizePool.toFixed(2),
      totalDonations: totalDonations.toFixed(2),
      totalDraws,
      pendingWinners
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// ─── USER MANAGEMENT ───
const getUsers = async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select(`
        id, name, email, role, charity_percentage, created_at,
        subscriptions(plan, status, renewal_date),
        charities(name)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json({ users })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const getUser = async (req, res) => {
  const { id } = req.params

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        id, name, email, role, charity_percentage, created_at,
        subscriptions(*),
        charities(name),
        scores(score, date)
      `)
      .eq('id', id)
      .single()

    if (error || !user)
      return res.status(404).json({ message: 'User not found' })

    res.json({ user })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const updateUser = async (req, res) => {
  const { id } = req.params
  const { name, email, role } = req.body

  try {
    const { data: user, error } = await supabase
      .from('users')
      .update({ name, email, role })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    res.json({ message: 'User updated', user })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const updateUserScore = async (req, res) => {
  const { scoreId } = req.params
  const { score, date } = req.body

  if (score < 1 || score > 45)
    return res.status(400).json({ message: 'Score must be between 1 and 45' })

  try {
    const { data: updated, error } = await supabase
      .from('scores')
      .update({ score, date })
      .eq('id', scoreId)
      .select()
      .single()

    if (error) throw error

    res.json({ message: 'Score updated', score: updated })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const updateSubscription = async (req, res) => {
  const { id } = req.params
  const { status, plan, renewal_date } = req.body

  try {
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .update({ status, plan, renewal_date })
      .eq('user_id', id)
      .select()
      .single()

    if (error) throw error

    res.json({ message: 'Subscription updated', subscription })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// ─── WINNER MANAGEMENT ───
const getWinners = async (req, res) => {
  try {
    const { data: winners, error } = await supabase
      .from('winners')
      .select(`
        *,
        users(name, email),
        draws(month, draw_numbers)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json({ winners })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const verifyWinner = async (req, res) => {
  const { id } = req.params
  const { verification_status } = req.body

  if (!['approved', 'rejected'].includes(verification_status))
    return res.status(400).json({ message: 'Status must be approved or rejected' })

  try {
    const { data: winner, error } = await supabase
      .from('winners')
      .update({ verification_status })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    const { data: user } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', winner.user_id)
      .single()

    if (verification_status === 'approved') {
      await sendVerificationApprovedEmail(user, winner)
    } else {
      await sendVerificationRejectedEmail(user)
    }

    res.json({ message: `Winner ${verification_status}`, winner })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const markPayout = async (req, res) => {
  const { id } = req.params

  try {
    // Check winner is approved first
    const { data: winner } = await supabase
      .from('winners')
      .select('verification_status')
      .eq('id', id)
      .single()

    if (winner?.verification_status !== 'approved')
      return res.status(400).json({ message: 'Winner must be approved before marking as paid' })

    const { data: updated, error } = await supabase
      .from('winners')
      .update({ payment_status: 'paid' })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    const { data: user } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', updated.user_id)
      .single()

    await sendPayoutEmail(user, updated)

    res.json({ message: 'Payout marked as paid', winner: updated })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

const uploadProof = async (req, res) => {
  const { id } = req.params
  const { proof_url } = req.body
  const userId = req.user.id

  if (!proof_url)
    return res.status(400).json({ message: 'Proof URL is required' })

  try {
    // Make sure this winner belongs to this user
    const { data: winner } = await supabase
      .from('winners')
      .select('id, user_id')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (!winner)
      return res.status(404).json({ message: 'Winner record not found' })

    const { data: updated, error } = await supabase
      .from('winners')
      .update({ proof_url })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    res.json({ message: 'Proof uploaded successfully', winner: updated })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// ─── REPORTS ───
const getReports = async (req, res) => {
  try {
    // Draw stats
    const { data: draws } = await supabase
      .from('draws')
      .select('id, month, status, jackpot_rollover, prize_pools(total_amount)')

    // Winners by tier
    const { data: winners } = await supabase
      .from('winners')
      .select('match_tier, prize_amount, payment_status')

    const winnersByTier = { 5: 0, 4: 0, 3: 0 }
    winners?.forEach(w => { winnersByTier[w.match_tier] = (winnersByTier[w.match_tier] || 0) + 1 })

    const totalPaid = winners
      ?.filter(w => w.payment_status === 'paid')
      .reduce((sum, w) => sum + (w.prize_amount || 0), 0) || 0

    // Charity stats
    const { data: donations } = await supabase
      .from('donations')
      .select('amount, charity_id, charities(name)')

    const charityTotals = {}
    donations?.forEach(d => {
      const key = d.charity_id
      if (!charityTotals[key]) {
        charityTotals[key] = { name: d.charities?.name, total: 0 }
      }
      charityTotals[key].total += d.amount
    })

    // Subscription revenue
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('plan, status')

    const subStats = {
      active: subscriptions?.filter(s => s.status === 'active').length || 0,
      monthly: subscriptions?.filter(s => s.plan === 'monthly').length || 0,
      yearly: subscriptions?.filter(s => s.plan === 'yearly').length || 0,
    }

    res.json({
      draws: {
        total: draws?.length || 0,
        published: draws?.filter(d => d.status === 'published').length || 0,
        jackpotRollovers: draws?.filter(d => d.jackpot_rollover).length || 0
      },
      winners: {
        byTier: winnersByTier,
        totalPaid: totalPaid.toFixed(2)
      },
      charityTotals: Object.values(charityTotals),
      subscriptions: subStats
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

module.exports = {
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
}
