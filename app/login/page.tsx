'use client'
import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError((data as { error?: string }).error || 'Something went wrong.')
        setLoading(false)
        return
      }
      setSent(true)
    } catch {
      setError('Network error — please try again.')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      position: 'relative',
      zIndex: 1,
    }}>

<div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}>

        {/* Brand mark */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 40 }}>
          <div style={{
            position: 'relative',
            width: 72, height: 72,
            marginBottom: 20,
          }}>
            {/* Outer glow ring */}
            <div aria-hidden style={{
              position: 'absolute', inset: -8,
              borderRadius: '50%',
              background: 'radial-gradient(ellipse at center, rgba(75,225,236,0.18) 0%, rgba(203,94,238,0.08) 50%, transparent 70%)',
              filter: 'blur(6px)',
              animation: 'breathe 4s ease-in-out infinite',
            }} />
            {/* Logo container */}
            <div style={{
              width: 72, height: 72,
              borderRadius: 20,
              background: 'rgba(12,17,32,0.9)',
              border: '1px solid rgba(75,225,236,0.25)',
              boxShadow: '0 0 0 1px rgba(203,94,238,0.1) inset, 0 20px 60px -10px rgba(75,225,236,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', overflow: 'hidden',
            }}>
              {/* Corner accent */}
              <div aria-hidden style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
                background: 'linear-gradient(180deg, rgba(75,225,236,0.06), transparent)',
                borderRadius: '20px 20px 0 0',
              }} />
              <svg width="48" height="48" viewBox="0 0 430 430" style={{ borderRadius: 4 }} aria-hidden>
                <use href="#ravenLogo" />
              </svg>
            </div>
          </div>

          {/* Brand name */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700, fontSize: 22,
              color: 'var(--ink)',
              letterSpacing: '-0.03em',
              marginBottom: 4,
            }}>
              IR<strong>aven</strong>
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              fontFamily: 'var(--font-display)',
              fontSize: 10.5, letterSpacing: '0.28em',
              textTransform: 'uppercase',
              color: 'var(--cyan)',
            }}>
              <span style={{ width: 20, height: 1, background: 'linear-gradient(90deg, transparent, var(--cyan))' }} />
              Mission Control
              <span style={{ width: 20, height: 1, background: 'linear-gradient(90deg, var(--cyan), transparent)' }} />
            </div>
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(8,11,22,0.85)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderTop: '1px solid rgba(75,225,236,0.18)',
          borderRadius: 'var(--r-lg)',
          padding: '32px 32px 28px',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 40px 80px -20px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.02) inset',
          position: 'relative', overflow: 'hidden',
        }}>

          {/* Top highlight streak */}
          <div aria-hidden style={{
            position: 'absolute', top: 0, left: '15%', right: '15%', height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(75,225,236,0.5), transparent)',
          }} />

          {sent ? (
            /* ── Success state ────────────────────────────── */
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{
                width: 56, height: 56,
                borderRadius: 16,
                background: 'rgba(75,225,236,0.07)',
                border: '1px solid rgba(75,225,236,0.18)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
                boxShadow: '0 0 24px rgba(75,225,236,0.12)',
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                </svg>
              </div>

              <h1 style={{
                fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600,
                color: 'var(--ink)', marginBottom: 8, letterSpacing: '-0.02em',
              }}>Check your inbox</h1>

              <p style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.65, marginBottom: 20 }}>
                A secure sign-in link was sent to<br />
                <span style={{ color: 'var(--ink-soft)', fontFamily: 'var(--font-display)', fontWeight: 500 }}>{email}</span>
              </p>

              <div style={{
                padding: '11px 14px',
                borderRadius: 10,
                background: 'rgba(75,225,236,0.05)',
                border: '1px solid rgba(75,225,236,0.12)',
                display: 'flex', alignItems: 'center', gap: 8,
                marginBottom: 20,
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--cyan)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                <span style={{ fontSize: 12, color: 'var(--cyan)', fontFamily: 'var(--font-display)', letterSpacing: '0.06em' }}>
                  Link expires in 15 minutes
                </span>
              </div>

              <button
                onClick={() => { setSent(false); setEmail('') }}
                style={{ fontSize: 12.5, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-display)' }}
              >
                ← Use a different email
              </button>
            </div>
          ) : (
            /* ── Login form ───────────────────────────────── */
            <>
              {/* Secure badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(46,232,196,0.05)',
                border: '1px solid rgba(46,232,196,0.14)',
                borderRadius: 100, padding: '4px 11px', marginBottom: 20,
              }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--teal)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <span style={{
                  fontFamily: 'var(--font-display)', fontSize: 10.5,
                  letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--teal)',
                }}>Secure access</span>
              </div>

              <h1 style={{
                fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700,
                color: 'var(--ink)', letterSpacing: '-0.03em', marginBottom: 6,
              }}>Sign in to admin</h1>
              <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 24, lineHeight: 1.6 }}>
                Enter your admin email — we&apos;ll send a magic link. No password needed.
              </p>

              <form onSubmit={handleSubmit}>
                <label style={{
                  display: 'block', fontSize: 11, fontFamily: 'var(--font-display)',
                  letterSpacing: '0.14em', textTransform: 'uppercase',
                  color: 'var(--muted)', marginBottom: 7,
                }}>
                  Email address
                </label>

                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{
                    width: '100%', borderRadius: 11,
                    background: 'rgba(255,255,255,0.035)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    color: 'var(--ink)', padding: '12px 14px',
                    fontSize: 14, outline: 'none', boxSizing: 'border-box',
                    fontFamily: 'var(--font-display)',
                    transition: 'border-color var(--dur) var(--ease), box-shadow var(--dur) var(--ease)',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = 'rgba(75,225,236,0.4)'
                    e.target.style.boxShadow = '0 0 0 3px rgba(75,225,236,0.07)'
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'rgba(255,255,255,0.09)'
                    e.target.style.boxShadow = 'none'
                  }}
                />

                {error && (
                  <div style={{
                    marginTop: 10, padding: '9px 13px', borderRadius: 9,
                    background: 'rgba(255,80,80,0.06)',
                    border: '1px solid rgba(255,80,80,0.18)',
                    fontSize: 12.5, color: '#ff7070',
                    display: 'flex', alignItems: 'center', gap: 7,
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    marginTop: 14, width: '100%', borderRadius: 11,
                    background: loading ? 'rgba(75,225,236,0.35)' : 'linear-gradient(135deg, #6df5ff 0%, #4be1ec 50%, #3ac8d8 100%)',
                    color: '#03111a', fontWeight: 700, fontSize: 13.5,
                    padding: '12px 20px', border: 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    transition: 'opacity 0.2s, box-shadow 0.2s, transform 0.1s',
                    boxShadow: loading ? 'none' : '0 8px 24px -6px rgba(75,225,236,0.45)',
                    fontFamily: 'var(--font-display)', letterSpacing: '0.02em',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}
                  onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 12px 32px -6px rgba(75,225,236,0.6)' }}
                  onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 24px -6px rgba(75,225,236,0.45)' }}
                >
                  {loading ? (
                    <>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 0.8s linear infinite' }}>
                        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                      </svg>
                      Sending link…
                    </>
                  ) : (
                    <>
                      Send magic link
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                      </svg>
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <p style={{ fontSize: 11.5, color: '#2a3050', fontFamily: 'var(--font-display)', letterSpacing: '0.06em' }}>
            Restricted access · Authorized admins only
          </p>
        </div>
      </div>
    </div>
  )
}
