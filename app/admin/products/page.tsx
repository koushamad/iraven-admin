import { getDb } from '@/lib/db'
import Link from 'next/link'
import AdminShell from '@/components/admin/AdminShell'

export default function ProductsPage() {
  const db = getDb()
  const products = db.prepare('SELECT * FROM products ORDER BY sort_order,id').all() as {
    id: number; name: string; domain: string; accent: string; active: number; category: string
  }[]

  const accentColor: Record<string, string> = { cyan: '#4be1ec', violet: '#cb5eee', gold: '#f5c842' }

  return (
    <AdminShell
      title="Products"
      subtitle={`${products.length} product${products.length !== 1 ? 's' : ''} in the constellation`}
      maxWidth={900}
      action={
        <Link href="/admin/products/new" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 10, background: 'linear-gradient(135deg,#6df5ff,#4be1ec)', color: '#04121a', fontWeight: 700, fontSize: 13, padding: '10px 18px', textDecoration: 'none', fontFamily: 'var(--font-display)', whiteSpace: 'nowrap' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New product
        </Link>
      }
    >
      <div style={{ background: 'rgba(12,17,32,0.7)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
        {products.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: '#5a6080', fontSize: 14 }}>No products yet. Add the first one.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {['Name', 'Domain', 'Category', 'Status', ''].map((h, i) => (
                  <th key={i} style={{ textAlign: i === 4 ? 'right' : 'left', padding: '12px 20px', fontSize: 10.5, color: '#5a6080', textTransform: 'uppercase', letterSpacing: '0.14em', fontFamily: 'var(--font-display)', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: i < products.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: accentColor[p.accent] ?? '#4be1ec', flexShrink: 0, boxShadow: `0 0 6px ${accentColor[p.accent] ?? '#4be1ec'}80` }} />
                      <span style={{ fontSize: 13.5, fontWeight: 500, color: '#e8eaf2', fontFamily: 'var(--font-display)' }}>{p.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#5a6080' }}>{p.domain || '—'}</td>
                  <td style={{ padding: '14px 20px', fontSize: 13, color: '#5a6080' }}>{p.category || '—'}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 100, background: p.active ? 'rgba(46,232,196,0.1)' : 'rgba(255,255,255,0.05)', color: p.active ? '#2ee8c4' : '#5a6080', border: `1px solid ${p.active ? 'rgba(46,232,196,0.2)' : 'rgba(255,255,255,0.08)'}`, fontFamily: 'var(--font-display)' }}>
                      {p.active ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <Link href={`/admin/products/${p.id}`} style={{ fontSize: 12, color: '#4be1ec', textDecoration: 'none', fontFamily: 'var(--font-display)', opacity: 0.8 }}>Edit →</Link>
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
