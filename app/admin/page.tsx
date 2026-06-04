import { getDb, getWorkspaceDb } from '@/lib/db'
import Link from 'next/link'
import DashboardRequestsTable from '@/components/admin/DashboardRequestsTable'

export default function AdminDashboard() {
  const db = getDb()
  const adb = getWorkspaceDb()

  // Web stats
  const productCount = (db.prepare('SELECT COUNT(*) as c FROM products WHERE active=1').get() as { c: number }).c
  const founderCount = (db.prepare('SELECT COUNT(*) as c FROM founders WHERE active=1').get() as { c: number }).c
  const engineCount  = (db.prepare('SELECT COUNT(*) as c FROM engine_systems WHERE active=1').get() as { c: number }).c

  // Workspace stats
  const pendingPlayground = (adb.prepare("SELECT COUNT(*) as c FROM playground_requests WHERE status IN ('submitted','pending_review')").get() as { c: number }).c
  const pendingProduct    = (adb.prepare("SELECT COUNT(*) as c FROM product_access_requests WHERE status IN ('submitted','pending_review')").get() as { c: number }).c
  const pendingRequests   = pendingPlayground + pendingProduct
  const activePlaygrounds = (adb.prepare("SELECT COUNT(*) as c FROM playgrounds WHERE status='active'").get() as { c: number }).c
  const failedPayments    = (adb.prepare("SELECT COUNT(*) as c FROM playgrounds WHERE billing_status='payment_failed'").get() as { c: number }).c
  const lockedCount       = (adb.prepare("SELECT COUNT(*) as c FROM playgrounds WHERE status='locked'").get() as { c: number }).c

  // Recent pending requests (last 5 combined)
  const recentPR = adb.prepare(`
    SELECT id, full_name, company_name, work_email, 'playground' as type, requested_slug as ref, status, created_at
    FROM playground_requests WHERE status IN ('submitted','pending_review')
    UNION ALL
    SELECT id, full_name, company_name, work_email, 'product-access' as type, product_key as ref, status, created_at
    FROM product_access_requests WHERE status IN ('submitted','pending_review')
    ORDER BY created_at DESC LIMIT 5
  `).all().map((r: unknown) => ({ ...(r as object) })) as {
    id: number; full_name: string; company_name: string; work_email: string
    type: string; ref: string; status: string; created_at: number
  }[]

  // Playgrounds needing attention
  const attentionPlaygrounds = adb.prepare(`
    SELECT slug, display_name, status, billing_status FROM playgrounds
    WHERE status IN ('payment_failed','locked','suspended')
  `).all().map((r: unknown) => ({ ...(r as object) })) as { slug: string; display_name: string; status: string; billing_status: string }[]

  const workspaceStats = [
    { label: 'Pending requests', value: pendingRequests, href: '/admin/requests', color: '#4be1ec', sub: 'Awaiting review' },
    { label: 'Active playgrounds', value: activePlaygrounds, href: '/admin/playgrounds', color: '#2ee8c4', sub: 'Running workspaces' },
    { label: 'Failed payments', value: failedPayments, href: '/admin/billing', color: failedPayments > 0 ? '#ff6b6b' : '#5a6080', sub: 'Needs attention' },
    { label: 'Locked', value: lockedCount, href: '/admin/playgrounds', color: lockedCount > 0 ? '#f5c842' : '#5a6080', sub: 'Access suspended' },
  ]

  const webStats = [
    { label: 'Live products', value: productCount, href: '/admin/products', color: '#4be1ec' },
    { label: 'Founders', value: founderCount, href: '/admin/founders', color: '#cb5eee' },
    { label: 'Engine systems', value: engineCount, href: '/admin/engine', color: '#2ee8c4' },
  ]

  return (
    <div style={{ padding: '36px 40px', maxWidth: 960 }}>

      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#2ee8c4', boxShadow: '0 0 8px #2ee8c4', display: 'inline-block' }} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#2ee8c4' }}>RavenOS v1</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: '#e8eaf2', letterSpacing: '-0.03em', margin: 0 }}>Mission Control</h1>
        <p style={{ color: '#333849', fontSize: 14, marginTop: 6 }}>Manage workspaces, requests, platform users, and content.</p>
      </div>

      {/* Attention banner */}
      {attentionPlaygrounds.length > 0 && (
        <div style={{ background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.2)', borderRadius: 12, padding: '14px 18px', marginBottom: 24, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: '#ff6b6b', marginBottom: 4 }}>Attention required</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {attentionPlaygrounds.map(p => (
                <Link key={p.slug} href={`/admin/playgrounds/${p.slug}`}
                  style={{ fontSize: 12, color: '#ff6b6b', fontFamily: 'var(--font-display)', textDecoration: 'none', background: 'rgba(255,107,107,0.1)', padding: '3px 10px', borderRadius: 6, border: '1px solid rgba(255,107,107,0.2)' }}>
                  {p.display_name} — {p.status.replace(/_/g, ' ')}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Workspace stats */}
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 10.5, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#333849', marginBottom: 12 }}>Workspace</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 32 }}>
        {workspaceStats.map(s => (
          <Link key={s.label} href={s.href} className="admin-stat-card" style={{ '--card-color': s.color } as React.CSSProperties}>
            <div className="admin-stat-glow" />
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 700, color: s.color, lineHeight: 1, letterSpacing: '-0.03em' }}>{s.value}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: '#a9aec5', marginTop: 6, fontWeight: 500 }}>{s.label}</div>
            <div style={{ fontSize: 11.5, color: '#333849', marginTop: 3 }}>{s.sub}</div>
          </Link>
        ))}
      </div>

      {/* Pending requests table */}
      {recentPR.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 10.5, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#333849' }}>Pending requests</div>
            <Link href="/admin/requests" style={{ fontSize: 11.5, color: '#4be1ec', fontFamily: 'var(--font-display)', textDecoration: 'none', opacity: 0.7 }}>View all →</Link>
          </div>
          <DashboardRequestsTable rows={recentPR} />
        </div>
      )}

      {/* Web content stats */}
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 10.5, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#333849', marginBottom: 12 }}>Web content</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
        {webStats.map(s => (
          <Link key={s.label} href={s.href} className="admin-stat-card" style={{ '--card-color': s.color } as React.CSSProperties}>
            <div className="admin-stat-glow" />
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, color: s.color, lineHeight: 1, letterSpacing: '-0.03em' }}>{s.value}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, color: '#a9aec5', marginTop: 6, fontWeight: 500 }}>{s.label}</div>
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
      `}</style>
    </div>
  )
}
