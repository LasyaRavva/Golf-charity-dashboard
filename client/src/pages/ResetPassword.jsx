import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../services/api'

const ResetPassword = () => {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const token = decodeURIComponent(params.get('token') || '')
  const id = params.get('id') || params.get('uid') || params.get('userId') || ''
  const hasValidParams = useMemo(() => Boolean(token && id), [token, id])

  const handleSubmit = async () => {
    if (!hasValidParams)
      return setError('This reset link is invalid or incomplete.')
    if (!password || !confirm)
      return setError('Please fill in both password fields.')
    if (password.length < 6)
      return setError('Password must be at least 6 characters.')
    if (password !== confirm)
      return setError('Passwords do not match.')

    setLoading(true)
    setError('')
    setMessage('')

    try {
      const res = await api.post('/auth/reset-password', { id, token, password })
      setMessage(res.data.message)
      setTimeout(() => navigate('/login'), 1200)
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to reset password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      padding: '2rem',
      background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)',
      fontFamily: "'DM Sans', sans-serif"
    }}>
      <div style={{
        width: '100%',
        maxWidth: '460px',
        background: '#fff',
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 24px 80px rgba(0,0,0,0.25)'
      }}>
        <div style={{
          fontFamily: 'Syne, sans-serif',
          fontWeight: 800,
          fontSize: '1.8rem',
          color: '#1a1a2e',
          marginBottom: '0.5rem'
        }}>
          Reset password
        </div>
        <p style={{ color: '#6b7280', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          Choose a new password for your account. This link expires after one hour.
        </p>

        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#ef4444',
            borderRadius: '10px',
            padding: '0.8rem 1rem',
            fontSize: '0.88rem',
            marginBottom: '1rem'
          }}>{error}</div>
        )}

        {message && (
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#16a34a',
            borderRadius: '10px',
            padding: '0.8rem 1rem',
            fontSize: '0.88rem',
            marginBottom: '1rem'
          }}>{message}</div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{
              fontSize: '0.82rem',
              fontWeight: 600,
              color: '#374151',
              display: 'block',
              marginBottom: '6px'
            }}>New password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              style={{
                width: '100%',
                padding: '0.9rem 1rem',
                borderRadius: '10px',
                border: '1.5px solid #e5e7eb',
                background: '#f8f8fc',
                fontSize: '0.95rem',
                color: '#1a1a2e',
                outline: 'none',
                boxSizing: 'border-box'
              }}
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
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Repeat your password"
              style={{
                width: '100%',
                padding: '0.9rem 1rem',
                borderRadius: '10px',
                border: '1.5px solid #e5e7eb',
                background: '#f8f8fc',
                fontSize: '0.95rem',
                color: '#1a1a2e',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !hasValidParams}
            style={{
              width: '100%',
              background: loading || !hasValidParams ? '#a78bfa' : '#6c63ff',
              color: '#fff',
              border: 'none',
              padding: '0.95rem',
              borderRadius: '10px',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: loading || !hasValidParams ? 'not-allowed' : 'pointer',
              boxShadow: '0 8px 24px rgba(108,99,255,0.25)'
            }}
          >
            {loading ? 'Resetting password...' : 'Reset password'}
          </button>
        </div>

        <div style={{ marginTop: '1.2rem', textAlign: 'center' }}>
          <Link to="/login" style={{
            color: '#6c63ff',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.9rem'
          }}>
            Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
