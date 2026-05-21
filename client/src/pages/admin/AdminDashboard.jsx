import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

// ─── ADMIN LAYOUT (shared sidebar for all admin pages) ───
export const AdminLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleLogout = () => {
    logout()
    window.location.assign('/login')
  }

  const navItems = [
    { path: '/admin', icon: '📊', label: 'Dashboard', exact: true },
    { path: '/admin/users', icon: '👥', label: 'Users' },
    { path: '/admin/draws', icon: '🎯', label: 'Draws' },
    { path: '/admin/charities', icon: '💚', label: 'Charities' },
    { path: '/admin/winners', icon: '🏆', label: 'Winners' },
    { path: '/admin/reports', icon: '📈', label: 'Reports' }
  ]

  const isActive = (path, exact) => exact
    ? location.pathname === path
    : location.pathname.startsWith(path) && path !== '/admin'
      || location.pathname === path

  if (!user) return <Navigate to="/login" replace />

  return (
    <div style={{
      display: 'flex', minHeight: '100vh',
      fontFamily: "'DM Sans', sans-serif",
      background: '#f8f8fc'
    }}>

      {/* ─── SIDEBAR ─── */}
      <div style={{
        width: sidebarOpen ? '240px' : '68px',
        background: '#0f0f1a',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', left: 0, top: 0, bottom: 0,
        zIndex: 50, transition: 'width 0.25s ease',
        height: '100dvh', overflow: 'hidden'
      }}>

        {/* Logo */}
        <div style={{
          padding: '1.4rem 1.2rem',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: '8px'
        }}>
          {sidebarOpen && (
            <div style={{
              fontFamily: 'Syne, sans-serif', fontWeight: 800,
              fontSize: '1.1rem', color: '#fff', whiteSpace: 'nowrap'
            }}>
              Golf<span style={{ color: '#6c63ff' }}>Gives</span>
              <span style={{
                marginLeft: '8px', fontSize: '0.65rem',
                background: 'rgba(108,99,255,0.2)',
                border: '1px solid rgba(108,99,255,0.3)',
                color: '#a78bfa', padding: '2px 7px',
                borderRadius: '4px', fontWeight: 700,
                letterSpacing: '0.5px'
              }}>ADMIN</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.5)',
              width: '30px', height: '30px', borderRadius: '6px',
              cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: '0.75rem', flexShrink: 0
            }}>
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>

        {/* Admin info */}
        {sidebarOpen && (
          <div style={{
            padding: '1rem 1.2rem',
            borderBottom: '1px solid rgba(255,255,255,0.06)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '8px',
                background: 'linear-gradient(135deg, #6c63ff, #4f46e5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.9rem', fontWeight: 700, color: '#fff', flexShrink: 0
              }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{
                  color: '#fff', fontSize: '0.85rem',
                  fontWeight: 600, whiteSpace: 'nowrap',
                  overflow: 'hidden', textOverflow: 'ellipsis'
                }}>{user?.name}</div>
                <div style={{
                  color: '#6c63ff', fontSize: '0.7rem',
                  fontWeight: 600, letterSpacing: '0.3px'
                }}>Administrator</div>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav style={{
          flex: '1 1 auto',
          minHeight: 0,
          overflowY: 'auto',
          padding: '1rem 0.8rem 1rem',
          display: 'flex', flexDirection: 'column', gap: '2px'
        }}>
          {navItems.map(item => {
            const active = isActive(item.path, item.exact)
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  display: 'flex', alignItems: 'center',
                  gap: sidebarOpen ? '10px' : '0',
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px', border: 'none',
                  cursor: 'pointer', width: '100%',
                  background: active
                    ? 'rgba(108,99,255,0.18)' : 'transparent',
                  transition: 'all 0.15s'
                }}
                onMouseEnter={e => {
                  if (!active)
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                }}
                onMouseLeave={e => {
                  if (!active)
                    e.currentTarget.style.background = 'transparent'
                }}>
                <span style={{ fontSize: '1rem', flexShrink: 0 }}>{item.icon}</span>
                {sidebarOpen && (
                  <span style={{
                    fontSize: '0.85rem', fontWeight: 500,
                    color: active ? '#a78bfa' : 'rgba(255,255,255,0.5)',
                    whiteSpace: 'nowrap'
                  }}>{item.label}</span>
                )}
                {active && sidebarOpen && (
                  <div style={{
                    marginLeft: 'auto', width: '4px', height: '4px',
                    borderRadius: '50%', background: '#6c63ff'
                  }} />
                )}
              </button>
            )
          })}
        </nav>

        {/* Bottom */}
        <div style={{
          position: 'absolute',
          left: '0.8rem',
          right: '0.8rem',
          bottom: '5rem',
          padding: 0,
          background: 'transparent',
          zIndex: 3,
          display: 'flex', flexDirection: 'column', gap: '8px'
        }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              display: 'none',
              background: 'rgba(255,255,255,0.04)',
              color: 'rgba(255,255,255,0.4)',
              border: '1px solid rgba(255,255,255,0.06)',
              padding: '0.8rem', borderRadius: '8px',
              fontSize: '0.78rem', cursor: 'pointer',
              display: 'none', alignItems: 'center',
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              gap: '8px'
            }}>
            <span>👤</span>
            {sidebarOpen && <span>User Dashboard</span>}
          </button>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              background: '#ef4444',
              color: '#fff',
              border: 'none',
              padding: '0.7rem', borderRadius: '8px',
              fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center',
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              gap: '8px',
              boxShadow: '0 10px 24px rgba(239,68,68,0.22)'
            }}>
            <span>🚪</span>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* ─── PAGE CONTENT ─── */}
      <div style={{
        marginLeft: sidebarOpen ? '240px' : '68px',
        flex: 1, transition: 'margin-left 0.25s ease',
        padding: '3rem', minWidth: 0
      }}>
        <Outlet />
      </div>
    </div>
  )
}

// ─── ADMIN DASHBOARD PAGE ───
const AdminDashboard = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [reports, setReports] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/reports')
    ]).then(([statsRes, reportsRes]) => {
      setStats(statsRes.data)
      setReports(reportsRes.data)
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
        <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>Loading dashboard...</p>
      </div>
    </div>
  )

  const statCards = [
    {
      label: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: '👥', color: '#6c63ff',
      bg: 'rgba(108,99,255,0.08)',
      change: '+12% this month'
    },
    {
      label: 'Active Subscribers',
      value: stats?.activeSubscribers || 0,
      icon: '✅', color: '#22c55e',
      bg: 'rgba(34,197,94,0.08)',
      change: 'Currently active'
    },
    {
      label: 'Total Prize Pool',
      value: `£${stats?.totalPrizePool || '0.00'}`,
      icon: '🏆', color: '#f59e0b',
      bg: 'rgba(245,158,11,0.08)',
      change: 'All time'
    },
    {
      label: 'Charity Donations',
      value: `£${stats?.totalDonations || '0.00'}`,
      icon: '💚', color: '#22c55e',
      bg: 'rgba(34,197,94,0.08)',
      change: 'Total donated'
    },
    {
      label: 'Draws Published',
      value: stats?.totalDraws || 0,
      icon: '🎯', color: '#6c63ff',
      bg: 'rgba(108,99,255,0.08)',
      change: 'All time'
    },
    {
      label: 'Pending Verifications',
      value: stats?.pendingWinners || 0,
      icon: '⏳',
      color: stats?.pendingWinners > 0 ? '#ef4444' : '#22c55e',
      bg: stats?.pendingWinners > 0
        ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.08)',
      change: stats?.pendingWinners > 0 ? 'Needs attention' : 'All clear',
      alert: stats?.pendingWinners > 0
    }
  ]

  const quickActions = [
    {
      icon: '🎯', label: 'Create Draw',
      desc: 'Set up this month\'s draw',
      color: '#6c63ff', path: '/admin/draws'
    },
    {
      icon: '👥', label: 'Manage Users',
      desc: 'View and edit user accounts',
      color: '#22c55e', path: '/admin/users'
    },
    {
      icon: '🏆', label: 'Verify Winners',
      desc: `${stats?.pendingWinners || 0} pending review`,
      color: stats?.pendingWinners > 0 ? '#ef4444' : '#f59e0b',
      path: '/admin/winners',
      urgent: stats?.pendingWinners > 0
    },
    {
      icon: '💚', label: 'Manage Charities',
      desc: 'Add or update charities',
      color: '#22c55e', path: '/admin/charities'
    },
    {
      icon: '📈', label: 'View Reports',
      desc: 'Analytics and insights',
      color: '#6c63ff', path: '/admin/reports'
    }
  ]

  return (
    <div>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 800,
          fontSize: '1.7rem', color: '#1a1a2e',
          letterSpacing: '-0.5px', marginBottom: '4px'
        }}>Admin Dashboard</h1>
        <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
          {new Date().toLocaleDateString('en-GB', {
            weekday: 'long', day: 'numeric',
            month: 'long', year: 'numeric'
          })}
        </p>
      </div>

      {/* Alert banner */}
      {stats?.pendingWinners > 0 && (
        <div style={{
          background: 'rgba(239,68,68,0.06)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: '12px', padding: '1rem 1.4rem',
          marginBottom: '1.5rem',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.2rem' }}>⚠️</span>
            <div>
              <div style={{
                fontSize: '0.9rem', fontWeight: 700, color: '#ef4444'
              }}>
                {stats.pendingWinners} winner{stats.pendingWinners > 1 ? 's' : ''} pending verification
              </div>
              <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                Review and approve or reject winner submissions
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/admin/winners')}
            style={{
              background: '#ef4444', color: '#fff', border: 'none',
              padding: '0.5rem 1.2rem', borderRadius: '8px',
              fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer'
            }}>
            Review Now →
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem', marginBottom: '2rem'
      }}>
        {statCards.map((card, i) => (
          <div key={i} style={{
            background: '#fff', borderRadius: '14px',
            padding: '1.4rem', border: `1px solid ${card.alert ? 'rgba(239,68,68,0.2)' : '#e5e7eb'}`,
            transition: 'all 0.2s', cursor: 'default'
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
                background: card.bg,
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '1.2rem'
              }}>{card.icon}</div>
              {card.alert && (
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: '#ef4444',
                  boxShadow: '0 0 0 3px rgba(239,68,68,0.2)'
                }} />
              )}
            </div>
            <div style={{
              fontFamily: 'Syne, sans-serif', fontSize: '1.7rem',
              fontWeight: 800, color: '#1a1a2e', lineHeight: 1,
              marginBottom: '4px'
            }}>{card.value}</div>
            <div style={{
              fontSize: '0.78rem', color: '#9ca3af',
              fontWeight: 500, marginBottom: '4px'
            }}>{card.label}</div>
            <div style={{
              fontSize: '0.72rem',
              color: card.alert ? '#ef4444' : '#22c55e',
              fontWeight: 600
            }}>{card.change}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions + Charts row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.4fr 1fr',
        gap: '1.5rem', marginBottom: '1.5rem'
      }}>

        {/* Quick Actions */}
        <div style={{
          background: '#fff', borderRadius: '16px',
          padding: '1.6rem', border: '1px solid #e5e7eb'
        }}>
          <h2 style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 700,
            fontSize: '1rem', color: '#1a1a2e', marginBottom: '1.2rem'
          }}>Quick Actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
            {quickActions.map((action, i) => (
              <button
                key={i}
                onClick={() => navigate(action.path)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '0.9rem 1rem', borderRadius: '10px',
                  border: `1px solid ${action.urgent ? 'rgba(239,68,68,0.2)' : '#e5e7eb'}`,
                  background: action.urgent ? 'rgba(239,68,68,0.04)' : '#f8f8fc',
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.15s', width: '100%'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = action.color
                  e.currentTarget.style.background = `${action.color}0a`
                  e.currentTarget.style.transform = 'translateX(4px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = action.urgent
                    ? 'rgba(239,68,68,0.2)' : '#e5e7eb'
                  e.currentTarget.style.background = action.urgent
                    ? 'rgba(239,68,68,0.04)' : '#f8f8fc'
                  e.currentTarget.style.transform = 'translateX(0)'
                }}>
                <div style={{
                  width: '38px', height: '38px', borderRadius: '8px',
                  background: `${action.color}15`,
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '1rem', flexShrink: 0
                }}>{action.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '0.88rem', fontWeight: 600,
                    color: '#1a1a2e', marginBottom: '1px'
                  }}>{action.label}</div>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                    {action.desc}
                  </div>
                </div>
                <span style={{ color: '#d1d5db', fontSize: '0.85rem' }}>→</span>
              </button>
            ))}
          </div>
        </div>

        {/* Subscription breakdown */}
        <div style={{
          background: '#fff', borderRadius: '16px',
          padding: '1.6rem', border: '1px solid #e5e7eb'
        }}>
          <h2 style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 700,
            fontSize: '1rem', color: '#1a1a2e', marginBottom: '1.2rem'
          }}>Subscription Breakdown</h2>

          {reports?.subscriptions && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                {
                  label: 'Monthly Plans',
                  value: reports.subscriptions.monthly,
                  total: reports.subscriptions.active,
                  color: '#6c63ff'
                },
                {
                  label: 'Yearly Plans',
                  value: reports.subscriptions.yearly,
                  total: reports.subscriptions.active,
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
                        {item.value} <span style={{ color: '#9ca3af', fontWeight: 400 }}>
                          ({pct}%)
                        </span>
                      </span>
                    </div>
                    <div style={{
                      height: '8px', background: '#f3f4f6',
                      borderRadius: '4px', overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%', width: `${pct}%`,
                        background: item.color, borderRadius: '4px',
                        transition: 'width 0.8s ease'
                      }} />
                    </div>
                  </div>
                )
              })}

              <div style={{
                marginTop: '0.5rem', padding: '1rem',
                background: '#f8f8fc', borderRadius: '10px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                    Total Active
                  </span>
                  <span style={{
                    fontFamily: 'Syne, sans-serif', fontSize: '1.4rem',
                    fontWeight: 800, color: '#1a1a2e'
                  }}>
                    {reports.subscriptions.active}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Draw stats */}
          <h2 style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 700,
            fontSize: '1rem', color: '#1a1a2e',
            marginTop: '1.5rem', marginBottom: '1rem'
          }}>Draw Overview</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
            {[
              { label: 'Total Draws', value: reports?.draws?.total || 0, color: '#6c63ff' },
              { label: 'Published', value: reports?.draws?.published || 0, color: '#22c55e' },
              { label: 'Jackpot Rollovers', value: reports?.draws?.jackpotRollovers || 0, color: '#f59e0b' },
              { label: 'Total Paid Out', value: `£${reports?.winners?.totalPaid || '0.00'}`, color: '#22c55e' }
            ].map((item, i) => (
              <div key={i} style={{
                background: '#f8f8fc', borderRadius: '8px',
                padding: '0.8rem', border: '1px solid #e5e7eb',
                textAlign: 'center'
              }}>
                <div style={{
                  fontFamily: 'Syne, sans-serif', fontSize: '1.2rem',
                  fontWeight: 800, color: item.color
                }}>{item.value}</div>
                <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: '2px' }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charity contributions */}
      {reports?.charityTotals?.length > 0 && (
        <div style={{
          background: '#fff', borderRadius: '16px',
          padding: '1.6rem', border: '1px solid #e5e7eb'
        }}>
          <h2 style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 700,
            fontSize: '1rem', color: '#1a1a2e', marginBottom: '1.2rem'
          }}>Charity Contribution Totals</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {reports.charityTotals
              .sort((a, b) => b.total - a.total)
              .map((charity, i) => {
                const max = Math.max(...reports.charityTotals.map(c => c.total))
                const pct = max > 0 ? (charity.total / max) * 100 : 0
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '1rem'
                  }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '8px',
                      background: 'rgba(34,197,94,0.1)',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '0.85rem', flexShrink: 0
                    }}>💚</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        marginBottom: '4px'
                      }}>
                        <span style={{
                          fontSize: '0.85rem', fontWeight: 500,
                          color: '#1a1a2e', whiteSpace: 'nowrap',
                          overflow: 'hidden', textOverflow: 'ellipsis'
                        }}>{charity.name}</span>
                        <span style={{
                          fontSize: '0.85rem', fontWeight: 700,
                          color: '#22c55e', flexShrink: 0, marginLeft: '8px'
                        }}>£{charity.total?.toFixed(2)}</span>
                      </div>
                      <div style={{
                        height: '5px', background: '#f3f4f6',
                        borderRadius: '3px', overflow: 'hidden'
                      }}>
                        <div style={{
                          height: '100%', width: `${pct}%`,
                          background: 'linear-gradient(90deg, #22c55e, #16a34a)',
                          borderRadius: '3px'
                        }} />
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
