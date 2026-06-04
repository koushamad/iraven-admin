'use client'
import { useEffect, useState, useMemo } from 'react'
import AdminShell from '@/components/admin/AdminShell'

function Badge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: '#2ee8c4', disabled: '#5a6080', invited: '#a9aec5',
  }
  const c = colors[status] || '#5a6080'
  return <span style={{ fontSize: 11.5, padding: '2px 8px', borderRadius: 5, background: c + '18', border: `1px solid ${c}40`, color: c, fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}>{status}</span>
}

type PlatformUser = {
  id: number; email: string; full_name: string | null; status: string
  is_platform_admin: number; last_login_at: number | null; created_at: number
}

function Initials({ name, email }: { name: string | null; email: string }) {
  const n = name ?? email
  const parts = n.trim().split(/[\s@]/)
  const ini = (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? parts[0]?.[1] ?? '')
  return (
    <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,rgba(75,225,236,0.2),rgba(203,94,238,0.2))', border: '1px solid rgba(75,225,236,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, color: '#e8eaf2', flexShrink: 0 }}>
      {ini.toUpperCase()}
    </div>
  )
}

function relativeTime(ts: number | null) {
  if (!ts) return 'Never'
  const diff = Math.floor(Date.now() / 1000) - ts
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return new Date(ts * 1000).toLocaleDateString()
}

export default function UsersPage() {
  const [rows, setRows] = useState<PlatformUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/users').then(r => r.json()).then((d: PlatformUser[]) => { setRows(d); setLoading(false) })
  }, [])

  const filtered = useMemo(() => {
    if (!search) return rows
    const q = search.toLowerCase()
    return rows.filter(r => r.email.toLowerCase().includes(q) || (r.full_name ?? '').toLowerCase().includes(q))
  }, [rows, search])

  return (
    <AdminShell title="Platform Users" subtitle="All partner and admin users on the platform." maxWidth={900}>
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Search name or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', maxWidth: 340, padding: '7px 14px', borderRadius: 9, fontSize: 13, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#d0d4e8', fontFamily: 'var(--font-display)', outline: 'none', boxSizing: 'border-box' }}
        />
      </div>

      <div style={{ background: 'rgba(12,17,32,0.7)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              {['User', 'Type', 'Status', 'Last login'].map(h => (
                <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontFamily: 'var(--font-display)', fontSize: 10.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#333849', fontWeight: 600 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={4} style={{ padding: '32px 14px', textAlign: 'center', color: '#333849', fontFamily: 'var(--font-display)', fontSize: 13 }}>Loading…</td></tr>}
            {!loading && filtered.length === 0 && <tr><td colSpan={4} style={{ padding: '32px 14px', textAlign: 'center', color: '#333849', fontFamily: 'var(--font-display)', fontSize: 13 }}>No users found.</td></tr>}
            {filtered.map((u, i) => (
              <tr key={u.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <td style={{ padding: '10px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Initials name={u.full_name} email={u.email} />
                    <div>
                      <div style={{ fontSize: 13, color: '#d0d4e8', fontFamily: 'var(--font-display)', fontWeight: 500 }}>{u.full_name || u.email}</div>
                      <div style={{ fontFamily: 'monospace', fontSize: 11.5, color: '#5a6080', marginTop: 2 }}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '10px 14px' }}>
                  {u.is_platform_admin === 1 ? (
                    <span style={{ fontSize: 11.5, padding: '2px 8px', borderRadius: 5, background: 'rgba(203,94,238,0.1)', border: '1px solid rgba(203,94,238,0.25)', color: '#cb5eee', fontFamily: 'var(--font-display)' }}>IRaven Admin</span>
                  ) : (
                    <span style={{ fontSize: 11.5, padding: '2px 8px', borderRadius: 5, background: 'rgba(75,225,236,0.08)', border: '1px solid rgba(75,225,236,0.2)', color: '#4be1ec', fontFamily: 'var(--font-display)' }}>Partner</span>
                  )}
                </td>
                <td style={{ padding: '10px 14px' }}><Badge status={u.status} /></td>
                <td style={{ padding: '10px 14px', fontSize: 12, color: '#5a6080', fontFamily: 'var(--font-display)' }}>{relativeTime(u.last_login_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  )
}
