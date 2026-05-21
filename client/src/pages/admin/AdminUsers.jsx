import { useState, useEffect } from 'react'
import api from '../../services/api'

const AdminUsers = () => {
  const [users, setUsers] = useState([])
  const [selected, setSelected] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [message, setMessage] = useState({ text: '', type: '' })
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [activeTab, setActiveTab] = useState('details')

  useEffect(() => { fetchUsers() }, [])

  const fetchUsers = async () => {
    setFetching(true)
    try {
      const res = await api.get('/admin/users')
      setUsers(res.data.users)
    } catch (err) {
      showMessage('Failed to load users', 'error')
    } finally {
      setFetching(false)
    }
  }

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: '' }), 3000)
  }

  const handleSelectUser = async (id) => {
    try {
      const res = await api.get(`/admin/users/${id}`)
      setSelected(res.data.user)
      setEditForm({
        name: res.data.user.name,
        email: res.data.user.email,
        role: res.data.user.role
      })
      setActiveTab('details')
    } catch (err) {
      showMessage('Failed to load user', 'error')
    }
  }

  const handleUpdateUser = async () => {
    setLoading(true)
    try {
      await api.put(`/admin/users/${selected.id}`, editForm)
      showMessage('User updated successfully ✓')
      fetchUsers()
      handleSelectUser(selected.id)
    } catch (err) {
      showMessage('Failed to update user', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateSubscription = async (status) => {
    setLoading(true)
    try {
      await api.put(`/admin/users/${selected.id}/subscription`, { status })
      showMessage(`Subscription set to ${status} ✓`)
      handleSelectUser(selected.id)
    } catch (err) {
      showMessage('Failed to update subscription', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateScore = async (scoreId, score, date) => {
    setLoading(true)
    try {
      await api.put(`/admin/scores/${scoreId}`, { score, date })
      showMessage('Score updated ✓')
      handleSelectUser(selected.id)
    } catch (err) {
      showMessage('Failed to update score', 'error')
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(u => {
    const matchSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
    const matchStatus =
      filterStatus === 'all' ||
      u.subscriptions?.[0]?.status === filterStatus ||
      (filterStatus === 'admin' && u.role === 'admin')
    return matchSearch && matchStatus
  })

  const statusColors = {
    active: { bg: 'rgba(34,197,94,0.1)', text: '#16a34a', border: 'rgba(34,197,94,0.2)' },
    inactive: { bg: '#f3f4f6', text: '#6b7280', border: '#e5e7eb' },
    cancelled: { bg: 'rgba(239,68,68,0.08)', text: '#ef4444', border: 'rgba(239,68,68,0.15)' },
    lapsed: { bg: 'rgba(245,158,11,0.08)', text: '#d97706', border: 'rgba(245,158,11,0.2)' }
  }

  const inputStyle = (focused) => ({
    width: '100%', padding: '0.75rem 1rem',
    borderRadius: '8px',
    border: `1.5px solid ${focused ? '#6c63ff' : '#e5e7eb'}`,
    background: '#f8f8fc', fontSize: '0.9rem',
    color: '#1a1a2e', outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box'
  })

  return (
    <div>

      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 800,
          fontSize: '1.7rem', color: '#1a1a2e',
          letterSpacing: '-0.5px', marginBottom: '4px'
        }}>User Management</h1>
        <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
          {users.length} total users · {users.filter(u =>
            u.subscriptions?.[0]?.status === 'active').length} active subscribers
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

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '1.5rem' }}>

        {/* ─── USER LIST PANEL ─── */}
        <div style={{
          background: '#fff', borderRadius: '16px',
          border: '1px solid #e5e7eb', overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          maxHeight: 'calc(100vh - 180px)'
        }}>

          {/* Search + Filter */}
          <div style={{ padding: '1rem', borderBottom: '1px solid #f3f4f6' }}>
            <div style={{ position: 'relative', marginBottom: '0.8rem' }}>
              <span style={{
                position: 'absolute', left: '0.8rem', top: '50%',
                transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '0.85rem'
              }}>🔍</span>
              <input
                type="text"
                placeholder="Search by name or email..."
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

            {/* Filter pills */}
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {['all', 'active', 'lapsed', 'cancelled', 'admin'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilterStatus(f)}
                  style={{
                    padding: '3px 10px', borderRadius: '50px',
                    border: `1px solid ${filterStatus === f ? '#6c63ff' : '#e5e7eb'}`,
                    background: filterStatus === f ? 'rgba(108,99,255,0.08)' : '#fff',
                    color: filterStatus === f ? '#6c63ff' : '#6b7280',
                    fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer'
                  }}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* User list */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {fetching ? (
              [1, 2, 3, 4, 5].map(i => (
                <div key={i} style={{
                  padding: '1rem', borderBottom: '1px solid #f3f4f6',
                  display: 'flex', gap: '10px', alignItems: 'center'
                }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '8px',
                    background: '#f3f4f6', flexShrink: 0
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{
                      height: '12px', width: '60%',
                      background: '#f3f4f6', borderRadius: '4px',
                      marginBottom: '6px'
                    }} />
                    <div style={{
                      height: '10px', width: '80%',
                      background: '#f3f4f6', borderRadius: '4px'
                    }} />
                  </div>
                </div>
              ))
            ) : filteredUsers.length === 0 ? (
              <div style={{
                padding: '3rem 1rem', textAlign: 'center',
                color: '#9ca3af', fontSize: '0.85rem'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👥</div>
                No users found
              </div>
            ) : (
              filteredUsers.map(user => {
                const subStatus = user.subscriptions?.[0]?.status || 'inactive'
                const colors = statusColors[subStatus] || statusColors.inactive
                const isSelected = selected?.id === user.id

                return (
                  <div
                    key={user.id}
                    onClick={() => handleSelectUser(user.id)}
                    style={{
                      padding: '0.9rem 1rem',
                      borderBottom: '1px solid #f3f4f6',
                      cursor: 'pointer',
                      background: isSelected
                        ? 'rgba(108,99,255,0.06)' : 'transparent',
                      borderLeft: isSelected
                        ? '3px solid #6c63ff' : '3px solid transparent',
                      transition: 'all 0.15s',
                      display: 'flex', alignItems: 'center', gap: '10px'
                    }}
                    onMouseEnter={e => {
                      if (!isSelected)
                        e.currentTarget.style.background = '#f8f8fc'
                    }}
                    onMouseLeave={e => {
                      if (!isSelected)
                        e.currentTarget.style.background = 'transparent'
                    }}>

                    {/* Avatar */}
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '8px',
                      background: user.role === 'admin'
                        ? 'linear-gradient(135deg, #6c63ff, #4f46e5)'
                        : 'linear-gradient(135deg, #22c55e, #16a34a)',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '0.85rem',
                      fontWeight: 700, color: '#fff', flexShrink: 0
                    }}>
                      {user.name?.charAt(0).toUpperCase()}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        marginBottom: '2px'
                      }}>
                        <span style={{
                          fontSize: '0.85rem', fontWeight: 600,
                          color: '#1a1a2e', whiteSpace: 'nowrap',
                          overflow: 'hidden', textOverflow: 'ellipsis'
                        }}>{user.name}</span>
                        {user.role === 'admin' && (
                          <span style={{
                            fontSize: '0.6rem', background: 'rgba(108,99,255,0.1)',
                            color: '#6c63ff', padding: '1px 6px',
                            borderRadius: '4px', fontWeight: 700, flexShrink: 0
                          }}>ADMIN</span>
                        )}
                      </div>
                      <div style={{
                        fontSize: '0.75rem', color: '#9ca3af',
                        whiteSpace: 'nowrap', overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>{user.email}</div>
                    </div>

                    <div style={{
                      background: colors.bg, border: `1px solid ${colors.border}`,
                      color: colors.text, padding: '2px 8px',
                      borderRadius: '50px', fontSize: '0.68rem',
                      fontWeight: 700, flexShrink: 0
                    }}>
                      {subStatus}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* ─── USER DETAIL PANEL ─── */}
        {selected ? (
          <div style={{
            background: '#fff', borderRadius: '16px',
            border: '1px solid #e5e7eb', overflow: 'hidden',
            maxHeight: 'calc(100vh - 180px)', overflowY: 'auto'
          }}>

            {/* User header */}
            <div style={{
              padding: '1.5rem', borderBottom: '1px solid #f3f4f6',
              display: 'flex', alignItems: 'center', gap: '1rem',
              background: 'linear-gradient(135deg, #f8f8fc, #fff)'
            }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '14px',
                background: selected.role === 'admin'
                  ? 'linear-gradient(135deg, #6c63ff, #4f46e5)'
                  : 'linear-gradient(135deg, #22c55e, #16a34a)',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '1.4rem',
                fontWeight: 700, color: '#fff', flexShrink: 0
              }}>
                {selected.name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{
                  fontFamily: 'Syne, sans-serif', fontWeight: 800,
                  fontSize: '1.1rem', color: '#1a1a2e', marginBottom: '2px'
                }}>{selected.name}</h2>
                <div style={{ fontSize: '0.82rem', color: '#9ca3af' }}>{selected.email}</div>
                <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '2px' }}>
                  Joined {new Date(selected.created_at).toLocaleDateString('en-GB', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[
                  { label: selected.role === 'admin' ? 'Admin' : 'Subscriber', color: '#6c63ff' },
                  {
                    label: selected.subscriptions?.[0]?.status || 'No sub',
                    color: selected.subscriptions?.[0]?.status === 'active' ? '#22c55e' : '#ef4444'
                  }
                ].map((badge, i) => (
                  <div key={i} style={{
                    background: `${badge.color}12`,
                    border: `1px solid ${badge.color}30`,
                    color: badge.color, padding: '4px 10px',
                    borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600
                  }}>{badge.label}</div>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div style={{
              display: 'flex', gap: '0',
              borderBottom: '1px solid #f3f4f6',
              padding: '0 1.5rem'
            }}>
              {['details', 'subscription', 'scores'].map(tab => (
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
                    marginBottom: '-1px', transition: 'all 0.15s'
                  }}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div style={{ padding: '1.5rem' }}>

              {/* ─── DETAILS TAB ─── */}
              {activeTab === 'details' && (
                <div>
                  <h3 style={{
                    fontFamily: 'Syne, sans-serif', fontWeight: 700,
                    fontSize: '0.95rem', color: '#1a1a2e', marginBottom: '1.2rem'
                  }}>Edit User Details</h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div>
                        <label style={{
                          fontSize: '0.78rem', fontWeight: 600,
                          color: '#374151', display: 'block', marginBottom: '6px'
                        }}>Full Name</label>
                        <input
                          value={editForm.name || ''}
                          onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                          style={inputStyle(false)}
                        />
                      </div>
                      <div>
                        <label style={{
                          fontSize: '0.78rem', fontWeight: 600,
                          color: '#374151', display: 'block', marginBottom: '6px'
                        }}>Email Address</label>
                        <input
                          value={editForm.email || ''}
                          onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                          style={inputStyle(false)}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{
                        fontSize: '0.78rem', fontWeight: 600,
                        color: '#374151', display: 'block', marginBottom: '6px'
                      }}>Role</label>
                      <select
                        value={editForm.role || 'subscriber'}
                        onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                        style={{
                          ...inputStyle(false),
                          cursor: 'pointer', appearance: 'none'
                        }}>
                        <option value="subscriber">Subscriber</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    {/* Charity info */}
                    {selected.charities && (
                      <div style={{
                        padding: '1rem', background: 'rgba(34,197,94,0.04)',
                        border: '1px solid rgba(34,197,94,0.15)',
                        borderRadius: '10px',
                        display: 'flex', alignItems: 'center', gap: '10px'
                      }}>
                        <span style={{ fontSize: '1.2rem' }}>💚</span>
                        <div>
                          <div style={{
                            fontSize: '0.75rem', color: '#9ca3af',
                            fontWeight: 600, letterSpacing: '0.3px'
                          }}>SUPPORTING</div>
                          <div style={{
                            fontSize: '0.9rem', fontWeight: 600, color: '#1a1a2e'
                          }}>{selected.charities.name}</div>
                          <div style={{ fontSize: '0.78rem', color: '#22c55e' }}>
                            {selected.charity_percentage}% contribution
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={handleUpdateUser}
                      disabled={loading}
                      style={{
                        background: loading ? '#a78bfa' : '#6c63ff',
                        color: '#fff', border: 'none',
                        padding: '0.8rem', borderRadius: '8px',
                        fontSize: '0.9rem', fontWeight: 700,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        boxShadow: '0 4px 16px rgba(108,99,255,0.25)'
                      }}>
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              )}

              {/* ─── SUBSCRIPTION TAB ─── */}
              {activeTab === 'subscription' && (
                <div>
                  <h3 style={{
                    fontFamily: 'Syne, sans-serif', fontWeight: 700,
                    fontSize: '0.95rem', color: '#1a1a2e', marginBottom: '1.2rem'
                  }}>Subscription Details</h3>

                  {selected.subscriptions?.[0] ? (
                    <div>
                      {/* Current status */}
                      <div style={{
                        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                        gap: '0.8rem', marginBottom: '1.5rem'
                      }}>
                        {[
                          {
                            label: 'Status',
                            value: selected.subscriptions[0].status,
                            color: selected.subscriptions[0].status === 'active'
                              ? '#22c55e' : '#ef4444'
                          },
                          {
                            label: 'Plan',
                            value: selected.subscriptions[0].plan === 'yearly'
                              ? 'Yearly' : 'Monthly',
                            color: '#6c63ff'
                          },
                          {
                            label: 'Renewal',
                            value: new Date(selected.subscriptions[0].renewal_date)
                              .toLocaleDateString('en-GB', {
                                day: 'numeric', month: 'short', year: 'numeric'
                              }),
                            color: '#1a1a2e'
                          }
                        ].map((item, i) => (
                          <div key={i} style={{
                            background: '#f8f8fc', borderRadius: '10px',
                            padding: '1rem', border: '1px solid #e5e7eb',
                            textAlign: 'center'
                          }}>
                            <div style={{
                              fontFamily: 'Syne, sans-serif', fontWeight: 700,
                              fontSize: '0.95rem', color: item.color, marginBottom: '4px'
                            }}>{item.value}</div>
                            <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
                              {item.label}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Override controls */}
                      <div style={{
                        background: '#f8f8fc', borderRadius: '12px',
                        padding: '1.2rem', border: '1px solid #e5e7eb',
                        marginBottom: '1rem'
                      }}>
                        <div style={{
                          fontSize: '0.78rem', fontWeight: 700,
                          color: '#9ca3af', letterSpacing: '0.5px',
                          marginBottom: '0.8rem', textTransform: 'uppercase'
                        }}>Override Status</div>
                        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                          {[
                            { label: 'Set Active', status: 'active', color: '#22c55e' },
                            { label: 'Set Inactive', status: 'inactive', color: '#6b7280' },
                            { label: 'Set Lapsed', status: 'lapsed', color: '#f59e0b' },
                            { label: 'Set Cancelled', status: 'cancelled', color: '#ef4444' }
                          ].map(btn => (
                            <button
                              key={btn.status}
                              onClick={() => handleUpdateSubscription(btn.status)}
                              disabled={loading}
                              style={{
                                background: `${btn.color}12`,
                                color: btn.color,
                                border: `1px solid ${btn.color}30`,
                                padding: '0.5rem 1rem', borderRadius: '8px',
                                fontSize: '0.82rem', fontWeight: 600,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.15s'
                              }}
                              onMouseEnter={e => {
                                e.target.style.background = `${btn.color}20`
                              }}
                              onMouseLeave={e => {
                                e.target.style.background = `${btn.color}12`
                              }}>
                              {btn.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Stripe IDs */}
                      {selected.subscriptions[0].stripe_subscription_id && (
                        <div style={{
                          padding: '0.8rem 1rem', background: '#f8f8fc',
                          borderRadius: '8px', border: '1px solid #e5e7eb'
                        }}>
                          <div style={{
                            fontSize: '0.72rem', color: '#9ca3af',
                            fontWeight: 600, marginBottom: '4px'
                          }}>STRIPE SUBSCRIPTION ID</div>
                          <div style={{
                            fontSize: '0.8rem', color: '#6b7280',
                            fontFamily: 'monospace', wordBreak: 'break-all'
                          }}>
                            {selected.subscriptions[0].stripe_subscription_id}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{
                      textAlign: 'center', padding: '3rem 0'
                    }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: '0.8rem' }}>📋</div>
                      <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
                        No subscription found for this user
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ─── SCORES TAB ─── */}
              {activeTab === 'scores' && (
                <div>
                  <h3 style={{
                    fontFamily: 'Syne, sans-serif', fontWeight: 700,
                    fontSize: '0.95rem', color: '#1a1a2e', marginBottom: '1.2rem'
                  }}>Golf Scores</h3>

                  {!selected.scores || selected.scores.length === 0 ? (
                    <div style={{
                      textAlign: 'center', padding: '3rem 0'
                    }}>
                      <div style={{ fontSize: '2.5rem', marginBottom: '0.8rem' }}>⛳</div>
                      <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
                        No scores entered yet
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                      {selected.scores.map((score, i) => (
                        <ScoreEditRow
                          key={score.id || i}
                          score={score}
                          onSave={handleUpdateScore}
                          loading={loading}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{
            background: '#fff', borderRadius: '16px',
            border: '1px solid #e5e7eb',
            display: 'flex', alignItems: 'center',
            justifyContent: 'center', minHeight: '400px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👈</div>
              <p style={{
                color: '#9ca3af', fontSize: '0.9rem',
                fontWeight: 500, marginBottom: '4px'
              }}>Select a user to view details</p>
              <p style={{ color: '#d1d5db', fontSize: '0.82rem' }}>
                Click any user from the list on the left
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── SCORE EDIT ROW ───
const ScoreEditRow = ({ score, onSave, loading }) => {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(score.score)
  const [date, setDate] = useState(score.date)

  const getColor = (s) => {
    if (s >= 35) return '#22c55e'
    if (s >= 25) return '#6c63ff'
    if (s >= 15) return '#f59e0b'
    return '#ef4444'
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '1rem',
      padding: '0.9rem 1rem',
      background: editing ? 'rgba(108,99,255,0.04)' : '#f8f8fc',
      borderRadius: '10px',
      border: `1px solid ${editing ? 'rgba(108,99,255,0.2)' : '#e5e7eb'}`,
      transition: 'all 0.15s'
    }}>

      {/* Score badge */}
      {editing ? (
        <input
          type="number" min="1" max="45"
          value={val}
          onChange={e => setVal(e.target.value)}
          style={{
            width: '70px', padding: '5px 8px',
            borderRadius: '6px', border: '1.5px solid #6c63ff',
            background: '#fff', fontSize: '0.9rem',
            fontWeight: 700, outline: 'none', textAlign: 'center'
          }}
        />
      ) : (
        <div style={{
          background: `${getColor(score.score)}15`,
          border: `1px solid ${getColor(score.score)}30`,
          color: getColor(score.score),
          padding: '5px 14px', borderRadius: '8px',
          fontFamily: 'Syne, sans-serif',
          fontSize: '1rem', fontWeight: 800, minWidth: '58px',
          textAlign: 'center'
        }}>{score.score}</div>
      )}

      {/* Date */}
      <div style={{ flex: 1 }}>
        {editing ? (
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            style={{
              padding: '5px 8px', borderRadius: '6px',
              border: '1.5px solid #6c63ff', background: '#fff',
              fontSize: '0.85rem', outline: 'none'
            }}
          />
        ) : (
          <div style={{ fontSize: '0.85rem', color: '#374151', fontWeight: 500 }}>
            {new Date(score.date).toLocaleDateString('en-GB', {
              day: 'numeric', month: 'short', year: 'numeric'
            })}
          </div>
        )}
      </div>

      {/* Rating */}
      {!editing && (
        <div style={{
          fontSize: '0.72rem', fontWeight: 600,
          color: getColor(score.score),
          background: `${getColor(score.score)}12`,
          padding: '3px 8px', borderRadius: '50px',
          border: `1px solid ${getColor(score.score)}25`
        }}>
          {score.score >= 35 ? 'Excellent' :
           score.score >= 25 ? 'Good' :
           score.score >= 15 ? 'Average' : 'Low'}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
        {editing ? (
          <>
            <button
              onClick={() => {
                onSave(score.id, parseInt(val), date)
                setEditing(false)
              }}
              disabled={loading}
              style={{
                background: '#6c63ff', color: '#fff', border: 'none',
                padding: '5px 14px', borderRadius: '6px',
                fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer'
              }}>Save</button>
            <button
              onClick={() => { setEditing(false); setVal(score.score); setDate(score.date) }}
              style={{
                background: '#f3f4f6', color: '#6b7280',
                border: '1px solid #e5e7eb', padding: '5px 10px',
                borderRadius: '6px', fontSize: '0.78rem', cursor: 'pointer'
              }}>Cancel</button>
          </>
        ) : (
          <button
            onClick={() => setEditing(true)}
            style={{
              background: '#f3f4f6', color: '#6b7280',
              border: '1px solid #e5e7eb', padding: '5px 12px',
              borderRadius: '6px', fontSize: '0.78rem', cursor: 'pointer',
              transition: 'all 0.15s'
            }}
            onMouseEnter={e => {
              e.target.style.background = 'rgba(108,99,255,0.08)'
              e.target.style.borderColor = '#6c63ff'
              e.target.style.color = '#6c63ff'
            }}
            onMouseLeave={e => {
              e.target.style.background = '#f3f4f6'
              e.target.style.borderColor = '#e5e7eb'
              e.target.style.color = '#6b7280'
            }}>Edit</button>
        )}
      </div>
    </div>
  )
}

export default AdminUsers