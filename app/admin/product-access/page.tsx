import { getWorkspaceDb } from '@/lib/db'
import AdminShell from '@/components/admin/AdminShell'

type Row = { id: number; slug: string; display_name: string }
type ProductStatus = { playground_id: number; product_key: string; status: string }
type CatalogProduct = { key: string; name: string }

function StatusCell({ status }: { status: string | undefined }) {
  if (!status || status === 'not_requested') return <span style={{ color: '#3a4060', fontFamily: 'var(--font-display)', fontSize: 12 }}>—</span>
  const colors: Record<string, string> = {
    enabled: '#2ee8c4',
    requested: '#4be1ec',
    locked: '#ff6b6b',
    suspended: '#ff6b6b',
  }
  const c = colors[status] || '#5a6080'
  return <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 5, background: c + '15', border: `1px solid ${c}35`, color: c, fontFamily: 'var(--font-display)' }}>{status}</span>
}

export default function ProductAccessPage() {
  const db = getWorkspaceDb()
  const playgrounds = db.prepare('SELECT id, slug, display_name FROM playgrounds ORDER BY created_at ASC').all() as Row[]
  const products = db.prepare('SELECT playground_id, product_key, status FROM playground_products').all() as ProductStatus[]
  const catalog = db.prepare('SELECT key, name FROM catalog_products ORDER BY sort_order').all() as CatalogProduct[]

  // Build lookup: playground_id -> product_key -> status
  const lookup: Record<number, Record<string, string>> = {}
  for (const p of products) {
    if (!lookup[p.playground_id]) lookup[p.playground_id] = {}
    lookup[p.playground_id][p.product_key] = p.status
  }

  return (
    <AdminShell title="Product Access" subtitle="Product enablement matrix across all playgrounds." maxWidth={1100}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'rgba(12,17,32,0.7)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <th style={{ padding: '11px 16px', textAlign: 'left', fontFamily: 'var(--font-display)', fontSize: 10.5, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#333849', fontWeight: 600, minWidth: 160 }}>Playground</th>
              {catalog.map(c => (
                <th key={c.key} style={{ padding: '11px 10px', textAlign: 'center', fontFamily: 'monospace', fontSize: 11, color: '#4be1ec', fontWeight: 600, whiteSpace: 'nowrap', minWidth: 80 }}>{c.key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {playgrounds.map((pg, i) => (
              <tr key={pg.id} style={{ borderBottom: i < playgrounds.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <td style={{ padding: '10px 16px' }}>
                  <div style={{ fontSize: 13, color: '#d0d4e8', fontFamily: 'var(--font-display)', fontWeight: 500 }}>{pg.display_name}</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#5a6080', marginTop: 2 }}>{pg.slug}</div>
                </td>
                {catalog.map(c => (
                  <td key={c.key} style={{ padding: '10px 10px', textAlign: 'center' }}>
                    <StatusCell status={lookup[pg.id]?.[c.key]} />
                  </td>
                ))}
              </tr>
            ))}
            {playgrounds.length === 0 && (
              <tr><td colSpan={catalog.length + 1} style={{ padding: '32px 16px', textAlign: 'center', color: '#333849', fontFamily: 'var(--font-display)', fontSize: 13 }}>No playgrounds yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  )
}
