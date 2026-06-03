import { getDb } from '@/lib/db'
import Link from 'next/link'

export default function AdminDashboard() {
  const db = getDb()
  const productCount = (db.prepare('SELECT COUNT(*) as c FROM products WHERE active=1').get() as { c: number }).c
  const founderCount = (db.prepare('SELECT COUNT(*) as c FROM founders WHERE active=1').get() as { c: number }).c
  const engineCount  = (db.prepare('SELECT COUNT(*) as c FROM engine_systems WHERE active=1').get() as { c: number }).c
  const adminCount   = (db.prepare('SELECT COUNT(*) as c FROM admins').get() as { c: number }).c

  const stats = [
    { label: 'Live products', value: productCount, href: '/admin/products', color: '#4be1ec', sub: 'Orbiting the studio' },
    { label: 'Founders', value: founderCount, href: '/admin/founders', color: '#cb5eee', sub: 'Active profiles' },
    { label: 'Engine systems', value: engineCount, href: '/admin/engine', color: '#2ee8c4', sub: 'Shared infrastructure' },
    { label: 'Admin users', value: adminCount, href: '/admin/admins', color: '#f5c842', sub: 'Access granted' },
  ]

  const actions = [
    { href: '/admin/products/new', label: 'Add new product', sub: 'Create an orbiting product', color: '#4be1ec', icon: 'M12 5v14M5 12h14' },
    { href: '/admin/founders/new', label: 'Add founder', sub: 'Add a founder profile', color: '#cb5eee', icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
    { href: '/admin/hero', label: 'Edit hero section', sub: 'Boot sequence, stats, labels', color: '#2ee8c4', icon: 'M4 7V4h16v3M9 20h6M12 4v16' },
    { href: '/admin/engine', label: 'Edit engine', sub: 'Systems and capabilities', color: '#f5c842', icon: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14' },
  ]

  return (
    <div style={{ padding: '36px 40px', maxWidth: 920 }}>

      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#2ee8c4', boxShadow: '0 0 8px #2ee8c4', display: 'inline-block' }} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#2ee8c4' }}>RavenOS v1</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: '#e8eaf2', letterSpacing: '-0.03em', margin: 0 }}>Mission Control</h1>
        <p style={{ color: '#333849', fontSize: 14, marginTop: 6 }}>Manage your IRaven content, products, and team.</p>
      </div>

      {/* Stats grid */}
      <div className="admin-stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 32 }}>
        {stats.map(s => (
          <Link key={s.label} href={s.href} className="admin-stat-card" style={{ '--card-color': s.color } as React.CSSProperties}>
            <div className="admin-stat-glow" />
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700, color: s.color, lineHeight: 1, letterSpacing: '-0.03em' }}>{s.value}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: '#a9aec5', marginTop: 6, fontWeight: 500 }}>{s.label}</div>
            <div style={{ fontSize: 11.5, color: '#333849', marginTop: 3 }}>{s.sub}</div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 10.5, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#333849', marginBottom: 12 }}>Quick actions</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {actions.map(a => (
          <Link key={a.href} href={a.href} className="admin-action-card" style={{ '--card-color': a.color } as React.CSSProperties}>
            <div className="admin-action-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={a.icon} />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 500, color: '#d0d4e8', fontFamily: 'var(--font-display)' }}>{a.label}</div>
              <div style={{ fontSize: 11.5, color: '#333849', marginTop: 2 }}>{a.sub}</div>
            </div>
            <svg style={{ marginLeft: 'auto', flexShrink: 0, color: '#333849' }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </Link>
        ))}
      </div>

      <style>{`
        .admin-stat-card {
          display: block; text-decoration: none; border-radius: 16px;
          background: rgba(12,17,32,0.7); border: 1px solid rgba(255,255,255,0.07);
          padding: 20px 22px; transition: border-color .2s, box-shadow .2s;
          position: relative; overflow: hidden;
        }
        .admin-stat-card:hover { border-color: color-mix(in srgb, var(--card-color) 30%, transparent); box-shadow: 0 0 30px -10px color-mix(in srgb, var(--card-color) 40%, transparent); }
        .admin-stat-glow { position:absolute;top:-30px;right:-20px;width:90px;height:90px;border-radius:50%;background:var(--card-color);opacity:.06;filter:blur(20px);pointer-events:none; }
        .admin-action-card {
          display: flex; align-items: center; gap: 14; text-decoration: none;
          border-radius: 14px; background: rgba(12,17,32,0.7);
          border: 1px solid rgba(255,255,255,0.07); padding: 16px 18px;
          transition: border-color .2s; gap: 14px;
        }
        .admin-action-card:hover { border-color: color-mix(in srgb, var(--card-color) 30%, transparent); }
        .admin-action-icon {
          width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0;
          background: color-mix(in srgb, var(--card-color) 10%, transparent);
          border: 1px solid color-mix(in srgb, var(--card-color) 25%, transparent);
          display: flex; align-items: center; justify-content: center;
          color: var(--card-color);
        }
      `}</style>
    </div>
  )
}
