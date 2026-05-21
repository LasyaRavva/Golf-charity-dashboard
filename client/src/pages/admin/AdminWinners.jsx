import { useState, useEffect } from 'react'
import api from '../../services/api'

const AdminWinners = () => {
  const [winners, setWinners] = useState([])
  const [fetching, setFetching] = useState(true)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedWinner, setSelectedWinner] = useState(null)
  const [confirmAction, setConfirmAction] = useState(null)

  useEffect(() => { fetchWinners() }, [])

  const fetchWinners = async () => {
    setFetching(true)
    try {
      const res = await api.get('/admin/winners')
      setWinners(res.data.winners)
    } catch (err) {
      showMessage('Failed to load winners', 'error')
    } finally {
      setFetching(false)
    }
  }

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: '' }), 3000)
  }

  const handleVerify = async (id, status) => {
    setLoading(true)
    try {
      await api.put(`/admin/winners/${id}/verify`, { verification_status: status })
      showMessage(`Winner ${status} ✓`)
      setConfirmAction(null)
      setSelectedWinner(null)
      fetchWinners()
    } catch (err) {
      showMessage('Failed to update verification', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handlePayout = async (id) => {
    setLoading(true)
    try {
      await api.put(`/admin/winners/${id}/payout`)
      showMessage('Payout marked as paid ✓')
      setConfirmAction(null)
      setSelectedWinner(null)
      fetchWinners()
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to mark payout', 'error')
    } finally {
      setLoading(false)
    }
  }

  const filteredWinners = winners.filter(w => {
    const matchFilter =
      filter === 'all' ||
      (filter === 'pending' && w.verification_status === 'pending') ||
      (filter === 'approved' && w.verification_status === 'approved') ||
      (filter === 'rejected' && w.verification_status === 'rejected') ||
      (filter === 'unpaid' && w.verification_status === 'approved' && w.payment_status === 'pending') ||
      (filter === 'paid' && w.payment_status === 'paid')

    const matchSearch =
      w.users?.name?.toLowerCase().includes(search.toLowerCase()) ||
      w.users?.email?.toLowerCase().includes(search.toLowerCase()) ||
      w.draws?.month?.includes(search)

    return matchFilter && matchSearch
  })

  const counts = {
    all: winners.length,
    pending: winners.filter(w => w.verification_status === 'pending').length,
    approved: winners.filter(w => w.verification_status === 'approved').length,
    rejected: winners.filter(w => w.verification_status === 'rejected').length,
    unpaid: winners.filter(w =>
      w.verification_status === 'approved' && w.payment_status === 'pending'
    ).length,
    paid: winners.filter(w => w.payment_status === 'paid').length
  }

  const verifyColors = {
    pending: { bg: 'rgba(245,158,11,0.08)', text: '#d97706', border: 'rgba(245,158,11,0.2)' },
    approved: { bg: 'rgba(34,197,94,0.08)', text: '#16a34a', border: 'rgba(34,197,94,0.2)' },
    rejected: { bg: 'rgba(239,68,68,0.08)', text: '#ef4444', border: 'rgba(239,68,68,0.15)' }
  }

  const payColors = {
    pending: { bg: 'rgba(245,158,11,0.08)', text: '#d97706', border: 'rgba(245,158,11,0.2)' },
    paid: { bg: 'rgba(34,197,94,0.08)', text: '#16a34a', border: 'rgba(34,197,94,0.2)' }
  }

  const tierConfig = {
    5: { icon: '🏆', label: '5-Match', color: '#6c63ff', bg: 'rgba(108,99,255,0.08)' },
    4: { icon: '🥈', label: '4-Match', color: '#22c55e', bg: 'rgba(34,197,94,0.08)' },
    3: { icon: '🥉', label: '3-Match', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' }
  }

  return (
    <div>

      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 800,
          fontSize: '1.7rem', color: '#1a1a2e',
          letterSpacing: '-0.5px', marginBottom: '4px'
        }}>Winner Verification</h1>
        <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
          {counts.pending > 0
            ? `⚠️ ${counts.pending} winner${counts.pending > 1 ? 's' : ''} pending verification`
            : `✅ All winners reviewed · ${counts.paid} paid out`}
        </p>
      </div>

      {/* Message */}
      {message.text && (
        <div style={{
          padding: '0.8rem 1rem', borderRadius: '8px', marginBottom: '1rem',
          background: message.type === 'error' ? '#fef2f2' : '#f0fdf4',
          border: `1px solid ${message.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
          color: message.type === 'error' ? '#ef4444' : '#16a34a',
          fontSize: '0.88rem', fontWeight: 500
        }}>{message.text}</div>
      )}

      {/* Stats row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '1rem', marginBottom: '1.5rem'
      }}>
        {[
          { label: 'Total Winners', value: counts.all, color: '#6c63ff', bg: 'rgba(108,99,255,0.08)', icon: '🏆' },
          { label: 'Pending Review', value: counts.pending, color: '#d97706', bg: 'rgba(245,158,11,0.08)', icon: '⏳', alert: counts.pending > 0 },
          { label: 'Approved', value: counts.approved, color: '#16a34a', bg: 'rgba(34,197,94,0.08)', icon: '✅' },
          { label: 'Awaiting Payment', value: counts.unpaid, color: '#d97706', bg: 'rgba(245,158,11,0.08)', icon: '💸', alert: counts.unpaid > 0 },
          { label: 'Paid Out', value: counts.paid, color: '#16a34a', bg: 'rgba(34,197,94,0.08)', icon: '✅' },
          { label: 'Rejected', value: counts.rejected, color: '#ef4444', bg: 'rgba(239,68,68,0.08)', icon: '❌' }
        ].map((stat, i) => (
          <div key={i} style={{
            background: '#fff', borderRadius: '12px',
            padding: '1.1rem', border: `1px solid ${stat.alert ? stat.color + '40' : '#e5e7eb'}`,
            display: 'flex', alignItems: 'center', gap: '10px',
            transition: 'all 0.2s'
          }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '8px',
              background: stat.bg,
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '1rem', flexShrink: 0
            }}>{stat.icon}</div>
            <div>
              <div style={{
                fontFamily: 'Syne, sans-serif', fontWeight: 800,
                fontSize: '1.4rem', color: stat.color, lineHeight: 1
              }}>{stat.value}</div>
              <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: '2px' }}>
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem' }}>

        {/* ─── WINNERS LIST ─── */}
        <div style={{
          background: '#fff', borderRadius: '16px',
          border: '1px solid #e5e7eb', overflow: 'hidden'
        }}>

          {/* Search + Filter tabs */}
          <div style={{ padding: '1rem 1.2rem', borderBottom: '1px solid #f3f4f6' }}>
            <div style={{ position: 'relative', marginBottom: '0.8rem' }}>
              <span style={{
                position: 'absolute', left: '0.8rem', top: '50%',
                transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '0.85rem'
              }}>🔍</span>
              <input
                type="text"
                placeholder="Search by name, email or month..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%', padding: '0.65rem 0.8rem 0.65rem 2.2rem',
                  borderRadius: '8px', border: '1px solid #e5e7eb',
                  background: '#f8f8fc', fontSize: '0.85rem',
                  color: '#1a1a2e', outline: 'none', boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: 'All' },
                { id: 'pending', label: 'Pending' },
                { id: 'approved', label: 'Approved' },
                { id: 'unpaid', label: 'Unpaid' },
                { id: 'paid', label: 'Paid' },
                { id: 'rejected', label: 'Rejected' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  style={{
                    padding: '4px 12px', borderRadius: '50px',
                    border: `1px solid ${filter === f.id ? '#6c63ff' : '#e5e7eb'}`,
                    background: filter === f.id ? 'rgba(108,99,255,0.08)' : '#fff',
                    color: filter === f.id ? '#6c63ff' : '#6b7280',
                    fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '4px'
                  }}>
                  {f.label}
                  {counts[f.id] > 0 && (
                    <span style={{
                      background: filter === f.id ? '#6c63ff' : '#e5e7eb',
                      color: filter === f.id ? '#fff' : '#9ca3af',
                      padding: '0 5px', borderRadius: '50px',
                      fontSize: '0.68rem', fontWeight: 700
                    }}>{counts[f.id]}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Winners list */}
          <div style={{ overflowY: 'auto', maxHeight: '65vh' }}>
            {fetching ? (
              [1, 2, 3, 4].map(i => (
                <div key={i} style={{
                  padding: '1.1rem 1.2rem',
                  borderBottom: '1px solid #f3f4f6',
                  display: 'flex', gap: '12px', alignItems: 'center'
                }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '10px',
                    background: '#f3f4f6', flexShrink: 0
                  }} />
                  <div style={{ flex: 1 }}>
                    {[60, 80, 40].map((w, j) => (
                      <div key={j} style={{
                        height: '10px', width: `${w}%`,
                        background: '#f3f4f6', borderRadius: '4px',
                        marginBottom: j < 2 ? '6px' : 0
                      }} />
                    ))}
                  </div>
                </div>
              ))
            ) : filteredWinners.length === 0 ? (
              <div style={{
                padding: '4rem', textAlign: 'center'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏆</div>
                <p style={{ color: '#9ca3af', fontSize: '0.9rem', fontWeight: 500 }}>
                  No winners found
                </p>
              </div>
            ) : (
              filteredWinners.map(winner => {
                const tier = tierConfig[winner.match_tier] || tierConfig[3]
                const vColors = verifyColors[winner.verification_status] || verifyColors.pending
                const pColors = payColors[winner.payment_status] || payColors.pending
                const isSelected = selectedWinner?.id === winner.id

                return (
                  <div
                    key={winner.id}
                    onClick={() => setSelectedWinner(
                      isSelected ? null : winner
                    )}
                    style={{
                      padding: '1rem 1.2rem',
                      borderBottom: '1px solid #f3f4f6',
                      cursor: 'pointer',
                      background: isSelected ? 'rgba(108,99,255,0.04)' : 'transparent',
                      borderLeft: `3px solid ${isSelected ? '#6c63ff' : 'transparent'}`,
                      transition: 'all 0.15s'
                    }}
                    onMouseEnter={e => {
                      if (!isSelected)
                        e.currentTarget.style.background = '#f8f8fc'
                    }}
                    onMouseLeave={e => {
                      if (!isSelected)
                        e.currentTarget.style.background = 'transparent'
                    }}>

                    <div style={{
                      display: 'flex', alignItems: 'flex-start',
                      gap: '12px'
                    }}>

                      {/* Tier icon */}
                      <div style={{
                        width: '42px', height: '42px', borderRadius: '10px',
                        background: tier.bg,
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0
                      }}>{tier.icon}</div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Name + tier */}
                        <div style={{
                          display: 'flex', alignItems: 'center',
                          gap: '8px', marginBottom: '3px', flexWrap: 'wrap'
                        }}>
                          <span style={{
                            fontSize: '0.88rem', fontWeight: 700, color: '#1a1a2e'
                          }}>{winner.users?.name}</span>
                          <div style={{
                            background: tier.bg, border: `1px solid ${tier.color}30`,
                            color: tier.color, padding: '2px 8px',
                            borderRadius: '50px', fontSize: '0.68rem', fontWeight: 700
                          }}>{tier.label}</div>
                        </div>

                        {/* Email + month */}
                        <div style={{
                          fontSize: '0.75rem', color: '#9ca3af', marginBottom: '6px'
                        }}>
                          {winner.users?.email} · Draw {winner.draws?.month}
                        </div>

                        {/* Status badges */}
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <div style={{
                            background: vColors.bg, border: `1px solid ${vColors.border}`,
                            color: vColors.text, padding: '2px 8px',
                            borderRadius: '50px', fontSize: '0.68rem', fontWeight: 700
                          }}>{winner.verification_status}</div>
                          <div style={{
                            background: pColors.bg, border: `1px solid ${pColors.border}`,
                            color: pColors.text, padding: '2px 8px',
                            borderRadius: '50px', fontSize: '0.68rem', fontWeight: 700
                          }}>{winner.payment_status}</div>
                          {!winner.proof_url && (
                            <div style={{
                              background: 'rgba(239,68,68,0.06)',
                              border: '1px solid rgba(239,68,68,0.15)',
                              color: '#ef4444', padding: '2px 8px',
                              borderRadius: '50px', fontSize: '0.68rem', fontWeight: 700
                            }}>No proof</div>
                          )}
                        </div>
                      </div>

                      {/* Prize amount */}
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{
                          fontFamily: 'Syne, sans-serif', fontWeight: 800,
                          fontSize: '1rem', color: '#1a1a2e'
                        }}>£{winner.prize_amount?.toFixed(2)}</div>
                        <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '2px' }}>
                          prize
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* ─── WINNER DETAIL PANEL ─── */}
        {selectedWinner ? (
          <div style={{
            background: '#fff', borderRadius: '16px',
            border: '1px solid #e5e7eb', overflow: 'hidden',
            alignSelf: 'flex-start', position: 'sticky', top: '1rem'
          }}>

            {/* Header */}
            <div style={{
              padding: '1.4rem', borderBottom: '1px solid #f3f4f6',
              background: 'linear-gradient(135deg, #f8f8fc, #fff)'
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'flex-start'
              }}>
                <div>
                  <div style={{
                    fontSize: '0.72rem', fontWeight: 700,
                    color: '#9ca3af', letterSpacing: '0.5px',
                    marginBottom: '4px', textTransform: 'uppercase'
                  }}>Winner Details</div>
                  <h3 style={{
                    fontFamily: 'Syne, sans-serif', fontWeight: 800,
                    fontSize: '1.1rem', color: '#1a1a2e'
                  }}>{selectedWinner.users?.name}</h3>
                  <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                    {selectedWinner.users?.email}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedWinner(null)}
                  style={{
                    background: '#f3f4f6', border: '1px solid #e5e7eb',
                    color: '#9ca3af', width: '28px', height: '28px',
                    borderRadius: '6px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '0.8rem', flexShrink: 0
                  }}>✕</button>
              </div>
            </div>

            <div style={{ padding: '1.4rem' }}>

              {/* Win details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.4rem' }}>
                {[
                  {
                    label: 'Draw Month',
                    value: selectedWinner.draws?.month,
                    icon: '📅'
                  },
                  {
                    label: 'Match Tier',
                    value: `${selectedWinner.match_tier}-Number Match`,
                    icon: tierConfig[selectedWinner.match_tier]?.icon || '🏆'
                  },
                  {
                    label: 'Prize Amount',
                    value: `£${selectedWinner.prize_amount?.toFixed(2)}`,
                    icon: '💰',
                    valueColor: '#22c55e'
                  },
                  {
                    label: 'Draw Numbers',
                    value: selectedWinner.draws?.draw_numbers?.join(', ') || '—',
                    icon: '🎯'
                  }
                ].map((item, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '0.7rem', background: '#f8f8fc',
                    borderRadius: '8px', border: '1px solid #e5e7eb'
                  }}>
                    <span style={{ fontSize: '0.9rem', flexShrink: 0 }}>{item.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '0.7rem', color: '#9ca3af',
                        fontWeight: 600, marginBottom: '1px'
                      }}>{item.label}</div>
                      <div style={{
                        fontSize: '0.88rem', fontWeight: 600,
                        color: item.valueColor || '#1a1a2e'
                      }}>{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Status badges */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr',
                gap: '0.6rem', marginBottom: '1.4rem'
              }}>
                {[
                  {
                    label: 'Verification',
                    value: selectedWinner.verification_status,
                    colors: verifyColors[selectedWinner.verification_status]
                  },
                  {
                    label: 'Payment',
                    value: selectedWinner.payment_status,
                    colors: payColors[selectedWinner.payment_status]
                  }
                ].map((s, i) => (
                  <div key={i} style={{
                    padding: '0.8rem', borderRadius: '10px',
                    background: s.colors?.bg,
                    border: `1px solid ${s.colors?.border}`,
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '0.7rem', color: '#9ca3af',
                      fontWeight: 600, marginBottom: '4px'
                    }}>{s.label}</div>
                    <div style={{
                      fontSize: '0.85rem', fontWeight: 700,
                      color: s.colors?.text,
                      textTransform: 'capitalize'
                    }}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Proof */}
              <div style={{ marginBottom: '1.4rem' }}>
                <div style={{
                  fontSize: '0.75rem', fontWeight: 700,
                  color: '#9ca3af', letterSpacing: '0.5px',
                  textTransform: 'uppercase', marginBottom: '0.6rem'
                }}>Proof Submission</div>

                {selectedWinner.proof_url ? (
                  <div style={{
                    padding: '0.9rem', background: 'rgba(34,197,94,0.04)',
                    border: '1px solid rgba(34,197,94,0.15)',
                    borderRadius: '10px',
                    display: 'flex', alignItems: 'center', gap: '10px'
                  }}>
                    <span style={{ fontSize: '1.1rem' }}>📎</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '0.82rem', fontWeight: 600,
                        color: '#16a34a', marginBottom: '2px'
                      }}>Proof uploaded</div>
                      <div style={{
                        fontSize: '0.72rem', color: '#9ca3af',
                        whiteSpace: 'nowrap', overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>{selectedWinner.proof_url}</div>
                    </div>
                    <a
                      href={selectedWinner.proof_url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        background: 'rgba(34,197,94,0.1)',
                        color: '#16a34a',
                        border: '1px solid rgba(34,197,94,0.2)',
                        padding: '4px 10px', borderRadius: '6px',
                        fontSize: '0.75rem', fontWeight: 600,
                        textDecoration: 'none', flexShrink: 0
                      }}>View →</a>
                  </div>
                ) : (
                  <div style={{
                    padding: '0.9rem', background: 'rgba(239,68,68,0.04)',
                    border: '1px solid rgba(239,68,68,0.15)',
                    borderRadius: '10px',
                    display: 'flex', alignItems: 'center', gap: '10px'
                  }}>
                    <span style={{ fontSize: '1.1rem' }}>⚠️</span>
                    <div>
                      <div style={{
                        fontSize: '0.82rem', fontWeight: 600,
                        color: '#ef4444', marginBottom: '2px'
                      }}>No proof uploaded</div>
                      <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
                        Winner has not submitted proof yet
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>

                {/* Verification actions */}
                {selectedWinner.verification_status === 'pending' && (
                  <>
                    <div style={{
                      fontSize: '0.75rem', fontWeight: 700,
                      color: '#9ca3af', letterSpacing: '0.5px',
                      textTransform: 'uppercase', marginBottom: '2px'
                    }}>Verification</div>
                    <div style={{ display: 'flex', gap: '0.6rem' }}>
                      <button
                        onClick={() => setConfirmAction({
                          type: 'approve', id: selectedWinner.id
                        })}
                        style={{
                          flex: 1,
                          background: 'rgba(34,197,94,0.08)',
                          color: '#16a34a',
                          border: '1px solid rgba(34,197,94,0.2)',
                          padding: '0.75rem', borderRadius: '8px',
                          fontSize: '0.88rem', fontWeight: 700,
                          cursor: 'pointer', transition: 'all 0.15s'
                        }}
                        onMouseEnter={e => e.target.style.background = 'rgba(34,197,94,0.14)'}
                        onMouseLeave={e => e.target.style.background = 'rgba(34,197,94,0.08)'}>
                        ✅ Approve
                      </button>
                      <button
                        onClick={() => setConfirmAction({
                          type: 'reject', id: selectedWinner.id
                        })}
                        style={{
                          flex: 1,
                          background: 'rgba(239,68,68,0.08)',
                          color: '#ef4444',
                          border: '1px solid rgba(239,68,68,0.15)',
                          padding: '0.75rem', borderRadius: '8px',
                          fontSize: '0.88rem', fontWeight: 700,
                          cursor: 'pointer', transition: 'all 0.15s'
                        }}
                        onMouseEnter={e => e.target.style.background = 'rgba(239,68,68,0.14)'}
                        onMouseLeave={e => e.target.style.background = 'rgba(239,68,68,0.08)'}>
                        ❌ Reject
                      </button>
                    </div>
                  </>
                )}

                {/* Payout action */}
                {selectedWinner.verification_status === 'approved' &&
                  selectedWinner.payment_status === 'pending' && (
                    <>
                      <div style={{
                        fontSize: '0.75rem', fontWeight: 700,
                        color: '#9ca3af', letterSpacing: '0.5px',
                        textTransform: 'uppercase', marginBottom: '2px'
                      }}>Payment</div>
                      <button
                        onClick={() => setConfirmAction({
                          type: 'payout', id: selectedWinner.id
                        })}
                        style={{
                          background: '#6c63ff', color: '#fff',
                          border: 'none', padding: '0.85rem',
                          borderRadius: '8px', fontSize: '0.9rem',
                          fontWeight: 700, cursor: 'pointer',
                          boxShadow: '0 4px 16px rgba(108,99,255,0.25)',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => {
                          e.target.style.background = '#5a52e0'
                          e.target.style.transform = 'translateY(-1px)'
                        }}
                        onMouseLeave={e => {
                          e.target.style.background = '#6c63ff'
                          e.target.style.transform = 'translateY(0)'
                        }}>
                        💸 Mark as Paid — £{selectedWinner.prize_amount?.toFixed(2)}
                      </button>
                    </>
                  )}

                {/* Already paid */}
                {selectedWinner.payment_status === 'paid' && (
                  <div style={{
                    padding: '0.85rem', background: 'rgba(34,197,94,0.06)',
                    border: '1px solid rgba(34,197,94,0.15)',
                    borderRadius: '8px', textAlign: 'center',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: '8px'
                  }}>
                    <span style={{ fontSize: '1rem' }}>✅</span>
                    <span style={{
                      fontSize: '0.88rem', fontWeight: 700, color: '#16a34a'
                    }}>Payment completed</span>
                  </div>
                )}

                {/* Rejected */}
                {selectedWinner.verification_status === 'rejected' && (
                  <div style={{
                    padding: '0.85rem', background: 'rgba(239,68,68,0.04)',
                    border: '1px solid rgba(239,68,68,0.12)',
                    borderRadius: '8px', textAlign: 'center',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: '8px'
                  }}>
                    <span style={{ fontSize: '1rem' }}>❌</span>
                    <span style={{
                      fontSize: '0.88rem', fontWeight: 700, color: '#ef4444'
                    }}>Verification rejected</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            background: '#fff', borderRadius: '16px',
            border: '1px solid #e5e7eb',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', minHeight: '300px',
            alignSelf: 'flex-start'
          }}>
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.8rem' }}>👈</div>
              <p style={{
                color: '#9ca3af', fontSize: '0.88rem',
                fontWeight: 500, marginBottom: '4px'
              }}>Select a winner to review</p>
              <p style={{ color: '#d1d5db', fontSize: '0.8rem' }}>
                Click any winner from the list
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ─── CONFIRM ACTION MODAL ─── */ }
      {confirmAction && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: '#fff', borderRadius: '20px',
            padding: '2rem', maxWidth: '400px', width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
          }}>

            {confirmAction.type === 'approve' && (
              <>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '12px',
                  background: 'rgba(34,197,94,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.4rem', marginBottom: '1rem'
                }}>✅</div>
                <h3 style={{
                  fontFamily: 'Syne, sans-serif', fontWeight: 800,
                  fontSize: '1.1rem', color: '#1a1a2e', marginBottom: '0.6rem'
                }}>Approve this winner?</h3>
                <p style={{
                  color: '#6b7280', fontSize: '0.88rem',
                  lineHeight: 1.6, marginBottom: '1.5rem'
                }}>
                  This will approve the winner's submission and notify them by email.
                  Their payment will then be awaiting processing.
                </p>
                <div style={{ display: 'flex', gap: '0.8rem' }}>
                  <button
                    onClick={() => setConfirmAction(null)}
                    style={{
                      flex: 1, background: '#f8f8fc', color: '#374151',
                      border: '1px solid #e5e7eb', padding: '0.8rem',
                      borderRadius: '8px', fontSize: '0.9rem',
                      fontWeight: 600, cursor: 'pointer'
                    }}>Cancel</button>
                  <button
                    onClick={() => handleVerify(confirmAction.id, 'approved')}
                    disabled={loading}
                    style={{
                      flex: 1, background: '#22c55e', color: '#fff',
                      border: 'none', padding: '0.8rem', borderRadius: '8px',
                      fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
                      boxShadow: '0 4px 16px rgba(34,197,94,0.3)'
                    }}>
                    {loading ? 'Approving...' : 'Approve ✓'}
                  </button>
                </div>
              </>
            )}

            {confirmAction.type === 'reject' && (
              <>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '12px',
                  background: 'rgba(239,68,68,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.4rem', marginBottom: '1rem'
                }}>❌</div>
                <h3 style={{
                  fontFamily: 'Syne, sans-serif', fontWeight: 800,
                  fontSize: '1.1rem', color: '#1a1a2e', marginBottom: '0.6rem'
                }}>Reject this winner?</h3>
                <p style={{
                  color: '#6b7280', fontSize: '0.88rem',
                  lineHeight: 1.6, marginBottom: '1.5rem'
                }}>
                  This will reject the winner's submission and notify them by email.
                  They will not receive a payout.
                </p>
                <div style={{ display: 'flex', gap: '0.8rem' }}>
                  <button
                    onClick={() => setConfirmAction(null)}
                    style={{
                      flex: 1, background: '#f8f8fc', color: '#374151',
                      border: '1px solid #e5e7eb', padding: '0.8rem',
                      borderRadius: '8px', fontSize: '0.9rem',
                      fontWeight: 600, cursor: 'pointer'
                    }}>Cancel</button>
                  <button
                    onClick={() => handleVerify(confirmAction.id, 'rejected')}
                    disabled={loading}
                    style={{
                      flex: 1, background: '#ef4444', color: '#fff',
                      border: 'none', padding: '0.8rem', borderRadius: '8px',
                      fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
                      boxShadow: '0 4px 16px rgba(239,68,68,0.3)'
                    }}>
                    {loading ? 'Rejecting...' : 'Reject'}
                  </button>
                </div>
              </>
            )}

            {confirmAction.type === 'payout' && (
              <>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '12px',
                  background: 'rgba(108,99,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.4rem', marginBottom: '1rem'
                }}>💸</div>
                <h3 style={{
                  fontFamily: 'Syne, sans-serif', fontWeight: 800,
                  fontSize: '1.1rem', color: '#1a1a2e', marginBottom: '0.6rem'
                }}>Confirm payout?</h3>
                <p style={{
                  color: '#6b7280', fontSize: '0.88rem',
                  lineHeight: 1.6, marginBottom: '0.8rem'
                }}>
                  Mark this prize as paid out to the winner. Make sure the
                  payment has been sent before confirming.
                </p>
                <div style={{
                  background: 'rgba(108,99,255,0.06)',
                  border: '1px solid rgba(108,99,255,0.15)',
                  borderRadius: '10px', padding: '0.9rem',
                  marginBottom: '1.5rem',
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '0.88rem', color: '#6b7280' }}>
                    {selectedWinner?.users?.name}
                  </span>
                  <span style={{
                    fontFamily: 'Syne, sans-serif', fontWeight: 800,
                    fontSize: '1.1rem', color: '#6c63ff'
                  }}>
                    £{selectedWinner?.prize_amount?.toFixed(2)}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '0.8rem' }}>
                  <button
                    onClick={() => setConfirmAction(null)}
                    style={{
                      flex: 1, background: '#f8f8fc', color: '#374151',
                      border: '1px solid #e5e7eb', padding: '0.8rem',
                      borderRadius: '8px', fontSize: '0.9rem',
                      fontWeight: 600, cursor: 'pointer'
                    }}>Cancel</button>
                  <button
                    onClick={() => handlePayout(confirmAction.id)}
                    disabled={loading}
                    style={{
                      flex: 1, background: '#6c63ff', color: '#fff',
                      border: 'none', padding: '0.8rem', borderRadius: '8px',
                      fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
                      boxShadow: '0 4px 16px rgba(108,99,255,0.3)'
                    }}>
                    {loading ? 'Processing...' : 'Confirm Paid ✓'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminWinners
