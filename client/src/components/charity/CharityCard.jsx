import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

const CharityCard = ({ charity, onUpdate, expanded }) => {
  const navigate = useNavigate()
  const [percentage, setPercentage] = useState(charity?.contribution_percentage || 10)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/users/charity-percentage', { percentage })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      onUpdate()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{
      background: '#fff', borderRadius: '16px',
      padding: '1.5rem', border: '1px solid #e5e7eb'
    }}>
      <h3 style={{
        fontFamily: 'Syne, sans-serif', fontWeight: 700,
        fontSize: '0.95rem', color: '#1a1a2e', marginBottom: '1.2rem'
      }}>My Charity</h3>

      {charity ? (
        <div>
          {charity.image_url && (
            <img
              src={charity.image_url}
              alt={charity.name}
              style={{
                width: '100%', height: '100px',
                objectFit: 'cover', borderRadius: '10px',
                marginBottom: '1rem'
              }}
            />
          )}
          <div style={{
            fontWeight: 600, color: '#1a1a2e',
            fontSize: '0.95rem', marginBottom: '1rem'
          }}>{charity.name}</div>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontSize: '0.82rem', marginBottom: '6px'
            }}>
              <span style={{ color: '#6b7280' }}>Monthly contribution</span>
              <span style={{ color: '#22c55e', fontWeight: 700 }}>{percentage}%</span>
            </div>
            <input
              type="range" min="10" max="100"
              value={percentage}
              onChange={e => setPercentage(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: '#22c55e', cursor: 'pointer' }}
            />
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontSize: '0.72rem', color: '#d1d5db', marginTop: '2px'
            }}>
              <span>10%</span><span>100%</span>
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              width: '100%',
              background: saved ? '#22c55e' : '#f8f8fc',
              color: saved ? '#fff' : '#374151',
              border: `1px solid ${saved ? '#22c55e' : '#e5e7eb'}`,
              padding: '0.6rem', borderRadius: '8px',
              fontSize: '0.85rem', fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}>
            {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Contribution'}
          </button>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💚</div>
          <p style={{ color: '#9ca3af', fontSize: '0.88rem', marginBottom: '1rem' }}>
            No charity selected yet
          </p>
          <button
            onClick={() => navigate('/charities')}
            style={{
              background: '#22c55e', color: '#fff', border: 'none',
              padding: '0.6rem 1.4rem', borderRadius: '8px',
              fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer'
            }}>
            Choose a Charity
          </button>
        </div>
      )}
    </div>
  )
}

export default CharityCard