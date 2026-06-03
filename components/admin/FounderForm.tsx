'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type FounderData = {
  id?: number; name: string; role: string; quote: string
  href: string; favicon: string; signal: string; sort_order: number; active: number; traits: string[]
}

const EMPTY: FounderData = { name: '', role: '', quote: '', href: '', favicon: '', signal: 'active', sort_order: 0, active: 1, traits: [''] }

const S = {
  field: { width: '100%', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#e8eaf2', padding: '11px 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', transition: 'border-color 0.15s' } as React.CSSProperties,
  label: { display: 'block', fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#5a6080', marginBottom: 7, fontWeight: 500 } as React.CSSProperties,
  section: { background: 'rgba(12,17,32,0.7)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '20px 22px', marginBottom: 16 } as React.CSSProperties,
  sectionTitle: { fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#333849', marginBottom: 16, fontWeight: 500 } as React.CSSProperties,
}

export default function FounderForm({ initial = EMPTY }: { initial?: FounderData }) {
  const [form, setForm] = useState<FounderData>({ ...EMPTY, ...initial })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const isEdit = !!initial.id

  function f(key: keyof FounderData, value: unknown) { setForm(p => ({ ...p, [key]: value })) }
  function setTrait(i: number, v: string) { const t = [...form.traits]; t[i] = v; f('traits', t) }

  const focusStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { e.target.style.borderColor = 'rgba(203,94,238,0.5)' }
  const blurStyle  = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)' }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError('')
    const payload = { ...form, traits: form.traits.filter(Boolean) }
    const res = await fetch(isEdit ? `/api/founders/${initial.id}` : '/api/founders', {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (res.ok) { router.push('/admin/founders'); router.refresh() }
    else { setError('Failed to save.'); setSaving(false) }
  }

  async function handleDelete() {
    if (!confirm('Delete this founder? This cannot be undone.')) return
    await fetch(`/api/founders/${initial.id}`, { method: 'DELETE' })
    router.push('/admin/founders'); router.refresh()
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div style={{ marginBottom: 16, padding: '12px 16px', borderRadius: 12, background: 'rgba(255,80,80,0.07)', border: '1px solid rgba(255,80,80,0.2)', fontSize: 13.5, color: '#ff6b6b' }}>{error}</div>
      )}

      {/* Identity */}
      <div style={S.section}>
        <div style={S.sectionTitle}>Identity</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={S.label}>Name</label>
            <input style={S.field} required value={form.name} onChange={e => f('name', e.target.value)} onFocus={focusStyle} onBlur={blurStyle} />
          </div>
          <div>
            <label style={S.label}>Role / title</label>
            <input style={S.field} value={form.role} onChange={e => f('role', e.target.value)} onFocus={focusStyle} onBlur={blurStyle} placeholder="Co-founder & CEO" />
          </div>
          <div>
            <label style={S.label}>Personal URL</label>
            <input style={S.field} value={form.href} onChange={e => f('href', e.target.value)} onFocus={focusStyle} onBlur={blurStyle} placeholder="https://kousha.dev" />
          </div>
          <div>
            <label style={S.label}>Avatar / favicon URL</label>
            <input style={S.field} value={form.favicon} onChange={e => f('favicon', e.target.value)} onFocus={focusStyle} onBlur={blurStyle} placeholder="https://..." />
          </div>
          <div>
            <label style={S.label}>Signal label</label>
            <input style={S.field} value={form.signal} onChange={e => f('signal', e.target.value)} onFocus={focusStyle} onBlur={blurStyle} placeholder="active" />
            <div style={{ fontSize: 11.5, color: '#5a6080', marginTop: 5 }}>Status shown on the founder card, e.g. "active", "advisor", "co-founder"</div>
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
            <div style={{ fontSize: 12, color: '#5a6080', marginTop: 2 }}>Show this founder on the homepage</div>
          </div>
          <button type="button" onClick={() => f('active', form.active ? 0 : 1)}
            style={{ width: 44, height: 24, borderRadius: 100, border: 'none', cursor: 'pointer', transition: 'background 0.2s', background: form.active ? '#cb5eee' : 'rgba(255,255,255,0.12)', position: 'relative', flexShrink: 0 }}>
            <span style={{ position: 'absolute', top: 3, left: form.active ? 22 : 3, width: 18, height: 18, borderRadius: '50%', background: form.active ? '#fff' : '#5a6080', transition: 'left 0.2s', display: 'block' }} />
          </button>
        </div>
      </div>

      {/* Quote */}
      <div style={S.section}>
        <div style={S.sectionTitle}>Quote</div>
        <textarea style={{ ...S.field, resize: 'none', height: 100 } as React.CSSProperties}
          value={form.quote} onChange={e => f('quote', e.target.value)} onFocus={focusStyle} onBlur={blurStyle}
          placeholder="A memorable quote shown on the homepage…" />
      </div>

      {/* Traits */}
      <div style={S.section}>
        <div style={S.sectionTitle}>Traits / tags</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {form.traits.map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input style={{ ...S.field, flex: 1 }} value={t} onChange={e => setTrait(i, e.target.value)} onFocus={focusStyle} onBlur={blurStyle} placeholder={`Trait ${i + 1}`} />
              <button type="button" onClick={() => f('traits', form.traits.filter((_, idx) => idx !== i))}
                style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'none', color: '#5a6080', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'color 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#ff6b6b' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#5a6080' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          ))}
          <button type="button" onClick={() => f('traits', [...form.traits, ''])}
            style={{ alignSelf: 'flex-start', marginTop: 4, fontSize: 13, color: '#cb5eee', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add trait
          </button>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
        <button type="submit" disabled={saving}
          style={{ borderRadius: 12, background: saving ? 'rgba(203,94,238,0.4)' : 'linear-gradient(135deg,#d97af5,#cb5eee)', color: '#fff', fontWeight: 700, fontSize: 14, padding: '12px 24px', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-display)', boxShadow: saving ? 'none' : '0 6px 20px -6px rgba(203,94,238,0.5)' }}>
          {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create founder'}
        </button>
        {isEdit && (
          <button type="button" onClick={handleDelete}
            style={{ borderRadius: 12, border: '1px solid rgba(255,80,80,0.25)', color: '#ff6b6b', background: 'none', fontSize: 14, padding: '11px 22px', cursor: 'pointer', fontFamily: 'var(--font-display)', transition: 'background 0.15s' }}
            onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,80,80,0.07)')}
            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = 'none')}>
            Delete founder
          </button>
        )}
      </div>
    </form>
  )
}
