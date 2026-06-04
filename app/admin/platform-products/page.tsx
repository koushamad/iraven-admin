import AdminShell from '@/components/admin/AdminShell'

type Product = {
  key: string
  name: string
  tagline: string
  domain: string
  status: 'available' | 'beta' | 'coming_soon'
  accent: string
}

const PRODUCTS: Product[] = [
  {
    key: 'playground',
    name: 'Playground',
    tagline: 'Your isolated partner runtime',
    domain: 'workspace.iraven.io',
    status: 'available',
    accent: '#4be1ec',
  },
  {
    key: 'media',
    name: 'Media',
    tagline: 'Content, campaigns & publishing OS',
    domain: 'media.iraven.io',
    status: 'coming_soon',
    accent: '#d9b25f',
  },
  {
    key: 'database',
    name: 'Database',
    tagline: 'Managed visibility into your data layer',
    domain: 'database.iraven.io',
    status: 'coming_soon',
    accent: '#d9b25f',
  },
  {
    key: 'ai',
    name: 'AI',
    tagline: 'Practical AI for business operations',
    domain: 'ai.iraven.io',
    status: 'coming_soon',
    accent: '#d9b25f',
  },
  {
    key: 'agent',
    name: 'Agent',
    tagline: 'Controlled automations with oversight',
    domain: 'agent.iraven.io',
    status: 'coming_soon',
    accent: '#d9b25f',
  },
  {
    key: 'storage',
    name: 'Storage',
    tagline: 'Managed file storage & asset delivery',
    domain: 'storage.iraven.io',
    status: 'coming_soon',
    accent: '#d9b25f',
  },
  {
    key: 'advertise',
    name: 'Advertise',
    tagline: 'Plan advertising strategy',
    domain: 'advertise.iraven.io',
    status: 'coming_soon',
    accent: '#d9b25f',
  },
  {
    key: 'cloud',
    name: 'Cloud',
    tagline: 'Deployments, domains & GitOps visibility',
    domain: 'cloud.iraven.io',
    status: 'coming_soon',
    accent: '#d9b25f',
  },
]

const STATUS_LABEL: Record<Product['status'], string> = {
  available:    'Available',
  beta:         'Beta',
  coming_soon:  'Coming Soon',
}

const STATUS_STYLE: Record<Product['status'], { color: string; bg: string; border: string }> = {
  available:   { color: '#2ee8c4', bg: 'rgba(46,232,196,0.08)',  border: 'rgba(46,232,196,0.18)' },
  beta:        { color: '#cb5eee', bg: 'rgba(203,94,238,0.08)',  border: 'rgba(203,94,238,0.18)' },
  coming_soon: { color: '#d9b25f', bg: 'rgba(217,178,95,0.08)',  border: 'rgba(217,178,95,0.18)' },
}

export default function PlatformProductsPage() {
  return (
    <AdminShell
      title="Products"
      subtitle={`${PRODUCTS.length} products in the platform — defined in code`}
      maxWidth={860}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {PRODUCTS.map(p => {
          const ss = STATUS_STYLE[p.status]
          return (
            <div key={p.key} style={{
              background: 'rgba(11,15,29,0.8)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 14,
              padding: '18px 20px',
              display: 'flex',
              gap: 14,
              alignItems: 'flex-start',
            }}>
              {/* Dot */}
              <div style={{ marginTop: 3, width: 8, height: 8, borderRadius: '50%', background: p.accent, boxShadow: `0 0 7px ${p.accent}80`, flexShrink: 0 }} />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: '#e8eaf2' }}>{p.name}</span>
                  <span style={{ fontSize: 10.5, padding: '2px 8px', borderRadius: 100, background: ss.bg, border: `1px solid ${ss.border}`, color: ss.color, fontFamily: 'var(--font-display)', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                    {STATUS_LABEL[p.status]}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: '#5c6680', marginBottom: 8, lineHeight: 1.4 }}>{p.tagline}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: '#1e2438', letterSpacing: '0.03em' }}>{p.domain}</div>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: 20, padding: '14px 18px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: '#333849', letterSpacing: '0.06em' }}>
          Products are defined in{' '}
          <code style={{ color: '#4be1ec', background: 'rgba(75,225,236,0.08)', padding: '1px 6px', borderRadius: 4 }}>
            app/admin/platform-products/page.tsx
          </code>
        </span>
      </div>
    </AdminShell>
  )
}
