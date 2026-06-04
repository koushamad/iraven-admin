'use client'
import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import AdminShell from '@/components/admin/AdminShell'

function Badge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: '#2ee8c4', available: '#2ee8c4', enabled: '#2ee8c4', completed: '#2ee8c4', succeeded: '#2ee8c4',
    pending_review: '#4be1ec', submitted: '#4be1ec', requested: '#4be1ec', running: '#4be1ec', trialing: '#4be1ec',
    payment_failed: '#ff6b6b', locked: '#ff6b6b', rejected: '#ff6b6b', failed: '#ff6b6b', suspended: '#ff6b6b',
    needs_info: '#f5c842', grace_period: '#f5c842', queued: '#f5c842',
    invited: '#a9aec5', disabled: '#5a6080', not_started: '#5a6080', not_configured: '#5a6080',
    approved: '#cb5eee', converted: '#cb5eee',
  }
  const c = colors[status] || '#5a6080'
  return <span style={{ fontSize: 11.5, padding: '2px 8px', borderRadius: 5, background: c + '18', border: `1px solid ${c}40`, color: c, fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}>{status.replace(/_/g, ' ')}</span>
}

type RequestRow = {
  id: number; full_name: string; company_name: string; work_email: string
  type: 'playground' | 'product-access'; ref: string; source_page: string | null
  status: string; created_at: number
}

function relativeTime(ts: number) {
  const diff = Math.floor(Date.now() / 1000) - ts
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function RequestsPage() {
  const router = useRouter()
  const [rows, setRows] = useState<RequestRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'playground' | 'product'>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/requests').then(r => r.json()).then((data: RequestRow[]) => { setRows(data); setLoading(false) })
  }, [])

  const filtered = useMemo(() => {
    let r = rows
    if (filter === 'pending') r = r.filter(x => ['submitted', 'pending_review'].includes(x.status))
    if (filter === 'playground') r = r.filter(x => x.type === 'playground')
    if (filter === 'product') r = r.filter(x => x.type === 'product-access')
    if (search) {
      const q = search.toLowerCase()
      r = r.filter(x =>
        x.company_name.toLowerCase().includes(q) ||
        x.work_email.toLowerCase().includes(q) ||
        x.ref.toLowerCase().includes(q)
      )
    }
    return r
  }, [rows, filter, search])

  const pills: { key: typeof filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'playground', label: 'Playground' },
    { key: 'product', label: 'Product' },
  ]

  return (
    <AdminShell title="Requests" subtitle="Incoming playground and product access requests." maxWidth={980}>
      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {pills.map(p => (
            <button key={p.key} onClick={() => setFilter(p.key)} style={{
              padding: '5px 14px', borderRadius: 20, fontSize: 12.5, fontFamily: 'var(--font-display)',
              cursor: 'pointer', border: 'none', transition: 'all 0.15s',
              background: filter === p.key ? 'rgba(75,225,236,0.12)' : 'rgba(255,255,255,0.04)',
              color: filter === p.key ? '#4be1ec' : '#5a6080',
              outline: filter === p.key ? '1px solid rgba(75,225,236,0.3)' : '1px solid rgba(255,255,255,0.06)',
            }}>{p.label}</button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search company, email, slug…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1, minWidth: 200, padding: '7px 14px', borderRadius: 9, fontSize: 13,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            color: '#d0d4e8', fontFamily: 'var(--font-display)', outline: 'none',
          }}
        />
      </div>

      <div style={{ background: 'rgba(12,17,32,0.7)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {['Requester', 'Type', 'Requested', 'Source', 'Status', 'When'].map(h => (
                <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontFamily: 'var(--font-display)', fontSize: 10.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#333849', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} style={{ padding: '32px 14px', textAlign: 'center', color: '#333849', fontFamily: 'var(--font-display)', fontSize: 13 }}>Loading…</td></tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={6} style={{ padding: '32px 14px', textAlign: 'center', color: '#333849', fontFamily: 'var(--font-display)', fontSize: 13 }}>No requests found.</td></tr>
            )}
            {filtered.map((r, i) => (
              <tr key={`${r.type}-${r.id}`}
                onClick={() => router.push(`/admin/requests/${r.id}`)}
                style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', cursor: 'pointer', transition: 'background 0.12s' }}
                onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = 'rgba(255,255,255,0.025)'}
                onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = 'transparent'}
              >
                <td style={{ padding: '10px 14px' }}>
                  <div style={{ fontSize: 13, color: '#d0d4e8', fontFamily: 'var(--font-display)', fontWeight: 500 }}>{r.company_name}</div>
                  <div style={{ fontSize: 11.5, color: '#5a6080', marginTop: 2 }}>{r.work_email}</div>
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ fontSize: 11.5, padding: '2px 8px', borderRadius: 5,
                    background: r.type === 'playground' ? 'rgba(75,225,236,0.1)' : 'rgba(203,94,238,0.1)',
                    color: r.type === 'playground' ? '#4be1ec' : '#cb5eee',
                    fontFamily: 'var(--font-display)', border: `1px solid ${r.type === 'playground' ? 'rgba(75,225,236,0.2)' : 'rgba(203,94,238,0.2)'}` }}>
                    {r.type === 'playground' ? 'Playground' : 'Product'}
                  </span>
                </td>
                <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: 12.5, color: '#4be1ec' }}>{r.ref}</td>
                <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: 11.5, color: '#5a6080' }}>{r.source_page || '—'}</td>
                <td style={{ padding: '10px 14px' }}><Badge status={r.status} /></td>
                <td style={{ padding: '10px 14px', fontSize: 12, color: '#5a6080', fontFamily: 'var(--font-display)', whiteSpace: 'nowrap' }}>{relativeTime(r.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  )
}
