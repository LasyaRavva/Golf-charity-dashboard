import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createCheckout } from '../services/subscriptionService'
import { useAuth } from '../context/AuthContext'

const Subscribe = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [selected, setSelected] = useState('yearly')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const plans = [
    {
      id: 'monthly',
      name: 'Monthly',
      price: '£9.99',
      period: '/month',
      description: 'Perfect for getting started',
      savings: null,
      features: [
        'Enter golf scores every month',
        'Join monthly prize draws',
        'Support your chosen charity (min 10%)',
        'User dashboard & score history',
        'Draw results notifications'
      ]
    },
    {
      id: 'yearly',
      name: 'Yearly',
      price: '£99.99',
      period: '/year',
      description: 'Best value — 2 months free',
      savings: 'Save £19.89',
      features: [
        'Everything in Monthly',
        '2 months completely free',
        'Priority draw entry',
        'Exclusive yearly member badge',
        'Early access to new features'
      ]
    }
  ]

  const handleSubscribe = async () => {
    if (!user) return navigate('/signup')

    setLoading(true)
    setError('')

    try {
      const { url } = await createCheckout(selected)
      window.location.href = url
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8f8fc',
      fontFamily: "'DM Sans', sans-serif"
    }}>

      {/* ─── NAV ─── */}
      <nav style={{
        background: '#0f0f1a',
        padding: '1.2rem 6%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div
          onClick={() => navigate('/')}
          style={{
            fontFamily: 'Syne, sans-serif', fontWeight: 800,
            fontSize: '1.3rem', color: '#fff', cursor: 'pointer'
          }}>
          Golf<span style={{ color: '#6c63ff' }}>Gives</span>
        </div>
        {user && (
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'transparent', color: 'rgba(255,255,255,0.6)',
              border: 'none', fontSize: '0.9rem', cursor: 'pointer'
            }}>
            Back to Dashboard
          </button>
        )}
      </nav>

      {/* ─── HEADER ─── */}
      <div style={{
        background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)',
        padding: '4rem 6% 6rem',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'rgba(108,99,255,0.15)',
          border: '1px solid rgba(108,99,255,0.3)',
          color: '#a78bfa', padding: '6px 14px', borderRadius: '50px',
          fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.5px',
          marginBottom: '1.5rem'
        }}>
          <span style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: '#22c55e', display: 'inline-block'
          }} />
          NO LOCK-IN · CANCEL ANYTIME
        </div>

        <h1 style={{
          fontFamily: 'Syne, sans-serif',
          fontSize: 'clamp(2rem, 4vw, 3.2rem)',
          fontWeight: 800, color: '#fff',
          letterSpacing: '-1.5px', marginBottom: '1rem'
        }}>
          Choose your plan
        </h1>
        <p style={{
          color: 'rgba(255,255,255,0.55)',
          fontSize: '1.05rem', maxWidth: '450px',
          margin: '0 auto', lineHeight: 1.7
        }}>
          Start playing, winning, and giving back today.
          Every subscription supports a charity you choose.
        </p>
      </div>

      {/* ─── PLANS ─── */}
      <div style={{
        maxWidth: '860px', margin: '-3rem auto 0',
        padding: '0 6% 5rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '1.5rem',
        position: 'relative', zIndex: 1
      }}>
        {plans.map(plan => {
          const isSelected = selected === plan.id
          const isYearly = plan.id === 'yearly'

          return (
            <div
              key={plan.id}
              onClick={() => setSelected(plan.id)}
              style={{
                background: '#fff',
                borderRadius: '20px',
                padding: '2.5rem',
                border: `2px solid ${isSelected ? '#6c63ff' : '#e5e7eb'}`,
                cursor: 'pointer',
                transition: 'all 0.25s',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: isSelected
                  ? '0 20px 60px rgba(108,99,255,0.2)'
                  : '0 4px 20px rgba(0,0,0,0.05)',
                transform: isSelected ? 'translateY(-4px)' : 'translateY(0)'
              }}
            >
              {/* Top accent bar */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0,
                height: '4px',
                background: isSelected
                  ? 'linear-gradient(90deg, #6c63ff, #22c55e)'
                  : '#e5e7eb',
                transition: 'background 0.3s'
              }} />

              {/* Popular badge */}
              {isYearly && (
                <div style={{
                  position: 'absolute', top: '1.5rem', right: '1.5rem',
                  background: 'linear-gradient(135deg, #6c63ff, #4f46e5)',
                  color: '#fff', padding: '4px 12px', borderRadius: '50px',
                  fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.5px'
                }}>BEST VALUE</div>
              )}

              {/* Plan header */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{
                  fontSize: '0.8rem', fontWeight: 700,
                  color: '#6b7280', letterSpacing: '1px',
                  textTransform: 'uppercase', marginBottom: '0.5rem'
                }}>{plan.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{
                    fontFamily: 'Syne, sans-serif', fontSize: '3rem',
                    fontWeight: 800, color: '#1a1a2e', lineHeight: 1
                  }}>{plan.price}</span>
                  <span style={{ color: '#9ca3af', fontSize: '0.95rem' }}>{plan.period}</span>
                </div>
                <div style={{ fontSize: '0.88rem', color: '#6b7280', marginTop: '4px' }}>
                  {plan.description}
                </div>
                {plan.savings && (
                  <div style={{
                    display: 'inline-block',
                    background: 'rgba(34,197,94,0.1)',
                    color: '#16a34a', padding: '3px 10px',
                    borderRadius: '50px', fontSize: '0.78rem',
                    fontWeight: 600, marginTop: '8px'
                  }}>{plan.savings}</div>
                )}
              </div>

              {/* Divider */}
              <div style={{
                height: '1px', background: '#f3f4f6',
                marginBottom: '1.5rem'
              }} />

              {/* Features */}
              <div style={{
                display: 'flex', flexDirection: 'column', gap: '0.75rem',
                marginBottom: '2rem'
              }}>
                {plan.features.map((feature, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <div style={{
                      width: '20px', height: '20px', borderRadius: '50%',
                      background: isSelected
                        ? 'rgba(108,99,255,0.1)'
                        : 'rgba(34,197,94,0.1)',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', flexShrink: 0, marginTop: '1px'
                    }}>
                      <span style={{
                        color: isSelected ? '#6c63ff' : '#22c55e',
                        fontSize: '0.7rem', fontWeight: 700
                      }}>✓</span>
                    </div>
                    <span style={{ fontSize: '0.9rem', color: '#374151', lineHeight: 1.5 }}>
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              {/* Select indicator */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '0.75rem 1rem', borderRadius: '8px',
                background: isSelected ? 'rgba(108,99,255,0.06)' : '#f8f8fc',
                border: `1px solid ${isSelected ? 'rgba(108,99,255,0.2)' : '#e5e7eb'}`,
                transition: 'all 0.2s'
              }}>
                <div style={{
                  width: '18px', height: '18px', borderRadius: '50%',
                  border: `2px solid ${isSelected ? '#6c63ff' : '#d1d5db'}`,
                  background: isSelected ? '#6c63ff' : 'transparent',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', transition: 'all 0.2s', flexShrink: 0
                }}>
                  {isSelected && (
                    <div style={{
                      width: '6px', height: '6px',
                      borderRadius: '50%', background: '#fff'
                    }} />
                  )}
                </div>
                <span style={{
                  fontSize: '0.88rem', fontWeight: 600,
                  color: isSelected ? '#6c63ff' : '#6b7280'
                }}>
                  {isSelected ? `${plan.name} plan selected` : `Select ${plan.name}`}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* ─── CTA ─── */}
      <div style={{
        maxWidth: '860px', margin: '0 auto',
        padding: '0 6% 2rem',
        textAlign: 'center'
      }}>
        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca',
            borderRadius: '8px', padding: '0.8rem 1rem',
            color: '#ef4444', fontSize: '0.88rem', marginBottom: '1.5rem'
          }}>{error}</div>
        )}

        <button
          onClick={handleSubscribe}
          disabled={loading}
          style={{
            background: loading ? '#a78bfa' : '#6c63ff',
            color: '#fff', border: 'none',
            padding: '1.1rem 3rem', borderRadius: '12px',
            fontSize: '1.05rem', fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 8px 30px rgba(108,99,255,0.35)',
            transition: 'all 0.2s', marginBottom: '1rem'
          }}
          onMouseEnter={e => { if (!loading) e.target.style.transform = 'translateY(-2px)' }}
          onMouseLeave={e => { e.target.style.transform = 'translateY(0)' }}
        >
          {loading
            ? 'Redirecting to checkout...'
            : `Subscribe ${selected === 'yearly' ? 'Yearly' : 'Monthly'} →`}
        </button>

        <p style={{ fontSize: '0.82rem', color: '#9ca3af', marginBottom: '3rem' }}>
          Secure payment powered by Stripe · Cancel anytime · No hidden fees
        </p>

        {/* Trust badges */}
        <div style={{
          display: 'flex', justifyContent: 'center',
          gap: '2rem', flexWrap: 'wrap'
        }}>
          {[
            { icon: '🔒', text: 'Secure Checkout' },
            { icon: '↩️', text: 'Cancel Anytime' },
            { icon: '💚', text: 'Charity Guaranteed' },
            { icon: '🏆', text: 'Monthly Draws' }
          ].map((badge, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '0.82rem', color: '#6b7280'
            }}>
              <span>{badge.icon}</span>
              <span>{badge.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── FAQ ─── */}
      <div style={{
        background: '#fff', padding: '4rem 6%',
        maxWidth: '700px', margin: '0 auto'
      }}>
        <h2 style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 800,
          fontSize: '1.6rem', color: '#1a1a2e',
          letterSpacing: '-0.5px', marginBottom: '2rem',
          textAlign: 'center'
        }}>Common questions</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            {
              q: 'How does the prize draw work?',
              a: 'Each month, 5 winning numbers are drawn. Your last 5 golf scores are your entries. Match 3, 4, or 5 numbers to win a share of the prize pool.'
            },
            {
              q: 'How much goes to charity?',
              a: 'A minimum of 10% of your subscription fee goes to your chosen charity every month. You can increase this percentage any time from your dashboard.'
            },
            {
              q: 'Can I change my charity?',
              a: 'Yes — you can change your selected charity at any time from your account dashboard.'
            },
            {
              q: 'What happens if nobody wins the jackpot?',
              a: "If no one matches all 5 numbers, the jackpot rolls over to the next month's draw — making it even bigger."
            },
            {
              q: 'Can I cancel my subscription?',
              a: 'Yes, you can cancel at any time. Your access continues until the end of your current billing period.'
            }
          ].map((faq, i) => (
            <FaqItem key={i} question={faq.q} answer={faq.a} />
          ))}
        </div>
      </div>

    </div>
  )
}

// FAQ accordion item
const FaqItem = ({ question, answer }) => {
  const [open, setOpen] = useState(false)

  return (
    <div style={{
      border: '1px solid #e5e7eb', borderRadius: '10px',
      overflow: 'hidden', transition: 'border-color 0.2s'
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', background: open ? '#f8f8fc' : '#fff',
          border: 'none', padding: '1.1rem 1.4rem',
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', cursor: 'pointer',
          textAlign: 'left', transition: 'background 0.2s'
        }}
      >
        <span style={{
          fontSize: '0.95rem', fontWeight: 600,
          color: '#1a1a2e'
        }}>{question}</span>
        <span style={{
          color: '#6c63ff', fontSize: '1.2rem', fontWeight: 300,
          transform: open ? 'rotate(45deg)' : 'rotate(0)',
          transition: 'transform 0.2s', flexShrink: 0, marginLeft: '1rem'
        }}>+</span>
      </button>
      {open && (
        <div style={{
          padding: '0 1.4rem 1.1rem',
          fontSize: '0.9rem', color: '#6b7280', lineHeight: 1.7
        }}>
          {answer}
        </div>
      )}
    </div>
  )
}

export default Subscribe