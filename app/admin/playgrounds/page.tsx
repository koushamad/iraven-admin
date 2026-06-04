'use client'
import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import AdminShell from '@/components/admin/AdminShell'

function Badge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: '#2ee8c4', completed: '#2ee8c4',
    pending_review: '#4be1ec', submitted: '#4be1ec', queued: '#f5c842', trialing: '#4be1ec', running: '#4be1ec',
    payment_failed: '#ff6b6b', locked: '#ff6b6b', suspended: '#ff6b6b', failed: '#ff6b6b',
    not_started: '#5a6080', not_configured: '#5a6080',
    approved: '#cb5eee',
  }
  const c = colors[status] || '#5a6080'
  return <span style={{ fontSize: 11.5, padding: '2px 8px', borderRadius: 5, background: c + '18', border: `1px solid ${c}40`, color: c, fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}>{status.replace(/_/g, ' ')}</span>
}

type Playground = {
  id: number; slug: string; display_name: string; owner_email: string | null
  status: string; billing_status: string; provisioning_status: string
  product_count: number; created_at: number
}

function relativeTime(ts: number) {
  const diff = Math.floor(Date.now() / 1000) - ts
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return new Date(ts * 1000).toLocaleDateString()
}

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(' ')
  const ini = (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? parts[0]?.[1] ?? '')
  return (
    <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,rgba(75,225,236,0.2),rgba(203,94,238,0.2))', border: '1px solid rgba(75,225,236,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, color: '#e8eaf2', flexShrink: 0 }}>
      {ini.toUpperCase()}
    </div>
  )
}

export default function PlaygroundsPage() {
  const router = useRouter()
  const [rows, setRows] = useState<Playground[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/playgrounds').then(r => r.json()).then((d: Playground[]) => { setRows(d); setLoading(false) })
  }, [])

  const filtered = useMemo(() => {
    if (!search) return rows
    const q = search.toLowerCase()
    return rows.filter(r => r.slug.toLowerCase().includes(q) || r.display_name.toLowerCase().includes(q) || (r.owner_email ?? '').toLowerCase().includes(q))
  }, [rows, search])

  return (
    <AdminShell title="Playgrounds" subtitle="All partner workspace instances." maxWidth={1000}>
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Search name or slug…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', maxWidth: 340, padding: '7px 14px', borderRadius: 9, fontSize: 13, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#d0d4e8', fontFamily: 'var(--font-display)', outline: 'none', boxSizing: 'border-box' }}
        />
      </div>

      <div style={{ background: 'rgba(12,17,32,0.7)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {['Workspace', 'Status', 'Billing', 'Provisioning', 'Products', 'Created'].map(h => (
                <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontFamily: 'var(--font-display)', fontSize: 10.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#333849', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} style={{ padding: '32px 14px', textAlign: 'center', color: '#333849', fontFamily: 'var(--font-display)', fontSize: 13 }}>Loading…</td></tr>}
            {!loading && filtered.length === 0 && <tr><td colSpan={6} style={{ padding: '32px 14px', textAlign: 'center', color: '#333849', fontFamily: 'var(--font-display)', fontSize: 13 }}>No playgrounds found.</td></tr>}
            {filtered.map((p, i) => (
              <tr key={p.id} onClick={() => router.push(`/admin/playgrounds/${p.slug}`)}
                style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', cursor: 'pointer', transition: 'background 0.12s' }}
                onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(255,255,255,0.025)'}
                onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}
              >
                <td style={{ padding: '10px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Initials name={p.display_name} />
                    <div>
                      <div style={{ fontSize: 13, color: '#d0d4e8', fontFamily: 'var(--font-display)', fontWeight: 500 }}>{p.display_name}</div>
                      <div style={{ fontFamily: 'monospace', fontSize: 11.5, color: '#4be1ec', marginTop: 2 }}>{p.slug}.iraven.io</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '10px 14px' }}><Badge status={p.status} /></td>
                <td style={{ padding: '10px 14px' }}><Badge status={p.billing_status} /></td>
                <td style={{ padding: '10px 14px' }}><Badge status={p.provisioning_status} /></td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ fontSize: 13, color: '#a9aec5', fontFamily: 'var(--font-display)' }}>{p.product_count}</span>
                </td>
                <td style={{ padding: '10px 14px', fontSize: 12, color: '#5a6080', fontFamily: 'var(--font-display)', whiteSpace: 'nowrap' }}>{relativeTime(p.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  )
}
