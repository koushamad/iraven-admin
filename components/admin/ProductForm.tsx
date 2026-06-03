'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type ProductData = {
  id?: number
  key: string; name: string; initial: string; orbit: number; category: string
  domain: string; href: string; accent: string; story: string; visual_label: string
  favicon: string; float_stat_k: string; float_stat_v: string; compliance: string
  sort_order: number; active: number; points: string[]
}

const EMPTY: ProductData = {
  key: '', name: '', initial: '', orbit: 1, category: '', domain: '', href: '',
  accent: 'cyan', story: '', visual_label: '', favicon: '', float_stat_k: '',
  float_stat_v: '', compliance: '', sort_order: 0, active: 1, points: [''],
}

const S = {
  field: { width: '100%', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#e8eaf2', padding: '11px 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', transition: 'border-color 0.15s' } as React.CSSProperties,
  label: { display: 'block', fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#5a6080', marginBottom: 7, fontWeight: 500 } as React.CSSProperties,
  section: { background: 'rgba(12,17,32,0.7)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '20px 22px', marginBottom: 16 } as React.CSSProperties,
  sectionTitle: { fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#333849', marginBottom: 16, fontWeight: 500 } as React.CSSProperties,
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 } as React.CSSProperties,
}

export default function ProductForm({ initial = EMPTY }: { initial?: ProductData }) {
  const [form, setForm] = useState<ProductData>({ ...EMPTY, ...initial })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const isEdit = !!initial.id

  function f(key: keyof ProductData, value: unknown) { setForm(p => ({ ...p, [key]: value })) }
  function setPoint(i: number, v: string) { const p = [...form.points]; p[i] = v; f('points', p) }
  function addPoint() { f('points', [...form.points, '']) }
  function removePoint(i: number) { f('points', form.points.filter((_, idx) => idx !== i)) }

  const focusStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => { e.target.style.borderColor = 'rgba(75,225,236,0.5)' }
  const blurStyle  = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError('')
    const payload = { ...form, points: form.points.filter(Boolean) }
    const res = await fetch(isEdit ? `/api/products/${initial.id}` : '/api/products', {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) { router.push('/admin/products'); router.refresh() }
    else { setError('Failed to save. Please try again.'); setSaving(false) }
  }

  async function handleDelete() {
    if (!confirm('Delete this product? This cannot be undone.')) return
    await fetch(`/api/products/${initial.id}`, { method: 'DELETE' })
    router.push('/admin/products'); router.refresh()
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div style={{ marginBottom: 16, padding: '12px 16px', borderRadius: 12, background: 'rgba(255,80,80,0.07)', border: '1px solid rgba(255,80,80,0.2)', fontSize: 13.5, color: '#ff6b6b', display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {error}
        </div>
      )}

      {/* Basic info */}
      <div style={S.section}>
        <div style={S.sectionTitle}>Basic info</div>
        <div style={S.grid2}>
          <div>
            <label style={S.label}>Name</label>
            <input style={S.field} required value={form.name} onChange={e => f('name', e.target.value)} onFocus={focusStyle} onBlur={blurStyle} placeholder="Zenory" />
          </div>
          <div>
            <label style={S.label}>Slug key</label>
            <input style={S.field} required value={form.key} onChange={e => f('key', e.target.value)} onFocus={focusStyle} onBlur={blurStyle} placeholder="zenory" />
          </div>
          <div>
            <label style={S.label}>Category</label>
            <input style={S.field} value={form.category} onChange={e => f('category', e.target.value)} onFocus={focusStyle} onBlur={blurStyle} placeholder="Wellness" />
          </div>
          <div>
            <label style={S.label}>Accent color</label>
            <select style={S.field} value={form.accent} onChange={e => f('accent', e.target.value)} onFocus={focusStyle} onBlur={blurStyle}>
              <option value="cyan">Cyan</option>
              <option value="violet">Violet</option>
              <option value="gold">Gold</option>
            </select>
          </div>
          <div>
            <label style={S.label}>Orbit number</label>
            <input type="number" style={S.field} value={form.orbit} onChange={e => f('orbit', +e.target.value)} onFocus={focusStyle} onBlur={blurStyle} />
          </div>
          <div>
            <label style={S.label}>Sort order</label>
            <input type="number" style={S.field} value={form.sort_order} onChange={e => f('sort_order', +e.target.value)} onFocus={focusStyle} onBlur={blurStyle} />
          </div>
        </div>

        {/* Active toggle */}
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 13.5, color: '#d0d4e8', fontWeight: 500 }}>Active</div>
            <div style={{ fontSize: 12, color: '#5a6080', marginTop: 2 }}>Show this product on the homepage</div>
          </div>
          <button type="button" onClick={() => f('active', form.active ? 0 : 1)}
            style={{ width: 44, height: 24, borderRadius: 100, border: 'none', cursor: 'pointer', transition: 'background 0.2s', background: form.active ? '#4be1ec' : 'rgba(255,255,255,0.12)', position: 'relative', flexShrink: 0 }}>
            <span style={{ position: 'absolute', top: 3, left: form.active ? 22 : 3, width: 18, height: 18, borderRadius: '50%', background: form.active ? '#04121a' : '#5a6080', transition: 'left 0.2s', display: 'block' }} />
          </button>
        </div>
      </div>

      {/* URLs */}
      <div style={S.section}>
        <div style={S.sectionTitle}>Links & media</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={S.label}>Domain</label>
            <input style={S.field} value={form.domain} onChange={e => f('domain', e.target.value)} onFocus={focusStyle} onBlur={blurStyle} placeholder="zenory.fit" />
          </div>
          <div>
            <label style={S.label}>URL</label>
            <input style={S.field} value={form.href} onChange={e => f('href', e.target.value)} onFocus={focusStyle} onBlur={blurStyle} placeholder="https://zenory.fit" />
          </div>
          <div>
            <label style={S.label}>Favicon URL</label>
            <input style={S.field} value={form.favicon} onChange={e => f('favicon', e.target.value)} onFocus={focusStyle} onBlur={blurStyle} placeholder="https://..." />
          </div>
          <div>
            <label style={S.label}>Initial (1–2 chars)</label>
            <input style={S.field} maxLength={2} value={form.initial} onChange={e => f('initial', e.target.value)} onFocus={focusStyle} onBlur={blurStyle} placeholder="Z" />
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <label style={S.label}>Visual label (iframe title)</label>
          <input style={S.field} value={form.visual_label} onChange={e => f('visual_label', e.target.value)} onFocus={focusStyle} onBlur={blurStyle} />
        </div>
      </div>

      {/* Content */}
      <div style={S.section}>
        <div style={S.sectionTitle}>Content</div>
        <div>
          <label style={S.label}>Story / description</label>
          <textarea style={{ ...S.field, resize: 'none', height: 96 } as React.CSSProperties} value={form.story} onChange={e => f('story', e.target.value)} onFocus={focusStyle} onBlur={blurStyle} />
        </div>
        <div style={{ marginTop: 14 }}>
          <label style={S.label}>Compliance note (optional)</label>
          <textarea style={{ ...S.field, resize: 'none', height: 64 } as React.CSSProperties} value={form.compliance} onChange={e => f('compliance', e.target.value)} onFocus={focusStyle} onBlur={blurStyle} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }}>
          <div>
            <label style={S.label}>Float stat label</label>
            <input style={S.field} value={form.float_stat_k} onChange={e => f('float_stat_k', e.target.value)} onFocus={focusStyle} onBlur={blurStyle} placeholder="Tonight" />
          </div>
          <div>
            <label style={S.label}>Float stat value</label>
            <input style={S.field} value={form.float_stat_v} onChange={e => f('float_stat_v', e.target.value)} onFocus={focusStyle} onBlur={blurStyle} placeholder="Sleep · 22 min" />
          </div>
        </div>
      </div>

      {/* Feature points */}
      <div style={S.section}>
        <div style={S.sectionTitle}>Feature points</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {form.points.map((pt, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: '#333849', width: 20, textAlign: 'center', flexShrink: 0 }}>{i + 1}</span>
              <input style={{ ...S.field, flex: 1 }} value={pt} onChange={e => setPoint(i, e.target.value)} onFocus={focusStyle} onBlur={blurStyle} placeholder={`Feature ${i + 1}`} />
              <button type="button" onClick={() => removePoint(i)}
                style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'none', color: '#5a6080', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'color 0.15s, border-color 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#ff6b6b'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,80,80,0.3)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#5a6080'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.1)' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          ))}
          <button type="button" onClick={addPoint}
            style={{ alignSelf: 'flex-start', marginTop: 4, fontSize: 13, color: '#4be1ec', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add point
          </button>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
        <button type="submit" disabled={saving}
          style={{ borderRadius: 12, background: saving ? 'rgba(75,225,236,0.4)' : 'linear-gradient(135deg,#6df5ff,#4be1ec)', color: '#04121a', fontWeight: 700, fontSize: 14, padding: '12px 24px', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: 8, boxShadow: saving ? 'none' : '0 6px 20px -6px rgba(75,225,236,0.5)' }}>
          {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create product'}
        </button>
        {isEdit && (
          <button type="button" onClick={handleDelete}
            style={{ borderRadius: 12, border: '1px solid rgba(255,80,80,0.25)', color: '#ff6b6b', background: 'none', fontSize: 14, padding: '11px 22px', cursor: 'pointer', fontFamily: 'var(--font-display)', transition: 'background 0.15s' }}
            onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,80,80,0.07)')}
            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = 'none')}>
            Delete product
          </button>
        )}
      </div>
    </form>
  )
}
