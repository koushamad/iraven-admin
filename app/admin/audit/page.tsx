import { getWorkspaceDb } from '@/lib/db'
import AdminShell from '@/components/admin/AdminShell'

function Badge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    admin: '#cb5eee', user: '#4be1ec', system: '#f5c842',
  }
  const c = colors[status] || '#5a6080'
  return <span style={{ fontSize: 11.5, padding: '2px 8px', borderRadius: 5, background: c + '18', border: `1px solid ${c}40`, color: c, fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}>{status}</span>
}

function relativeTime(ts: number) {
  const diff = Math.floor(Date.now() / 1000) - ts
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return new Date(ts * 1000).toLocaleDateString()
}

export default function AuditPage() {
  const db = getWorkspaceDb()
  const logs = db.prepare(`
    SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100
  `).all() as {
    id: number; actor_email: string | null; actor_type: string
    playground_id: number | null; action: string; target: string | null
    metadata: string | null; created_at: number
  }[]

  return (
    <AdminShell title="Audit Log" subtitle="Last 100 platform events across all actors and workspaces." maxWidth={960}>
      <div style={{ background: 'rgba(12,17,32,0.7)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {['Action', 'Actor', 'Target', 'Metadata', 'When'].map(h => (
                <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontFamily: 'var(--font-display)', fontSize: 10.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#333849', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && (
              <tr><td colSpan={5} style={{ padding: '32px 14px', textAlign: 'center', color: '#333849', fontFamily: 'var(--font-display)', fontSize: 13 }}>No audit events yet.</td></tr>
            )}
            {logs.map((log, i) => (
              <tr key={log.id} style={{ borderBottom: i < logs.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 12.5, color: '#4be1ec' }}>{log.action}</span>
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12.5, color: '#a9aec5', fontFamily: 'var(--font-display)' }}>{log.actor_email || '—'}</span>
                    <Badge status={log.actor_type} />
                  </div>
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#7a8098' }}>{log.target || '—'}</span>
                </td>
                <td style={{ padding: '10px 14px' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 11.5, color: '#5a6080' }}>
                    {log.metadata ? JSON.stringify(log.metadata).slice(0, 60) : '—'}
                  </span>
                </td>
                <td style={{ padding: '10px 14px', fontSize: 12, color: '#5a6080', fontFamily: 'var(--font-display)', whiteSpace: 'nowrap' }}>
                  {relativeTime(log.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  )
}
