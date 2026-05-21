const supabase = require('../config/supabase')

// GET USER SCORES
const getScores = async (req, res) => {
  try {
    const { data: scores, error } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', req.user.id)
      .order('date', { ascending: false })

    if (error) throw error

    res.json({ scores })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// ADD SCORE
const addScore = async (req, res) => {
  const { score, date } = req.body
  const userId = req.user.id

  if (!score || !date)
    return res.status(400).json({ message: 'Score and date are required' })

  if (score < 1 || score > 45)
    return res.status(400).json({ message: 'Score must be between 1 and 45' })

  try {
    // Get current scores count
    const { data: existingScores } = await supabase
      .from('scores')
      .select('id, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    // If already 5 scores, delete the oldest one
    if (existingScores && existingScores.length >= 5) {
      const oldest = existingScores[0]
      await supabase
        .from('scores')
        .delete()
        .eq('id', oldest.id)
    }

    // Insert new score
    const { data: newScore, error } = await supabase
      .from('scores')
      .insert([{ user_id: userId, score, date }])
      .select()
      .single()

    if (error) throw error

    res.status(201).json({
      message: 'Score added successfully',
      score: newScore
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// EDIT SCORE
const editScore = async (req, res) => {
  const { id } = req.params
  const { score, date } = req.body
  const userId = req.user.id

  if (score < 1 || score > 45)
    return res.status(400).json({ message: 'Score must be between 1 and 45' })

  try {
    // Make sure score belongs to this user
    const { data: existing } = await supabase
      .from('scores')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (!existing)
      return res.status(404).json({ message: 'Score not found' })

    const { data: updated, error } = await supabase
      .from('scores')
      .update({ score, date })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    res.json({ message: 'Score updated successfully', score: updated })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// DELETE SCORE
const deleteScore = async (req, res) => {
  const { id } = req.params
  const userId = req.user.id

  try {
    const { data: existing } = await supabase
      .from('scores')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (!existing)
      return res.status(404).json({ message: 'Score not found' })

    await supabase.from('scores').delete().eq('id', id)

    res.json({ message: 'Score deleted successfully' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

module.exports = { getScores, addScore, editScore, deleteScore }