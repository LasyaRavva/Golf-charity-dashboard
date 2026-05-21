import { useState } from 'react'
import api from '../../services/api'

const WinningsCard = ({ winnings, totalWon, onUploaded }) => {
  const statusColors = {
    pending: { bg: 'rgba(245,158,11,0.08)', text: '#d97706', border: 'rgba(245,158,11,0.2)' },
    paid: { bg: 'rgba(34,197,94,0.08)', text: '#16a34a', border: 'rgba(34,197,94,0.2)' }
  }
  const verifyColors = {
    pending: '#f59e0b',
    approved: '#22c55e',
    rejected: '#ef4444'
  }
  const [proofUrl, setProofUrl] = useState({})
  const [submittingId, setSubmittingId] = useState(null)
  const [message, setMessage] = useState('')

  const handleProofSubmit = async (winnerId) => {
    const url = proofUrl[winnerId]?.trim()
    if (!url) {
      setMessage('Proof URL is required.')
      return
    }

    setSubmittingId(winnerId)
    setMessage('')

    try {
      await api.put(`/winners/${winnerId}/proof`, { proof_url: url })
      setMessage('Proof submitted successfully.')
      setProofUrl(prev => ({ ...prev, [winnerId]: '' }))
      if (onUploaded) await onUploaded()
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to submit proof.')
    } finally {
      setSubmittingId(null)
    }
  }

  return (
    <div style={{
      background: '#fff', borderRadius: '16px',
      padding: '1.5rem', border: '1px solid #e5e7eb'
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '1.2rem'
      }}>
        <h3 style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 700,
          fontSize: '0.95rem', color: '#1a1a2e'
        }}>Winnings</h3>
        <div style={{
          background: 'rgba(245,158,11,0.08)',
          border: '1px solid rgba(245,158,11,0.2)',
          borderRadius: '8px', padding: '4px 10px'
        }}>
          <span style={{
            fontFamily: 'Syne, sans-serif', fontSize: '0.88rem',
            fontWeight: 700, color: '#d97706'
          }}>£{totalWon?.toFixed(2) || '0.00'}</span>
        </div>
      </div>

      {message && (
        <div style={{
          marginBottom: '1rem',
          padding: '0.7rem 0.9rem',
          borderRadius: '8px',
          background: '#f8f8fc',
          border: '1px solid #e5e7eb',
          color: '#6b7280',
          fontSize: '0.8rem'
        }}>
          {message}
        </div>
      )}

      {!winnings || winnings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🏆</div>
          <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
            No winnings yet - keep playing!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
          {winnings.map(w => {
            const payColor = statusColors[w.payment_status] || statusColors.pending

            return (
              <div key={w.id} style={{
                padding: '0.8rem',
                background: '#f8f8fc',
                borderRadius: '10px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{
                      fontSize: '0.88rem', fontWeight: 600,
                      color: '#1a1a2e', marginBottom: '2px'
                    }}>{w.match_tier}-Number Match</div>
                    <div style={{ fontSize: '0.75rem', color: verifyColors[w.verification_status] }}>
                      {w.verification_status}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontFamily: 'Syne, sans-serif', fontWeight: 700,
                      color: '#1a1a2e', fontSize: '0.95rem'
                    }}>£{w.prize_amount?.toFixed(2)}</div>
                    <div style={{
                      display: 'inline-block',
                      background: payColor.bg, border: `1px solid ${payColor.border}`,
                      color: payColor.text, padding: '2px 8px',
                      borderRadius: '50px', fontSize: '0.7rem', fontWeight: 600,
                      marginTop: '2px'
                    }}>{w.payment_status}</div>
                  </div>
                </div>

                {w.proof_url && (
                  <div style={{
                    marginTop: '0.7rem',
                    fontSize: '0.76rem',
                    color: '#22c55e'
                  }}>
                    Proof submitted
                  </div>
                )}

                {w.verification_status === 'pending' && !w.proof_url && (
                  <div style={{ marginTop: '0.8rem' }}>
                    <div style={{
                      fontSize: '0.72rem',
                      color: '#9ca3af',
                      marginBottom: '0.45rem'
                    }}>
                      Submit score proof to complete verification
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="url"
                        placeholder="Paste proof image URL"
                        value={proofUrl[w.id] || ''}
                        onChange={e => setProofUrl(prev => ({
                          ...prev,
                          [w.id]: e.target.value
                        }))}
                        style={{
                          flex: 1,
                          padding: '0.6rem 0.75rem',
                          borderRadius: '8px',
                          border: '1px solid #d1d5db',
                          fontSize: '0.8rem',
                          outline: 'none'
                        }}
                      />
                      <button
                        onClick={() => handleProofSubmit(w.id)}
                        disabled={submittingId === w.id}
                        style={{
                          background: '#6c63ff',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '0.6rem 0.85rem',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: submittingId === w.id ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {submittingId === w.id ? 'Saving...' : 'Submit'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default WinningsCard
