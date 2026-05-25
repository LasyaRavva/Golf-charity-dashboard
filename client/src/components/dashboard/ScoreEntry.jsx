import { useState, useEffect } from 'react'
import { getScores, addScore, editScore, deleteScore } from '../../services/scoreService'
import { useResponsive } from '../../hooks/useResponsive'

const ScoreEntry = () => {
  const [scores, setScores] = useState([])
  const [newScore, setNewScore] = useState('')
  const [newDate, setNewDate] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editVal, setEditVal] = useState('')
  const [editDate, setEditDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [focused, setFocused] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const { isMobile } = useResponsive()

  useEffect(() => { fetchScores() }, [])

  const fetchScores = async () => {
    setFetching(true)
    try {
      const data = await getScores()
      setScores(data.scores)
    } catch (err) {
      showMessage('Failed to load scores', 'error')
    } finally {
      setFetching(false)
    }
  }

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: '' }), 3000)
  }

  const handleAdd = async () => {
    if (!newScore || !newDate)
      return showMessage('Please enter both score and date', 'error')

    const scoreNum = parseInt(newScore)
    if (isNaN(scoreNum) || scoreNum < 1 || scoreNum > 45)
      return showMessage('Score must be between 1 and 45', 'error')

    setLoading(true)
    try {
      await addScore(scoreNum, newDate)
      setNewScore('')
      setNewDate('')
      showMessage('Score added successfully ✓')
      fetchScores()
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to add score', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async (id) => {
    const scoreNum = parseInt(editVal)
    if (isNaN(scoreNum) || scoreNum < 1 || scoreNum > 45)
      return showMessage('Score must be between 1 and 45', 'error')

    setLoading(true)
    try {
      await editScore(id, scoreNum, editDate)
      setEditingId(null)
      showMessage('Score updated ✓')
      fetchScores()
    } catch (err) {
      showMessage('Failed to update score', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    setLoading(true)
    try {
      await deleteScore(id)
      setDeleteConfirm(null)
      showMessage('Score deleted')
      fetchScores()
    } catch (err) {
      showMessage('Failed to delete score', 'error')
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (score) => {
    setEditingId(score.id)
    setEditVal(score.score)
    setEditDate(score.date)
  }

  const getScoreColor = (score) => {
    if (score >= 35) return { bg: 'rgba(34,197,94,0.1)', text: '#16a34a', border: 'rgba(34,197,94,0.2)' }
    if (score >= 25) return { bg: 'rgba(108,99,255,0.1)', text: '#6c63ff', border: 'rgba(108,99,255,0.2)' }
    if (score >= 15) return { bg: 'rgba(245,158,11,0.1)', text: '#d97706', border: 'rgba(245,158,11,0.2)' }
    return { bg: 'rgba(239,68,68,0.1)', text: '#ef4444', border: 'rgba(239,68,68,0.2)' }
  }

  const inputStyle = (name) => ({
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    border: `1.5px solid ${focused === name ? '#6c63ff' : '#e5e7eb'}`,
    background: '#f8f8fc',
    fontSize: '0.9rem',
    color: '#1a1a2e',
    outline: 'none',
    transition: 'border-color 0.2s',
    width: '100%',
    boxSizing: 'border-box'
  })

  const avgScore = scores.length > 0
    ? (scores.reduce((s, sc) => s + sc.score, 0) / scores.length).toFixed(1)
    : null

  const maxScore = scores.length > 0
    ? Math.max(...scores.map(s => s.score))
    : null

  return (
    <div style={{ maxWidth: '800px' }}>

      {/* ─── HEADER STATS ─── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
        gap: '1rem', marginBottom: '2rem'
      }}>
        {[
          {
            label: 'Scores Logged',
            value: `${scores.length}/5`,
            icon: '⛳',
            color: '#6c63ff',
            bg: 'rgba(108,99,255,0.08)'
          },
          {
            label: 'Average Score',
            value: avgScore || '—',
            icon: '📊',
            color: '#22c55e',
            bg: 'rgba(34,197,94,0.08)'
          },
          {
            label: 'Best Score',
            value: maxScore || '—',
            icon: '🏆',
            color: '#f59e0b',
            bg: 'rgba(245,158,11,0.08)'
          }
        ].map((stat, i) => (
          <div key={i} style={{
            background: '#fff', borderRadius: '14px',
            padding: '1.3rem', border: '1px solid #e5e7eb',
            display: 'flex', alignItems: 'center', gap: '12px'
          }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '10px',
              background: stat.bg, display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              fontSize: '1.2rem', flexShrink: 0
            }}>{stat.icon}</div>
            <div>
              <div style={{
                fontFamily: 'Syne, sans-serif', fontSize: '1.5rem',
                fontWeight: 800, color: '#1a1a2e', lineHeight: 1
              }}>{stat.value}</div>
              <div style={{
                fontSize: '0.75rem', color: '#9ca3af',
                marginTop: '3px', fontWeight: 500
              }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── MESSAGE ─── */}
      {message.text && (
        <div style={{
          padding: '0.8rem 1rem',
          borderRadius: '8px', marginBottom: '1.5rem',
          background: message.type === 'error' ? '#fef2f2' : '#f0fdf4',
          border: `1px solid ${message.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
          color: message.type === 'error' ? '#ef4444' : '#16a34a',
          fontSize: '0.88rem', fontWeight: 500
        }}>
          {message.text}
        </div>
      )}

      {/* ─── ADD SCORE FORM ─── */}
      <div style={{
        background: '#fff', borderRadius: '16px',
        padding: '1.8rem', border: '1px solid #e5e7eb',
        marginBottom: '1.5rem'
      }}>
        <h3 style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 700,
          fontSize: '1rem', color: '#1a1a2e', marginBottom: '0.4rem'
        }}>Add New Score</h3>
        <p style={{
          fontSize: '0.82rem', color: '#9ca3af',
          marginBottom: '1.5rem'
        }}>
          Enter your Stableford score (1–45). Adding a 6th score removes the oldest automatically.
        </p>

        <div style={{
          display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr auto',
          gap: '1rem', alignItems: 'end'
        }}>
          <div>
            <label style={{
              fontSize: '0.8rem', fontWeight: 600,
              color: '#374151', display: 'block', marginBottom: '6px'
            }}>Stableford Score</label>
            <input
              type="number"
              min="1" max="45"
              placeholder="e.g. 32"
              value={newScore}
              onChange={e => setNewScore(e.target.value)}
              onFocus={() => setFocused('score')}
              onBlur={() => setFocused('')}
              style={inputStyle('score')}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
            />
          </div>
          <div>
            <label style={{
              fontSize: '0.8rem', fontWeight: 600,
              color: '#374151', display: 'block', marginBottom: '6px'
            }}>Date Played</label>
            <input
              type="date"
              value={newDate}
              onChange={e => setNewDate(e.target.value)}
              onFocus={() => setFocused('date')}
              onBlur={() => setFocused('')}
              max={new Date().toISOString().split('T')[0]}
              style={inputStyle('date')}
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={loading}
            style={{
              background: loading ? '#a78bfa' : '#6c63ff',
              color: '#fff', border: 'none',
              padding: '0.75rem 1.5rem', borderRadius: '8px',
              fontSize: '0.9rem', fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 16px rgba(108,99,255,0.25)'
            }}>
            {loading ? 'Adding...' : '+ Add Score'}
          </button>
        </div>

        {/* Score range hint */}
        {newScore && (
          <div style={{
            marginTop: '0.8rem',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <div style={{
              height: '4px', flex: 1, borderRadius: '2px',
              background: '#f3f4f6', overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${Math.min((parseInt(newScore) / 45) * 100, 100)}%`,
                background: parseInt(newScore) >= 35 ? '#22c55e'
                  : parseInt(newScore) >= 25 ? '#6c63ff'
                  : parseInt(newScore) >= 15 ? '#f59e0b' : '#ef4444',
                borderRadius: '2px', transition: 'width 0.2s'
              }} />
            </div>
            <span style={{ fontSize: '0.75rem', color: '#9ca3af', whiteSpace: 'nowrap' }}>
              {parseInt(newScore) >= 35 ? 'Excellent' :
               parseInt(newScore) >= 25 ? 'Good' :
               parseInt(newScore) >= 15 ? 'Average' : 'Below average'}
            </span>
          </div>
        )}
      </div>

      {/* ─── SCORES LIST ─── */}
      <div style={{
        background: '#fff', borderRadius: '16px',
        padding: '1.8rem', border: '1px solid #e5e7eb'
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center', marginBottom: '1.5rem',
          flexDirection: isMobile ? 'column' : 'row', gap: '1rem'
        }}>
          <div>
            <h3 style={{
              fontFamily: 'Syne, sans-serif', fontWeight: 700,
              fontSize: '1rem', color: '#1a1a2e', marginBottom: '2px'
            }}>My Last 5 Scores</h3>
            <p style={{ fontSize: '0.78rem', color: '#9ca3af' }}>
              Sorted by most recent first
            </p>
          </div>

          {/* Score bar chart */}
          {scores.length > 0 && (
            <div style={{
              display: 'flex', alignItems: 'flex-end',
              gap: '4px', height: '40px'
            }}>
              {scores.map((s, i) => {
                const colors = getScoreColor(s.score)
                return (
                  <div key={i} style={{
                    width: '16px',
                    height: `${(s.score / 45) * 40}px`,
                    background: colors.text,
                    borderRadius: '3px 3px 0 0',
                    opacity: 0.7,
                    minHeight: '4px'
                  }} title={`${s.score} pts`} />
                )
              })}
            </div>
          )}
        </div>

        {fetching ? (
          <div style={{
            textAlign: 'center', padding: '2rem',
            color: '#9ca3af', fontSize: '0.88rem'
          }}>Loading scores...</div>
        ) : scores.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '3rem 0'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.8rem' }}>⛳</div>
            <p style={{
              color: '#9ca3af', fontSize: '0.9rem',
              marginBottom: '0.4rem', fontWeight: 500
            }}>No scores yet</p>
            <p style={{ color: '#d1d5db', fontSize: '0.82rem' }}>
              Add your first Stableford score above
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {scores.map((s, index) => {
              const colors = getScoreColor(s.score)
              const isEditing = editingId === s.id
              const isDeleteConfirm = deleteConfirm === s.id

              return (
                <div key={s.id} style={{
                  display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', gap: '1rem',
                  flexDirection: isMobile ? 'column' : 'row',
                  padding: '1rem 1.2rem',
                  background: isEditing ? 'rgba(108,99,255,0.04)' : '#f8f8fc',
                  borderRadius: '12px',
                  border: `1px solid ${isEditing ? 'rgba(108,99,255,0.2)' : '#e5e7eb'}`,
                  transition: 'all 0.2s'
                }}>

                  {/* Rank */}
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '8px',
                    background: index === 0 ? 'rgba(245,158,11,0.1)' : '#f3f4f6',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.78rem', fontWeight: 700,
                    color: index === 0 ? '#d97706' : '#9ca3af',
                    flexShrink: 0
                  }}>
                    {index === 0 ? '🥇' : index + 1}
                  </div>

                  {/* Score badge */}
                  {!isEditing ? (
                    <div style={{
                      background: colors.bg,
                      border: `1px solid ${colors.border}`,
                      color: colors.text,
                      padding: '6px 14px', borderRadius: '8px',
                      fontFamily: 'Syne, sans-serif',
                      fontSize: '1.1rem', fontWeight: 800,
                      minWidth: '60px', textAlign: 'center'
                    }}>{s.score}</div>
                  ) : (
                    <input
                      type="number" min="1" max="45"
                      value={editVal}
                      onChange={e => setEditVal(e.target.value)}
                      style={{
                        width: '80px', padding: '6px 10px',
                        borderRadius: '8px',
                        border: '1.5px solid #6c63ff',
                        background: '#fff', fontSize: '0.95rem',
                        fontWeight: 700, color: '#1a1a2e',
                        outline: 'none', textAlign: 'center'
                      }}
                    />
                  )}

                  {/* Date */}
                  <div style={{ flex: 1, width: isMobile ? '100%' : 'auto' }}>
                    {!isEditing ? (
                      <div>
                        <div style={{
                          fontSize: '0.88rem', fontWeight: 600, color: '#1a1a2e'
                        }}>
                          {new Date(s.date).toLocaleDateString('en-GB', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '1px' }}>
                          {index === 0 ? 'Most recent' : `${index + 1} rounds ago`}
                        </div>
                      </div>
                    ) : (
                      <input
                        type="date"
                        value={editDate}
                        onChange={e => setEditDate(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                        style={{
                          padding: '6px 10px', borderRadius: '8px',
                          border: '1.5px solid #6c63ff',
                          background: '#fff', fontSize: '0.88rem',
                          color: '#1a1a2e', outline: 'none'
                        }}
                      />
                    )}
                  </div>

                  {/* Score rating label */}
                  {!isEditing && (
                    <div style={{
                      fontSize: '0.72rem', fontWeight: 600,
                      color: colors.text,
                      background: colors.bg,
                      padding: '3px 8px', borderRadius: '50px',
                      border: `1px solid ${colors.border}`
                    }}>
                      {s.score >= 35 ? 'Excellent' :
                       s.score >= 25 ? 'Good' :
                       s.score >= 15 ? 'Average' : 'Low'}
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0, width: isMobile ? '100%' : 'auto', flexWrap: 'wrap' }}>
                    {isDeleteConfirm ? (
                      <>
                        <button
                          onClick={() => handleDelete(s.id)}
                          style={{
                            background: '#ef4444', color: '#fff',
                            border: 'none', padding: '5px 12px',
                            borderRadius: '6px', fontSize: '0.78rem',
                            fontWeight: 600, cursor: 'pointer'
                          }}>
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          style={{
                            background: '#f3f4f6', color: '#6b7280',
                            border: '1px solid #e5e7eb',
                            padding: '5px 12px', borderRadius: '6px',
                            fontSize: '0.78rem', cursor: 'pointer'
                          }}>
                          Cancel
                        </button>
                      </>
                    ) : isEditing ? (
                      <>
                        <button
                          onClick={() => handleEdit(s.id)}
                          disabled={loading}
                          style={{
                            background: '#6c63ff', color: '#fff',
                            border: 'none', padding: '5px 14px',
                            borderRadius: '6px', fontSize: '0.78rem',
                            fontWeight: 600, cursor: 'pointer'
                          }}>
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          style={{
                            background: '#f3f4f6', color: '#6b7280',
                            border: '1px solid #e5e7eb',
                            padding: '5px 12px', borderRadius: '6px',
                            fontSize: '0.78rem', cursor: 'pointer'
                          }}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(s)}
                          style={{
                            background: '#f3f4f6', color: '#6b7280',
                            border: '1px solid #e5e7eb',
                            padding: '5px 12px', borderRadius: '6px',
                            fontSize: '0.78rem', cursor: 'pointer',
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
                          }}>
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(s.id)}
                          style={{
                            background: '#f3f4f6', color: '#9ca3af',
                            border: '1px solid #e5e7eb',
                            padding: '5px 10px', borderRadius: '6px',
                            fontSize: '0.78rem', cursor: 'pointer',
                            transition: 'all 0.15s'
                          }}
                          onMouseEnter={e => {
                            e.target.style.background = 'rgba(239,68,68,0.08)'
                            e.target.style.borderColor = '#ef4444'
                            e.target.style.color = '#ef4444'
                          }}
                          onMouseLeave={e => {
                            e.target.style.background = '#f3f4f6'
                            e.target.style.borderColor = '#e5e7eb'
                            e.target.style.color = '#9ca3af'
                          }}>
                          ✕
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Rolling info */}
        {scores.length === 5 && (
          <div style={{
            marginTop: '1rem', padding: '0.75rem 1rem',
            background: 'rgba(245,158,11,0.06)',
            border: '1px solid rgba(245,158,11,0.15)',
            borderRadius: '8px', display: 'flex',
            alignItems: 'center', gap: '8px'
          }}>
            <span style={{ fontSize: '0.9rem' }}>ℹ️</span>
            <p style={{ fontSize: '0.8rem', color: '#d97706', margin: 0 }}>
              You have 5 scores. Adding a new one will automatically remove the oldest.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ScoreEntry
