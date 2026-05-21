export function calculatePrizeSplit(poolAmount) {
  const winnerShare = Math.round(poolAmount * 0.6);
  const charityShare = poolAmount - winnerShare;

  return { winnerShare, charityShare };
}
