'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import AdminShell from '@/components/admin/AdminShell'

function Badge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: '#2ee8c4', available: '#2ee8c4', enabled: '#2ee8c4', completed: '#2ee8c4',
    pending_review: '#4be1ec', submitted: '#4be1ec', requested: '#4be1ec',
    payment_failed: '#ff6b6b', locked: '#ff6b6b', rejected: '#ff6b6b', failed: '#ff6b6b',
    needs_info: '#f5c842', queued: '#f5c842',
    approved: '#cb5eee', converted: '#cb5eee',
    disabled: '#5a6080', not_started: '#5a6080',
  }
  const c = colors[status] || '#5a6080'
  return <span style={{ fontSize: 11.5, padding: '2px 8px', borderRadius: 5, background: c + '18', border: `1px solid ${c}40`, color: c, fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}>{status.replace(/_/g, ' ')}</span>
}

type RequestDetail = {
  id: number; type: string; full_name: string; work_email: string; company_name: string
  status: string; created_at: number; updated_at: number
  requested_slug?: string; interested_products?: string; source_page?: string
  product_key?: string; playground_slug?: string; use_case?: string
  notes: { id: number; author_email: string; body: string; created_at: number }[]
}

const PLATFORM_PRODUCTS = [
  { key: 'playground', name: 'Playground',  required: true },
  { key: 'media',      name: 'Media',        required: false },
  { key: 'database',   name: 'Database',     required: false },
  { key: 'ai',         name: 'AI',           required: false },
  { key: 'agent',      name: 'Agent',        required: false },
  { key: 'storage',    name: 'Storage',      required: false },
  { key: 'advertise',  name: 'Advertise',    required: false },
  { key: 'cloud',      name: 'Cloud',        required: false },
]

function relativeTime(ts: number) {
  const diff = Math.floor(Date.now() / 1000) - ts
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return new Date(ts * 1000).toLocaleDateString()
}

function KVRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', alignItems: 'flex-start' }}>
      <div style={{ minWidth: 130, fontSize: 11.5, color: '#5a6080', fontFamily: 'var(--font-display)', letterSpacing: '0.04em', paddingTop: 2 }}>{label}</div>
      <div style={{ fontSize: 13, color: '#d0d4e8', fontFamily: 'var(--font-display)' }}>{value}</div>
    </div>
  )
}

type ActionStep = 'idle' | 'selecting' | 'note_info' | 'note_reject'

export default function RequestDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [req, setReq] = useState<RequestDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(false)
  const [noteBody, setNoteBody] = useState('')
  const [addingNote, setAddingNote] = useState(false)
  const [actionStep, setActionStep] = useState<ActionStep>('idle')
  const [actionNote, setActionNote] = useState('')
  const [selectedProducts, setSelectedProducts] = useState<string[]>(['playground'])

  async function load() {
    const res = await fetch(`/api/requests/${id}`)
    const data = await res.json()
    setReq(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [id])

  function toggleProduct(key: string) {
    if (key === 'playground') return
    setSelectedProducts(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  function cancelAction() {
    setActionStep('idle')
    setActionNote('')
  }

  async function confirmApprove() {
    setActing(true)
    await fetch(`/api/requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve', products: selectedProducts }),
    })
    await load()
    setActing(false)
    setActionStep('idle')
  }

  async function confirmNeedsInfo() {
    setActing(true)
    await fetch(`/api/requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'needs_info', note: actionNote }),
    })
    await load()
    setActing(false)
    setActionNote('')
    setActionStep('idle')
  }

  async function confirmReject() {
    setActing(true)
    await fetch(`/api/requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reject', note: actionNote }),
    })
    await load()
    setActing(false)
    setActionNote('')
    setActionStep('idle')
  }

  async function addNote() {
    if (!noteBody.trim()) return
    setAddingNote(true)
    await fetch(`/api/requests/${id}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: noteBody }),
    })
    setNoteBody('')
    await load()
    setAddingNote(false)
  }

  if (loading) return (
    <AdminShell title="Request" backHref="/admin/requests" backLabel="Requests">
      <div style={{ color: '#5a6080', fontFamily: 'var(--font-display)', fontSize: 13 }}>Loading…</div>
    </AdminShell>
  )

  if (!req) return (
    <AdminShell title="Not found" backHref="/admin/requests" backLabel="Requests">
      <div style={{ color: '#ff6b6b', fontFamily: 'var(--font-display)', fontSize: 13 }}>Request not found.</div>
    </AdminShell>
  )

  const isLocked = req.status === 'approved' || req.status === 'converted'

  const card = (children: React.ReactNode, style?: React.CSSProperties) => (
    <div style={{ background: 'rgba(12,17,32,0.7)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '20px 22px', ...style }}>{children}</div>
  )

  const noteTextarea = (value: string, onChange: (v: string) => void, placeholder: string) => (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={4}
      style={{ width: '100%', padding: '10px 12px', borderRadius: 9, fontSize: 13, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)', color: '#d0d4e8', fontFamily: 'var(--font-display)', resize: 'vertical', outline: 'none', boxSizing: 'border-box', lineHeight: 1.5 }}
    />
  )

  return (
    <AdminShell title={req.company_name} subtitle={`${req.type === 'playground' ? 'Playground' : 'Product access'} request · #${req.id}`} backHref="/admin/requests" backLabel="Requests" maxWidth={980}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>

        {/* Left */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {card(<>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#5a6080', marginBottom: 14 }}>Request Details</div>
            <KVRow label="Name" value={req.full_name} />
            <KVRow label="Email" value={<span style={{ fontFamily: 'monospace', color: '#4be1ec' }}>{req.work_email}</span>} />
            <KVRow label="Company" value={req.company_name} />
            <KVRow label="Status" value={<Badge status={req.status} />} />
            {req.requested_slug && <KVRow label="Requested slug" value={<span style={{ fontFamily: 'monospace', color: '#4be1ec' }}>{req.requested_slug}</span>} />}
            {req.product_key && <KVRow label="Product" value={<span style={{ fontFamily: 'monospace', color: '#4be1ec' }}>{req.product_key}</span>} />}
            {req.playground_slug && <KVRow label="Playground" value={<span style={{ fontFamily: 'monospace', color: '#a9aec5' }}>{req.playground_slug}</span>} />}
            {req.interested_products && <KVRow label="Interested in" value={
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {(() => { try { return JSON.parse(req.interested_products!) } catch { return [req.interested_products] } })().map((p: string) => (
                  <span key={p} style={{ fontFamily: 'monospace', fontSize: 12, padding: '2px 7px', borderRadius: 5, background: 'rgba(75,225,236,0.08)', color: '#4be1ec', border: '1px solid rgba(75,225,236,0.15)' }}>{p}</span>
                ))}
              </div>
            } />}
            {req.use_case && <KVRow label="Use case" value={<span style={{ color: '#a9aec5', fontSize: 12.5 }}>{req.use_case}</span>} />}
            {req.source_page && <KVRow label="Source" value={<span style={{ fontFamily: 'monospace', fontSize: 12, color: '#5a6080' }}>{req.source_page}</span>} />}
            <KVRow label="Submitted" value={relativeTime(req.created_at)} />
          </>)}

          {/* Notes */}
          {card(<>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#5a6080', marginBottom: 14 }}>Notes</div>
            {req.notes.length === 0 && <div style={{ color: '#5a6080', fontSize: 13, fontFamily: 'var(--font-display)', marginBottom: 16 }}>No notes yet.</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: req.notes.length > 0 ? 16 : 0 }}>
              {req.notes.map(n => (
                <div key={n.id} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 9, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 11.5, color: '#a9aec5', fontFamily: 'var(--font-display)' }}>{n.author_email}</span>
                    <span style={{ fontSize: 11, color: '#5a6080' }}>{relativeTime(n.created_at)}</span>
                  </div>
                  <div style={{ fontSize: 13, color: '#d0d4e8', lineHeight: 1.5 }}>{n.body}</div>
                </div>
              ))}
            </div>
            {!isLocked && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <textarea
                  value={noteBody}
                  onChange={e => setNoteBody(e.target.value)}
                  placeholder="Add an internal note…"
                  rows={3}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 9, fontSize: 13, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#d0d4e8', fontFamily: 'var(--font-display)', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
                />
                <button onClick={addNote} disabled={addingNote || !noteBody.trim()} style={{ alignSelf: 'flex-end', padding: '8px 18px', borderRadius: 8, fontSize: 12.5, fontFamily: 'var(--font-display)', background: 'rgba(75,225,236,0.1)', border: '1px solid rgba(75,225,236,0.25)', color: '#4be1ec', cursor: addingNote ? 'not-allowed' : 'pointer', opacity: addingNote || !noteBody.trim() ? 0.5 : 1 }}>
                  {addingNote ? 'Adding…' : 'Add note'}
                </button>
              </div>
            )}
          </>)}
        </div>

        {/* Right: Actions */}
        <div style={{ position: 'sticky', top: 24 }}>
          {card(<>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#5a6080', marginBottom: 14 }}>Actions</div>

            {/* Locked state */}
            {isLocked && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ padding: '12px 14px', borderRadius: 9, background: 'rgba(203,94,238,0.07)', border: '1px solid rgba(203,94,238,0.2)', fontSize: 13, color: '#cb5eee', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                  Request approved — locked
                </div>
                <div style={{ fontSize: 12, color: '#5a6080', fontFamily: 'var(--font-display)', lineHeight: 1.5 }}>
                  This request has been approved and cannot be modified.
                </div>
              </div>
            )}

            {/* Action buttons — available for all non-locked statuses */}
            {!isLocked && actionStep === 'idle' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  onClick={() => setActionStep('selecting')}
                  style={{ width: '100%', padding: '10px 16px', borderRadius: 9, fontSize: 13, fontFamily: 'var(--font-display)', fontWeight: 500, background: 'rgba(46,232,196,0.12)', border: '1px solid rgba(46,232,196,0.3)', color: '#2ee8c4', cursor: 'pointer' }}>
                  Approve →
                </button>
                <button
                  onClick={() => setActionStep('note_info')}
                  disabled={acting}
                  style={{ width: '100%', padding: '10px 16px', borderRadius: 9, fontSize: 13, fontFamily: 'var(--font-display)', background: 'rgba(245,200,66,0.07)', border: '1px solid rgba(245,200,66,0.2)', color: '#f5c842', cursor: acting ? 'not-allowed' : 'pointer', opacity: acting ? 0.6 : 1 }}>
                  Need more info
                </button>
                <button
                  onClick={() => setActionStep('note_reject')}
                  disabled={acting}
                  style={{ width: '100%', padding: '10px 16px', borderRadius: 9, fontSize: 13, fontFamily: 'var(--font-display)', background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.2)', color: '#ff6b6b', cursor: acting ? 'not-allowed' : 'pointer', opacity: acting ? 0.6 : 1 }}>
                  Reject
                </button>
              </div>
            )}

            {/* Product selection step */}
            {!isLocked && actionStep === 'selecting' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontSize: 12, color: '#a9aec5', fontFamily: 'var(--font-display)', lineHeight: 1.5 }}>
                  Select products to activate for this partner:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {PLATFORM_PRODUCTS.map(p => {
                    const checked = selectedProducts.includes(p.key)
                    return (
                      <button
                        key={p.key}
                        onClick={() => toggleProduct(p.key)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '8px 10px', borderRadius: 8, textAlign: 'left',
                          background: checked ? 'rgba(75,225,236,0.08)' : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${checked ? 'rgba(75,225,236,0.25)' : 'rgba(255,255,255,0.07)'}`,
                          cursor: p.required ? 'default' : 'pointer',
                        }}>
                        <div style={{
                          width: 14, height: 14, borderRadius: 4, flexShrink: 0,
                          background: checked ? '#4be1ec' : 'transparent',
                          border: `1.5px solid ${checked ? '#4be1ec' : 'rgba(255,255,255,0.2)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {checked && <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><polyline points="1.5,5 4,7.5 8.5,2.5" stroke="#050710" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </div>
                        <span style={{ fontSize: 12.5, fontFamily: 'var(--font-display)', color: checked ? '#e8eaf2' : '#5a6080', flex: 1 }}>{p.name}</span>
                        {p.required && <span style={{ fontSize: 10, color: '#4be1ec', fontFamily: 'var(--font-display)', opacity: 0.7 }}>required</span>}
                      </button>
                    )
                  })}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 4, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <button onClick={confirmApprove} disabled={acting}
                    style={{ width: '100%', padding: '10px 16px', borderRadius: 9, fontSize: 13, fontFamily: 'var(--font-display)', fontWeight: 600, background: 'rgba(46,232,196,0.15)', border: '1px solid rgba(46,232,196,0.35)', color: '#2ee8c4', cursor: acting ? 'not-allowed' : 'pointer', opacity: acting ? 0.6 : 1 }}>
                    {acting ? 'Approving…' : `Confirm — ${selectedProducts.length} product${selectedProducts.length !== 1 ? 's' : ''}`}
                  </button>
                  <button onClick={cancelAction} disabled={acting}
                    style={{ width: '100%', padding: '8px', borderRadius: 8, fontSize: 12, fontFamily: 'var(--font-display)', background: 'none', border: 'none', color: '#5a6080', cursor: 'pointer' }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Need more info step */}
            {!isLocked && actionStep === 'note_info' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ fontSize: 12, color: '#f5c842', fontFamily: 'var(--font-display)', lineHeight: 1.5 }}>
                  Message to the applicant — this will be sent by email:
                </div>
                {noteTextarea(actionNote, setActionNote, 'What information do you need from them?')}
                <button onClick={confirmNeedsInfo} disabled={acting || !actionNote.trim()}
                  style={{ width: '100%', padding: '10px 16px', borderRadius: 9, fontSize: 13, fontFamily: 'var(--font-display)', fontWeight: 600, background: 'rgba(245,200,66,0.1)', border: '1px solid rgba(245,200,66,0.3)', color: '#f5c842', cursor: (acting || !actionNote.trim()) ? 'not-allowed' : 'pointer', opacity: (acting || !actionNote.trim()) ? 0.5 : 1 }}>
                  {acting ? 'Sending…' : 'Send & request info'}
                </button>
                <button onClick={cancelAction} disabled={acting}
                  style={{ width: '100%', padding: '8px', borderRadius: 8, fontSize: 12, fontFamily: 'var(--font-display)', background: 'none', border: 'none', color: '#5a6080', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            )}

            {/* Reject step */}
            {!isLocked && actionStep === 'note_reject' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ fontSize: 12, color: '#ff6b6b', fontFamily: 'var(--font-display)', lineHeight: 1.5 }}>
                  Reason for rejection — this will be sent by email:
                </div>
                {noteTextarea(actionNote, setActionNote, 'Explain why this request is being rejected…')}
                <button onClick={confirmReject} disabled={acting || !actionNote.trim()}
                  style={{ width: '100%', padding: '10px 16px', borderRadius: 9, fontSize: 13, fontFamily: 'var(--font-display)', fontWeight: 600, background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', color: '#ff6b6b', cursor: (acting || !actionNote.trim()) ? 'not-allowed' : 'pointer', opacity: (acting || !actionNote.trim()) ? 0.5 : 1 }}>
                  {acting ? 'Rejecting…' : 'Confirm rejection'}
                </button>
                <button onClick={cancelAction} disabled={acting}
                  style={{ width: '100%', padding: '8px', borderRadius: 8, fontSize: 12, fontFamily: 'var(--font-display)', background: 'none', border: 'none', color: '#5a6080', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            )}
          </>)}
        </div>
      </div>
    </AdminShell>
  )
}
