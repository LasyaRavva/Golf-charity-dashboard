import { useState, useEffect } from 'react'
import {
  getAdminDraws,
  createDraw,
  simulateDraw,
  publishDraw
} from '../../services/drawService'
import { useResponsive } from '../../hooks/useResponsive'

const AdminDraws = () => {
  const [draws, setDraws] = useState([])
  const [fetching, setFetching] = useState(true)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [month, setMonth] = useState('')
  const [logicType, setLogicType] = useState('random')
  const [simulation, setSimulation] = useState(null)
  const [simulatingId, setSimulatingId] = useState(null)
  const [publishingId, setPublishingId] = useState(null)
  const [selectedDraw, setSelectedDraw] = useState(null)
  const [confirmPublish, setConfirmPublish] = useState(null)
  const [activeTab, setActiveTab] = useState('all')
  const { isMobile, isTablet } = useResponsive()

  useEffect(() => { fetchDraws() }, [])

  const fetchDraws = async () => {
    setFetching(true)
    try {
      const data = await getAdminDraws()
      setDraws(data.draws)
    } catch (err) {
      showMessage('Failed to load draws', 'error')
    } finally {
      setFetching(false)
    }
  }

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: '' }), 4000)
  }

  const handleCreate = async () => {
    if (!month) return showMessage('Please select a month', 'error')
    setLoading(true)
    try {
      await createDraw(month, logicType)
      showMessage('Draw created successfully ✓')
      setMonth('')
      fetchDraws()
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to create draw', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSimulate = async (id) => {
    setSimulatingId(id)
    setSimulation(null)
    try {
      const data = await simulateDraw(id)
      setSimulation(data.simulation)
      setSelectedDraw(id)
      showMessage('Simulation complete ✓')
    } catch (err) {
      showMessage('Simulation failed', 'error')
    } finally {
      setSimulatingId(null)
    }
  }

  const handlePublish = async (id) => {
    setPublishingId(id)
    setConfirmPublish(null)
    try {
      const data = await publishDraw(id)
      showMessage(`Draw published! Winners — 5-Match: ${data.results.tier5Winners}, 4-Match: ${data.results.tier4Winners}, 3-Match: ${data.results.tier3Winners}`)
      setSimulation(null)
      setSelectedDraw(null)
      fetchDraws()
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to publish', 'error')
    } finally {
      setPublishingId(null)
    }
  }

  const filteredDraws = draws.filter(d => {
    if (activeTab === 'all') return true
    return d.status === activeTab
  })

  const statusConfig = {
    draft: { bg: 'rgba(245,158,11,0.08)', text: '#d97706', border: 'rgba(245,158,11,0.2)', label: 'Draft' },
    simulated: { bg: 'rgba(108,99,255,0.08)', text: '#6c63ff', border: 'rgba(108,99,255,0.2)', label: 'Simulated' },
    published: { bg: 'rgba(34,197,94,0.08)', text: '#16a34a', border: 'rgba(34,197,94,0.2)', label: 'Published' }
  }

  const tabCounts = {
    all: draws.length,
    draft: draws.filter(d => d.status === 'draft').length,
    published: draws.filter(d => d.status === 'published').length
  }

  return (
    <div>

      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 800,
          fontSize: '1.7rem', color: '#1a1a2e',
          letterSpacing: '-0.5px', marginBottom: '4px'
        }}>Draw Management</h1>
        <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
          Create, simulate, and publish monthly prize draws
        </p>
      </div>

      {/* Message */}
      {message.text && (
        <div style={{
          padding: '0.9rem 1.2rem', borderRadius: '10px',
          marginBottom: '1.5rem',
          background: message.type === 'error' ? '#fef2f2' : '#f0fdf4',
          border: `1px solid ${message.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
          color: message.type === 'error' ? '#ef4444' : '#16a34a',
          fontSize: '0.88rem', fontWeight: 500,
          display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <span>{message.type === 'error' ? '⚠️' : '✅'}</span>
          {message.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: isTablet ? '1fr' : '1fr 1.5fr', gap: '1.5rem' }}>

        {/* ─── LEFT COLUMN ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Create Draw */}
          <div style={{
            background: '#fff', borderRadius: '16px',
            padding: '1.6rem', border: '1px solid #e5e7eb'
          }}>
            <h2 style={{
              fontFamily: 'Syne, sans-serif', fontWeight: 700,
              fontSize: '1rem', color: '#1a1a2e', marginBottom: '0.3rem'
            }}>Create New Draw</h2>
            <p style={{
              fontSize: '0.8rem', color: '#9ca3af', marginBottom: '1.4rem'
            }}>
              Set up the monthly prize draw for a specific month
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{
                  fontSize: '0.78rem', fontWeight: 600,
                  color: '#374151', display: 'block', marginBottom: '6px'
                }}>Draw Month</label>
                <input
                  type="month"
                  value={month}
                  onChange={e => setMonth(e.target.value)}
                  style={{
                    width: '100%', padding: '0.75rem 1rem',
                    borderRadius: '8px', border: '1.5px solid #e5e7eb',
                    background: '#f8f8fc', fontSize: '0.9rem',
                    color: '#1a1a2e', outline: 'none',
                    transition: 'border-color 0.2s', boxSizing: 'border-box'
                  }}
                  onFocus={e => e.target.style.borderColor = '#6c63ff'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div>
                <label style={{
                  fontSize: '0.78rem', fontWeight: 600,
                  color: '#374151', display: 'block', marginBottom: '8px'
                }}>Draw Logic</label>
                <div style={{ display: 'flex', gap: '0.8rem', flexDirection: isMobile ? 'column' : 'row' }}>
                  {[
                    { id: 'random', label: 'Random', icon: '🎲', desc: 'Standard lottery-style' },
                    { id: 'algorithmic', label: 'Weighted', icon: '📊', desc: 'Based on score frequency' }
                  ].map(opt => (
                    <div
                      key={opt.id}
                      onClick={() => setLogicType(opt.id)}
                      style={{
                        flex: 1, padding: '0.9rem',
                        borderRadius: '10px', cursor: 'pointer',
                        border: `1.5px solid ${logicType === opt.id ? '#6c63ff' : '#e5e7eb'}`,
                        background: logicType === opt.id
                          ? 'rgba(108,99,255,0.06)' : '#f8f8fc',
                        transition: 'all 0.15s'
                      }}>
                      <div style={{ fontSize: '1.2rem', marginBottom: '4px' }}>
                        {opt.icon}
                      </div>
                      <div style={{
                        fontSize: '0.82rem', fontWeight: 700,
                        color: logicType === opt.id ? '#6c63ff' : '#374151',
                        marginBottom: '2px'
                      }}>{opt.label}</div>
                      <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
                        {opt.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCreate}
                disabled={loading || !month}
                style={{
                  background: loading || !month ? '#e5e7eb' : '#6c63ff',
                  color: loading || !month ? '#9ca3af' : '#fff',
                  border: 'none', padding: '0.85rem', borderRadius: '8px',
                  fontSize: '0.9rem', fontWeight: 700,
                  cursor: loading || !month ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: loading || !month
                    ? 'none' : '0 4px 16px rgba(108,99,255,0.25)'
                }}>
                {loading ? 'Creating...' : '+ Create Draw'}
              </button>
            </div>
          </div>

          {/* Simulation Results */}
          {simulation && (
            <div style={{
              background: '#fff', borderRadius: '16px',
              padding: '1.6rem', border: '1px solid rgba(108,99,255,0.2)',
              boxShadow: '0 4px 20px rgba(108,99,255,0.08)'
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                marginBottom: '1.2rem'
              }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: 'rgba(108,99,255,0.1)',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '1rem'
                }}>🔬</div>
                <div>
                  <h3 style={{
                    fontFamily: 'Syne, sans-serif', fontWeight: 700,
                    fontSize: '0.95rem', color: '#1a1a2e'
                  }}>Simulation Results</h3>
                  <p style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                    Preview only — not yet published
                  </p>
                </div>
              </div>

              {/* Participants */}
              <div style={{
                background: '#f8f8fc', borderRadius: '10px',
                padding: '0.9rem 1rem', marginBottom: '1rem',
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', border: '1px solid #e5e7eb'
              }}>
                <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                  Total Participants
                </span>
                <span style={{
                  fontFamily: 'Syne, sans-serif', fontWeight: 800,
                  fontSize: '1.2rem', color: '#1a1a2e'
                }}>{simulation.totalParticipants}</span>
              </div>

              {/* Prize tiers */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem' }}>
                {[
                  {
                    tier: '5-Number Match',
                    winners: simulation.tier5Winners,
                    prize: simulation.tier5Prize,
                    pool: simulation.prizePool?.tier_5,
                    color: '#6c63ff', icon: '🏆'
                  },
                  {
                    tier: '4-Number Match',
                    winners: simulation.tier4Winners,
                    prize: simulation.tier4Prize,
                    pool: simulation.prizePool?.tier_4,
                    color: '#22c55e', icon: '🥈'
                  },
                  {
                    tier: '3-Number Match',
                    winners: simulation.tier3Winners,
                    prize: simulation.tier3Prize,
                    pool: simulation.prizePool?.tier_3,
                    color: '#f59e0b', icon: '🥉'
                  }
                ].map((t, i) => (
                  <div key={i} style={{
                    padding: '0.9rem', borderRadius: '10px',
                    background: `${t.color}06`,
                    border: `1px solid ${t.color}20`
                  }}>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', marginBottom: '4px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.9rem' }}>{t.icon}</span>
                        <span style={{
                          fontSize: '0.82rem', fontWeight: 700, color: t.color
                        }}>{t.tier}</span>
                      </div>
                      <span style={{
                        fontFamily: 'Syne, sans-serif', fontWeight: 800,
                        fontSize: '0.95rem', color: '#1a1a2e'
                      }}>
                        {t.winners} winner{t.winners !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      fontSize: '0.75rem', color: '#9ca3af'
                    }}>
                      <span>Pool: £{t.pool?.toFixed(2)}</span>
                      <span>
                        {t.winners > 0
                          ? `£${t.prize?.toFixed(2)} each`
                          : 'No winners'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Jackpot rollover warning */}
              {simulation.tier5Winners === 0 && (
                <div style={{
                  padding: '0.8rem 1rem',
                  background: 'rgba(245,158,11,0.06)',
                  border: '1px solid rgba(245,158,11,0.2)',
                  borderRadius: '8px', marginBottom: '1rem',
                  display: 'flex', gap: '8px', alignItems: 'center'
                }}>
                  <span style={{ fontSize: '0.9rem' }}>⚠️</span>
                  <p style={{ fontSize: '0.78rem', color: '#d97706', margin: 0 }}>
                    No 5-match winner — jackpot will roll over to next month
                  </p>
                </div>
              )}

              {/* Total pool */}
              <div style={{
                padding: '0.9rem 1rem',
                background: 'rgba(108,99,255,0.06)',
                border: '1px solid rgba(108,99,255,0.15)',
                borderRadius: '10px',
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>Total Prize Pool</span>
                <span style={{
                  fontFamily: 'Syne, sans-serif', fontWeight: 800,
                  fontSize: '1.2rem', color: '#6c63ff'
                }}>£{simulation.prizePool?.total?.toFixed(2)}</span>
              </div>

              <button
                onClick={() => setConfirmPublish(selectedDraw)}
                style={{
                  width: '100%', background: '#22c55e', color: '#fff',
                  border: 'none', padding: '0.85rem', borderRadius: '8px',
                  fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
                  marginTop: '1rem',
                  boxShadow: '0 4px 16px rgba(34,197,94,0.25)'
                }}>
                Publish This Draw →
              </button>
            </div>
          )}
        </div>

        {/* ─── RIGHT COLUMN — DRAWS LIST ─── */}
        <div style={{
          background: '#fff', borderRadius: '16px',
          border: '1px solid #e5e7eb', overflow: 'hidden'
        }}>

          {/* Tabs */}
          <div
            className="hide-scrollbar"
            style={{
            display: 'flex', borderBottom: '1px solid #f3f4f6',
            padding: '0 1.5rem',
            overflowX: 'auto'
            }}>
            {['all', 'draft', 'published'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '1rem 1.2rem', border: 'none',
                  background: 'transparent', cursor: 'pointer',
                  fontSize: '0.85rem', fontWeight: 600,
                  color: activeTab === tab ? '#6c63ff' : '#9ca3af',
                  borderBottom: activeTab === tab
                    ? '2px solid #6c63ff' : '2px solid transparent',
                  marginBottom: '-1px', transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                <span style={{
                  background: activeTab === tab ? '#6c63ff' : '#e5e7eb',
                  color: activeTab === tab ? '#fff' : '#9ca3af',
                  padding: '1px 7px', borderRadius: '50px',
                  fontSize: '0.7rem', fontWeight: 700
                }}>{tabCounts[tab]}</span>
              </button>
            ))}
          </div>

          {/* List */}
          <div
            className="hide-scrollbar"
            style={{ padding: '1rem', overflowY: 'auto', maxHeight: '70vh' }}>
            {fetching ? (
              [1, 2, 3].map(i => (
                <div key={i} style={{
                  padding: '1.2rem', borderRadius: '12px',
                  background: '#f8f8fc', marginBottom: '0.8rem',
                  border: '1px solid #e5e7eb'
                }}>
                  {[80, 60, 40].map((w, j) => (
                    <div key={j} style={{
                      height: '12px', width: `${w}%`,
                      background: '#e5e7eb', borderRadius: '4px',
                      marginBottom: '8px'
                    }} />
                  ))}
                </div>
              ))
            ) : filteredDraws.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '4rem 0'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
                <p style={{ color: '#9ca3af', fontSize: '0.9rem', fontWeight: 500 }}>
                  No {activeTab === 'all' ? '' : activeTab} draws yet
                </p>
                <p style={{ color: '#d1d5db', fontSize: '0.82rem' }}>
                  Create a draw using the form on the left
                </p>
              </div>
            ) : (
              filteredDraws.map(draw => {
                const config = statusConfig[draw.status] || statusConfig.draft
                const isSelected = selectedDraw === draw.id
                const isSimulating = simulatingId === draw.id
                const isPublishing = publishingId === draw.id

                return (
                  <div key={draw.id} style={{
                    padding: '1.2rem', borderRadius: '12px',
                    marginBottom: '0.8rem',
                    border: `1px solid ${isSelected ? 'rgba(108,99,255,0.3)' : '#e5e7eb'}`,
                    background: isSelected ? 'rgba(108,99,255,0.03)' : '#f8f8fc',
                    transition: 'all 0.15s'
                  }}>

                    {/* Draw header */}
                      <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'flex-start', marginBottom: '1rem',
                        flexDirection: isMobile ? 'column' : 'row', gap: '0.75rem'
                      }}>
                      <div>
                        <div style={{
                          fontFamily: 'Syne, sans-serif', fontWeight: 800,
                          fontSize: '1rem', color: '#1a1a2e', marginBottom: '2px'
                        }}>
                          Draw — {draw.month}
                        </div>
                        <div style={{
                          fontSize: '0.75rem', color: '#9ca3af'
                        }}>
                          {draw.logic_type === 'algorithmic' ? '📊 Weighted' : '🎲 Random'} draw
                          {draw.published_at && ` · Published ${new Date(draw.published_at)
                            .toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {draw.jackpot_rollover && (
                          <div style={{
                            background: 'rgba(245,158,11,0.1)',
                            border: '1px solid rgba(245,158,11,0.2)',
                            color: '#d97706', padding: '3px 8px',
                            borderRadius: '50px', fontSize: '0.7rem', fontWeight: 700
                          }}>🔄 Rollover</div>
                        )}
                        <div style={{
                          background: config.bg,
                          border: `1px solid ${config.border}`,
                          color: config.text,
                          padding: '4px 10px', borderRadius: '50px',
                          fontSize: '0.72rem', fontWeight: 700
                        }}>{config.label}</div>
                      </div>
                    </div>

                    {/* Draw numbers */}
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{
                        fontSize: '0.7rem', fontWeight: 700,
                        color: '#9ca3af', letterSpacing: '0.5px',
                        marginBottom: '6px', textTransform: 'uppercase'
                      }}>Draw Numbers</div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {draw.draw_numbers?.map((num, i) => (
                          <div key={i} style={{
                            width: '36px', height: '36px', borderRadius: '50%',
                            background: draw.status === 'published'
                              ? 'linear-gradient(135deg, #6c63ff, #4f46e5)'
                              : '#f3f4f6',
                            border: `2px solid ${draw.status === 'published'
                              ? 'transparent' : '#e5e7eb'}`,
                            display: 'flex', alignItems: 'center',
                            justifyContent: 'center',
                            fontFamily: 'Syne, sans-serif',
                            fontSize: '0.82rem', fontWeight: 800,
                            color: draw.status === 'published' ? '#fff' : '#374151'
                          }}>{num}</div>
                        ))}
                      </div>
                    </div>

                    {/* Prize pool if published */}
                    {draw.prize_pools?.[0] && (
                      <div style={{
                        display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr',
                        gap: '0.5rem', marginBottom: '1rem'
                      }}>
                        {[
                          { label: '5-Match Pool', value: draw.prize_pools[0].tier_5, color: '#6c63ff' },
                          { label: '4-Match Pool', value: draw.prize_pools[0].tier_4, color: '#22c55e' },
                          { label: '3-Match Pool', value: draw.prize_pools[0].tier_3, color: '#f59e0b' }
                        ].map((p, i) => (
                          <div key={i} style={{
                            background: '#fff', borderRadius: '8px',
                            padding: '0.6rem', border: '1px solid #e5e7eb',
                            textAlign: 'center'
                          }}>
                            <div style={{
                              fontFamily: 'Syne, sans-serif', fontWeight: 700,
                              fontSize: '0.85rem', color: p.color
                            }}>£{p.value?.toFixed(2)}</div>
                            <div style={{ fontSize: '0.65rem', color: '#9ca3af', marginTop: '1px' }}>
                              {p.label}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    {draw.status === 'draft' && (
                      <div style={{ display: 'flex', gap: '0.6rem', flexDirection: isMobile ? 'column' : 'row' }}>
                        <button
                          onClick={() => handleSimulate(draw.id)}
                          disabled={isSimulating}
                          style={{
                            flex: 1,
                            background: isSimulating
                              ? '#f3f4f6' : 'rgba(108,99,255,0.08)',
                            color: isSimulating ? '#9ca3af' : '#6c63ff',
                            border: `1px solid ${isSimulating
                              ? '#e5e7eb' : 'rgba(108,99,255,0.2)'}`,
                            padding: '0.65rem', borderRadius: '8px',
                            fontSize: '0.82rem', fontWeight: 600,
                            cursor: isSimulating ? 'not-allowed' : 'pointer',
                            transition: 'all 0.15s'
                          }}>
                          {isSimulating ? '⏳ Simulating...' : '🔬 Simulate'}
                        </button>
                        <button
                          onClick={() => setConfirmPublish(draw.id)}
                          disabled={isPublishing}
                          style={{
                            flex: 1,
                            background: isPublishing
                              ? '#f3f4f6' : 'rgba(34,197,94,0.08)',
                            color: isPublishing ? '#9ca3af' : '#16a34a',
                            border: `1px solid ${isPublishing
                              ? '#e5e7eb' : 'rgba(34,197,94,0.2)'}`,
                            padding: '0.65rem', borderRadius: '8px',
                            fontSize: '0.82rem', fontWeight: 600,
                            cursor: isPublishing ? 'not-allowed' : 'pointer',
                            transition: 'all 0.15s'
                          }}>
                          {isPublishing ? '⏳ Publishing...' : '🚀 Publish'}
                        </button>
                      </div>
                    )}

                    {draw.status === 'published' && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '0.6rem 0.9rem',
                        background: 'rgba(34,197,94,0.06)',
                        border: '1px solid rgba(34,197,94,0.15)',
                        borderRadius: '8px'
                      }}>
                        <span style={{ fontSize: '0.9rem' }}>✅</span>
                        <span style={{
                          fontSize: '0.82rem', color: '#16a34a', fontWeight: 600
                        }}>Published and live</span>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* ─── CONFIRM PUBLISH MODAL ─── */}
      {confirmPublish && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: '#fff', borderRadius: '20px',
            padding: '2rem', maxWidth: '420px', width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
          }}>
            <div style={{
              width: '56px', height: '56px', borderRadius: '14px',
              background: 'rgba(34,197,94,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.6rem', marginBottom: '1.2rem'
            }}>🚀</div>

            <h3 style={{
              fontFamily: 'Syne, sans-serif', fontWeight: 800,
              fontSize: '1.2rem', color: '#1a1a2e', marginBottom: '0.6rem'
            }}>Publish this draw?</h3>

            <p style={{
              color: '#6b7280', fontSize: '0.9rem',
              lineHeight: 1.6, marginBottom: '1.5rem'
            }}>
              This will process all entries, calculate winners, send email notifications,
              and make results live. <strong style={{ color: '#1a1a2e' }}>This cannot be undone.</strong>
            </p>

            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: '8px', padding: '0.8rem 1rem',
              marginBottom: '1.5rem',
              display: 'flex', gap: '8px', alignItems: 'flex-start'
            }}>
              <span style={{ fontSize: '0.9rem', flexShrink: 0 }}>⚠️</span>
              <p style={{ fontSize: '0.8rem', color: '#ef4444', margin: 0 }}>
                Make sure you've run a simulation first and reviewed the expected results.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.8rem', flexDirection: isMobile ? 'column' : 'row' }}>
              <button
                onClick={() => setConfirmPublish(null)}
                style={{
                  flex: 1, background: '#f8f8fc',
                  color: '#374151', border: '1px solid #e5e7eb',
                  padding: '0.8rem', borderRadius: '8px',
                  fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer'
                }}>Cancel</button>
              <button
                onClick={() => handlePublish(confirmPublish)}
                style={{
                  flex: 1, background: '#22c55e', color: '#fff',
                  border: 'none', padding: '0.8rem', borderRadius: '8px',
                  fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(34,197,94,0.3)'
                }}>
                Yes, Publish →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDraws
