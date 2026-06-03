'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

type NavItem = { href: string; label: string; icon: React.ReactNode }

function IconDashboard() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
}
function IconProducts() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="8"/><line x1="12" y1="16" x2="12" y2="22"/><line x1="2" y1="12" x2="8" y2="12"/><line x1="16" y1="12" x2="22" y2="12"/></svg>
}
function IconFounders() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
}
function IconHero() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
}
function IconEngine() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M4.93 4.93a10 10 0 0 0 0 14.14"/><path d="M16.24 7.76a6 6 0 0 1 0 8.48"/><path d="M7.76 7.76a6 6 0 0 0 0 8.48"/></svg>
}
function IconAdmins() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
}
function IconLogout() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
}

const NAV: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: <IconDashboard /> },
  { href: '/admin/products', label: 'Products', icon: <IconProducts /> },
  { href: '/admin/founders', label: 'Founders', icon: <IconFounders /> },
  { href: '/admin/hero', label: 'Hero', icon: <IconHero /> },
  { href: '/admin/engine', label: 'Engine', icon: <IconEngine /> },
  { href: '/admin/admins', label: 'Admins', icon: <IconAdmins /> },
]

export default function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname()
  const [loggingOut, setLoggingOut] = useState(false)

  const initials = email.slice(0, 2).toUpperCase()

  async function handleLogout() {
    setLoggingOut(true)
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  return (
    <aside style={{ width: 220, flexShrink: 0, background: '#070a17', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>

      {/* Top glow */}
      <div aria-hidden style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 200, background: 'radial-gradient(ellipse 120% 60% at 50% -10%, rgba(75,225,236,0.06), transparent)', pointerEvents: 'none' }} />

      {/* Brand */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(75,225,236,0.08)', border: '1px solid rgba(75,225,236,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 430 430" aria-hidden>
              <use href="#ravenLogo" />
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: '#e8eaf2', letterSpacing: '-0.02em' }}>IR<strong>aven</strong></div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 9.5, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#4be1ec', marginTop: 1, opacity: 0.8 }}>Admin</div>
          </div>
        </div>
      </div>

      {/* Nav label */}
      <div style={{ padding: '16px 16px 6px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#333849', fontWeight: 500 }}>Navigation</div>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '0 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map(item => {
          const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 12px',
                borderRadius: 10,
                fontSize: 13.5,
                fontFamily: 'var(--font-display)',
                fontWeight: active ? 500 : 400,
                textDecoration: 'none',
                transition: 'background 0.15s, color 0.15s',
                color: active ? '#4be1ec' : '#5a6080',
                background: active ? 'rgba(75,225,236,0.09)' : 'transparent',
                borderLeft: active ? '2px solid rgba(75,225,236,0.6)' : '2px solid transparent',
                position: 'relative',
              }}
            >
              <span style={{ opacity: active ? 1 : 0.6, flexShrink: 0 }}>{item.icon}</span>
              {item.label}
              {active && (
                <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: '#4be1ec', flexShrink: 0, boxShadow: '0 0 6px #4be1ec' }} />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom user section */}
      <div style={{ padding: '8px 8px 12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {/* User chip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', marginBottom: 4 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,rgba(75,225,236,0.3),rgba(203,94,238,0.3))', border: '1px solid rgba(75,225,236,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, color: '#e8eaf2' }}>
            {initials}
          </div>
          <div style={{ overflow: 'hidden', minWidth: 0 }}>
            <div style={{ fontSize: 11.5, color: '#a9aec5', fontFamily: 'var(--font-display)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#2ee8c4', flexShrink: 0 }} />
              <span style={{ fontSize: 10, color: '#2ee8c4', fontFamily: 'var(--font-display)', letterSpacing: '0.06em' }}>Active session</span>
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, fontSize: 13, fontFamily: 'var(--font-display)', background: 'none', border: 'none', cursor: loggingOut ? 'not-allowed' : 'pointer', color: loggingOut ? '#333849' : '#5a6080', transition: 'color 0.15s, background 0.15s', textAlign: 'left' }}
          onMouseEnter={e => { if (!loggingOut) { (e.currentTarget as HTMLButtonElement).style.color = '#ff6b6b'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,80,80,0.06)' } }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = loggingOut ? '#333849' : '#5a6080'; (e.currentTarget as HTMLButtonElement).style.background = 'none' }}
        >
          <IconLogout />
          {loggingOut ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
    </aside>
  )
}
