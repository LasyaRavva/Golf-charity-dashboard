const supabase = require('../config/supabase')

// GET ALL CHARITIES (Public)
const getCharities = async (req, res) => {
  try {
    const { search, featured } = req.query

    let query = supabase
      .from('charities')
      .select('*, charity_events(*)')
      .order('created_at', { ascending: false })

    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    if (featured === 'true') {
      query = query.eq('featured', true)
    }

    const { data: charities, error } = await query

    if (error) throw error

    res.json({ charities })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// GET SINGLE CHARITY (Public)
const getCharity = async (req, res) => {
  const { id } = req.params

  try {
    const { data: charity, error } = await supabase
      .from('charities')
      .select('*, charity_events(*)')
      .eq('id', id)
      .single()

    if (error || !charity)
      return res.status(404).json({ message: 'Charity not found' })

    res.json({ charity })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// SELECT CHARITY (User)
const selectCharity = async (req, res) => {
  const { charity_id } = req.body
  const userId = req.user.id

  if (!charity_id)
    return res.status(400).json({ message: 'Charity ID is required' })

  try {
    // Verify charity exists
    const { data: charity } = await supabase
      .from('charities')
      .select('id, name')
      .eq('id', charity_id)
      .single()

    if (!charity)
      return res.status(404).json({ message: 'Charity not found' })

    // Update user's charity
    await supabase
      .from('users')
      .update({ charity_id })
      .eq('id', userId)

    res.json({ message: `Charity "${charity.name}" selected successfully` })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// MAKE INDEPENDENT DONATION (User)
const makeDonation = async (req, res) => {
  const { charity_id, amount } = req.body
  const userId = req.user.id

  if (!charity_id || !amount)
    return res.status(400).json({ message: 'Charity ID and amount are required' })

  if (amount <= 0)
    return res.status(400).json({ message: 'Amount must be greater than 0' })

  try {
    const { data: donation, error } = await supabase
      .from('donations')
      .insert([{
        user_id: userId,
        charity_id,
        amount,
        type: 'independent'
      }])
      .select()
      .single()

    if (error) throw error

    res.status(201).json({
      message: 'Donation recorded successfully',
      donation
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// GET USER DONATIONS
const getUserDonations = async (req, res) => {
  try {
    const { data: donations, error } = await supabase
      .from('donations')
      .select('*, charities(name, image_url)')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    const total = donations.reduce((sum, d) => sum + d.amount, 0)

    res.json({ donations, total })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// ─── ADMIN ───

// CREATE CHARITY
const createCharity = async (req, res) => {
  const { name, description, image_url, featured } = req.body

  if (!name)
    return res.status(400).json({ message: 'Charity name is required' })

  try {
    const { data: charity, error } = await supabase
      .from('charities')
      .insert([{ name, description, image_url, featured: featured || false }])
      .select()
      .single()

    if (error) throw error

    res.status(201).json({ message: 'Charity created', charity })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// UPDATE CHARITY
const updateCharity = async (req, res) => {
  const { id } = req.params
  const { name, description, image_url, featured } = req.body

  try {
    const { data: charity, error } = await supabase
      .from('charities')
      .update({ name, description, image_url, featured })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    res.json({ message: 'Charity updated', charity })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// DELETE CHARITY
const deleteCharity = async (req, res) => {
  const { id } = req.params

  try {
    await supabase.from('charities').delete().eq('id', id)
    res.json({ message: 'Charity deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// ADD CHARITY EVENT
const addCharityEvent = async (req, res) => {
  const { id } = req.params
  const { title, event_date, description } = req.body

  if (!title)
    return res.status(400).json({ message: 'Event title is required' })

  try {
    const { data: event, error } = await supabase
      .from('charity_events')
      .insert([{
        charity_id: id,
        title,
        event_date,
        description
      }])
      .select()
      .single()

    if (error) throw error

    res.status(201).json({ message: 'Event added', event })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// DELETE CHARITY EVENT
const deleteCharityEvent = async (req, res) => {
  const { eventId } = req.params

  try {
    await supabase.from('charity_events').delete().eq('id', eventId)
    res.json({ message: 'Event deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// GET CHARITY DONATION TOTALS (Admin)
const getCharityStats = async (req, res) => {
  try {
    const { data: donations } = await supabase
      .from('donations')
      .select('charity_id, amount, charities(name)')

    // Group by charity
    const stats = {}
    donations?.forEach(d => {
      const key = d.charity_id
      if (!stats[key]) {
        stats[key] = {
          charity_id: key,
          name: d.charities?.name,
          total: 0,
          count: 0
        }
      }
      stats[key].total += d.amount
      stats[key].count += 1
    })

    res.json({ stats: Object.values(stats) })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

module.exports = {
  getCharities,
  getCharity,
  selectCharity,
  makeDonation,
  getUserDonations,
  createCharity,
  updateCharity,
  deleteCharity,
  addCharityEvent,
  deleteCharityEvent,
  getCharityStats
}