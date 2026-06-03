'use client'
import Link from 'next/link'

type Props = {
  title: string
  subtitle?: string
  backHref?: string
  backLabel?: string
  action?: React.ReactNode
  maxWidth?: number
  children: React.ReactNode
}

export default function AdminShell({ title, subtitle, backHref, backLabel = 'Back', action, maxWidth = 860, children }: Props) {
  return (
    <div style={{ padding: '36px 40px', maxWidth }}>
      {backHref && (
        <Link href={backHref} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: '#5a6080', textDecoration: 'none', marginBottom: 20, fontFamily: 'var(--font-display)', letterSpacing: '0.04em', transition: 'color 0.15s' }}
          onMouseEnter={e => ((e.target as HTMLElement).style.color = '#a9aec5')}
          onMouseLeave={e => ((e.target as HTMLElement).style.color = '#5a6080')}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          {backLabel}
        </Link>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: '#e8eaf2', letterSpacing: '-0.03em', margin: 0 }}>{title}</h1>
          {subtitle && <p style={{ color: '#5a6080', fontSize: 13.5, marginTop: 5 }}>{subtitle}</p>}
        </div>
        {action && <div style={{ flexShrink: 0, marginTop: 2 }}>{action}</div>}
      </div>

      {children}
    </div>
  )
}
