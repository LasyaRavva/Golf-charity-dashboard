import { useState, useEffect } from 'react'
import api from '../../services/api'

const AdminCharities = () => {
  const [charities, setCharities] = useState([])
  const [fetching, setFetching] = useState(true)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [addingEventTo, setAddingEventTo] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [search, setSearch] = useState('')
  const [filterFeatured, setFilterFeatured] = useState('all')
  const [expandedEvents, setExpandedEvents] = useState({})

  const emptyForm = {
    name: '', description: '', image_url: '', featured: false
  }
  const emptyEventForm = {
    title: '', event_date: '', description: ''
  }

  const [form, setForm] = useState(emptyForm)
  const [eventForm, setEventForm] = useState(emptyEventForm)
  const [focused, setFocused] = useState('')

  useEffect(() => { fetchCharities() }, [])

  const fetchCharities = async () => {
    setFetching(true)
    try {
      const res = await api.get('/charities')
      setCharities(res.data.charities)
    } catch (err) {
      showMessage('Failed to load charities', 'error')
    } finally {
      setFetching(false)
    }
  }

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: '' }), 3000)
  }

  const handleCreate = async () => {
    if (!form.name) return showMessage('Charity name is required', 'error')
    setLoading(true)
    try {
      await api.post('/charities', form)
      showMessage('Charity created successfully ✓')
      setForm(emptyForm)
      setShowCreateForm(false)
      fetchCharities()
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to create charity', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (id) => {
    setLoading(true)
    try {
      await api.put(`/charities/${id}`, form)
      showMessage('Charity updated ✓')
      setEditingId(null)
      setForm(emptyForm)
      fetchCharities()
    } catch (err) {
      showMessage('Failed to update charity', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    setLoading(true)
    try {
      await api.delete(`/charities/${id}`)
      showMessage('Charity deleted')
      setDeleteConfirm(null)
      fetchCharities()
    } catch (err) {
      showMessage('Failed to delete charity', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleAddEvent = async (charityId) => {
    if (!eventForm.title)
      return showMessage('Event title is required', 'error')
    setLoading(true)
    try {
      await api.post(`/charities/${charityId}/events`, eventForm)
      showMessage('Event added ✓')
      setAddingEventTo(null)
      setEventForm(emptyEventForm)
      fetchCharities()
    } catch (err) {
      showMessage('Failed to add event', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteEvent = async (eventId) => {
    try {
      await api.delete(`/charities/events/${eventId}`)
      showMessage('Event deleted')
      fetchCharities()
    } catch (err) {
      showMessage('Failed to delete event', 'error')
    }
  }

  const startEdit = (charity) => {
    setEditingId(charity.id)
    setForm({
      name: charity.name,
      description: charity.description || '',
      image_url: charity.image_url || '',
      featured: charity.featured || false
    })
    setShowCreateForm(false)
  }

  const filteredCharities = charities.filter(c => {
    const matchSearch = c.name?.toLowerCase().includes(search.toLowerCase())
    const matchFilter =
      filterFeatured === 'all' ||
      (filterFeatured === 'featured' && c.featured) ||
      (filterFeatured === 'standard' && !c.featured)
    return matchSearch && matchFilter
  })

  const inputStyle = (name) => ({
    width: '100%', padding: '0.75rem 1rem',
    borderRadius: '8px',
    border: `1.5px solid ${focused === name ? '#6c63ff' : '#e5e7eb'}`,
    background: '#f8f8fc', fontSize: '0.9rem',
    color: '#1a1a2e', outline: 'none',
    transition: 'border-color 0.2s', boxSizing: 'border-box'
  })

  const CharityForm = ({ onSubmit, submitLabel }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={{
            fontSize: '0.78rem', fontWeight: 600,
            color: '#374151', display: 'block', marginBottom: '6px'
          }}>Charity Name *</label>
          <input
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Cancer Research UK"
            onFocus={() => setFocused('name')}
            onBlur={() => setFocused('')}
            style={inputStyle('name')}
          />
        </div>
        <div>
          <label style={{
            fontSize: '0.78rem', fontWeight: 600,
            color: '#374151', display: 'block', marginBottom: '6px'
          }}>Image URL</label>
          <input
            value={form.image_url}
            onChange={e => setForm({ ...form, image_url: e.target.value })}
            placeholder="https://..."
            onFocus={() => setFocused('image_url')}
            onBlur={() => setFocused('')}
            style={inputStyle('image_url')}
          />
        </div>
      </div>

      <div>
        <label style={{
          fontSize: '0.78rem', fontWeight: 600,
          color: '#374151', display: 'block', marginBottom: '6px'
        }}>Description</label>
        <textarea
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
          placeholder="About this charity and their mission..."
          rows={3}
          onFocus={() => setFocused('description')}
          onBlur={() => setFocused('')}
          style={{
            ...inputStyle('description'),
            resize: 'vertical', minHeight: '80px',
            fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6
          }}
        />
      </div>

      {/* Image preview */}
      {form.image_url && (
        <div style={{
          padding: '0.8rem', background: '#f8f8fc',
          borderRadius: '10px', border: '1px solid #e5e7eb'
        }}>
          <div style={{
            fontSize: '0.72rem', fontWeight: 600,
            color: '#9ca3af', marginBottom: '8px',
            textTransform: 'uppercase', letterSpacing: '0.5px'
          }}>Image Preview</div>
          <img
            src={form.image_url}
            alt="Preview"
            style={{
              width: '100%', height: '100px',
              objectFit: 'cover', borderRadius: '8px'
            }}
            onError={e => e.target.style.display = 'none'}
          />
        </div>
      )}

      {/* Featured toggle */}
      <div
        onClick={() => setForm({ ...form, featured: !form.featured })}
        style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '0.9rem 1rem', borderRadius: '10px',
          border: `1.5px solid ${form.featured ? '#f59e0b' : '#e5e7eb'}`,
          background: form.featured ? 'rgba(245,158,11,0.04)' : '#f8f8fc',
          cursor: 'pointer', transition: 'all 0.15s'
        }}>
        <div style={{
          width: '44px', height: '24px', borderRadius: '12px',
          background: form.featured ? '#f59e0b' : '#e5e7eb',
          position: 'relative', transition: 'background 0.2s', flexShrink: 0
        }}>
          <div style={{
            position: 'absolute', top: '3px',
            left: form.featured ? '23px' : '3px',
            width: '18px', height: '18px', borderRadius: '50%',
            background: '#fff', transition: 'left 0.2s',
            boxShadow: '0 1px 4px rgba(0,0,0,0.15)'
          }} />
        </div>
        <div>
          <div style={{
            fontSize: '0.85rem', fontWeight: 600,
            color: form.featured ? '#d97706' : '#374151'
          }}>
            {form.featured ? '⭐ Featured Charity' : 'Standard Charity'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
            Featured charities appear in the spotlight section on the homepage
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.8rem' }}>
        <button
          onClick={onSubmit}
          disabled={loading}
          style={{
            flex: 1, background: loading ? '#a78bfa' : '#6c63ff',
            color: '#fff', border: 'none',
            padding: '0.8rem', borderRadius: '8px',
            fontSize: '0.9rem', fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 16px rgba(108,99,255,0.25)'
          }}>
          {loading ? 'Saving...' : submitLabel}
        </button>
        <button
          onClick={() => {
            setShowCreateForm(false)
            setEditingId(null)
            setForm(emptyForm)
          }}
          style={{
            background: '#f8f8fc', color: '#374151',
            border: '1px solid #e5e7eb', padding: '0.8rem 1.2rem',
            borderRadius: '8px', fontSize: '0.9rem',
            fontWeight: 500, cursor: 'pointer'
          }}>
          Cancel
        </button>
      </div>
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
          }}>Charity Management</h1>
          <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
            {charities.length} charities ·{' '}
            {charities.filter(c => c.featured).length} featured
          </p>
        </div>
        <button
          onClick={() => {
            setShowCreateForm(true)
            setEditingId(null)
            setForm(emptyForm)
          }}
          style={{
            background: '#6c63ff', color: '#fff', border: 'none',
            padding: '0.7rem 1.4rem', borderRadius: '8px',
            fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: '0 4px 16px rgba(108,99,255,0.25)'
          }}>
          <span>+</span> Add Charity
        </button>
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

      {/* Create Form */}
      {showCreateForm && (
        <div style={{
          background: '#fff', borderRadius: '16px',
          padding: '1.6rem', border: '1px solid rgba(108,99,255,0.2)',
          marginBottom: '1.5rem',
          boxShadow: '0 4px 20px rgba(108,99,255,0.08)'
        }}>
          <h2 style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 700,
            fontSize: '1rem', color: '#1a1a2e', marginBottom: '1.2rem',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <span style={{ fontSize: '1.1rem' }}>💚</span>
            Add New Charity
          </h2>
          <CharityForm
            onSubmit={handleCreate}
            submitLabel="Create Charity"
          />
        </div>
      )}

      {/* Search + filter */}
      <div style={{
        display: 'flex', gap: '0.8rem', marginBottom: '1.2rem',
        flexWrap: 'wrap', alignItems: 'center'
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <span style={{
            position: 'absolute', left: '0.8rem', top: '50%',
            transform: 'translateY(-50%)', color: '#9ca3af', fontSize: '0.85rem'
          }}>🔍</span>
          <input
            type="text"
            placeholder="Search charities..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '0.65rem 0.8rem 0.65rem 2.2rem',
              borderRadius: '8px', border: '1px solid #e5e7eb',
              background: '#fff', fontSize: '0.85rem',
              color: '#1a1a2e', outline: 'none', boxSizing: 'border-box'
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {['all', 'featured', 'standard'].map(f => (
            <button
              key={f}
              onClick={() => setFilterFeatured(f)}
              style={{
                padding: '0.5rem 1rem', borderRadius: '8px',
                border: `1px solid ${filterFeatured === f ? '#6c63ff' : '#e5e7eb'}`,
                background: filterFeatured === f ? 'rgba(108,99,255,0.08)' : '#fff',
                color: filterFeatured === f ? '#6c63ff' : '#6b7280',
                fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer'
              }}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Charities Grid */}
      {fetching ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '1.2rem'
        }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{
              background: '#fff', borderRadius: '14px',
              border: '1px solid #e5e7eb', overflow: 'hidden'
            }}>
              <div style={{
                height: '120px',
                background: 'linear-gradient(90deg, #f3f4f6, #e5e7eb, #f3f4f6)',
                backgroundSize: '200% 100%'
              }} />
              <div style={{ padding: '1.2rem' }}>
                {[70, 100, 50].map((w, j) => (
                  <div key={j} style={{
                    height: '12px', width: `${w}%`,
                    background: '#f3f4f6', borderRadius: '4px', marginBottom: '8px'
                  }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : filteredCharities.length === 0 ? (
        <div style={{
          background: '#fff', borderRadius: '16px',
          padding: '4rem', border: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💚</div>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem', fontWeight: 500 }}>
            No charities found
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '1.2rem'
        }}>
          {filteredCharities.map(charity => {
            const isEditing = editingId === charity.id
            const isAddingEvent = addingEventTo === charity.id
            const eventsExpanded = expandedEvents[charity.id]

            return (
              <div key={charity.id} style={{
                background: '#fff', borderRadius: '16px',
                border: `1px solid ${isEditing
                  ? 'rgba(108,99,255,0.3)' : '#e5e7eb'}`,
                overflow: 'hidden', transition: 'border-color 0.2s'
              }}>

                {/* Image */}
                <div style={{
                  height: '120px', position: 'relative', overflow: 'hidden',
                  background: charity.image_url
                    ? 'transparent'
                    : 'linear-gradient(135deg, rgba(108,99,255,0.1), rgba(34,197,94,0.1))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {charity.image_url ? (
                    <img
                      src={charity.image_url}
                      alt={charity.name}
                      style={{
                        width: '100%', height: '100%', objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: '2.5rem' }}>💚</span>
                  )}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.2), transparent)'
                  }} />
                  {charity.featured && (
                    <div style={{
                      position: 'absolute', top: '0.7rem', left: '0.7rem',
                      background: 'rgba(245,158,11,0.9)', color: '#fff',
                      padding: '3px 10px', borderRadius: '50px',
                      fontSize: '0.7rem', fontWeight: 700
                    }}>⭐ Featured</div>
                  )}
                  <div style={{
                    position: 'absolute', top: '0.7rem', right: '0.7rem',
                    display: 'flex', gap: '4px'
                  }}>
                    <button
                      onClick={() => isEditing ? null : startEdit(charity)}
                      style={{
                        width: '28px', height: '28px', borderRadius: '6px',
                        background: 'rgba(255,255,255,0.9)',
                        border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '0.75rem'
                      }}>✏️</button>
                    <button
                      onClick={() => setDeleteConfirm(charity.id)}
                      style={{
                        width: '28px', height: '28px', borderRadius: '6px',
                        background: 'rgba(255,255,255,0.9)',
                        border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: '0.75rem'
                      }}>🗑️</button>
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: '1.2rem' }}>
                  {isEditing ? (
                    <div>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        marginBottom: '1rem'
                      }}>
                        <div style={{
                          width: '6px', height: '6px', borderRadius: '50%',
                          background: '#6c63ff'
                        }} />
                        <span style={{
                          fontSize: '0.78rem', fontWeight: 700,
                          color: '#6c63ff', letterSpacing: '0.3px'
                        }}>EDITING</span>
                      </div>
                      <CharityForm
                        onSubmit={() => handleUpdate(charity.id)}
                        submitLabel="Save Changes"
                      />
                    </div>
                  ) : (
                    <>
                      <h3 style={{
                        fontFamily: 'Syne, sans-serif', fontWeight: 700,
                        fontSize: '1rem', color: '#1a1a2e', marginBottom: '0.4rem'
                      }}>{charity.name}</h3>

                      {charity.description && (
                        <p style={{
                          fontSize: '0.82rem', color: '#6b7280',
                          lineHeight: 1.6, marginBottom: '1rem'
                        }}>
                          {charity.description.slice(0, 100)}
                          {charity.description.length > 100 && '...'}
                        </p>
                      )}

                      {/* Stats row */}
                      <div style={{
                        display: 'flex', gap: '0.6rem',
                        marginBottom: '1rem', flexWrap: 'wrap'
                      }}>
                        <div style={{
                          background: 'rgba(108,99,255,0.06)',
                          border: '1px solid rgba(108,99,255,0.12)',
                          borderRadius: '6px', padding: '4px 10px',
                          fontSize: '0.72rem', fontWeight: 600, color: '#6c63ff'
                        }}>
                          {charity.charity_events?.length || 0} events
                        </div>
                        <div style={{
                          background: charity.featured
                            ? 'rgba(245,158,11,0.08)' : '#f3f4f6',
                          border: `1px solid ${charity.featured
                            ? 'rgba(245,158,11,0.2)' : '#e5e7eb'}`,
                          borderRadius: '6px', padding: '4px 10px',
                          fontSize: '0.72rem', fontWeight: 600,
                          color: charity.featured ? '#d97706' : '#9ca3af'
                        }}>
                          {charity.featured ? '⭐ Featured' : 'Standard'}
                        </div>
                      </div>

                      {/* Events section */}
                      {charity.charity_events?.length > 0 && (
                        <div style={{ marginBottom: '1rem' }}>
                          <button
                            onClick={() => setExpandedEvents(prev => ({
                              ...prev, [charity.id]: !prev[charity.id]
                            }))}
                            style={{
                              background: 'none', border: 'none',
                              fontSize: '0.78rem', fontWeight: 700,
                              color: '#6c63ff', cursor: 'pointer',
                              padding: 0, marginBottom: '0.5rem',
                              display: 'flex', alignItems: 'center', gap: '4px'
                            }}>
                            {eventsExpanded ? '▼' : '▶'} Events ({charity.charity_events.length})
                          </button>

                          {eventsExpanded && (
                            <div style={{
                              display: 'flex', flexDirection: 'column', gap: '4px'
                            }}>
                              {charity.charity_events.map(event => (
                                <div key={event.id} style={{
                                  display: 'flex', alignItems: 'center',
                                  gap: '8px', padding: '0.5rem 0.7rem',
                                  background: '#f8f8fc', borderRadius: '8px',
                                  border: '1px solid #e5e7eb'
                                }}>
                                  <span style={{ fontSize: '0.8rem' }}>📅</span>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                      fontSize: '0.82rem', fontWeight: 600,
                                      color: '#374151', whiteSpace: 'nowrap',
                                      overflow: 'hidden', textOverflow: 'ellipsis'
                                    }}>{event.title}</div>
                                    {event.event_date && (
                                      <div style={{
                                        fontSize: '0.72rem', color: '#9ca3af'
                                      }}>
                                        {new Date(event.event_date).toLocaleDateString('en-GB', {
                                          day: 'numeric', month: 'short', year: 'numeric'
                                        })}
                                      </div>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => handleDeleteEvent(event.id)}
                                    style={{
                                      background: 'rgba(239,68,68,0.08)',
                                      border: '1px solid rgba(239,68,68,0.15)',
                                      color: '#ef4444', width: '24px', height: '24px',
                                      borderRadius: '6px', cursor: 'pointer',
                                      fontSize: '0.7rem', display: 'flex',
                                      alignItems: 'center', justifyContent: 'center',
                                      flexShrink: 0
                                    }}>✕</button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Add event form */}
                      {isAddingEvent ? (
                        <div style={{
                          background: '#f8f8fc', borderRadius: '10px',
                          padding: '1rem', border: '1px solid rgba(108,99,255,0.15)',
                          marginBottom: '0.8rem'
                        }}>
                          <div style={{
                            fontSize: '0.78rem', fontWeight: 700,
                            color: '#6c63ff', marginBottom: '0.8rem'
                          }}>Add Event</div>
                          <div style={{
                            display: 'flex', flexDirection: 'column', gap: '0.7rem'
                          }}>
                            <input
                              placeholder="Event title *"
                              value={eventForm.title}
                              onChange={e => setEventForm({ ...eventForm, title: e.target.value })}
                              style={{
                                padding: '0.6rem 0.8rem', borderRadius: '8px',
                                border: '1.5px solid #e5e7eb', background: '#fff',
                                fontSize: '0.85rem', outline: 'none',
                                width: '100%', boxSizing: 'border-box'
                              }}
                              onFocus={e => e.target.style.borderColor = '#6c63ff'}
                              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                            />
                            <input
                              type="date"
                              value={eventForm.event_date}
                              onChange={e => setEventForm({ ...eventForm, event_date: e.target.value })}
                              style={{
                                padding: '0.6rem 0.8rem', borderRadius: '8px',
                                border: '1.5px solid #e5e7eb', background: '#fff',
                                fontSize: '0.85rem', outline: 'none',
                                width: '100%', boxSizing: 'border-box'
                              }}
                              onFocus={e => e.target.style.borderColor = '#6c63ff'}
                              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                            />
                            <textarea
                              placeholder="Event description (optional)"
                              value={eventForm.description}
                              onChange={e => setEventForm({ ...eventForm, description: e.target.value })}
                              rows={2}
                              style={{
                                padding: '0.6rem 0.8rem', borderRadius: '8px',
                                border: '1.5px solid #e5e7eb', background: '#fff',
                                fontSize: '0.85rem', outline: 'none', resize: 'none',
                                width: '100%', boxSizing: 'border-box',
                                fontFamily: "'DM Sans', sans-serif"
                              }}
                              onFocus={e => e.target.style.borderColor = '#6c63ff'}
                              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                            />
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button
                                onClick={() => handleAddEvent(charity.id)}
                                disabled={loading}
                                style={{
                                  flex: 1, background: '#6c63ff', color: '#fff',
                                  border: 'none', padding: '0.6rem',
                                  borderRadius: '8px', fontSize: '0.82rem',
                                  fontWeight: 600, cursor: 'pointer'
                                }}>
                                {loading ? 'Adding...' : 'Add Event'}
                              </button>
                              <button
                                onClick={() => {
                                  setAddingEventTo(null)
                                  setEventForm(emptyEventForm)
                                }}
                                style={{
                                  background: '#f3f4f6', color: '#6b7280',
                                  border: '1px solid #e5e7eb', padding: '0.6rem 0.8rem',
                                  borderRadius: '8px', fontSize: '0.82rem', cursor: 'pointer'
                                }}>Cancel</button>
                            </div>
                          </div>
                        </div>
                      ) : null}

                      {/* Action buttons */}
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => startEdit(charity)}
                          style={{
                            flex: 1, background: 'rgba(108,99,255,0.08)',
                            color: '#6c63ff',
                            border: '1px solid rgba(108,99,255,0.2)',
                            padding: '0.6rem', borderRadius: '8px',
                            fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                            transition: 'all 0.15s'
                          }}
                          onMouseEnter={e => e.target.style.background = 'rgba(108,99,255,0.14)'}
                          onMouseLeave={e => e.target.style.background = 'rgba(108,99,255,0.08)'}>
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => setAddingEventTo(
                            isAddingEvent ? null : charity.id
                          )}
                          style={{
                            flex: 1, background: 'rgba(34,197,94,0.08)',
                            color: '#16a34a',
                            border: '1px solid rgba(34,197,94,0.2)',
                            padding: '0.6rem', borderRadius: '8px',
                            fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                            transition: 'all 0.15s'
                          }}
                          onMouseEnter={e => e.target.style.background = 'rgba(34,197,94,0.14)'}
                          onMouseLeave={e => e.target.style.background = 'rgba(34,197,94,0.08)'}>
                          📅 Add Event
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(charity.id)}
                          style={{
                            background: 'rgba(239,68,68,0.08)',
                            color: '#ef4444',
                            border: '1px solid rgba(239,68,68,0.15)',
                            padding: '0.6rem 0.8rem', borderRadius: '8px',
                            fontSize: '0.82rem', cursor: 'pointer',
                            transition: 'all 0.15s'
                          }}
                          onMouseEnter={e => e.target.style.background = 'rgba(239,68,68,0.14)'}
                          onMouseLeave={e => e.target.style.background = 'rgba(239,68,68,0.08)'}>
                          🗑️
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ─── DELETE CONFIRM MODAL ─── */}
      {deleteConfirm && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: '#fff', borderRadius: '20px',
            padding: '2rem', maxWidth: '380px', width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
          }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '12px',
              background: 'rgba(239,68,68,0.1)',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '1.4rem',
              marginBottom: '1rem'
            }}>🗑️</div>

            <h3 style={{
              fontFamily: 'Syne, sans-serif', fontWeight: 800,
              fontSize: '1.1rem', color: '#1a1a2e', marginBottom: '0.6rem'
            }}>Delete this charity?</h3>

            <p style={{
              color: '#6b7280', fontSize: '0.88rem',
              lineHeight: 1.6, marginBottom: '1.5rem'
            }}>
              This will permanently remove the charity and all associated events.
              Users who selected this charity will need to choose a new one.
              <strong style={{ color: '#ef4444' }}> This cannot be undone.</strong>
            </p>

            <div style={{ display: 'flex', gap: '0.8rem' }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={{
                  flex: 1, background: '#f8f8fc',
                  color: '#374151', border: '1px solid #e5e7eb',
                  padding: '0.8rem', borderRadius: '8px',
                  fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer'
                }}>Cancel</button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={loading}
                style={{
                  flex: 1, background: '#ef4444', color: '#fff',
                  border: 'none', padding: '0.8rem', borderRadius: '8px',
                  fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(239,68,68,0.3)'
                }}>
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminCharities