import { getDb } from '@/lib/db'
import Link from 'next/link'
import AdminShell from '@/components/admin/AdminShell'

export default function FoundersPage() {
  const db = getDb()
  const founders = db.prepare('SELECT * FROM founders ORDER BY sort_order,id').all() as {
    id: number; name: string; role: string; active: number
  }[]

  return (
    <AdminShell
      title="Founders"
      subtitle={`${founders.length} founder${founders.length !== 1 ? 's' : ''} on the team`}
      maxWidth={820}
      action={
        <Link href="/admin/founders/new" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 10, background: 'linear-gradient(135deg,#d97af5,#cb5eee)', color: '#fff', fontWeight: 700, fontSize: 13, padding: '10px 18px', textDecoration: 'none', fontFamily: 'var(--font-display)', whiteSpace: 'nowrap' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New founder
        </Link>
      }
    >
      <div style={{ background: 'rgba(12,17,32,0.7)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
        {founders.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: '#5a6080', fontSize: 14 }}>No founders yet. Add the first one.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {['Name', 'Role', 'Status', ''].map((h, i) => (
                  <th key={i} style={{ textAlign: i === 3 ? 'right' : 'left', padding: '12px 20px', fontSize: 10.5, color: '#5a6080', textTransform: 'uppercase', letterSpacing: '0.14em', fontFamily: 'var(--font-display)', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {founders.map((f, i) => (
                <tr key={f.id} style={{ borderBottom: i < founders.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 9, background: 'linear-gradient(135deg,rgba(203,94,238,0.2),rgba(75,225,236,0.2))', border: '1px solid rgba(203,94,238,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 11, fontWeight: 700, color: '#e8eaf2', fontFamily: 'var(--font-display)' }}>
                        {f.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span style={{ fontSize: 13.5, fontWeight: 500, color: '#e8eaf2', fontFamily: 'var(--font-display)' }}>{f.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#5a6080' }}>{f.role || '—'}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, background: f.active ? 'rgba(46,232,196,0.1)' : 'rgba(255,255,255,0.05)', color: f.active ? '#2ee8c4' : '#5a6080', border: `1px solid ${f.active ? 'rgba(46,232,196,0.2)' : 'rgba(255,255,255,0.08)'}`, fontFamily: 'var(--font-display)' }}>
                      {f.active ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <Link href={`/admin/founders/${f.id}`} style={{ fontSize: 12, color: '#cb5eee', textDecoration: 'none', fontFamily: 'var(--font-display)', opacity: 0.8 }}>Edit →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminShell>
  )
}
