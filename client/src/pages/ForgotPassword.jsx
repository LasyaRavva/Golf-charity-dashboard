import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [resetSession, setResetSession] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleSendCode = async () => {
    if (!email) return setError('Please enter your email address')

    setLoading(true)
    setError('')
    setMessage('')

    try {
      const res = await api.post('/auth/forgot-password', { email })
      if (!res.data.resetSession) {
        throw new Error('No reset session returned')
      }

      setResetSession(res.data.resetSession)
      setStep(2)
      setMessage(res.data.message)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to send reset code right now.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    if (!code || !password || !confirm)
      return setError('Please fill in all fields.')
    if (password.length < 6)
      return setError('Password must be at least 6 characters.')
    if (password !== confirm)
      return setError('Passwords do not match.')

    setLoading(true)
    setError('')
    setMessage('')

    try {
      const res = await api.post('/auth/reset-password-code', {
        email,
        code,
        resetSession,
        password
      })
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
          display: 'flex',
          gap: '6px',
          marginBottom: '1.5rem'
        }}>
          {[1, 2].map(item => (
            <div
              key={item}
              style={{
                height: '4px',
                flex: 1,
                borderRadius: '999px',
                background: item <= step ? '#6c63ff' : '#e5e7eb'
              }}
            />
          ))}
        </div>

        <div style={{
          fontFamily: 'Syne, sans-serif',
          fontWeight: 800,
          fontSize: '1.8rem',
          color: '#1a1a2e',
          marginBottom: '0.5rem'
        }}>
          {step === 1 ? 'Forgot password' : 'Enter reset code'}
        </div>
        <p style={{ color: '#6b7280', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
          {step === 1
            ? 'Enter your email and we will send a 6-digit reset code.'
            : `We sent a 6-digit code to ${email}. Enter it below and choose a new password.`}
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

        {step === 1 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={inputStyle}
                onKeyDown={e => e.key === 'Enter' && handleSendCode()}
              />
            </div>

            <button onClick={handleSendCode} disabled={loading} style={buttonStyle(loading)}>
              {loading ? 'Sending code...' : 'Send code'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Reset code</label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="6-digit code"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>New password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Confirm password</label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="Repeat your password"
                style={inputStyle}
                onKeyDown={e => e.key === 'Enter' && handleResetPassword()}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.8rem' }}>
              <button
                onClick={() => {
                  setStep(1)
                  setCode('')
                  setPassword('')
                  setConfirm('')
                  setResetSession('')
                  setMessage('')
                  setError('')
                }}
                style={{
                  flex: 1,
                  background: '#f8f8fc',
                  color: '#374151',
                  border: '1px solid #e5e7eb',
                  padding: '0.95rem',
                  borderRadius: '10px',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Back
              </button>
              <button
                onClick={handleResetPassword}
                disabled={loading}
                style={{ ...buttonStyle(loading), flex: 2 }}
              >
                {loading ? 'Resetting...' : 'Reset password'}
              </button>
            </div>
          </div>
        )}

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

const labelStyle = {
  fontSize: '0.82rem',
  fontWeight: 600,
  color: '#374151',
  display: 'block',
  marginBottom: '6px'
}

const inputStyle = {
  width: '100%',
  padding: '0.9rem 1rem',
  borderRadius: '10px',
  border: '1.5px solid #e5e7eb',
  background: '#f8f8fc',
  fontSize: '0.95rem',
  color: '#1a1a2e',
  outline: 'none',
  boxSizing: 'border-box'
}

const buttonStyle = (loading) => ({
  width: '100%',
  background: loading ? '#a78bfa' : '#6c63ff',
  color: '#fff',
  border: 'none',
  padding: '0.95rem',
  borderRadius: '10px',
  fontSize: '1rem',
  fontWeight: 700,
  cursor: loading ? 'not-allowed' : 'pointer',
  boxShadow: '0 8px 24px rgba(108,99,255,0.25)'
})

export default ForgotPassword
