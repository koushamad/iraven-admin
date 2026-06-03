'use client'
import { useState } from 'react'

type Row = { section: string; key: string; value: string; sort_order: number }

const LABELS: Record<string, string> = {
  // hero
  boot_0: 'Boot line 1', boot_1: 'Boot line 2', boot_2: 'Boot line 3', boot_3: 'Boot line 4',
  stat_0_v: 'Stat 1 — value', stat_0_k: 'Stat 1 — label',
  stat_1_v: 'Stat 2 — value', stat_1_k: 'Stat 2 — label',
  stat_2_v: 'Stat 3 — value', stat_2_k: 'Stat 3 — label',
  founder_node_label: 'Founder node label',
  // brand
  name: 'Brand name', tagline: 'Tagline',
  // contact
  email: 'Contact email',
  // legal
  chancegoal: 'ChanceGoal legal disclaimer',
  // engine
  eyebrow: 'Eyebrow text', title: 'Section title', lede: 'Section lede',
}

const SECTION_LABELS: Record<string, string> = {
  hero: 'Hero section', brand: 'Brand', contact: 'Contact', legal: 'Legal', engine: 'Engine',
}

const LONG_KEYS = new Set(['chancegoal', 'lede', 'tagline', 'title', 'boot_0', 'boot_1', 'boot_2', 'boot_3'])

const field: React.CSSProperties = { width: '100%', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#e8eaf2', padding: '10px 13px', fontSize: 13.5, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', transition: 'border-color 0.15s' }
const label: React.CSSProperties = { display: 'block', fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#5a6080', marginBottom: 6, fontWeight: 500 }

export default function ContentEditor({ initialRows, sections }: { initialRows: Row[]; sections: Record<string, Row[]> }) {
  const [rows, setRows] = useState<Row[]>(initialRows)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function update(section: string, key: string, value: string) {
    setRows(prev => prev.map(r => r.section === section && r.key === key ? { ...r, value } : r))
    setSaved(false)
  }

  function val(section: string, key: string) {
    return rows.find(r => r.section === section && r.key === key)?.value ?? ''
  }

  const focusCyan = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { e.target.style.borderColor = 'rgba(75,225,236,0.5)' }
  const blurReset = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }

  async function handleSave() {
    setSaving(true)
    const res = await fetch('/api/content', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(rows) })
    setSaving(false)
    setSaved(res.ok)
  }

  return (
    <div>
      {Object.entries(sections).map(([section, srows]) => (
        <div key={section} style={{ background: 'rgba(12,17,32,0.7)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '20px 22px', marginBottom: 14 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#4be1ec', marginBottom: 18, fontWeight: 500 }}>
            {SECTION_LABELS[section] ?? section}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {srows.map(r => {
              const current = val(r.section, r.key)
              const isLong = LONG_KEYS.has(r.key) || current.length > 80
              return (
                <div key={r.key}>
                  <label style={label}>{LABELS[r.key] ?? r.key.replace(/_/g, ' ')}</label>
                  {isLong ? (
                    <textarea style={{ ...field, resize: 'none', height: 72 } as React.CSSProperties} value={current}
                      onChange={e => update(r.section, r.key, e.target.value)} onFocus={focusCyan} onBlur={blurReset} />
                  ) : (
                    <input style={field} value={current}
                      onChange={e => update(r.section, r.key, e.target.value)} onFocus={focusCyan} onBlur={blurReset} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
        <button onClick={handleSave} disabled={saving}
          style={{ borderRadius: 12, background: saving ? 'rgba(75,225,236,0.4)' : 'linear-gradient(135deg,#6df5ff,#4be1ec)', color: '#04121a', fontWeight: 700, fontSize: 14, padding: '12px 24px', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-display)', boxShadow: saving ? 'none' : '0 6px 20px -6px rgba(75,225,236,0.5)' }}>
          {saving ? 'Saving…' : 'Save all changes'}
        </button>
        {saved && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: '#2ee8c4', fontFamily: 'var(--font-display)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Saved
          </div>
        )}
      </div>
    </div>
  )
}
