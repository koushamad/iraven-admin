'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

// ─── Icons ───────────────────────────────────────────────────────────────────

function IconDashboard() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
}
function IconAudit() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
}
function IconRequests() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>
}
function IconPlaygrounds() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
}
function IconProductAccess() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
}
function IconProvisioning() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>
}
function IconUsers() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
}
function IconPlatformProducts() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
}
function IconBilling() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
}
function IconAdmins() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
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
function IconLogout() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
}
function IconChevron({ open }: { open: boolean }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ transition: 'transform 0.2s', transform: open ? 'rotate(90deg)' : 'rotate(0deg)', flexShrink: 0 }}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}
function IconCollapseLeft() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
}
function IconCollapseRight() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
}

// ─── Data ─────────────────────────────────────────────────────────────────────

type NavItem = { href: string; label: string; icon: React.ReactNode }
type NavGroup = { id: string; label: string; color: string; items: NavItem[] }

const NAV_GROUPS: NavGroup[] = [
  {
    id: 'admin',
    label: 'Admin',
    color: '#cb5eee',
    items: [
      { href: '/admin', label: 'Dashboard', icon: <IconDashboard /> },
      { href: '/admin/admins', label: 'Admins', icon: <IconAdmins /> },
    ],
  },
  {
    id: 'workspace',
    label: 'Workspace',
    color: '#4be1ec',
    items: [
      { href: '/admin/requests', label: 'Requests', icon: <IconRequests /> },
      { href: '/admin/playgrounds', label: 'Playgrounds', icon: <IconPlaygrounds /> },
      { href: '/admin/product-access', label: 'Product Access', icon: <IconProductAccess /> },
      { href: '/admin/provisioning', label: 'Provisioning', icon: <IconProvisioning /> },
      { href: '/admin/users', label: 'Users', icon: <IconUsers /> },
      { href: '/admin/platform-products', label: 'Products', icon: <IconPlatformProducts /> },
      { href: '/admin/billing', label: 'Billing', icon: <IconBilling /> },
      { href: '/admin/audit', label: 'Audit', icon: <IconAudit /> },
    ],
  },
  {
    id: 'web',
    label: 'Web',
    color: '#f5c842',
    items: [
      { href: '/admin/products', label: 'Products', icon: <IconProducts /> },
      { href: '/admin/founders', label: 'Founders', icon: <IconFounders /> },
      { href: '/admin/hero', label: 'Hero', icon: <IconHero /> },
      { href: '/admin/engine', label: 'Engine', icon: <IconEngine /> },
    ],
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    admin: true, workspace: true, web: true,
  })
  const [loggingOut, setLoggingOut] = useState(false)

  const initials = email.slice(0, 2).toUpperCase()

  function toggleGroup(id: string) {
    setOpenGroups(prev => ({ ...prev, [id]: !prev[id] }))
  }

  async function handleLogout() {
    setLoggingOut(true)
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  function isActive(href: string) {
    return href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
  }

  function getBgRgb(color: string) {
    if (color === '#4be1ec') return '75,225,236'
    if (color === '#f5c842') return '245,200,66'
    if (color === '#cb5eee') return '203,94,238'
    return '75,225,236'
  }

  const sidebarWidth = collapsed ? 56 : 220

  return (
    <aside style={{
      width: sidebarWidth,
      flexShrink: 0,
      background: '#070a17',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      position: 'relative',
      transition: 'width 0.22s cubic-bezier(.4,0,.2,1)',
      overflow: 'hidden',
    }}>

      {/* Top glow */}
      <div aria-hidden style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 200, background: 'radial-gradient(ellipse 120% 60% at 50% -10%, rgba(75,225,236,0.06), transparent)', pointerEvents: 'none' }} />

      {/* Brand */}
      <div style={{ padding: '16px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'relative', display: 'flex', alignItems: 'center', gap: 10, minHeight: 64 }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(75,225,236,0.08)', border: '1px solid rgba(75,225,236,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="20" height="20" viewBox="0 0 430 430" aria-hidden><use href="#ravenLogo" /></svg>
        </div>
        {!collapsed && (
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: '#e8eaf2', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>IR<strong>aven</strong></div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 9.5, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#4be1ec', marginTop: 1, opacity: 0.8 }}>Admin</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 6px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto', overflowX: 'hidden' }}>
        {NAV_GROUPS.map(group => {
          const isOpen = openGroups[group.id] ?? true
          const hasActive = group.items.some(i => isActive(i.href))

          return (
            <div key={group.id} style={{ marginBottom: 4 }}>
              {/* Group header */}
              <button
                onClick={() => toggleGroup(group.id)}
                title={collapsed ? group.label : undefined}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: collapsed ? '8px 0' : '7px 10px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  borderRadius: 8,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: hasActive ? group.color : '#3a4060',
                  fontFamily: 'var(--font-display)',
                  fontSize: 10.5,
                  fontWeight: 600,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  transition: 'color 0.15s',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                }}
              >
                {/* Group color dot */}
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: group.color, flexShrink: 0, opacity: hasActive ? 1 : 0.35, boxShadow: hasActive ? `0 0 6px ${group.color}` : 'none', transition: 'opacity 0.2s, box-shadow 0.2s' }} />
                {!collapsed && (
                  <>
                    <span style={{ flex: 1, textAlign: 'left' }}>{group.label}</span>
                    <IconChevron open={isOpen} />
                  </>
                )}
              </button>

              {/* Group items */}
              <div style={{
                overflow: 'hidden',
                maxHeight: (!collapsed && isOpen) ? group.items.length * 48 : collapsed ? group.items.length * 48 : 0,
                transition: 'max-height 0.22s cubic-bezier(.4,0,.2,1)',
              }}>
                {group.items.map(item => {
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: collapsed ? '9px 0' : '8px 10px 8px 22px',
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        borderRadius: 9,
                        fontSize: 13,
                        fontFamily: 'var(--font-display)',
                        fontWeight: active ? 500 : 400,
                        textDecoration: 'none',
                        transition: 'background 0.15s, color 0.15s',
                        color: active ? group.color : '#4a5070',
                        background: active ? `rgba(${getBgRgb(group.color)},0.08)` : 'transparent',
                        borderLeft: (!collapsed && active) ? `2px solid ${group.color}60` : '2px solid transparent',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                      }}
                    >
                      <span style={{ opacity: active ? 1 : 0.55, flexShrink: 0, color: active ? group.color : 'currentColor' }}>{item.icon}</span>
                      {!collapsed && (
                        <>
                          <span style={{ flex: 1 }}>{item.label}</span>
                          {active && <span style={{ width: 5, height: 5, borderRadius: '50%', background: group.color, flexShrink: 0, boxShadow: `0 0 5px ${group.color}` }} />}
                        </>
                      )}
                    </Link>
                  )
                })}
              </div>

              {/* Group divider */}
              <div style={{ height: 1, background: 'rgba(255,255,255,0.04)', margin: '6px 4px 4px' }} />
            </div>
          )
        })}
      </nav>

      {/* Bottom: user + collapse */}
      <div style={{ padding: '6px 6px 10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(c => !c)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-end',
            gap: 6,
            padding: '7px 10px',
            borderRadius: 8,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#2a3050',
            transition: 'color 0.15s, background 0.15s',
            marginBottom: 4,
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#4be1ec'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(75,225,236,0.05)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#2a3050'; (e.currentTarget as HTMLButtonElement).style.background = 'none' }}
        >
          {collapsed ? <IconCollapseRight /> : <><span style={{ fontFamily: 'var(--font-display)', fontSize: 10.5, letterSpacing: '0.1em' }}>Collapse</span><IconCollapseLeft /></>}
        </button>

        {/* User chip */}
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', marginBottom: 4 }}>
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
        )}

        {/* Avatar when collapsed */}
        {collapsed && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: 'linear-gradient(135deg,rgba(75,225,236,0.3),rgba(203,94,238,0.3))', border: '1px solid rgba(75,225,236,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, color: '#e8eaf2' }}>
              {initials}
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          title={collapsed ? 'Sign out' : undefined}
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', justifyContent: collapsed ? 'center' : 'flex-start', borderRadius: 10, fontSize: 13, fontFamily: 'var(--font-display)', background: 'none', border: 'none', cursor: loggingOut ? 'not-allowed' : 'pointer', color: loggingOut ? '#333849' : '#4a5070', transition: 'color 0.15s, background 0.15s', textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden' }}
          onMouseEnter={e => { if (!loggingOut) { (e.currentTarget as HTMLButtonElement).style.color = '#ff6b6b'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,80,80,0.06)' } }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = loggingOut ? '#333849' : '#4a5070'; (e.currentTarget as HTMLButtonElement).style.background = 'none' }}
        >
          <IconLogout />
          {!collapsed && (loggingOut ? 'Signing out…' : 'Sign out')}
        </button>
      </div>
    </aside>
  )
}
