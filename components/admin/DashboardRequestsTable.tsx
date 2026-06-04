'use client'
import { useRouter } from 'next/navigation'

type RequestRow = {
  id: number
  company_name: string
  work_email: string
  type: string
  ref: string
  status: string
  created_at: number
}

function relativeTime(ts: number) {
  const diff = Math.floor(Date.now() / 1000) - ts
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function DashboardRequestsTable({ rows }: { rows: RequestRow[] }) {
  const router = useRouter()

  if (rows.length === 0) return null

  return (
    <div style={{ background: 'rgba(12,17,32,0.7)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <th style={{ padding: '10px 14px', textAlign: 'left', fontFamily: 'var(--font-display)', fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#333849', fontWeight: 600 }}>Company</th>
            <th style={{ padding: '10px 14px', textAlign: 'left', fontFamily: 'var(--font-display)', fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#333849', fontWeight: 600 }}>Type</th>
            <th style={{ padding: '10px 14px', textAlign: 'left', fontFamily: 'var(--font-display)', fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#333849', fontWeight: 600 }}>Ref</th>
            <th style={{ padding: '10px 14px', textAlign: 'left', fontFamily: 'var(--font-display)', fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#333849', fontWeight: 600 }}>When</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={`${r.type}-${r.id}`}
              onClick={() => router.push(`/admin/requests/${r.id}`)}
              style={{
                borderBottom: i < rows.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                cursor: 'pointer',
                transition: 'background 0.12s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <td style={{ padding: '10px 14px' }}>
                <div style={{ fontSize: 13, color: '#d0d4e8', fontFamily: 'var(--font-display)' }}>{r.company_name}</div>
                <div style={{ fontSize: 11.5, color: '#5a6080', marginTop: 2 }}>{r.work_email}</div>
              </td>
              <td style={{ padding: '10px 14px' }}>
                <span style={{ fontSize: 11.5, padding: '2px 8px', borderRadius: 5, background: r.type === 'playground' ? 'rgba(75,225,236,0.1)' : 'rgba(203,94,238,0.1)', color: r.type === 'playground' ? '#4be1ec' : '#cb5eee', fontFamily: 'var(--font-display)' }}>
                  {r.type === 'playground' ? 'Playground' : 'Product'}
                </span>
              </td>
              <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: 12.5, color: '#4be1ec' }}>{r.ref}</td>
              <td style={{ padding: '10px 14px', fontSize: 12, color: '#5a6080', fontFamily: 'var(--font-display)' }}>{relativeTime(r.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
