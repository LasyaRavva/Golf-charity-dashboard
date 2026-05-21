// Calculate prize pool tiers based on total amount
const calculatePrizePool = (totalAmount, hasRollover = false, rolloverAmount = 0) => {
  const tier5Amount = (totalAmount * 0.40) + rolloverAmount
  const tier4Amount = totalAmount * 0.35
  const tier3Amount = totalAmount * 0.25

  return {
    total: totalAmount,
    tier_5: parseFloat(tier5Amount.toFixed(2)),
    tier_4: parseFloat(tier4Amount.toFixed(2)),
    tier_3: parseFloat(tier3Amount.toFixed(2))
  }
}

// Split prize equally among multiple winners
const splitPrize = (tierAmount, winnerCount) => {
  if (winnerCount === 0) return 0
  return parseFloat((tierAmount / winnerCount).toFixed(2))
}

// Calculate total pool from active subscribers
const calculateTotalFromSubscribers = (subscribers) => {
  return subscribers.reduce((total, sub) => {
    const amount = sub.plan === 'yearly' ? 99.99 / 12 : 9.99
    return total + amount
  }, 0)
}

module.exports = {
  calculatePrizePool,
  splitPrize,
  calculateTotalFromSubscribers
}