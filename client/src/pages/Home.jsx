import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'

const Home = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [scrolled, setScrolled] = useState(false)

  const handleLogout = () => {
    logout()
    window.location.assign('/login')
  }

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#f8f8fc', color: '#1a1a2e' }}>

      {/* ─── NAV ─── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '1rem 6%',
        background: scrolled ? 'rgba(15,15,26,0.97)' : 'transparent',
        backdropFilter: 'blur(12px)',
        transition: 'background 0.3s',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : 'none'
      }}>
        <div style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 800,
          fontSize: '1.3rem', color: '#fff', letterSpacing: '-0.5px'
        }}>
          Golf<span style={{ color: '#6c63ff' }}>Gives</span>
        </div>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          {['How It Works', 'Charities', 'Prize Draws'].map(link => (
            <a key={link} href={`#${link.toLowerCase().replace(/ /g, '-')}`} style={{
              color: 'rgba(255,255,255,0.7)', textDecoration: 'none',
              fontSize: '0.9rem', fontWeight: 500, transition: 'color 0.2s'
            }}
              onMouseEnter={e => e.target.style.color = '#fff'}
              onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.7)'}
            >{link}</a>
          ))}
          {user ? (
            <div style={{ display: 'flex', gap: '0.8rem' }}>
              <button onClick={() => navigate(user.role === 'admin' ? '/admin' : '/dashboard')} style={{
                background: '#6c63ff', color: '#fff', border: 'none',
                padding: '0.6rem 1.4rem', borderRadius: '8px',
                fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer'
              }}>Dashboard</button>
              <button onClick={handleLogout} style={{
                background: 'transparent', color: '#fff',
                border: '1px solid rgba(255,255,255,0.3)',
                padding: '0.6rem 1.4rem', borderRadius: '8px',
                fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer'
              }}>Logout</button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.8rem' }}>
              <button onClick={() => navigate('/login')} style={{
                background: 'transparent', color: '#fff',
                border: '1px solid rgba(255,255,255,0.3)',
                padding: '0.6rem 1.4rem', borderRadius: '8px',
                fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer'
              }}>Login</button>
              <button onClick={() => navigate('/subscribe')} style={{
                background: '#6c63ff', color: '#fff', border: 'none',
                padding: '0.6rem 1.4rem', borderRadius: '8px',
                fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer'
              }}>Get Started</button>
            </div>
          )}
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
        display: 'flex', alignItems: 'center',
        padding: '6rem 6% 4rem',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute', top: '20%', right: '10%',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', bottom: '10%', left: '5%',
          width: '300px', height: '300px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34,197,94,0.1) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ maxWidth: '700px', position: 'relative', zIndex: 1 }}>
          {/* Tag */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(108,99,255,0.15)',
            border: '1px solid rgba(108,99,255,0.3)',
            color: '#a78bfa', padding: '6px 14px', borderRadius: '50px',
            fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.5px',
            marginBottom: '1.5rem'
          }}>
            <span style={{
              width: '7px', height: '7px', borderRadius: '50%',
              background: '#22c55e', display: 'inline-block',
              animation: 'pulse 2s infinite'
            }} />
            PLAY · WIN · GIVE BACK
          </div>

          <h1 style={{
            fontFamily: 'Syne, sans-serif',
            fontSize: 'clamp(2.8rem, 6vw, 5rem)',
            fontWeight: 800, lineHeight: 1.05,
            letterSpacing: '-2px', color: '#fff',
            marginBottom: '1.2rem'
          }}>
            Golf that makes a <span style={{ color: '#22c55e' }}>difference</span>
          </h1>

          <p style={{
            fontSize: '1.15rem', color: 'rgba(255,255,255,0.6)',
            marginBottom: '2.5rem', lineHeight: 1.7, fontWeight: 300,
            maxWidth: '520px'
          }}>
            Subscribe, enter your scores, join monthly prize draws — and every round
            you play supports a charity you believe in.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/subscribe')} style={{
              background: '#6c63ff', color: '#fff', border: 'none',
              padding: '1rem 2rem', borderRadius: '10px',
              fontSize: '1rem', fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 8px 30px rgba(108,99,255,0.4)',
              transition: 'all 0.2s'
            }}
              onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 12px 40px rgba(108,99,255,0.5)' }}
              onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 8px 30px rgba(108,99,255,0.4)' }}
            >
              Start Playing →
            </button>
            <button onClick={() => document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' })} style={{
              background: 'transparent', color: '#fff',
              border: '1px solid rgba(255,255,255,0.2)',
              padding: '1rem 2rem', borderRadius: '10px',
              fontSize: '1rem', fontWeight: 500, cursor: 'pointer',
              transition: 'all 0.2s'
            }}
              onMouseEnter={e => e.target.style.borderColor = 'rgba(255,255,255,0.5)'}
              onMouseLeave={e => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
            >
              How it works
            </button>
          </div>

          {/* Stats */}
          <div style={{
            display: 'flex', gap: '3rem', marginTop: '4rem',
            flexWrap: 'wrap'
          }}>
            {[
              { num: '£10M+', label: 'In Prize Draws' },
              { num: '2,000+', label: 'Active Players' },
              { num: '50+', label: 'Charities Supported' }
            ].map(stat => (
              <div key={stat.label}>
                <div style={{
                  fontFamily: 'Syne, sans-serif', fontSize: '2rem',
                  fontWeight: 800, color: '#fff', lineHeight: 1
                }}>{stat.num}</div>
                <div style={{
                  fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)',
                  marginTop: '4px', letterSpacing: '0.3px'
                }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Hero Card */}
        <div style={{
          position: 'absolute', right: '6%', top: '50%',
          transform: 'translateY(-50%)',
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '20px', padding: '2rem',
          width: '280px',
          display: 'window.innerWidth > 1100 ? block : none'
        }}>
          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '1rem', letterSpacing: '1px' }}>THIS MONTH'S JACKPOT</div>
          <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '2.5rem', fontWeight: 800, color: '#22c55e' }}>£4,200</div>
          <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginBottom: '1.5rem' }}>5-Number Match Prize</div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1rem' }}>
            {[
              { tier: '4-Match', prize: '£1,800' },
              { tier: '3-Match', prize: '£900' }
            ].map(t => (
              <div key={t.tier} style={{
                display: 'flex', justifyContent: 'space-between',
                fontSize: '0.85rem', marginBottom: '8px'
              }}>
                <span style={{ color: 'rgba(255,255,255,0.5)' }}>{t.tier}</span>
                <span style={{ color: '#a78bfa', fontWeight: 600 }}>{t.prize}</span>
              </div>
            ))}
          </div>
          <button onClick={() => navigate('/subscribe')} style={{
            width: '100%', background: '#6c63ff', color: '#fff',
            border: 'none', padding: '0.8rem', borderRadius: '8px',
            fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
            marginTop: '1rem'
          }}>Enter This Draw</button>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" style={{ padding: '6rem 6%', background: '#fff' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{
            fontSize: '0.75rem', fontWeight: 700, letterSpacing: '2px',
            color: '#6c63ff', textTransform: 'uppercase', marginBottom: '0.8rem'
          }}>Simple Process</div>
          <h2 style={{
            fontFamily: 'Syne, sans-serif', fontSize: 'clamp(1.8rem, 3vw, 2.8rem)',
            fontWeight: 800, letterSpacing: '-1px', color: '#1a1a2e', marginBottom: '1rem'
          }}>How it works</h2>
          <p style={{ color: '#6b7280', maxWidth: '500px', margin: '0 auto', fontSize: '1rem' }}>
            Four simple steps to start playing, winning, and giving back.
          </p>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2rem', maxWidth: '1000px', margin: '0 auto'
        }}>
          {[
            { step: '01', icon: '📋', title: 'Subscribe', desc: 'Choose a monthly or yearly plan. Cancel anytime.' },
            { step: '02', icon: '⛳', title: 'Enter Scores', desc: 'Log your last 5 golf scores in Stableford format after each round.' },
            { step: '03', icon: '🎯', title: 'Join the Draw', desc: 'Your scores automatically enter you into the monthly prize draw.' },
            { step: '04', icon: '💚', title: 'Support Charity', desc: 'A portion of every subscription goes to your chosen charity.' }
          ].map((item, i) => (
            <div key={i} style={{
              background: '#f8f8fc', borderRadius: '16px',
              padding: '2rem', position: 'relative',
              border: '1px solid #e5e7eb',
              transition: 'all 0.2s'
            }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(108,99,255,0.1)'
                e.currentTarget.style.borderColor = '#6c63ff'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.borderColor = '#e5e7eb'
              }}
            >
              <div style={{
                fontFamily: 'Syne, sans-serif', fontSize: '0.75rem',
                fontWeight: 800, color: '#e5e7eb', letterSpacing: '1px',
                marginBottom: '1rem'
              }}>{item.step}</div>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{item.icon}</div>
              <h3 style={{
                fontFamily: 'Syne, sans-serif', fontWeight: 700,
                fontSize: '1.1rem', color: '#1a1a2e', marginBottom: '0.5rem'
              }}>{item.title}</h3>
              <p style={{ fontSize: '0.88rem', color: '#6b7280', lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CHARITY IMPACT ─── */}
      <section id="charities" style={{
        padding: '6rem 6%',
        background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)'
      }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '5rem', alignItems: 'center', maxWidth: '1100px', margin: '0 auto'
        }}>
          <div>
            <div style={{
              fontSize: '0.75rem', fontWeight: 700, letterSpacing: '2px',
              color: '#22c55e', textTransform: 'uppercase', marginBottom: '0.8rem'
            }}>Real Impact</div>
            <h2 style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: 'clamp(1.8rem, 3vw, 2.8rem)',
              fontWeight: 800, letterSpacing: '-1px',
              color: '#fff', marginBottom: '1.2rem', lineHeight: 1.1
            }}>
              Every round you play<br />
              <span style={{ color: '#22c55e' }}>funds a cause</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: '2rem' }}>
              When you subscribe, at least 10% goes directly to the charity
              you choose. You can increase this at any time — or make an
              independent donation on top.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { icon: '🏥', text: 'Support healthcare charities' },
                { icon: '🌱', text: 'Fund environmental causes' },
                { icon: '🎓', text: 'Back educational programmes' },
                { icon: '🐾', text: 'Help animal welfare organisations' }
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '8px',
                    background: 'rgba(34,197,94,0.1)',
                    border: '1px solid rgba(34,197,94,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1rem', flexShrink: 0
                  }}>{item.icon}</div>
                  <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem' }}>{item.text}</span>
                </div>
              ))}
            </div>
            <button onClick={() => navigate('/charities')} style={{
              marginTop: '2rem',
              background: '#22c55e', color: '#fff', border: 'none',
              padding: '0.9rem 1.8rem', borderRadius: '10px',
              fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer'
            }}>Browse Charities →</button>
          </div>

          {/* Impact Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {[
              { num: '£50K+', label: 'Donated to charities', color: '#22c55e' },
              { num: '120+', label: 'Monthly winners', color: '#6c63ff' },
              { num: '98%', label: 'Satisfaction rate', color: '#f59e0b' },
              { num: '30+', label: 'Partner charities', color: '#a78bfa' }
            ].map((card, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '14px', padding: '1.8rem',
                backdropFilter: 'blur(10px)'
              }}>
                <div style={{
                  fontFamily: 'Syne, sans-serif',
                  fontSize: '2rem', fontWeight: 800,
                  color: card.color, lineHeight: 1
                }}>{card.num}</div>
                <div style={{
                  fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)',
                  marginTop: '6px'
                }}>{card.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRIZE DRAWS ─── */}
      <section id="prize-draws" style={{ padding: '6rem 6%', background: '#fff' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{
            fontSize: '0.75rem', fontWeight: 700, letterSpacing: '2px',
            color: '#6c63ff', textTransform: 'uppercase', marginBottom: '0.8rem'
          }}>Monthly Draws</div>
          <h2 style={{
            fontFamily: 'Syne, sans-serif', fontSize: 'clamp(1.8rem, 3vw, 2.8rem)',
            fontWeight: 800, letterSpacing: '-1px', color: '#1a1a2e'
          }}>Three ways to win every month</h2>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.5rem', maxWidth: '900px', margin: '0 auto'
        }}>
          {[
            { match: '5-Number Match', prize: '40% of pool', icon: '🏆', color: '#6c63ff', note: 'Jackpot rolls over if unclaimed' },
            { match: '4-Number Match', prize: '35% of pool', icon: '🥈', color: '#22c55e', note: 'Split equally among winners' },
            { match: '3-Number Match', prize: '25% of pool', icon: '🥉', color: '#f59e0b', note: 'Split equally among winners' }
          ].map((tier, i) => (
            <div key={i} style={{
              background: '#f8f8fc', borderRadius: '16px',
              padding: '2rem', border: '1px solid #e5e7eb',
              textAlign: 'center', transition: 'all 0.2s',
              position: 'relative', overflow: 'hidden'
            }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.borderColor = tier.color
                e.currentTarget.style.boxShadow = `0 12px 40px ${tier.color}22`
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.borderColor = '#e5e7eb'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0,
                height: '3px', background: tier.color
              }} />
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{tier.icon}</div>
              <h3 style={{
                fontFamily: 'Syne, sans-serif', fontWeight: 700,
                fontSize: '1rem', color: '#1a1a2e', marginBottom: '0.5rem'
              }}>{tier.match}</h3>
              <div style={{
                fontFamily: 'Syne, sans-serif', fontSize: '1.5rem',
                fontWeight: 800, color: tier.color, marginBottom: '0.5rem'
              }}>{tier.prize}</div>
              <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>{tier.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA SECTION ─── */}
      <section style={{
        padding: '6rem 6%',
        background: 'linear-gradient(135deg, #6c63ff 0%, #4f46e5 100%)',
        textAlign: 'center'
      }}>
        <h2 style={{
          fontFamily: 'Syne, sans-serif',
          fontSize: 'clamp(2rem, 4vw, 3.5rem)',
          fontWeight: 800, color: '#fff',
          letterSpacing: '-1.5px', marginBottom: '1rem'
        }}>Ready to play your part?</h2>
        <p style={{
          color: 'rgba(255,255,255,0.75)', fontSize: '1.1rem',
          marginBottom: '2.5rem', maxWidth: '500px', margin: '0 auto 2.5rem'
        }}>
          Join thousands of golfers making a difference with every round they play.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/subscribe')} style={{
            background: '#fff', color: '#6c63ff', border: 'none',
            padding: '1rem 2.5rem', borderRadius: '10px',
            fontSize: '1rem', fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 8px 30px rgba(0,0,0,0.2)'
          }}>Subscribe Now</button>
          <button onClick={() => navigate('/charities')} style={{
            background: 'transparent', color: '#fff',
            border: '2px solid rgba(255,255,255,0.4)',
            padding: '1rem 2.5rem', borderRadius: '10px',
            fontSize: '1rem', fontWeight: 600, cursor: 'pointer'
          }}>Browse Charities</button>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{
        background: '#0f0f1a', padding: '2.5rem 6%',
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap', gap: '1rem'
      }}>
        <div style={{
          fontFamily: 'Syne, sans-serif', fontWeight: 800,
          color: '#fff', fontSize: '1.1rem'
        }}>
          Golf<span style={{ color: '#6c63ff' }}>Gives</span>
        </div>
        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)' }}>
          © 2026 GolfGives. All rights reserved.
        </div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          {['Privacy', 'Terms', 'Contact'].map(link => (
            <a key={link} href="#" style={{
              color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem',
              textDecoration: 'none', transition: 'color 0.2s'
            }}
              onMouseEnter={e => e.target.style.color = '#fff'}
              onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.4)'}
            >{link}</a>
          ))}
        </div>
      </footer>

    </div>
  )
}

export default Home
