import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCharities, selectCharity, makeDonation } from '../services/charityService'
import { useAuth } from '../context/AuthContext'

const Charities = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [charities, setCharities] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selecting, setSelecting] = useState(null)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [donating, setDonating] = useState(null)
  const [donationAmount, setDonationAmount] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')

  useEffect(() => { fetchCharities() }, [search])

  const fetchCharities = async () => {
    setLoading(true)
    try {
      const data = await getCharities(search)
      setCharities(data.charities)
    } catch (err) {
      showMessage('Failed to load charities', 'error')
    } finally {
      setLoading(false)
    }
  }

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage({ text: '', type: '' }), 3000)
  }

  const handleSelect = async (charityId, charityName) => {
    if (!user) return navigate('/login')
    setSelecting(charityId)
    try {
      await selectCharity(charityId)
      showMessage(`Now supporting "${charityName}" 💚`)
    } catch (err) {
      showMessage(err.response?.data?.message || 'Failed to select charity', 'error')
    } finally {
      setSelecting(null)
    }
  }

  const handleDonate = async (charityId) => {
    if (!user) return navigate('/login')
    const amount = parseFloat(donationAmount)
    if (!amount || amount <= 0)
      return showMessage('Please enter a valid amount', 'error')

    setSelecting(charityId)
    try {
      await makeDonation(charityId, amount)
      showMessage(`Donation of £${amount.toFixed(2)} made successfully 💚`)
      setDonating(null)
      setDonationAmount('')
    } catch (err) {
      showMessage('Failed to process donation', 'error')
    } finally {
      setSelecting(null)
    }
  }

  const featured = charities.filter(c => c.featured)
  const all = charities.filter(c => !c.featured)
  const filtered = activeFilter === 'featured' ? featured : all

  return (
    <div style={{
      minHeight: '100vh', background: '#f8f8fc',
      fontFamily: "'DM Sans', sans-serif"
    }}>

      {/* ─── NAV ─── */}
      <nav style={{
        background: '#0f0f1a', padding: '1.2rem 6%',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <div
          onClick={() => navigate('/')}
          style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 800,
            fontSize: '1.3rem', color: '#fff', cursor: 'pointer'
          }}>
          Golf<span style={{ color: '#6c63ff' }}>Gives</span>
        </div>
        <div style={{ display: 'flex', gap: '0.8rem' }}>
          {user ? (
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                background: '#6c63ff', color: '#fff', border: 'none',
                padding: '0.6rem 1.4rem', borderRadius: '8px',
                fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer'
              }}>Dashboard</button>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                style={{
                  background: 'transparent', color: 'rgba(255,255,255,0.7)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  padding: '0.6rem 1.2rem', borderRadius: '8px',
                  fontSize: '0.88rem', cursor: 'pointer'
                }}>Login</button>
              <button
                onClick={() => navigate('/subscribe')}
                style={{
                  background: '#6c63ff', color: '#fff', border: 'none',
                  padding: '0.6rem 1.2rem', borderRadius: '8px',
                  fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer'
                }}>Get Started</button>
            </>
          )}
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <div style={{
        background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)',
        padding: '4rem 6% 5rem', textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'rgba(34,197,94,0.12)',
          border: '1px solid rgba(34,197,94,0.25)',
          color: '#22c55e', padding: '6px 14px', borderRadius: '50px',
          fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.5px',
          marginBottom: '1.5rem'
        }}>
          <span style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: '#22c55e', display: 'inline-block'
          }} />
          REAL IMPACT · EVERY SUBSCRIPTION
        </div>

        <h1 style={{
          fontFamily: 'Syne, sans-serif',
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          fontWeight: 800, color: '#fff',
          letterSpacing: '-1.5px', marginBottom: '1rem'
        }}>
          Choose your cause
        </h1>
        <p style={{
          color: 'rgba(255,255,255,0.5)', fontSize: '1.05rem',
          maxWidth: '460px', margin: '0 auto 2.5rem', lineHeight: 1.7
        }}>
          At least 10% of your subscription goes directly to the charity you pick.
          Change it any time. Make an extra donation whenever you want.
        </p>

        {/* Search */}
        <div style={{
          maxWidth: '500px', margin: '0 auto',
          position: 'relative'
        }}>
          <span style={{
            position: 'absolute', left: '1rem', top: '50%',
            transform: 'translateY(-50%)', fontSize: '1rem',
            color: 'rgba(255,255,255,0.3)'
          }}>🔍</span>
          <input
            type="text"
            placeholder="Search charities..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '0.9rem 1rem 0.9rem 2.8rem',
              borderRadius: '10px',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#fff', fontSize: '0.95rem',
              outline: 'none', boxSizing: 'border-box',
              transition: 'border-color 0.2s'
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(108,99,255,0.5)'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
          />
        </div>

        {/* Stats row */}
        <div style={{
          display: 'flex', justifyContent: 'center',
          gap: '3rem', marginTop: '3rem', flexWrap: 'wrap'
        }}>
          {[
            { num: '30+', label: 'Partner Charities' },
            { num: '£50K+', label: 'Total Donated' },
            { num: '10%+', label: 'Per Subscription' }
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: 'Syne, sans-serif', fontSize: '1.8rem',
                fontWeight: 800, color: '#22c55e', lineHeight: 1
              }}>{s.num}</div>
              <div style={{
                fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)',
                marginTop: '4px'
              }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── MESSAGE ─── */}
      {message.text && (
        <div style={{
          margin: '1.5rem 6% 0',
          padding: '0.9rem 1.2rem', borderRadius: '10px',
          background: message.type === 'error' ? '#fef2f2' : '#f0fdf4',
          border: `1px solid ${message.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
          color: message.type === 'error' ? '#ef4444' : '#16a34a',
          fontSize: '0.9rem', fontWeight: 500
        }}>
          {message.text}
        </div>
      )}

      {/* ─── CONTENT ─── */}
      <div style={{ padding: '3rem 6%' }}>

        {/* Featured Charity */}
        {featured.length > 0 && !search && (
          <div style={{ marginBottom: '3rem' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              marginBottom: '1.5rem'
            }}>
              <span style={{ fontSize: '1.2rem' }}>⭐</span>
              <h2 style={{
                fontFamily: 'Syne, sans-serif', fontWeight: 800,
                fontSize: '1.3rem', color: '#1a1a2e', letterSpacing: '-0.3px'
              }}>Featured Charity</h2>
              <div style={{
                background: 'rgba(245,158,11,0.1)',
                border: '1px solid rgba(245,158,11,0.2)',
                color: '#d97706', padding: '3px 10px',
                borderRadius: '50px', fontSize: '0.72rem', fontWeight: 700
              }}>SPOTLIGHT</div>
            </div>

            {featured.map(charity => (
              <FeaturedCard
                key={charity.id}
                charity={charity}
                onSelect={handleSelect}
                onDonate={setDonating}
                selecting={selecting}
                user={user}
                navigate={navigate}
              />
            ))}
          </div>
        )}

        {/* Filter tabs */}
        {!search && (
          <div style={{
            display: 'flex', gap: '0.5rem', marginBottom: '1.5rem'
          }}>
            {[
              { id: 'all', label: `All Charities (${all.length})` },
              { id: 'featured', label: `Featured (${featured.length})` }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                style={{
                  padding: '0.5rem 1.2rem', borderRadius: '8px',
                  border: `1px solid ${activeFilter === f.id ? '#6c63ff' : '#e5e7eb'}`,
                  background: activeFilter === f.id ? 'rgba(108,99,255,0.08)' : '#fff',
                  color: activeFilter === f.id ? '#6c63ff' : '#6b7280',
                  fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.15s'
                }}>
                {f.label}
              </button>
            ))}
          </div>
        )}

        {/* All Charities */}
        <div style={{ marginBottom: '1rem' }}>
          <h2 style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 800,
            fontSize: '1.2rem', color: '#1a1a2e',
            letterSpacing: '-0.3px', marginBottom: '1.5rem'
          }}>
            {search ? `Results for "${search}"` : 'All Charities'}
          </h2>

          {loading ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.5rem'
            }}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '4rem 0'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
              <p style={{
                color: '#9ca3af', fontSize: '1rem',
                fontWeight: 500, marginBottom: '0.5rem'
              }}>No charities found</p>
              <p style={{ color: '#d1d5db', fontSize: '0.88rem' }}>
                Try a different search term
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.5rem'
            }}>
              {(search ? charities : filtered).map(charity => (
                <CharityCard
                  key={charity.id}
                  charity={charity}
                  onSelect={handleSelect}
                  onDonate={setDonating}
                  selecting={selecting}
                  donating={donating}
                  donationAmount={donationAmount}
                  setDonationAmount={setDonationAmount}
                  onConfirmDonate={handleDonate}
                  user={user}
                  navigate={navigate}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── BOTTOM CTA ─── */}
      <div style={{
        background: 'linear-gradient(135deg, #0f0f1a, #1a1a2e)',
        padding: '4rem 6%', textAlign: 'center'
      }}>
        <h2 style={{
          fontFamily: 'Syne, sans-serif', fontSize: '1.8rem',
          fontWeight: 800, color: '#fff', letterSpacing: '-0.5px',
          marginBottom: '0.8rem'
        }}>Ready to make an impact?</h2>
        <p style={{
          color: 'rgba(255,255,255,0.5)', marginBottom: '2rem',
          fontSize: '0.95rem'
        }}>
          Subscribe today and start supporting your chosen charity automatically.
        </p>
        <button
          onClick={() => navigate('/subscribe')}
          style={{
            background: '#22c55e', color: '#fff', border: 'none',
            padding: '1rem 2.5rem', borderRadius: '10px',
            fontSize: '1rem', fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(34,197,94,0.3)'
          }}>
          Start Supporting →
        </button>
      </div>
    </div>
  )
}

// ─── FEATURED CARD ───
const FeaturedCard = ({ charity, onSelect, onDonate, selecting, user, navigate }) => {
  const [expanded, setExpanded] = useState(false)

  return (
    <div style={{
      background: '#fff', borderRadius: '20px',
      border: '2px solid rgba(245,158,11,0.2)',
      overflow: 'hidden',
      boxShadow: '0 8px 40px rgba(245,158,11,0.08)',
      display: 'grid', gridTemplateColumns: '1fr 1.2fr'
    }}>
      {/* Image */}
      <div style={{
        background: charity.image_url
          ? `url(${charity.image_url}) center/cover no-repeat`
          : 'linear-gradient(135deg, #22c55e, #16a34a)',
        minHeight: '280px', position: 'relative'
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to right, transparent 60%, rgba(255,255,255,0.05))'
        }} />
        <div style={{
          position: 'absolute', top: '1rem', left: '1rem',
          background: 'rgba(245,158,11,0.9)',
          color: '#fff', padding: '4px 12px', borderRadius: '50px',
          fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.5px'
        }}>⭐ FEATURED</div>
      </div>

      {/* Content */}
      <div style={{ padding: '2.5rem' }}>
        <h3 style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 800,
          fontSize: '1.4rem', color: '#1a1a2e',
          letterSpacing: '-0.5px', marginBottom: '0.8rem'
        }}>{charity.name}</h3>

        <p style={{
          color: '#6b7280', fontSize: '0.9rem',
          lineHeight: 1.7, marginBottom: '1.2rem'
        }}>
          {expanded
            ? charity.description
            : `${charity.description?.slice(0, 150)}...`}
          {charity.description?.length > 150 && (
            <button
              onClick={() => setExpanded(!expanded)}
              style={{
                background: 'none', border: 'none',
                color: '#6c63ff', fontSize: '0.85rem',
                cursor: 'pointer', fontWeight: 600,
                padding: '0 4px'
              }}>
              {expanded ? 'less' : 'more'}
            </button>
          )}
        </p>

        {/* Events */}
        {charity.charity_events?.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{
              fontSize: '0.75rem', fontWeight: 700,
              color: '#9ca3af', letterSpacing: '1px',
              textTransform: 'uppercase', marginBottom: '0.6rem'
            }}>Upcoming Events</div>
            {charity.charity_events.slice(0, 2).map(event => (
              <div key={event.id} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '0.5rem 0',
                borderBottom: '1px solid #f3f4f6'
              }}>
                <span style={{ fontSize: '0.85rem' }}>📅</span>
                <span style={{ fontSize: '0.85rem', color: '#374151', flex: 1 }}>
                  {event.title}
                </span>
                {event.event_date && (
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                    {new Date(event.event_date).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short'
                    })}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.8rem' }}>
          <button
            onClick={() => onSelect(charity.id, charity.name)}
            disabled={selecting === charity.id}
            style={{
              flex: 1, background: '#22c55e', color: '#fff',
              border: 'none', padding: '0.8rem', borderRadius: '10px',
              fontSize: '0.9rem', fontWeight: 700,
              cursor: selecting === charity.id ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 16px rgba(34,197,94,0.25)'
            }}>
            {selecting === charity.id ? 'Selecting...' : '💚 Support This Charity'}
          </button>
          <button
            onClick={() => onDonate(charity.id)}
            style={{
              background: 'rgba(108,99,255,0.08)',
              color: '#6c63ff',
              border: '1px solid rgba(108,99,255,0.2)',
              padding: '0.8rem 1.2rem', borderRadius: '10px',
              fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer'
            }}>
            Donate
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── CHARITY CARD ───
const CharityCard = ({
  charity, onSelect, onDonate, selecting,
  donating, donationAmount, setDonationAmount,
  onConfirmDonate, user, navigate
}) => {
  const [expanded, setExpanded] = useState(false)
  const [hovered, setHovered] = useState(false)
  const isDonating = donating === charity.id

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff', borderRadius: '16px',
        border: `1px solid ${hovered ? 'rgba(108,99,255,0.3)' : '#e5e7eb'}`,
        overflow: 'hidden', transition: 'all 0.25s',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered
          ? '0 16px 48px rgba(108,99,255,0.12)'
          : '0 2px 8px rgba(0,0,0,0.04)',
        display: 'flex', flexDirection: 'column'
      }}>

      {/* Image */}
      <div style={{
        height: '160px', overflow: 'hidden', position: 'relative',
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
              width: '100%', height: '100%', objectFit: 'cover',
              transition: 'transform 0.4s',
              transform: hovered ? 'scale(1.05)' : 'scale(1)'
            }}
          />
        ) : (
          <span style={{ fontSize: '3rem' }}>💚</span>
        )}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.15), transparent)'
        }} />
        {charity.featured && (
          <div style={{
            position: 'absolute', top: '0.8rem', right: '0.8rem',
            background: 'rgba(245,158,11,0.9)', color: '#fff',
            padding: '3px 10px', borderRadius: '50px',
            fontSize: '0.7rem', fontWeight: 700
          }}>⭐ Featured</div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: '1.4rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 700,
          fontSize: '1rem', color: '#1a1a2e', marginBottom: '0.5rem'
        }}>{charity.name}</h3>

        <p style={{
          fontSize: '0.85rem', color: '#6b7280',
          lineHeight: 1.6, flex: 1, marginBottom: '0.8rem'
        }}>
          {expanded
            ? charity.description
            : `${charity.description?.slice(0, 90)}...`}
          {charity.description?.length > 90 && (
            <button
              onClick={() => setExpanded(!expanded)}
              style={{
                background: 'none', border: 'none',
                color: '#6c63ff', fontSize: '0.82rem',
                cursor: 'pointer', fontWeight: 600, padding: '0 3px'
              }}>
              {expanded ? ' less' : ' more'}
            </button>
          )}
        </p>

        {/* Events */}
        {charity.charity_events?.length > 0 && (
          <div style={{
            background: 'rgba(108,99,255,0.04)',
            border: '1px solid rgba(108,99,255,0.1)',
            borderRadius: '8px', padding: '0.7rem',
            marginBottom: '1rem'
          }}>
            <div style={{
              fontSize: '0.7rem', fontWeight: 700,
              color: '#6c63ff', letterSpacing: '0.5px',
              marginBottom: '0.4rem'
            }}>UPCOMING EVENT</div>
            <div style={{ fontSize: '0.82rem', color: '#374151' }}>
              {charity.charity_events[0].title}
            </div>
            {charity.charity_events[0].event_date && (
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '2px' }}>
                {new Date(charity.charity_events[0].event_date).toLocaleDateString('en-GB', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}
              </div>
            )}
          </div>
        )}

        {/* Donate inline */}
        {isDonating && (
          <div style={{
            background: '#f8f8fc', borderRadius: '10px',
            padding: '1rem', marginBottom: '1rem',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{
              fontSize: '0.8rem', fontWeight: 600,
              color: '#374151', marginBottom: '0.6rem'
            }}>One-time donation</div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <span style={{
                  position: 'absolute', left: '0.7rem', top: '50%',
                  transform: 'translateY(-50%)', color: '#9ca3af',
                  fontSize: '0.9rem'
                }}>£</span>
                <input
                  type="number" min="1" placeholder="0.00"
                  value={donationAmount}
                  onChange={e => setDonationAmount(e.target.value)}
                  style={{
                    width: '100%', padding: '0.6rem 0.8rem 0.6rem 1.8rem',
                    borderRadius: '8px', border: '1.5px solid #6c63ff',
                    fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box'
                  }}
                />
              </div>
              <button
                onClick={() => onConfirmDonate(charity.id)}
                style={{
                  background: '#22c55e', color: '#fff', border: 'none',
                  padding: '0.6rem 1rem', borderRadius: '8px',
                  fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer'
                }}>Give</button>
              <button
                onClick={() => { onDonate(null); setDonationAmount('') }}
                style={{
                  background: '#f3f4f6', color: '#9ca3af',
                  border: '1px solid #e5e7eb', padding: '0.6rem 0.8rem',
                  borderRadius: '8px', fontSize: '0.82rem', cursor: 'pointer'
                }}>✕</button>
            </div>

            {/* Quick amounts */}
            <div style={{ display: 'flex', gap: '6px', marginTop: '0.6rem' }}>
              {['5', '10', '25', '50'].map(amt => (
                <button
                  key={amt}
                  onClick={() => setDonationAmount(amt)}
                  style={{
                    flex: 1, background: donationAmount === amt
                      ? 'rgba(34,197,94,0.1)' : '#fff',
                    border: `1px solid ${donationAmount === amt ? '#22c55e' : '#e5e7eb'}`,
                    color: donationAmount === amt ? '#16a34a' : '#6b7280',
                    padding: '4px', borderRadius: '6px',
                    fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer'
                  }}>£{amt}</button>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '0.6rem', marginTop: 'auto' }}>
          <button
            onClick={() => onSelect(charity.id, charity.name)}
            disabled={selecting === charity.id}
            style={{
              flex: 1, background: selecting === charity.id
                ? '#a78bfa' : '#6c63ff',
              color: '#fff', border: 'none',
              padding: '0.7rem', borderRadius: '8px',
              fontSize: '0.85rem', fontWeight: 600,
              cursor: selecting === charity.id ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s'
            }}>
            {selecting === charity.id ? '...' : '💚 Support'}
          </button>
          <button
            onClick={() => onDonate(isDonating ? null : charity.id)}
            style={{
              background: isDonating ? 'rgba(239,68,68,0.08)' : 'rgba(108,99,255,0.08)',
              color: isDonating ? '#ef4444' : '#6c63ff',
              border: `1px solid ${isDonating ? 'rgba(239,68,68,0.2)' : 'rgba(108,99,255,0.2)'}`,
              padding: '0.7rem 1rem', borderRadius: '8px',
              fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
              transition: 'all 0.15s'
            }}>
            {isDonating ? '✕' : 'Donate'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── SKELETON CARD ───
const SkeletonCard = () => (
  <div style={{
    background: '#fff', borderRadius: '16px',
    border: '1px solid #e5e7eb', overflow: 'hidden'
  }}>
    <div style={{
      height: '160px',
      background: 'linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite'
    }} />
    <div style={{ padding: '1.4rem' }}>
      {[80, 100, 60].map((w, i) => (
        <div key={i} style={{
          height: i === 0 ? '16px' : '12px',
          width: `${w}%`,
          background: '#f3f4f6',
          borderRadius: '4px',
          marginBottom: '0.6rem'
        }} />
      ))}
      <div style={{ display: 'flex', gap: '0.6rem', marginTop: '1rem' }}>
        <div style={{ flex: 1, height: '36px', background: '#f3f4f6', borderRadius: '8px' }} />
        <div style={{ width: '70px', height: '36px', background: '#f3f4f6', borderRadius: '8px' }} />
      </div>
    </div>
  </div>
)

export default Charities