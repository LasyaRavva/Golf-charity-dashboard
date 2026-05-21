export function simulateDraw(entries = []) {
  if (!entries.length) {
    return { winner: 'No eligible entries' };
  }

  const index = Math.floor(Math.random() * entries.length);
  return { winner: entries[index] };
}
