'use client'
import { useState } from 'react'

type System = { id: number; number: string; heading: string; description: string; sort_order: number; active: number }
type Capability = { id: number; capability: string; sort_order: number }
type ContentRow = { section: string; key: string; value: string; sort_order: number }

const field: React.CSSProperties = { width: '100%', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#e8eaf2', padding: '10px 13px', fontSize: 13.5, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', transition: 'border-color 0.15s' }
const lbl: React.CSSProperties = { display: 'block', fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#5a6080', marginBottom: 6, fontWeight: 500 }
const section: React.CSSProperties = { background: 'rgba(12,17,32,0.7)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '20px 22px', marginBottom: 14 }
const sectionTitle: React.CSSProperties = { fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#4be1ec', marginBottom: 18, fontWeight: 500 }

const CONTENT_LABELS: Record<string, string> = { eyebrow: 'Eyebrow text', title: 'Section title', lede: 'Lede / intro' }

export default function EngineEditor({ initialSystems, initialCapabilities, contentRows }: {
  initialSystems: System[]; initialCapabilities: Capability[]; contentRows: ContentRow[]
}) {
  const [systems, setSystems] = useState(initialSystems)
  const [caps, setCaps] = useState(initialCapabilities.map(c => c.capability))
  const [content, setContent] = useState(contentRows)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function updateSystem(i: number, key: keyof System, value: unknown) {
    setSystems(prev => prev.map((s, idx) => idx === i ? { ...s, [key]: value } : s)); setSaved(false)
  }
  function updateContent(key: string, value: string) {
    setContent(prev => prev.map(r => r.key === key ? { ...r, value } : r)); setSaved(false)
  }

  const fc = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { e.target.style.borderColor = 'rgba(75,225,236,0.5)' }
  const bc = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }

  async function handleSave() {
    setSaving(true)
    await Promise.all([
      fetch('/api/content', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(content) }),
      ...systems.map(s => fetch('/api/engine/systems/' + s.id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(s) })),
      fetch('/api/engine/capabilities', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(caps) }),
    ])
    setSaving(false); setSaved(true)
  }

  return (
    <div>
      {/* Section text */}
      <div style={section}>
        <div style={sectionTitle}>Section text</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {content.map(r => (
            <div key={r.key}>
              <label style={lbl}>{CONTENT_LABELS[r.key] ?? r.key}</label>
              <input style={field} value={r.value ?? ''} onChange={e => updateContent(r.key, e.target.value)} onFocus={fc} onBlur={bc} />
            </div>
          ))}
        </div>
      </div>

      {/* Systems */}
      <div style={section}>
        <div style={sectionTitle}>Engine systems</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {systems.map((s, i) => (
            <div key={s.id} style={{ padding: '16px 18px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: '#4be1ec', background: 'rgba(75,225,236,0.1)', border: '1px solid rgba(75,225,236,0.2)', borderRadius: 6, padding: '2px 8px', letterSpacing: '0.1em' }}>
                  {s.number || `0${i + 1}`}
                </span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.05)' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 10, marginBottom: 10 }}>
                <div>
                  <label style={lbl}>Number</label>
                  <input style={field} value={s.number} onChange={e => updateSystem(i, 'number', e.target.value)} onFocus={fc} onBlur={bc} />
                </div>
                <div>
                  <label style={lbl}>Heading</label>
                  <input style={field} value={s.heading} onChange={e => updateSystem(i, 'heading', e.target.value)} onFocus={fc} onBlur={bc} />
                </div>
              </div>
              <div>
                <label style={lbl}>Description</label>
                <textarea style={{ ...field, resize: 'none', height: 64 } as React.CSSProperties} value={s.description ?? ''}
                  onChange={e => updateSystem(i, 'description', e.target.value)} onFocus={fc} onBlur={bc} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Capabilities */}
      <div style={section}>
        <div style={sectionTitle}>Capabilities (tags)</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: caps.length ? 16 : 0 }}>
          {caps.map((c, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 0, background: 'rgba(75,225,236,0.07)', border: '1px solid rgba(75,225,236,0.18)', borderRadius: 100, overflow: 'hidden' }}>
              <input value={c} onChange={e => { const n=[...caps]; n[i]=e.target.value; setCaps(n); setSaved(false) }}
                style={{ background: 'none', border: 'none', color: '#4be1ec', fontSize: 12.5, fontFamily: 'var(--font-display)', letterSpacing: '0.08em', padding: '6px 12px 6px 14px', outline: 'none', minWidth: 60, maxWidth: 180 }} />
              <button type="button" onClick={() => { setCaps(caps.filter((_,idx)=>idx!==i)); setSaved(false) }}
                style={{ background: 'none', border: 'none', borderLeft: '1px solid rgba(75,225,236,0.15)', color: '#4be1ec', cursor: 'pointer', padding: '6px 10px', opacity: 0.5, fontSize: 13, lineHeight: 1 }}
                onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '1')}
                onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.opacity = '0.5')}>
                ✕
              </button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => { setCaps([...caps, '']); setSaved(false) }}
          style={{ fontSize: 13, color: '#4be1ec', background: 'rgba(75,225,236,0.06)', border: '1px dashed rgba(75,225,236,0.25)', borderRadius: 100, padding: '6px 16px', cursor: 'pointer', fontFamily: 'var(--font-display)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add capability
        </button>
      </div>

      {/* Save */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
