const supabase = require('../config/supabase')
const {
  generateRandomDraw,
  generateAlgorithmicDraw,
  checkMatch,
  getMatchTier
} = require('../utils/drawEngine')
const {
  calculatePrizePool,
  splitPrize,
  calculateTotalFromSubscribers
} = require('../utils/prizeCalculator')
const { sendDrawResultsEmail } = require('../utils/emailService')

// CREATE DRAW (Admin)
const createDraw = async (req, res) => {
  const { month, logic_type } = req.body

  if (!month)
    return res.status(400).json({ message: 'Month is required (e.g. 2026-05)' })

  try {
    // Check draw for this month doesn't already exist
    const { data: existing } = await supabase
      .from('draws')
      .select('id')
      .eq('month', month)
      .single()

    if (existing)
      return res.status(400).json({ message: 'Draw for this month already exists' })

    // Generate draw numbers
    const drawNumbers = logic_type === 'algorithmic'
      ? await generateAlgorithmicDraw(supabase)
      : generateRandomDraw()

    // Create draw
    const { data: draw, error } = await supabase
      .from('draws')
      .insert([{
        month,
        draw_numbers: drawNumbers,
        logic_type: logic_type || 'random',
        status: 'draft'
      }])
      .select()
      .single()

    if (error) throw error

    res.status(201).json({ message: 'Draw created', draw })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// SIMULATE DRAW (Admin — preview before publish)
const simulateDraw = async (req, res) => {
  const { id } = req.params

  try {
    const { data: draw } = await supabase
      .from('draws')
      .select('*')
      .eq('id', id)
      .single()

    if (!draw)
      return res.status(404).json({ message: 'Draw not found' })

    // Get all active subscribers with their scores
    const { data: subscribers } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('status', 'active')

    const results = { tier5: [], tier4: [], tier3: [], noMatch: [] }

    for (const sub of subscribers) {
      const { data: scores } = await supabase
        .from('scores')
        .select('score')
        .eq('user_id', sub.user_id)

      const userScores = scores?.map(s => s.score) || []
      const matchCount = checkMatch(draw.draw_numbers, userScores)
      const tier = getMatchTier(matchCount)

      const entry = { user_id: sub.user_id, scores: userScores, matchCount }

      if (tier === 5) results.tier5.push(entry)
      else if (tier === 4) results.tier4.push(entry)
      else if (tier === 3) results.tier3.push(entry)
      else results.noMatch.push(entry)
    }

    // Calculate prize pool
    const totalPool = calculateTotalFromSubscribers(subscribers)
    const prizePool = calculatePrizePool(totalPool)

    res.json({
      draw,
      drawNumbers: draw.draw_numbers,
      simulation: {
        totalParticipants: subscribers.length,
        tier5Winners: results.tier5.length,
        tier4Winners: results.tier4.length,
        tier3Winners: results.tier3.length,
        prizePool,
        tier5Prize: splitPrize(prizePool.tier_5, results.tier5.length),
        tier4Prize: splitPrize(prizePool.tier_4, results.tier4.length),
        tier3Prize: splitPrize(prizePool.tier_3, results.tier3.length),
      }
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// PUBLISH DRAW (Admin)
const publishDraw = async (req, res) => {
  const { id } = req.params

  try {
    const { data: draw } = await supabase
      .from('draws')
      .select('*')
      .eq('id', id)
      .single()

    if (!draw)
      return res.status(404).json({ message: 'Draw not found' })

    if (draw.status === 'published')
      return res.status(400).json({ message: 'Draw already published' })

    // Get active subscribers
    const { data: subscribers } = await supabase
      .from('subscriptions')
      .select('user_id, plan')
      .eq('status', 'active')

    // Calculate prize pool
    const totalPool = calculateTotalFromSubscribers(subscribers)

    // Check for jackpot rollover from previous month
    const { data: lastDraw } = await supabase
      .from('draws')
      .select('id, jackpot_rollover')
      .eq('status', 'published')
      .eq('jackpot_rollover', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const rolloverAmount = lastDraw ? (totalPool * 0.40) : 0
    const prizePool = calculatePrizePool(totalPool, !!lastDraw, rolloverAmount)

    // Save prize pool
    await supabase.from('prize_pools').insert([{
      draw_id: draw.id,
      total_amount: prizePool.total,
      tier_5: prizePool.tier_5,
      tier_4: prizePool.tier_4,
      tier_3: prizePool.tier_3
    }])

    // Process each subscriber
    const tier5Winners = []
    const tier4Winners = []
    const tier3Winners = []

    for (const sub of subscribers) {
      const { data: scores } = await supabase
        .from('scores')
        .select('score')
        .eq('user_id', sub.user_id)

      const userScores = scores?.map(s => s.score) || []
      const matchCount = checkMatch(draw.draw_numbers, userScores)
      const tier = getMatchTier(matchCount)

      // Save draw entry
      await supabase.from('draw_entries').insert([{
        draw_id: draw.id,
        user_id: sub.user_id,
        scores_snapshot: userScores
      }])

      if (tier === 5) tier5Winners.push(sub.user_id)
      else if (tier === 4) tier4Winners.push(sub.user_id)
      else if (tier === 3) tier3Winners.push(sub.user_id)
    }

    // Check jackpot rollover
    const jackpotRollover = tier5Winners.length === 0

    // Save winners
    const saveWinners = async (userIds, tier, tierPool) => {
      if (userIds.length === 0) return
      const prize = splitPrize(tierPool, userIds.length)
      for (const userId of userIds) {
        await supabase.from('winners').insert([{
          draw_id: draw.id,
          user_id: userId,
          match_tier: tier,
          prize_amount: prize,
          verification_status: 'pending',
          payment_status: 'pending'
        }])
      }
    }

    await saveWinners(tier5Winners, 5, prizePool.tier_5)
    await saveWinners(tier4Winners, 4, prizePool.tier_4)
    await saveWinners(tier3Winners, 3, prizePool.tier_3)

    // Update draw status
    await supabase
      .from('draws')
      .update({
        status: 'published',
        jackpot_rollover: jackpotRollover,
        published_at: new Date().toISOString()
      })
      .eq('id', id)

    for (const sub of subscribers) {
      const { data: user } = await supabase
        .from('users')
        .select('name, email')
        .eq('id', sub.user_id)
        .single()

      const { data: scores } = await supabase
        .from('scores')
        .select('score')
        .eq('user_id', sub.user_id)

      const userScores = scores?.map(s => s.score) || []
      const matchCount = checkMatch(draw.draw_numbers, userScores)

      await sendDrawResultsEmail(user, draw, userScores, matchCount)
    }

    res.json({
      message: 'Draw published successfully',
      drawNumbers: draw.draw_numbers,
      results: {
        tier5Winners: tier5Winners.length,
        tier4Winners: tier4Winners.length,
        tier3Winners: tier3Winners.length,
        jackpotRollover,
        prizePool
      }
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// GET ALL DRAWS (Public)
const getDraws = async (req, res) => {
  try {
    const { data: draws, error } = await supabase
      .from('draws')
      .select('*, prize_pools(*)')
      .eq('status', 'published')
      .order('published_at', { ascending: false })

    if (error) throw error

    res.json({ draws })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// GET SINGLE DRAW
const getDraw = async (req, res) => {
  const { id } = req.params

  try {
    const { data: draw, error } = await supabase
      .from('draws')
      .select('*, prize_pools(*)')
      .eq('id', id)
      .single()

    if (error || !draw)
      return res.status(404).json({ message: 'Draw not found' })

    res.json({ draw })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// GET ALL DRAWS FOR ADMIN
const getAdminDraws = async (req, res) => {
  try {
    const { data: draws, error } = await supabase
      .from('draws')
      .select('*, prize_pools(*)')
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json({ draws })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

module.exports = {
  createDraw,
  simulateDraw,
  publishDraw,
  getDraws,
  getDraw,
  getAdminDraws
}
