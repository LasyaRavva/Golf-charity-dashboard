import { useState, useEffect } from 'react'
import api from '../../services/api'
import { useResponsive } from '../../hooks/useResponsive'

const AdminReports = () => {
  const [reports, setReports] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [dateRange, setDateRange] = useState('all')
  const { isMobile, isTablet } = useResponsive()

  useEffect(() => {
    Promise.all([
      api.get('/admin/reports'),
      api.get('/admin/stats')
    ]).then(([reportsRes, statsRes]) => {
      setReports(reportsRes.data)
      setStats(statsRes.data)
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', height: '60vh'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%',
          border: '3px solid #e5e7eb', borderTop: '3px solid #6c63ff',
          animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem'
        }} />
        <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
          Loading reports...
        </p>
      </div>
    </div>
  )

  const tabs = ['overview', 'subscriptions', 'draws', 'winners', 'charities']

  // ─── MINI BAR CHART ───
  const MiniBar = ({ value, max, color }) => (
    <div style={{
      height: '6px', background: '#f3f4f6',
      borderRadius: '3px', overflow: 'hidden', flex: 1
    }}>
      <div style={{
        height: '100%',
        width: `${max > 0 ? (value / max) * 100 : 0}%`,
        background: color, borderRadius: '3px',
        transition: 'width 0.8s ease'
      }} />
    </div>
  )

  // ─── STAT CARD ───
  const StatCard = ({ label, value, icon, color, bg, sub, valueFontSize = '1.8rem' }) => (
    <div style={{
      background: '#fff', borderRadius: '14px',
      padding: '1.4rem', border: '1px solid #e5e7eb',
      transition: 'all 0.2s'
    }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', marginBottom: '1rem'
      }}>
        <div style={{
          width: '42px', height: '42px', borderRadius: '10px',
          background: bg, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '1.1rem'
        }}>{icon}</div>
      </div>
      <div style={{
        fontFamily: 'Syne, sans-serif', fontSize: valueFontSize,
        fontWeight: 800, color: '#1a1a2e', lineHeight: 1,
        marginBottom: '4px'
      }}>{value}</div>
      <div style={{
        fontSize: '0.78rem', color: '#9ca3af',
        fontWeight: 500, marginBottom: sub ? '4px' : 0
      }}>{label}</div>
      {sub && (
        <div style={{ fontSize: '0.72rem', color, fontWeight: 600 }}>
          {sub}
        </div>
      )}
    </div>
  )

  return (
    <div>

      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', marginBottom: '1.5rem',
        flexWrap: 'wrap', gap: '1rem'
      }}>
        <div>
          <h1 style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 800,
            fontSize: '1.7rem', color: '#1a1a2e',
            letterSpacing: '-0.5px', marginBottom: '4px'
          }}>Reports & Analytics</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
            Platform performance overview
          </p>
        </div>

        {/* Export button */}
        <button
          onClick={() => {
            const data = JSON.stringify({ reports, stats }, null, 2)
            const blob = new Blob([data], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `golf-gives-report-${new Date().toISOString().split('T')[0]}.json`
            a.click()
          }}
          style={{
            background: '#f8f8fc', color: '#374151',
            border: '1px solid #e5e7eb',
            padding: '0.65rem 1.2rem', borderRadius: '8px',
            fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px',
            transition: 'all 0.15s'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#6c63ff'
            e.currentTarget.style.color = '#6c63ff'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = '#e5e7eb'
            e.currentTarget.style.color = '#374151'
          }}>
          <span>📥</span> Export JSON
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: '0',
        borderBottom: '1px solid #e5e7eb',
        marginBottom: '1.5rem',
        background: '#fff', borderRadius: '12px 12px 0 0',
        padding: '0 1rem',
        overflow: 'auto',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.9rem 1.2rem', border: 'none',
              background: 'transparent', cursor: 'pointer',
              fontSize: '0.85rem', fontWeight: 600,
              color: activeTab === tab ? '#6c63ff' : '#9ca3af',
              borderBottom: activeTab === tab
                ? '2px solid #6c63ff' : '2px solid transparent',
              marginBottom: '-1px', transition: 'all 0.15s',
              whiteSpace: 'nowrap'
            }}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* ─── OVERVIEW TAB ─── */}
      {activeTab === 'overview' && (
        <div>
          {/* Top stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile
              ? 'repeat(2, minmax(0, 1fr))'
              : 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem', marginBottom: '1rem'
          }}>
            <StatCard
              label="Total Users"
              value={stats?.totalUsers || 0}
              icon="👥" color="#6c63ff"
              bg="rgba(108,99,255,0.08)"
              sub="Platform members"
              valueFontSize={isMobile ? '1.35rem' : '1.8rem'}
            />
            <StatCard
              label="Active Subscribers"
              value={stats?.activeSubscribers || 0}
              icon="✅" color="#22c55e"
              bg="rgba(34,197,94,0.08)"
              sub="Currently active"
              valueFontSize={isMobile ? '1.35rem' : '1.8rem'}
            />
            <StatCard
              label="Total Prize Pool"
              value={`£${stats?.totalPrizePool || '0.00'}`}
              icon="🏆" color="#f59e0b"
              bg="rgba(245,158,11,0.08)"
              sub="All time"
              valueFontSize={isMobile ? '1.35rem' : '1.8rem'}
            />
            <StatCard
              label="Charity Donations"
              value={`£${stats?.totalDonations || '0.00'}`}
              icon="💚" color="#22c55e"
              bg="rgba(34,197,94,0.08)"
              sub="Total donated"
              valueFontSize={isMobile ? '1.35rem' : '1.8rem'}
            />
            <StatCard
              label="Draws Published"
              value={stats?.totalDraws || 0}
              icon="🎯" color="#6c63ff"
              bg="rgba(108,99,255,0.08)"
              sub="All time"
              valueFontSize={isMobile ? '1.35rem' : '1.8rem'}
            />
            <StatCard
              label="Winners Paid"
              value={`£${reports?.winners?.totalPaid || '0.00'}`}
              icon="💸" color="#6c63ff"
              bg="rgba(108,99,255,0.08)"
              sub="Prize payouts"
              valueFontSize={isMobile ? '1.35rem' : '1.8rem'}
            />
          </div>

          {/* Two col summary */}
          <div style={{
            display: 'grid', gridTemplateColumns: isTablet ? '1fr' : '1fr 1fr',
            gap: '1.5rem', marginBottom: '1.5rem'
          }}>

            {/* Subscription health */}
            <div style={{
              background: '#fff', borderRadius: '16px',
              padding: '1.6rem', border: '1px solid #e5e7eb'
            }}>
              <h3 style={{
                fontFamily: 'Syne, sans-serif', fontWeight: 700,
                fontSize: '1rem', color: '#1a1a2e', marginBottom: '1.2rem'
              }}>Subscription Health</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  {
                    label: 'Monthly Plans',
                    value: reports?.subscriptions?.monthly || 0,
                    total: (reports?.subscriptions?.monthly || 0) + (reports?.subscriptions?.yearly || 0),
                    color: '#6c63ff'
                  },
                  {
                    label: 'Yearly Plans',
                    value: reports?.subscriptions?.yearly || 0,
                    total: (reports?.subscriptions?.monthly || 0) + (reports?.subscriptions?.yearly || 0),
                    color: '#22c55e'
                  },
                  {
                    label: 'Active',
                    value: reports?.subscriptions?.active || 0,
                    total: stats?.totalUsers || 1,
                    color: '#22c55e'
                  }
                ].map((item, i) => {
                  const pct = item.total > 0
                    ? Math.round((item.value / item.total) * 100) : 0
                  return (
                    <div key={i}>
                      <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        fontSize: '0.85rem', marginBottom: '6px'
                      }}>
                        <span style={{ color: '#374151', fontWeight: 500 }}>
                          {item.label}
                        </span>
                        <span style={{ color: '#1a1a2e', fontWeight: 700 }}>
                          {item.value}
                          <span style={{ color: '#9ca3af', fontWeight: 400, marginLeft: '4px' }}>
                            ({pct}%)
                          </span>
                        </span>
                      </div>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '8px'
                      }}>
                        <MiniBar value={item.value} max={item.total} color={item.color} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Draw performance */}
            <div style={{
              background: '#fff', borderRadius: '16px',
              padding: '1.6rem', border: '1px solid #e5e7eb'
            }}>
              <h3 style={{
                fontFamily: 'Syne, sans-serif', fontWeight: 700,
                fontSize: '1rem', color: '#1a1a2e', marginBottom: '1.2rem'
              }}>Draw Performance</h3>

              <div style={{
                display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: '0.8rem'
              }}>
                {[
                  { label: 'Total Draws', value: reports?.draws?.total || 0, color: '#6c63ff', icon: '🎯' },
                  { label: 'Published', value: reports?.draws?.published || 0, color: '#22c55e', icon: '✅' },
                  { label: 'Jackpot Rollovers', value: reports?.draws?.jackpotRollovers || 0, color: '#f59e0b', icon: '🔄' },
                  { label: '5-Match Winners', value: reports?.winners?.byTier?.[5] || 0, color: '#6c63ff', icon: '🏆' },
                  { label: '4-Match Winners', value: reports?.winners?.byTier?.[4] || 0, color: '#22c55e', icon: '🥈' },
                  { label: '3-Match Winners', value: reports?.winners?.byTier?.[3] || 0, color: '#f59e0b', icon: '🥉' }
                ].map((item, i) => (
                  <div key={i} style={{
                    background: '#f8f8fc', borderRadius: '10px',
                    padding: '0.9rem', border: '1px solid #e5e7eb',
                    display: 'flex', alignItems: 'center', gap: '10px'
                  }}>
                    <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                    <div>
                      <div style={{
                        fontFamily: 'Syne, sans-serif', fontWeight: 800,
                        fontSize: '1.2rem', color: item.color, lineHeight: 1
                      }}>{item.value}</div>
                      <div style={{
                        fontSize: '0.7rem', color: '#9ca3af', marginTop: '2px'
                      }}>{item.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Charity overview */}
          <div style={{
            background: '#fff', borderRadius: '16px',
            padding: '1.6rem', border: '1px solid #e5e7eb'
          }}>
            <h3 style={{
              fontFamily: 'Syne, sans-serif', fontWeight: 700,
              fontSize: '1rem', color: '#1a1a2e', marginBottom: '1.2rem'
            }}>Top Charities by Contribution</h3>

            {!reports?.charityTotals?.length ? (
              <div style={{
                textAlign: 'center', padding: '2rem',
                color: '#9ca3af', fontSize: '0.88rem'
              }}>No donation data yet</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {reports.charityTotals
                  .sort((a, b) => b.total - a.total)
                  .slice(0, 5)
                  .map((charity, i) => {
                    const max = Math.max(...reports.charityTotals.map(c => c.total))
                    const pct = max > 0 ? (charity.total / max) * 100 : 0
                    const colors = ['#6c63ff', '#22c55e', '#f59e0b', '#ef4444', '#a78bfa']
                    return (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: '12px'
                      }}>
                        <div style={{
                          width: '28px', height: '28px', borderRadius: '8px',
                          background: `${colors[i]}15`,
                          display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontSize: '0.85rem',
                          flexShrink: 0, fontFamily: 'Syne, sans-serif',
                          fontWeight: 800, color: colors[i], fontSize: '0.8rem'
                        }}>#{i + 1}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            display: 'flex', justifyContent: 'space-between',
                            marginBottom: '5px'
                          }}>
                            <span style={{
                              fontSize: '0.85rem', fontWeight: 600,
                              color: '#1a1a2e', whiteSpace: 'nowrap',
                              overflow: 'hidden', textOverflow: 'ellipsis',
                              maxWidth: '200px'
                            }}>{charity.name}</span>
                            <span style={{
                              fontSize: '0.85rem', fontWeight: 700,
                              color: colors[i], flexShrink: 0, marginLeft: '8px'
                            }}>£{charity.total?.toFixed(2)}</span>
                          </div>
                          <div style={{
                            display: 'flex', alignItems: 'center', gap: '8px'
                          }}>
                            <MiniBar value={charity.total} max={max} color={colors[i]} />
                            <span style={{
                              fontSize: '0.72rem', color: '#9ca3af',
                              flexShrink: 0
                            }}>{Math.round(pct)}%</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── SUBSCRIPTIONS TAB ─── */}
      {activeTab === 'subscriptions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile
              ? 'repeat(2, minmax(0, 1fr))'
              : 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem'
          }}>
            {[
              { label: 'Total Users', value: stats?.totalUsers || 0, icon: '👥', color: '#6c63ff', bg: 'rgba(108,99,255,0.08)' },
              { label: 'Active Subscribers', value: reports?.subscriptions?.active || 0, icon: '✅', color: '#22c55e', bg: 'rgba(34,197,94,0.08)' },
              { label: 'Monthly Plans', value: reports?.subscriptions?.monthly || 0, icon: '📅', color: '#6c63ff', bg: 'rgba(108,99,255,0.08)' },
              { label: 'Yearly Plans', value: reports?.subscriptions?.yearly || 0, icon: '📆', color: '#22c55e', bg: 'rgba(34,197,94,0.08)' }
            ].map((s, i) => (
              <StatCard key={i} {...s} />
            ))}
          </div>

          <div style={{
            background: '#fff', borderRadius: '16px',
            padding: '1.6rem', border: '1px solid #e5e7eb'
          }}>
            <h3 style={{
              fontFamily: 'Syne, sans-serif', fontWeight: 700,
              fontSize: '1rem', color: '#1a1a2e', marginBottom: '1.4rem'
            }}>Plan Distribution</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              {[
                {
                  label: 'Monthly Plans',
                  value: reports?.subscriptions?.monthly || 0,
                  total: (reports?.subscriptions?.monthly || 0) +
                    (reports?.subscriptions?.yearly || 0),
                  color: '#6c63ff',
                  revenue: ((reports?.subscriptions?.monthly || 0) * 9.99).toFixed(2)
                },
                {
                  label: 'Yearly Plans',
                  value: reports?.subscriptions?.yearly || 0,
                  total: (reports?.subscriptions?.monthly || 0) +
                    (reports?.subscriptions?.yearly || 0),
                  color: '#22c55e',
                  revenue: ((reports?.subscriptions?.yearly || 0) * 99.99).toFixed(2)
                }
              ].map((item, i) => {
                const pct = item.total > 0
                  ? Math.round((item.value / item.total) * 100) : 0
                return (
                  <div key={i} style={{
                    padding: '1.2rem', background: '#f8f8fc',
                    borderRadius: '12px', border: '1px solid #e5e7eb'
                  }}>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'flex-start', marginBottom: '0.8rem'
                    }}>
                      <div>
                        <div style={{
                          fontFamily: 'Syne, sans-serif', fontWeight: 700,
                          fontSize: '0.9rem', color: '#1a1a2e', marginBottom: '2px'
                        }}>{item.label}</div>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                          Est. monthly revenue: <strong style={{ color: item.color }}>
                            £{item.revenue}
                          </strong>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{
                          fontFamily: 'Syne, sans-serif', fontWeight: 800,
                          fontSize: '1.4rem', color: item.color, lineHeight: 1
                        }}>{item.value}</div>
                        <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
                          {pct}% of total
                        </div>
                      </div>
                    </div>
                    <div style={{
                      height: '8px', background: '#e5e7eb',
                      borderRadius: '4px', overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%', width: `${pct}%`,
                        background: item.color, borderRadius: '4px',
                        transition: 'width 1s ease'
                      }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─── DRAWS TAB ─── */}
      {activeTab === 'draws' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile
              ? 'repeat(2, minmax(0, 1fr))'
              : 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem'
          }}>
            {[
              { label: 'Total Draws', value: reports?.draws?.total || 0, icon: '🎯', color: '#6c63ff', bg: 'rgba(108,99,255,0.08)' },
              { label: 'Published', value: reports?.draws?.published || 0, icon: '✅', color: '#22c55e', bg: 'rgba(34,197,94,0.08)' },
              { label: 'Jackpot Rollovers', value: reports?.draws?.jackpotRollovers || 0, icon: '🔄', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
              { label: 'Total Paid Out', value: `£${reports?.winners?.totalPaid || '0.00'}`, icon: '💸', color: '#22c55e', bg: 'rgba(34,197,94,0.08)' }
            ].map((s, i) => (
              <StatCard
                key={i}
                {...s}
                valueFontSize={isMobile ? '1.35rem' : '1.8rem'}
              />
            ))}
          </div>

          {/* Winners by tier */}
          <div style={{
            background: '#fff', borderRadius: '16px',
            padding: '1.6rem', border: '1px solid #e5e7eb'
          }}>
            <h3 style={{
              fontFamily: 'Syne, sans-serif', fontWeight: 700,
              fontSize: '1rem', color: '#1a1a2e', marginBottom: '1.4rem'
            }}>Winners by Tier</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { tier: '5-Number Match', icon: '🏆', value: reports?.winners?.byTier?.[5] || 0, color: '#6c63ff', prize: '40% pool' },
                { tier: '4-Number Match', icon: '🥈', value: reports?.winners?.byTier?.[4] || 0, color: '#22c55e', prize: '35% pool' },
                { tier: '3-Number Match', icon: '🥉', value: reports?.winners?.byTier?.[3] || 0, color: '#f59e0b', prize: '25% pool' }
              ].map((t, i) => {
                const total = (reports?.winners?.byTier?.[5] || 0) +
                  (reports?.winners?.byTier?.[4] || 0) +
                  (reports?.winners?.byTier?.[3] || 0)
                const pct = total > 0 ? Math.round((t.value / total) * 100) : 0
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '1rem', background: '#f8f8fc',
                    borderRadius: '12px', border: '1px solid #e5e7eb'
                  }}>
                    <div style={{
                      width: '42px', height: '42px', borderRadius: '10px',
                      background: `${t.color}15`,
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0
                    }}>{t.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        marginBottom: '6px'
                      }}>
                        <div>
                          <span style={{
                            fontSize: '0.88rem', fontWeight: 600, color: '#1a1a2e'
                          }}>{t.tier}</span>
                          <span style={{
                            marginLeft: '8px', fontSize: '0.72rem',
                            color: '#9ca3af'
                          }}>{t.prize}</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{
                            fontFamily: 'Syne, sans-serif', fontWeight: 800,
                            fontSize: '1rem', color: t.color
                          }}>{t.value}</span>
                          <span style={{
                            fontSize: '0.72rem', color: '#9ca3af', marginLeft: '4px'
                          }}>({pct}%)</span>
                        </div>
                      </div>
                      <MiniBar value={t.value} max={total || 1} color={t.color} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─── WINNERS TAB ─── */}
      {activeTab === 'winners' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile
              ? 'repeat(2, minmax(0, 1fr))'
              : 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem'
          }}>
            {[
              { label: '5-Match Winners', value: reports?.winners?.byTier?.[5] || 0, icon: '🏆', color: '#6c63ff', bg: 'rgba(108,99,255,0.08)' },
              { label: '4-Match Winners', value: reports?.winners?.byTier?.[4] || 0, icon: '🥈', color: '#22c55e', bg: 'rgba(34,197,94,0.08)' },
              { label: '3-Match Winners', value: reports?.winners?.byTier?.[3] || 0, icon: '🥉', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
              { label: 'Total Paid Out', value: `£${reports?.winners?.totalPaid || '0.00'}`, icon: '💸', color: '#22c55e', bg: 'rgba(34,197,94,0.08)' }
            ].map((s, i) => (
              <StatCard
                key={i}
                {...s}
                valueFontSize={isMobile ? '1.35rem' : '1.8rem'}
              />
            ))}
          </div>

          <div style={{
            background: '#fff', borderRadius: '16px',
            padding: '1.6rem', border: '1px solid #e5e7eb'
          }}>
            <h3 style={{
              fontFamily: 'Syne, sans-serif', fontWeight: 700,
              fontSize: '1rem', color: '#1a1a2e', marginBottom: '1.2rem'
            }}>Prize Distribution Breakdown</h3>

            <div style={{
              display: 'grid', gridTemplateColumns: isTablet ? '1fr' : '1fr 1fr 1fr',
              gap: '1rem'
            }}>
              {[
                { tier: 5, label: '5-Match Jackpot', pct: '40%', color: '#6c63ff', icon: '🏆', note: 'Rolls over if unclaimed' },
                { tier: 4, label: '4-Match Prize', pct: '35%', color: '#22c55e', icon: '🥈', note: 'Split among winners' },
                { tier: 3, label: '3-Match Prize', pct: '25%', color: '#f59e0b', icon: '🥉', note: 'Split among winners' }
              ].map((item, i) => (
                <div key={i} style={{
                  padding: '1.4rem', background: '#f8f8fc',
                  borderRadius: '12px', border: '1px solid #e5e7eb',
                  textAlign: 'center', position: 'relative', overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0,
                    height: '3px', background: item.color
                  }} />
                  <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>
                    {item.icon}
                  </div>
                  <div style={{
                    fontFamily: 'Syne, sans-serif', fontWeight: 800,
                    fontSize: '1.8rem', color: item.color, lineHeight: 1,
                    marginBottom: '4px'
                  }}>{item.pct}</div>
                  <div style={{
                    fontSize: '0.82rem', fontWeight: 600,
                    color: '#1a1a2e', marginBottom: '4px'
                  }}>{item.label}</div>
                  <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
                    {item.note}
                  </div>
                  <div style={{
                    marginTop: '0.8rem', padding: '0.4rem',
                    background: `${item.color}10`,
                    border: `1px solid ${item.color}20`,
                    borderRadius: '6px',
                    fontFamily: 'Syne, sans-serif', fontWeight: 800,
                    fontSize: '1rem', color: item.color
                  }}>
                    {reports?.winners?.byTier?.[item.tier] || 0} winners
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── CHARITIES TAB ─── */}
      {activeTab === 'charities' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          <div style={{
            background: '#fff', borderRadius: '16px',
            padding: '1.6rem', border: '1px solid #e5e7eb'
          }}>
            <h3 style={{
              fontFamily: 'Syne, sans-serif', fontWeight: 700,
              fontSize: '1rem', color: '#1a1a2e', marginBottom: '1.4rem'
            }}>Charity Contribution Leaderboard</h3>

            {!reports?.charityTotals?.length ? (
              <div style={{
                textAlign: 'center', padding: '3rem',
                color: '#9ca3af', fontSize: '0.9rem'
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>💚</div>
                No donation data yet
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {reports.charityTotals
                  .sort((a, b) => b.total - a.total)
                  .map((charity, i) => {
                    const max = Math.max(...reports.charityTotals.map(c => c.total))
                    const pct = max > 0 ? (charity.total / max) * 100 : 0
                    const totalAll = reports.charityTotals.reduce((s, c) => s + c.total, 0)
                    const share = totalAll > 0
                      ? Math.round((charity.total / totalAll) * 100) : 0
                    const rankColors = ['#f59e0b', '#9ca3af', '#cd7c2f']

                    return (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center',
                        gap: '14px', padding: '1.1rem',
                        background: i < 3 ? `${rankColors[i]}06` : '#f8f8fc',
                        borderRadius: '12px',
                        border: `1px solid ${i < 3 ? `${rankColors[i]}20` : '#e5e7eb'}`
                      }}>

                        {/* Rank */}
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '10px',
                          background: i < 3 ? `${rankColors[i]}15` : '#f3f4f6',
                          display: 'flex', alignItems: 'center',
                          justifyContent: 'center', flexShrink: 0,
                          fontFamily: 'Syne, sans-serif', fontWeight: 800,
                          fontSize: i === 0 ? '1.2rem' : '0.82rem',
                          color: i < 3 ? rankColors[i] : '#9ca3af'
                        }}>
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            display: 'flex', justifyContent: 'space-between',
                            alignItems: 'center', marginBottom: '6px'
                          }}>
                            <span style={{
                              fontSize: '0.9rem', fontWeight: 700,
                              color: '#1a1a2e', whiteSpace: 'nowrap',
                              overflow: 'hidden', textOverflow: 'ellipsis',
                              maxWidth: '200px'
                            }}>{charity.name}</span>
                            <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '8px' }}>
                              <span style={{
                                fontFamily: 'Syne, sans-serif', fontWeight: 800,
                                fontSize: '0.95rem', color: '#22c55e'
                              }}>£{charity.total?.toFixed(2)}</span>
                              <span style={{
                                marginLeft: '6px', fontSize: '0.72rem',
                                color: '#9ca3af'
                              }}>({share}%)</span>
                            </div>
                          </div>

                          <div style={{
                            display: 'flex', alignItems: 'center', gap: '8px'
                          }}>
                            <MiniBar value={charity.total} max={max} color="#22c55e" />
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </div>

          {/* Total donations summary */}
          <div style={{
            background: 'linear-gradient(135deg, #0f0f1a, #1a1a2e)',
            borderRadius: '16px', padding: '2rem',
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', flexWrap: 'wrap', gap: '1rem'
          }}>
            <div>
              <div style={{
                fontSize: '0.75rem', fontWeight: 700,
                color: 'rgba(255,255,255,0.4)', letterSpacing: '1px',
                textTransform: 'uppercase', marginBottom: '0.5rem'
              }}>Total Donated to Charities</div>
              <div style={{
                fontFamily: 'Syne, sans-serif', fontWeight: 800,
                fontSize: '2.5rem', color: '#22c55e', lineHeight: 1
              }}>£{stats?.totalDonations || '0.00'}</div>
              <div style={{
                fontSize: '0.82rem', color: 'rgba(255,255,255,0.4)',
                marginTop: '4px'
              }}>
                Across {reports?.charityTotals?.length || 0} charities
              </div>
            </div>
            <div style={{
              display: 'flex', gap: '2rem', flexWrap: 'wrap'
            }}>
              {[
                { label: 'Avg per charity', value: `£${reports?.charityTotals?.length > 0 ? (parseFloat(stats?.totalDonations || 0) / reports.charityTotals.length).toFixed(2) : '0.00'}` },
                { label: 'Charities supported', value: reports?.charityTotals?.length || 0 }
              ].map((item, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{
                    fontFamily: 'Syne, sans-serif', fontWeight: 800,
                    fontSize: '1.4rem', color: '#fff', lineHeight: 1
                  }}>{item.value}</div>
                  <div style={{
                    fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)',
                    marginTop: '4px'
                  }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminReports
