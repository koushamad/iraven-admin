import { getWorkspaceDb } from '@/lib/db'
import AdminShell from '@/components/admin/AdminShell'
import Link from 'next/link'

type Playground = {
  id: number; slug: string; display_name: string; status: string
  billing_status: string; billing_email: string | null
  pm_brand: string | null; pm_last4: string | null
}

function Badge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: '#2ee8c4', trialing: '#4be1ec',
    payment_failed: '#ff6b6b', locked: '#ff6b6b', suspended: '#ff6b6b',
    not_configured: '#5a6080', grace_period: '#f5c842',
  }
  const c = colors[status] || '#5a6080'
  return <span style={{ fontSize: 11.5, padding: '2px 8px', borderRadius: 5, background: c + '18', border: `1px solid ${c}40`, color: c, fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}>{status.replace(/_/g, ' ')}</span>
}

export default function BillingPage() {
  const db = getWorkspaceDb()
  const playgrounds = db.prepare('SELECT * FROM playgrounds ORDER BY created_at DESC').all() as Playground[]

  const activeSubs = playgrounds.filter(p => p.billing_status === 'active').length
  const trialing = playgrounds.filter(p => p.billing_status === 'trialing').length
  const failed = playgrounds.filter(p => p.billing_status === 'payment_failed').length
  const notConfigured = playgrounds.filter(p => p.billing_status === 'not_configured').length

  // Placeholder MRR: $100/mo per active
  const mrr = activeSubs * 100

  const stats = [
    { label: 'Active subscriptions', value: activeSubs, color: '#2ee8c4' },
    { label: 'Trialing', value: trialing, color: '#4be1ec' },
    { label: 'MRR', value: `$${mrr}`, color: '#f5c842' },
    { label: 'Failed payments', value: failed, color: failed > 0 ? '#ff6b6b' : '#5a6080' },
  ]

  return (
    <AdminShell title="Billing" subtitle="Subscription and payment status across all workspaces." maxWidth={920}>
      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 28 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: 'rgba(12,17,32,0.7)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -20, right: -15, width: 70, height: 70, borderRadius: '50%', background: s.color, opacity: 0.06, filter: 'blur(16px)', pointerEvents: 'none' }} />
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 700, color: s.color, lineHeight: 1, letterSpacing: '-0.03em' }}>{s.value}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: '#a9aec5', marginTop: 6 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: 'rgba(12,17,32,0.7)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {['Playground', 'Plan', 'Billing status', 'Billing email', 'Payment'].map(h => (
                <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontFamily: 'var(--font-display)', fontSize: 10.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#333849', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {playgrounds.length === 0 && <tr><td colSpan={5} style={{ padding: '32px 14px', textAlign: 'center', color: '#333849', fontFamily: 'var(--font-display)', fontSize: 13 }}>No playgrounds.</td></tr>}
            {playgrounds.map((p, i) => (
              <tr key={p.id} style={{ borderBottom: i < playgrounds.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <td style={{ padding: '10px 14px' }}>
                  <Link href={`/admin/playgrounds/${p.slug}`} style={{ textDecoration: 'none' }}>
                    <div style={{ fontSize: 13, color: '#d0d4e8', fontFamily: 'var(--font-display)', fontWeight: 500 }}>{p.display_name}</div>
                    <div style={{ fontFamily: 'monospace', fontSize: 11.5, color: '#4be1ec', marginTop: 2 }}>{p.slug}</div>
                  </Link>
                </td>
                <td style={{ padding: '10px 14px', fontSize: 12.5, color: '#7a8098', fontFamily: 'var(--font-display)' }}>
                  {p.billing_status === 'not_configured' ? '—' : '$100 / mo'}
                </td>
                <td style={{ padding: '10px 14px' }}><Badge status={p.billing_status} /></td>
                <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: 12, color: '#5a6080' }}>{p.billing_email || '—'}</td>
                <td style={{ padding: '10px 14px', fontSize: 12.5, color: '#7a8098', fontFamily: 'var(--font-display)' }}>
                  {p.pm_brand && p.pm_last4 ? `${p.pm_brand} ···· ${p.pm_last4}` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  )
}
