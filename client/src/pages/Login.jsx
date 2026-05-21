import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [focused, setFocused] = useState('')

  const handleSubmit = async () => {
    if (!form.email || !form.password)
      return setError('Please fill in all fields')

    setLoading(true)
    setError('')

    try {
      const res = await api.post('/auth/login', form)
      login(res.data.token, res.data.user)
      navigate(res.data.user.role === 'admin' ? '/admin' : '/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

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

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      fontFamily: "'DM Sans', sans-serif"
    }}>

      {/* ─── LEFT PANEL ─── */}
      <div style={{
        background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '4rem',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Glow */}
        <div style={{
          position: 'absolute', top: '20%', left: '10%',
          width: '300px', height: '300px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(108,99,255,0.2) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', bottom: '15%', right: '5%',
          width: '200px', height: '200px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        {/* Logo */}
        <div style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 800,
          fontSize: '1.5rem', color: '#fff', marginBottom: '3rem'
        }}>
          Golf<span style={{ color: '#6c63ff' }}>Gives</span>
        </div>

        <h2 style={{
          fontFamily: 'Syne, sans-serif',
          fontSize: '2.5rem', fontWeight: 800,
          color: '#fff', lineHeight: 1.1,
          letterSpacing: '-1px', marginBottom: '1.2rem'
        }}>
          Welcome<br />back 👋
        </h2>
        <p style={{
          color: 'rgba(255,255,255,0.5)',
          fontSize: '1rem', lineHeight: 1.7,
          marginBottom: '3rem', maxWidth: '320px'
        }}>
          Log in to enter your scores, check your draw results, and track your charity contributions.
        </p>

        {/* Testimonial */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '14px', padding: '1.5rem',
          maxWidth: '360px'
        }}>
          <p style={{
            color: 'rgba(255,255,255,0.7)',
            fontSize: '0.9rem', lineHeight: 1.7,
            marginBottom: '1rem', fontStyle: 'italic'
          }}>
            "Won £420 last month and my charity received £80 from my subscription. It's a brilliant concept."
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #6c63ff, #22c55e)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.8rem', fontWeight: 700, color: '#fff'
            }}>JM</div>
            <div>
              <div style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600 }}>James M.</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>Member since 2025</div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── RIGHT PANEL ─── */}
      <div style={{
        background: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '4rem'
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>

          <h1 style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 800,
            fontSize: '2rem', color: '#1a1a2e',
            letterSpacing: '-0.5px', marginBottom: '0.5rem'
          }}>Sign in</h1>
          <p style={{ color: '#6b7280', fontSize: '0.95rem', marginBottom: '2rem' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: '#6c63ff', fontWeight: 600, textDecoration: 'none' }}>
              Sign up free
            </Link>
          </p>

          {/* Error */}
          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca',
              borderRadius: '8px', padding: '0.8rem 1rem',
              color: '#ef4444', fontSize: '0.88rem', marginBottom: '1.5rem'
            }}>{error}</div>
          )}

          {/* Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

            <div>
              <label style={{
                fontSize: '0.82rem', fontWeight: 600,
                color: '#374151', display: 'block', marginBottom: '6px'
              }}>Email address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused('')}
                style={inputStyle('email')}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#374151' }}>
                  Password
                </label>
                <Link to="/forgot-password" style={{ fontSize: '0.82rem', color: '#6c63ff', textDecoration: 'none' }}>
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused('')}
                style={inputStyle('password')}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: '100%', background: loading ? '#a78bfa' : '#6c63ff',
                color: '#fff', border: 'none',
                padding: '0.95rem', borderRadius: '8px',
                fontSize: '1rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s', marginTop: '0.5rem',
                boxShadow: '0 4px 20px rgba(108,99,255,0.3)'
              }}
              onMouseEnter={e => { if (!loading) e.target.style.background = '#5a52e0' }}
              onMouseLeave={e => { if (!loading) e.target.style.background = '#6c63ff' }}
            >
              {loading ? 'Signing in...' : 'Sign in →'}
            </button>

          </div>

          {/* Divider */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '1rem',
            margin: '1.5rem 0'
          }}>
            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
            <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
          </div>

          <button
            onClick={() => navigate('/')}
            style={{
              width: '100%', background: '#f8f8fc',
              color: '#374151', border: '1px solid #e5e7eb',
              padding: '0.85rem', borderRadius: '8px',
              fontSize: '0.95rem', fontWeight: 500, cursor: 'pointer'
            }}
          >
            ← Back to Home
          </button>

        </div>
      </div>
    </div>
  )
}

export default Login
