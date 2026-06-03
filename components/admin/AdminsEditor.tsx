'use client'
import { useState } from 'react'

type Admin = { id: number; email: string; created_at: number }

function fmtDate(ts: number) {
  if (!ts) return '—'
  return new Date(ts * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function AdminsEditor({ initialAdmins }: { initialAdmins: Admin[] }) {
  const [admins, setAdmins] = useState(initialAdmins)
  const [newEmail, setNewEmail] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault(); setAdding(true); setError('')
    const res = await fetch('/api/admins', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: newEmail }) })
    if (res.ok) {
      const added = await res.json()
      setAdmins(prev => [...prev, added])
      setNewEmail('')
    } else {
      const d = await res.json()
      setError((d as { error?: string }).error ?? 'Failed to add admin')
    }
    setAdding(false)
  }

  async function handleRemove(id: number, email: string) {
    if (!confirm(`Remove ${email} from admin access?`)) return
    await fetch(`/api/admins/${id}`, { method: 'DELETE' })
    setAdmins(prev => prev.filter(a => a.id !== id))
  }

  return (
    <div>
      {/* Admin list */}
      <div style={{ background: 'rgba(12,17,32,0.7)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden', marginBottom: 20 }}>
        {admins.length === 0 ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', color: '#5a6080', fontSize: 14 }}>No admins yet.</div>
        ) : admins.map((a, i) => (
          <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: i < admins.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
            {/* Avatar */}
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,rgba(75,225,236,0.2),rgba(203,94,238,0.2))', border: '1px solid rgba(75,225,236,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, color: '#e8eaf2' }}>
              {a.email.slice(0, 2).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, color: '#e8eaf2', fontFamily: 'var(--font-display)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.email}</div>
              <div style={{ fontSize: 11.5, color: '#5a6080', marginTop: 2 }}>Added {fmtDate(a.created_at)}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#2ee8c4', fontFamily: 'var(--font-display)' }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#2ee8c4', display: 'inline-block' }} />
                Active
              </div>
              <button onClick={() => handleRemove(a.id, a.email)}
                style={{ fontSize: 12, color: '#5a6080', background: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', fontFamily: 'var(--font-display)', transition: 'color 0.15s, border-color 0.15s, background 0.15s' }}
                onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.color = '#ff6b6b'; b.style.borderColor = 'rgba(255,80,80,0.3)'; b.style.background = 'rgba(255,80,80,0.06)' }}
                onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.color = '#5a6080'; b.style.borderColor = 'rgba(255,255,255,0.08)'; b.style.background = 'none' }}>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add form */}
      <div style={{ background: 'rgba(12,17,32,0.7)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '20px 22px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#333849', marginBottom: 14, fontWeight: 500 }}>Add admin</div>
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: 10 }}>
          <input type="email" required value={newEmail} onChange={e => setNewEmail(e.target.value)}
            placeholder="new-admin@example.com"
            style={{ flex: 1, borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#e8eaf2', padding: '11px 14px', fontSize: 14, outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.15s' }}
            onFocus={e => (e.target.style.borderColor = 'rgba(75,225,236,0.5)')}
            onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
          />
          <button type="submit" disabled={adding}
            style={{ borderRadius: 10, background: adding ? 'rgba(75,225,236,0.4)' : 'linear-gradient(135deg,#6df5ff,#4be1ec)', color: '#04121a', fontWeight: 700, fontSize: 14, padding: '11px 20px', border: 'none', cursor: adding ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-display)', whiteSpace: 'nowrap' }}>
            {adding ? 'Adding…' : 'Add admin'}
          </button>
        </form>
        {error && (
          <div style={{ marginTop: 10, fontSize: 13, color: '#ff6b6b', display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
