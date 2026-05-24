import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message
  || error?.message
  || fallback

const Signup = () => {
  const navigate = useNavigate()
  const { setSession } = useAuth()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
    charity_id: '',
    charity_percentage: 10
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [focused, setFocused] = useState('')
  const [step, setStep] = useState(1)
  const [charities, setCharities] = useState([])
  const [loadingCharities, setLoadingCharities] = useState(true)

  useEffect(() => {
    api.get('/charities')
      .then(res => setCharities(res.data.charities || []))
      .catch(() => setError('Failed to load charities'))
      .finally(() => setLoadingCharities(false))
  }, [])

  const inputStyle = (name) => ({
    width: '100%',
    padding: '0.85rem 1rem',
    borderRadius: '8px',
    border: `1.5px solid ${focused === name ? '#6c63ff' : '#e5e7eb'}`,
    background: '#f8f8fc',
    fontSize: '0.95rem',
    color: '#1a1a2e',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box'
  })

  const handleNext = () => {
    if (!form.name || !form.email || !form.charity_id)
      return setError('Please fill in all fields')
    setError('')
    setStep(2)
  }

  const handleSubmit = async () => {
    if (!form.password || !form.confirm)
      return setError('Please fill in all fields')
    if (form.password.length < 6)
      return setError('Password must be at least 6 characters')
    if (form.password !== form.confirm)
      return setError('Passwords do not match')

    setLoading(true)
    setError('')

    try {
      const res = await api.post('/auth/signup', {
        name: form.name,
        email: form.email.trim(),
        password: form.password,
        charity_id: form.charity_id,
        charity_percentage: Number(form.charity_percentage)
      })

      await setSession(res.data.token, res.data.user)
      navigate('/subscribe')
    } catch (err) {
      setError(getErrorMessage(err, 'Signup failed. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      fontFamily: "'DM Sans', sans-serif"
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '4rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '30%',
          right: '10%',
          width: '250px',
          height: '250px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34,197,94,0.2) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{
          fontFamily: 'Syne, sans-serif',
          fontWeight: 800,
          fontSize: '1.5rem',
          color: '#fff',
          marginBottom: '3rem'
        }}>
          Golf<span style={{ color: '#6c63ff' }}>Gives</span>
        </div>

        <h2 style={{
          fontFamily: 'Syne, sans-serif',
          fontSize: '2.5rem',
          fontWeight: 800,
          color: '#fff',
          lineHeight: 1.1,
          letterSpacing: '-1px',
          marginBottom: '1.2rem'
        }}>
          Join thousands of golfers
        </h2>
        <p style={{
          color: 'rgba(255,255,255,0.5)',
          fontSize: '1rem',
          lineHeight: 1.7,
          marginBottom: '3rem',
          maxWidth: '320px'
        }}>
          Play golf. Win prizes. Support charity. It takes less than 2 minutes to get started.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { icon: 'Target', text: 'Enter monthly prize draws automatically' },
            { icon: 'Heart', text: 'Support your chosen charity every month' },
            { icon: 'Cup', text: 'Win up to 40% of the monthly prize pool' },
            { icon: 'Chart', text: 'Track your scores and performance' }
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(108,99,255,0.15)',
                border: '1px solid rgba(108,99,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                color: '#fff',
                flexShrink: 0
              }}>{item.icon}</div>
              <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem' }}>{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem'
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '2rem' }}>
            {[1, 2].map(s => (
              <div key={s} style={{
                height: '4px',
                flex: 1,
                borderRadius: '2px',
                background: s <= step ? '#6c63ff' : '#e5e7eb',
                transition: 'background 0.3s'
              }} />
            ))}
          </div>

          <h1 style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 800,
            fontSize: '2rem',
            color: '#1a1a2e',
            letterSpacing: '-0.5px',
            marginBottom: '0.5rem'
          }}>
            {step === 1 ? 'Create account' : 'Set your password'}
          </h1>
          <p style={{ color: '#6b7280', fontSize: '0.95rem', marginBottom: '2rem' }}>
            {step === 1 ? (
              <>Already have an account?{' '}
                <Link to="/login" style={{ color: '#6c63ff', fontWeight: 600, textDecoration: 'none' }}>
                  Sign in
                </Link>
              </>
            ) : 'Almost there, just set a password to finish.'}
          </p>

          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '0.8rem 1rem',
              color: '#ef4444',
              fontSize: '0.88rem',
              marginBottom: '1.5rem'
            }}>{error}</div>
          )}

          {step === 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={{
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: '#374151',
                  display: 'block',
                  marginBottom: '6px'
                }}>Full name</label>
                <input
                  type="text"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  onFocus={() => setFocused('name')}
                  onBlur={() => setFocused('')}
                  style={inputStyle('name')}
                />
              </div>
              <div>
                <label style={{
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: '#374151',
                  display: 'block',
                  marginBottom: '6px'
                }}>Email address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused('')}
                  style={inputStyle('email')}
                  onKeyDown={e => e.key === 'Enter' && handleNext()}
                />
              </div>
              <div>
                <label style={{
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: '#374151',
                  display: 'block',
                  marginBottom: '6px'
                }}>Choose charity</label>
                <select
                  value={form.charity_id}
                  onChange={e => setForm({ ...form, charity_id: e.target.value })}
                  onFocus={() => setFocused('charity_id')}
                  onBlur={() => setFocused('')}
                  disabled={loadingCharities}
                  style={inputStyle('charity_id')}
                >
                  <option value="">
                    {loadingCharities ? 'Loading charities...' : 'Select a charity'}
                  </option>
                  {charities.map(charity => (
                    <option key={charity.id} value={charity.id}>{charity.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: '#374151',
                  display: 'block',
                  marginBottom: '6px'
                }}>Charity contribution</label>
                <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={form.charity_percentage}
                    onChange={e => setForm({ ...form, charity_percentage: Number(e.target.value) })}
                    style={{ flex: 1 }}
                  />
                  <div style={{
                    minWidth: '60px',
                    textAlign: 'center',
                    fontWeight: 700,
                    color: '#22c55e'
                  }}>
                    {form.charity_percentage}%
                  </div>
                </div>
              </div>
              <button
                onClick={handleNext}
                style={{
                  width: '100%',
                  background: '#6c63ff',
                  color: '#fff',
                  border: 'none',
                  padding: '0.95rem',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(108,99,255,0.3)',
                  marginTop: '0.5rem'
                }}
              >{'Continue ->'}</button>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={{
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: '#374151',
                  display: 'block',
                  marginBottom: '6px'
                }}>Password</label>
                <input
                  type="password"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused('')}
                  style={inputStyle('password')}
                />
              </div>
              <div>
                <label style={{
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: '#374151',
                  display: 'block',
                  marginBottom: '6px'
                }}>Confirm password</label>
                <input
                  type="password"
                  placeholder="Repeat your password"
                  value={form.confirm}
                  onChange={e => setForm({ ...form, confirm: e.target.value })}
                  onFocus={() => setFocused('confirm')}
                  onBlur={() => setFocused('')}
                  style={inputStyle('confirm')}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                />
              </div>

              {form.password && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '4px' }}>
                    Password strength
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {[1, 2, 3].map(i => (
                      <div key={i} style={{
                        height: '4px',
                        flex: 1,
                        borderRadius: '2px',
                        background: form.password.length >= i * 3
                          ? i === 1 ? '#ef4444' : i === 2 ? '#f59e0b' : '#22c55e'
                          : '#e5e7eb'
                      }} />
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem' }}>
                <button
                  onClick={() => { setStep(1); setError('') }}
                  style={{
                    flex: 1,
                    background: '#f8f8fc',
                    color: '#374151',
                    border: '1px solid #e5e7eb',
                    padding: '0.85rem',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >{'<- Back'}</button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{
                    flex: 2,
                    background: loading ? '#a78bfa' : '#6c63ff',
                    color: '#fff',
                    border: 'none',
                    padding: '0.85rem',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: 700,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 20px rgba(108,99,255,0.3)'
                  }}
                >
                  {loading ? 'Creating account...' : 'Create Account ->'}
                </button>
              </div>
            </div>
          )}

          <p style={{
            fontSize: '0.78rem',
            color: '#9ca3af',
            textAlign: 'center',
            marginTop: '1.5rem',
            lineHeight: 1.6
          }}>
            By signing up you agree to our{' '}
            <a href="#" style={{ color: '#6c63ff', textDecoration: 'none' }}>Terms</a>{' '}
            and{' '}
            <a href="#" style={{ color: '#6c63ff', textDecoration: 'none' }}>Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Signup
