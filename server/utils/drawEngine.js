// Generate random draw numbers (5 numbers from user score range 1-45)
const generateRandomDraw = () => {
  const numbers = []
  while (numbers.length < 5) {
    const num = Math.floor(Math.random() * 45) + 1
    if (!numbers.includes(num)) numbers.push(num)
  }
  return numbers.sort((a, b) => a - b)
}

// Generate algorithmic draw weighted by most/least frequent scores
const generateAlgorithmicDraw = async (supabase) => {
  try {
    // Get all scores from all users
    const { data: scores } = await supabase
      .from('scores')
      .select('score')

    if (!scores || scores.length === 0)
      return generateRandomDraw()

    // Count frequency of each score
    const frequency = {}
    scores.forEach(({ score }) => {
      frequency[score] = (frequency[score] || 0) + 1
    })

    // Build weighted pool — higher frequency = more weight
    const weightedPool = []
    Object.entries(frequency).forEach(([score, count]) => {
      for (let i = 0; i < count; i++) {
        weightedPool.push(parseInt(score))
      }
    })

    // Pick 5 unique numbers from weighted pool
    const picked = []
    const shuffled = weightedPool.sort(() => Math.random() - 0.5)
    for (const num of shuffled) {
      if (!picked.includes(num)) picked.push(num)
      if (picked.length === 5) break
    }

    // Fill remaining with random if needed
    while (picked.length < 5) {
      const num = Math.floor(Math.random() * 45) + 1
      if (!picked.includes(num)) picked.push(num)
    }

    return picked.sort((a, b) => a - b)
  } catch (err) {
    return generateRandomDraw()
  }
}

// Check how many numbers match between draw and user scores
const checkMatch = (drawNumbers, userScores) => {
  const matches = drawNumbers.filter(n => userScores.includes(n))
  return matches.length
}

// Determine match tier
const getMatchTier = (matchCount) => {
  if (matchCount >= 5) return 5
  if (matchCount === 4) return 4
  if (matchCount === 3) return 3
  return 0
}

module.exports = {
  generateRandomDraw,
  generateAlgorithmicDraw,
  checkMatch,
  getMatchTier
}