'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import AdminShell from '@/components/admin/AdminShell'

function Badge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: '#2ee8c4', enabled: '#2ee8c4', completed: '#2ee8c4',
    pending_review: '#4be1ec', submitted: '#4be1ec', queued: '#f5c842', trialing: '#4be1ec', requested: '#4be1ec',
    payment_failed: '#ff6b6b', locked: '#ff6b6b', suspended: '#ff6b6b', failed: '#ff6b6b',
    not_started: '#5a6080', not_configured: '#5a6080', not_requested: '#5a6080',
    approved: '#cb5eee',
  }
  const c = colors[status] || '#5a6080'
  return <span style={{ fontSize: 11.5, padding: '2px 8px', borderRadius: 5, background: c + '18', border: `1px solid ${c}40`, color: c, fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}>{status.replace(/_/g, ' ')}</span>
}

type PlaygroundDetail = {
  id: number; slug: string; display_name: string; owner_email: string | null
  status: string; billing_status: string; provisioning_status: string
  billing_email: string | null; pm_brand: string | null; pm_last4: string | null
  lock_reason: string | null; created_at: number; updated_at: number
  products: { product_key: string; status: string }[]
}

function KVRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'flex-start' }}>
      <div style={{ minWidth: 130, fontSize: 11.5, color: '#5a6080', fontFamily: 'var(--font-display)', letterSpacing: '0.04em', paddingTop: 2 }}>{label}</div>
      <div style={{ fontSize: 13, color: '#d0d4e8', fontFamily: 'var(--font-display)' }}>{value}</div>
    </div>
  )
}

export default function PlaygroundDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [pg, setPg] = useState<PlaygroundDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(false)

  async function load() {
    const data = await fetch(`/api/playgrounds/${slug}`).then(r => r.json())
    setPg(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [slug])

  async function doAction(action: string) {
    setActing(true)
    await fetch(`/api/playgrounds/${slug}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) })
    await load()
    setActing(false)
  }

  if (loading) return <AdminShell title="Playground" backHref="/admin/playgrounds" backLabel="Playgrounds"><div style={{ color: '#5a6080', fontFamily: 'var(--font-display)', fontSize: 13 }}>Loading…</div></AdminShell>
  if (!pg) return <AdminShell title="Not found" backHref="/admin/playgrounds" backLabel="Playgrounds"><div style={{ color: '#ff6b6b', fontFamily: 'var(--font-display)', fontSize: 13 }}>Playground not found.</div></AdminShell>

  const card = (children: React.ReactNode, style?: React.CSSProperties) => (
    <div style={{ background: 'rgba(12,17,32,0.7)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '20px 22px', ...style }}>{children}</div>
  )

  const enabledProducts = pg.products.filter(p => ['enabled', 'requested'].includes(p.status))

  return (
    <AdminShell title={pg.display_name} subtitle={`${pg.slug}.iraven.io`} backHref="/admin/playgrounds" backLabel="Playgrounds" maxWidth={900}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 260px', gap: 20, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {card(<>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#5a6080', marginBottom: 14 }}>Overview</div>
            <KVRow label="Owner" value={pg.owner_email ? <span style={{ fontFamily: 'monospace', fontSize: 12.5 }}>{pg.owner_email}</span> : <span style={{ color: '#5a6080' }}>—</span>} />
            <KVRow label="Status" value={<Badge status={pg.status} />} />
            <KVRow label="Billing" value={<Badge status={pg.billing_status} />} />
            <KVRow label="Provisioning" value={<Badge status={pg.provisioning_status} />} />
            {pg.billing_email && <KVRow label="Billing email" value={<span style={{ fontFamily: 'monospace', fontSize: 12.5 }}>{pg.billing_email}</span>} />}
            {pg.pm_brand && pg.pm_last4 && <KVRow label="Payment method" value={<span style={{ fontFamily: 'var(--font-display)', fontSize: 12.5 }}>{pg.pm_brand} ···· {pg.pm_last4}</span>} />}
            {pg.lock_reason && <KVRow label="Lock reason" value={<span style={{ color: '#ff6b6b', fontSize: 12.5 }}>{pg.lock_reason}</span>} />}
            <KVRow label="Created" value={new Date(pg.created_at * 1000).toLocaleDateString()} />
          </>)}

          {card(<>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#5a6080', marginBottom: 14 }}>Products</div>
            {enabledProducts.length === 0 && <div style={{ color: '#5a6080', fontSize: 13, fontFamily: 'var(--font-display)' }}>No products enabled.</div>}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {enabledProducts.map(p => (
                <div key={p.product_key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 12.5, color: '#4be1ec' }}>{p.product_key}</span>
                  <Badge status={p.status} />
                </div>
              ))}
            </div>
          </>)}
        </div>

        {/* Actions */}
        <div style={{ position: 'sticky', top: 24 }}>
          {card(<>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#5a6080', marginBottom: 14 }}>Actions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {pg.status === 'locked' ? (
                <button onClick={() => doAction('unlock')} disabled={acting} style={{ width: '100%', padding: '10px 16px', borderRadius: 9, fontSize: 13, fontFamily: 'var(--font-display)', background: 'rgba(46,232,196,0.1)', border: '1px solid rgba(46,232,196,0.25)', color: '#2ee8c4', cursor: acting ? 'not-allowed' : 'pointer', opacity: acting ? 0.6 : 1 }}>
                  Unlock
                </button>
              ) : (
                <button onClick={() => doAction('lock')} disabled={acting} style={{ width: '100%', padding: '10px 16px', borderRadius: 9, fontSize: 13, fontFamily: 'var(--font-display)', background: 'rgba(245,200,66,0.08)', border: '1px solid rgba(245,200,66,0.2)', color: '#f5c842', cursor: acting ? 'not-allowed' : 'pointer', opacity: acting ? 0.6 : 1 }}>
                  Lock
                </button>
              )}
              {pg.status !== 'suspended' && (
                <button onClick={() => doAction('suspend')} disabled={acting} style={{ width: '100%', padding: '10px 16px', borderRadius: 9, fontSize: 13, fontFamily: 'var(--font-display)', background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.2)', color: '#ff6b6b', cursor: acting ? 'not-allowed' : 'pointer', opacity: acting ? 0.6 : 1 }}>
                  Suspend
                </button>
              )}
              {pg.status === 'suspended' && (
                <button onClick={() => doAction('unlock')} disabled={acting} style={{ width: '100%', padding: '10px 16px', borderRadius: 9, fontSize: 13, fontFamily: 'var(--font-display)', background: 'rgba(46,232,196,0.1)', border: '1px solid rgba(46,232,196,0.25)', color: '#2ee8c4', cursor: acting ? 'not-allowed' : 'pointer', opacity: acting ? 0.6 : 1 }}>
                  Reactivate
                </button>
              )}
            </div>
          </>)}
        </div>
      </div>
    </AdminShell>
  )
}
