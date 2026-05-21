import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDashboardData } from '../services/dashboardService'
import { useAuth } from '../context/AuthContext'
import ScoreEntry from '../components/dashboard/ScoreEntry'
import CharityCard from '../components/charity/CharityCard'
import WinningsCard from '../components/dashboard/WinningsCard'
import DrawsCard from '../components/dashboard/DrawsCard'

const Dashboard = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  useEffect(() => { fetchDashboard() }, [])

  const fetchDashboard = async () => {
    try {
      const res = await getDashboardData()
      setData(res)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const navItems = [
    { id: 'overview', icon: '🏠', label: 'Overview' },
    { id: 'scores', icon: '⛳', label: 'My Scores' },
    { id: 'draws', icon: '🎯', label: 'Draw History' },
    { id: 'winnings', icon: '🏆', label: 'Winnings' },
    { id: 'charity', icon: '💚', label: 'My Charity' }
  ]

  if (loading) return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: '#f8f8fc', fontFamily: "'DM Sans', sans-serif"
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '50%',
          border: '3px solid #e5e7eb',
          borderTop: '3px solid #6c63ff',
          animation: 'spin 0.8s linear infinite',
          margin: '0 auto 1rem'
        }} />
        <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>Loading your dashboard...</p>
      </div>
    </div>
  )

  return (
    <div style={{
      display: 'flex', minHeight: '100vh',
      fontFamily: "'DM Sans', sans-serif",
      background: '#f8f8fc'
    }}>

      {/* ─── SIDEBAR ─── */}
      <div style={{
        width: sidebarOpen ? '260px' : '72px',
        background: '#0f0f1a',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.25s ease',
        position: 'fixed', left: 0, top: 0, bottom: 0,
        zIndex: 50, height: '100dvh', overflow: 'hidden'
      }}>

        {/* Logo */}
        <div style={{
          padding: '1.5rem 1.2rem',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          {sidebarOpen && (
            <div
              onClick={() => navigate('/')}
              style={{
                fontFamily: 'Syne, sans-serif', fontWeight: 800,
                fontSize: '1.2rem', color: '#fff', cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}>
              Golf<span style={{ color: '#6c63ff' }}>Gives</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#fff', width: '32px', height: '32px',
              borderRadius: '8px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.8rem', flexShrink: 0
            }}>
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>

        {/* User info */}
        {sidebarOpen && (
          <div style={{
            padding: '1.2rem',
            borderBottom: '1px solid rgba(255,255,255,0.06)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #6c63ff, #22c55e)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem', fontWeight: 700, color: '#fff', flexShrink: 0
              }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{
                  color: '#fff', fontSize: '0.88rem',
                  fontWeight: 600, whiteSpace: 'nowrap',
                  overflow: 'hidden', textOverflow: 'ellipsis'
                }}>{user?.name}</div>
                <div style={{
                  color: 'rgba(255,255,255,0.35)',
                  fontSize: '0.75rem',
                  whiteSpace: 'nowrap', overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>{user?.email}</div>
              </div>
            </div>
            {/* Subscription badge */}
            <div style={{
              marginTop: '0.8rem',
              background: data?.subscription?.status === 'active'
                ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${data?.subscription?.status === 'active'
                ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
              borderRadius: '6px', padding: '5px 10px',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}>
              <div style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: data?.subscription?.status === 'active' ? '#22c55e' : '#ef4444'
              }} />
              <span style={{
                fontSize: '0.75rem', fontWeight: 600,
                color: data?.subscription?.status === 'active' ? '#22c55e' : '#ef4444'
              }}>
                {data?.subscription?.status === 'active'
                  ? `${data?.subscription?.plan === 'yearly' ? 'Yearly' : 'Monthly'} Plan`
                  : 'No Active Plan'}
              </span>
            </div>
          </div>
        )}

        {/* Nav items */}
        <nav style={{
          flex: '1 1 auto',
          minHeight: 0,
          overflowY: 'auto',
          padding: '1rem 0.8rem 8rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex', alignItems: 'center',
                gap: sidebarOpen ? '10px' : '0',
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
                padding: '0.7rem 0.9rem',
                borderRadius: '10px', border: 'none', cursor: 'pointer',
                background: activeTab === item.id
                  ? 'rgba(108,99,255,0.15)' : 'transparent',
                transition: 'all 0.15s',
                width: '100%'
              }}
              onMouseEnter={e => {
                if (activeTab !== item.id)
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
              }}
              onMouseLeave={e => {
                if (activeTab !== item.id)
                  e.currentTarget.style.background = 'transparent'
              }}
            >
              <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{item.icon}</span>
              {sidebarOpen && (
                <span style={{
                  fontSize: '0.88rem', fontWeight: 500,
                  color: activeTab === item.id ? '#a78bfa' : 'rgba(255,255,255,0.55)',
                  whiteSpace: 'nowrap'
                }}>{item.label}</span>
              )}
              {activeTab === item.id && sidebarOpen && (
                <div style={{
                  marginLeft: 'auto', width: '4px', height: '4px',
                  borderRadius: '50%', background: '#6c63ff'
                }} />
              )}
            </button>
          ))}

          <button
            onClick={handleLogout}
            style={{
              display: 'none',
              alignItems: 'center',
              gap: sidebarOpen ? '10px' : '0',
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              padding: '0.7rem 0.9rem',
              borderRadius: '10px',
              border: '1px solid rgba(239,68,68,0.14)',
              cursor: 'pointer',
              width: '100%',
              marginTop: '4rem',
              background: 'rgba(239,68,68,0.08)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.14)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.08)'
            }}
          >
            <span style={{ fontSize: '1rem', flexShrink: 0 }}>ðŸšª</span>
            {sidebarOpen && (
              <span style={{
                fontSize: '0.88rem',
                fontWeight: 600,
                color: '#fca5a5',
                whiteSpace: 'nowrap'
              }}>
                Logout
              </span>
            )}
          </button>
        </nav>

        {/* Bottom actions */}
        <div style={{
          position: 'absolute',
          left: '0.8rem',
          right: '0.8rem',
          bottom: '5rem',
          padding: 0,
          background: 'transparent',
          zIndex: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {data?.subscription?.status !== 'active' && (
            <button
              onClick={() => navigate('/subscribe')}
              style={{
                width: '100%', background: '#6c63ff',
                color: '#fff', border: 'none',
                padding: '0.7rem', borderRadius: '8px',
                fontSize: '0.82rem', fontWeight: 600,
                cursor: 'pointer', marginBottom: '8px',
                display: sidebarOpen ? 'block' : 'none'
              }}>
              Subscribe Now
            </button>
          )}
          <button
            onClick={handleLogout}
            style={{
              width: '100%', background: '#ef4444',
              color: '#fff',
              border: 'none',
              padding: '0.7rem', borderRadius: '8px',
              fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
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

      {/* ─── MAIN CONTENT ─── */}
      <div style={{
        marginLeft: sidebarOpen ? '260px' : '72px',
        flex: 1, transition: 'margin-left 0.25s ease',
        padding: '2rem 2rem 5rem', minWidth: 0
      }}>

        {/* Top bar */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: '2rem'
        }}>
          <div>
            <h1 style={{
              fontFamily: 'Syne, sans-serif', fontWeight: 800,
              fontSize: '1.6rem', color: '#1a1a2e',
              letterSpacing: '-0.5px', marginBottom: '2px'
            }}>
              {navItems.find(n => n.id === activeTab)?.label}
            </h1>
            <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
              {activeTab === 'overview' && `Welcome back, ${user?.name?.split(' ')[0]} 👋`}
              {activeTab === 'scores' && 'Manage your last 5 golf scores'}
              {activeTab === 'draws' && 'Your monthly draw participation history'}
              {activeTab === 'winnings' && 'Your prize winnings and payment status'}
              {activeTab === 'charity' && 'Your selected charity and contribution'}
            </p>
          </div>

          {/* Upcoming draw badge */}
          {data?.upcomingDraw && (
            <div style={{
              background: 'rgba(108,99,255,0.08)',
              border: '1px solid rgba(108,99,255,0.2)',
              borderRadius: '10px', padding: '0.6rem 1rem',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <span style={{ fontSize: '0.9rem' }}>🎯</span>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#6c63ff', fontWeight: 600 }}>NEXT DRAW</div>
                <div style={{ fontSize: '0.82rem', color: '#1a1a2e', fontWeight: 600 }}>
                  {data.upcomingDraw.month}
                </div>
                </div>
              </div>
            )}
        </div>

        {/* ─── OVERVIEW ─── */}
        {activeTab === 'overview' && (
          <div>
            {/* Stats row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem', marginBottom: '2rem'
            }}>
              {[
                {
                  label: 'Scores Entered',
                  value: `${data?.scores?.length || 0}/5`,
                  icon: '⛳',
                  color: '#6c63ff',
                  bg: 'rgba(108,99,255,0.08)'
                },
                {
                  label: 'Draws Entered',
                  value: data?.drawEntries?.length || 0,
                  icon: '🎯',
                  color: '#22c55e',
                  bg: 'rgba(34,197,94,0.08)'
                },
                {
                  label: 'Total Won',
                  value: `£${data?.totalWon?.toFixed(2) || '0.00'}`,
                  icon: '🏆',
                  color: '#f59e0b',
                  bg: 'rgba(245,158,11,0.08)'
                },
                {
                  label: 'Charity Given',
                  value: `${data?.charity?.contribution_percentage || 10}%`,
                  icon: '💚',
                  color: '#22c55e',
                  bg: 'rgba(34,197,94,0.08)'
                }
              ].map((stat, i) => (
                <div key={i} style={{
                  background: '#fff', borderRadius: '14px',
                  padding: '1.5rem', border: '1px solid #e5e7eb',
                  display: 'flex', alignItems: 'center', gap: '1rem'
                }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '12px',
                    background: stat.bg,
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0
                  }}>{stat.icon}</div>
                  <div>
                    <div style={{
                      fontFamily: 'Syne, sans-serif', fontSize: '1.6rem',
                      fontWeight: 800, color: '#1a1a2e', lineHeight: 1
                    }}>{stat.value}</div>
                    <div style={{
                      fontSize: '0.78rem', color: '#9ca3af',
                      marginTop: '4px', fontWeight: 500
                    }}>{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Overview grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem'
            }}>
              <SubscriptionCard
                subscription={data?.subscription}
                onNavigate={navigate}
              />
              <CharityCard
                charity={data?.charity}
                onUpdate={fetchDashboard}
              />
              <DrawsCard
                drawEntries={data?.drawEntries}
                upcomingDraw={data?.upcomingDraw}
              />
              <WinningsCard
                winnings={data?.winnings}
                totalWon={data?.totalWon}
                onUploaded={fetchDashboard}
              />
            </div>
          </div>
        )}

        {activeTab === 'scores' && <ScoreEntry />}
        {activeTab === 'draws' && (
          <DrawsCard
            drawEntries={data?.drawEntries}
            upcomingDraw={data?.upcomingDraw}
            expanded
          />
        )}
        {activeTab === 'winnings' && (
          <WinningsCard
            winnings={data?.winnings}
            totalWon={data?.totalWon}
            expanded
            onUploaded={fetchDashboard}
          />
        )}
        {activeTab === 'charity' && (
          <CharityCard
            charity={data?.charity}
            onUpdate={fetchDashboard}
            expanded
          />
        )}
      </div>
    </div>
  )
}

// ─── SUBSCRIPTION CARD ───
const SubscriptionCard = ({ subscription, onNavigate }) => {
  const statusColors = {
    active: { bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)', text: '#16a34a', dot: '#22c55e' },
    inactive: { bg: 'rgba(107,114,128,0.08)', border: '#e5e7eb', text: '#6b7280', dot: '#9ca3af' },
    cancelled: { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', text: '#ef4444', dot: '#ef4444' },
    lapsed: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', text: '#d97706', dot: '#f59e0b' }
  }

  const status = subscription?.status || 'inactive'
  const colors = statusColors[status] || statusColors.inactive

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
        }}>Subscription</h3>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: colors.bg, border: `1px solid ${colors.border}`,
          padding: '4px 10px', borderRadius: '50px'
        }}>
          <div style={{
            width: '6px', height: '6px',
            borderRadius: '50%', background: colors.dot
          }} />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: colors.text }}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
      </div>

      {subscription ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {[
            { label: 'Plan', value: subscription.plan === 'yearly' ? 'Yearly' : 'Monthly' },
            { label: 'Renewal', value: new Date(subscription.renewal_date).toLocaleDateString() }
          ].map(row => (
            <div key={row.label} style={{
              display: 'flex', justifyContent: 'space-between',
              fontSize: '0.88rem', padding: '0.5rem 0',
              borderBottom: '1px solid #f3f4f6'
            }}>
              <span style={{ color: '#9ca3af' }}>{row.label}</span>
              <span style={{ color: '#1a1a2e', fontWeight: 600 }}>{row.value}</span>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <p style={{ color: '#9ca3af', fontSize: '0.88rem', marginBottom: '1rem' }}>
            No active subscription
          </p>
          <button
            onClick={() => onNavigate('/subscribe')}
            style={{
              background: '#6c63ff', color: '#fff', border: 'none',
              padding: '0.6rem 1.4rem', borderRadius: '8px',
              fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer'
            }}>
            Subscribe Now
          </button>
        </div>
      )}
    </div>
  )
}

export default Dashboard
