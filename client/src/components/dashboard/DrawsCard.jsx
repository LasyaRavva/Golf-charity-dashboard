const DrawsCard = ({ drawEntries, upcomingDraw, expanded }) => {
  return (
    <div style={{
      background: '#fff', borderRadius: '16px',
      padding: '1.5rem', border: '1px solid #e5e7eb'
    }}>
      <h3 style={{
        fontFamily: 'Syne, sans-serif', fontWeight: 700,
        fontSize: '0.95rem', color: '#1a1a2e', marginBottom: '1.2rem'
      }}>Draw History</h3>

      {upcomingDraw && (
        <div style={{
          background: 'rgba(108,99,255,0.06)',
          border: '1px solid rgba(108,99,255,0.15)',
          borderRadius: '10px', padding: '0.9rem 1rem',
          marginBottom: '1rem', display: 'flex',
          alignItems: 'center', gap: '10px'
        }}>
          <span style={{ fontSize: '1.2rem' }}>🎯</span>
          <div>
            <div style={{
              fontSize: '0.75rem', color: '#6c63ff',
              fontWeight: 700, letterSpacing: '0.3px'
            }}>UPCOMING DRAW</div>
            <div style={{
              fontSize: '0.88rem', color: '#1a1a2e', fontWeight: 600
            }}>{upcomingDraw.month}</div>
          </div>
        </div>
      )}

      {!drawEntries || drawEntries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎯</div>
          <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
            No draws entered yet
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {drawEntries.slice(0, expanded ? undefined : 3).map(entry => (
            <div key={entry.id} style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', padding: '0.75rem',
              background: '#f8f8fc', borderRadius: '10px',
              border: '1px solid #e5e7eb'
            }}>
              <div>
                <div style={{
                  fontSize: '0.88rem', fontWeight: 600,
                  color: '#1a1a2e', marginBottom: '2px'
                }}>{entry.draws?.month}</div>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                  Scores: {entry.scores_snapshot?.join(', ')}
                </div>
              </div>
              <div style={{
                background: entry.draws?.status === 'published'
                  ? 'rgba(34,197,94,0.08)' : 'rgba(245,158,11,0.08)',
                border: `1px solid ${entry.draws?.status === 'published'
                  ? 'rgba(34,197,94,0.2)' : 'rgba(245,158,11,0.2)'}`,
                color: entry.draws?.status === 'published' ? '#16a34a' : '#d97706',
                padding: '3px 10px', borderRadius: '50px',
                fontSize: '0.72rem', fontWeight: 600
              }}>
                {entry.draws?.status}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DrawsCard