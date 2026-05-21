export function getWinners(request, response) {
  response.json({
    winners: [
      { id: 1, member: 'Olivia Grant', amount: 620, drawMonth: 'May 2026' },
    ],
  });
}
