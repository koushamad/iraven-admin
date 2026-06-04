import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { getWorkspaceDb } from '@/lib/db'
import { sendApprovalEmail, sendNeedsMoreInfoEmail, sendRejectionEmail } from '@/lib/auth/email'
import { getArgoEventsWebhookUrl } from '@/lib/vault'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const db = getWorkspaceDb()

  let row = db.prepare('SELECT * FROM playground_requests WHERE id=?').get(Number(id)) as Record<string, unknown> | undefined
  if (row) {
    const notes = db.prepare("SELECT * FROM admin_notes WHERE subject_type='playground' AND subject_id=? ORDER BY created_at ASC").all(Number(id))
    return NextResponse.json({ ...row, type: 'playground', notes })
  }

  row = db.prepare('SELECT * FROM product_access_requests WHERE id=?').get(Number(id)) as Record<string, unknown> | undefined
  if (row) {
    const notes = db.prepare("SELECT * FROM admin_notes WHERE subject_type='product-access' AND subject_id=? ORDER BY created_at ASC").all(Number(id))
    return NextResponse.json({ ...row, type: 'product-access', notes })
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { action, products, note } = await req.json() as {
    action: string
    products?: string[]
    note?: string
  }

  const statusMap: Record<string, string> = {
    approve:     'approved',
    reject:      'rejected',
    needs_info:  'needs_info',
  }

  const newStatus = statusMap[action]
  if (!newStatus) return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  const db = getWorkspaceDb()
  const now = Math.floor(Date.now() / 1000)

  // Try playground_requests
  const row = db.prepare('SELECT * FROM playground_requests WHERE id=?').get(Number(id)) as {
    work_email: string; full_name: string; company_name: string
    requested_slug: string; status: string
  } | undefined

  if (row) {
    // Lock: approved requests cannot be changed
    if (row.status === 'approved' || row.status === 'converted') {
      return NextResponse.json({ error: 'This request has already been approved and cannot be modified.' }, { status: 403 })
    }

    db.prepare('UPDATE playground_requests SET status=?, updated_at=? WHERE id=?').run(newStatus, now, Number(id))
    db.prepare(`
      INSERT INTO audit_logs (actor_email, actor_type, action, target, created_at)
      VALUES (?, 'admin', ?, ?, ?)
    `).run(session.email, `request.${action}`, `playground_request:${id}`, now)

    // Auto-save note for needs_info and reject
    if ((action === 'needs_info' || action === 'reject') && note?.trim()) {
      db.prepare(`
        INSERT INTO admin_notes (subject_type, subject_id, author_email, body, created_at)
        VALUES ('playground', ?, ?, ?, ?)
      `).run(Number(id), session.email, note.trim(), now)
    }

    if (action === 'approve') {
      db.prepare(`
        INSERT OR IGNORE INTO platform_users (email, full_name, status)
        VALUES (?, ?, 'active')
      `).run(row.work_email, row.full_name)
      db.prepare(`
        UPDATE platform_users SET status='active', updated_at=unixepoch()
        WHERE email=? AND status='invited'
      `).run(row.work_email)

      db.prepare(`
        INSERT OR IGNORE INTO playgrounds (slug, display_name, owner_email, status, provisioning_status)
        VALUES (?, ?, ?, 'active', 'provisioning')
      `).run(row.requested_slug, row.company_name, row.work_email)

      const pg = db.prepare('SELECT id FROM playgrounds WHERE slug=?').get(row.requested_slug) as { id: number } | undefined

      const selectedProducts = Array.from(new Set(['playground', ...(products ?? [])]))
      if (pg) {
        for (const key of selectedProducts) {
          db.prepare(`
            INSERT OR IGNORE INTO playground_products (playground_id, product_key, status, enabled_at)
            VALUES (?, ?, 'enabled', unixepoch())
          `).run(pg.id, key)
        }
      }

      db.prepare('UPDATE playground_requests SET converted_playground_id=? WHERE id=?').run(pg?.id ?? null, Number(id))

      triggerWorkspaceProvision({
        slug:      row.requested_slug,
        email:     row.work_email,
        full_name: row.full_name,
        products:  selectedProducts.join(','),
      }).catch(err => console.error('[argo provision]', err))

      sendApprovalEmail({
        to:       row.work_email,
        fullName: row.full_name,
        slug:     row.requested_slug,
      }).catch(err => console.error('[approval email]', err))
    }

    if (action === 'needs_info') {
      sendNeedsMoreInfoEmail({
        to:       row.work_email,
        fullName: row.full_name,
        slug:     row.requested_slug,
        note:     note?.trim() || 'Please provide additional information about your request.',
      }).catch(err => console.error('[needs info email]', err))
    }

    if (action === 'reject') {
      sendRejectionEmail({
        to:       row.work_email,
        fullName: row.full_name,
        slug:     row.requested_slug,
        note:     note?.trim() || 'Thank you for your interest in IRaven Workspace.',
      }).catch(err => console.error('[rejection email]', err))
    }

    const updated = db.prepare('SELECT * FROM playground_requests WHERE id=?').get(Number(id)) as Record<string, unknown>
    const notes   = db.prepare("SELECT * FROM admin_notes WHERE subject_type='playground' AND subject_id=? ORDER BY created_at ASC").all(Number(id))
    return NextResponse.json({ ...updated, type: 'playground', notes })
  }

  // Try product_access_requests
  const row2 = db.prepare('SELECT * FROM product_access_requests WHERE id=?').get(Number(id)) as {
    status: string
  } | undefined

  if (row2) {
    if (row2.status === 'approved' || row2.status === 'converted') {
      return NextResponse.json({ error: 'This request has already been approved and cannot be modified.' }, { status: 403 })
    }
    db.prepare('UPDATE product_access_requests SET status=?, updated_at=? WHERE id=?').run(newStatus, now, Number(id))
    db.prepare(`
      INSERT INTO audit_logs (actor_email, actor_type, action, target, created_at)
      VALUES (?, 'admin', ?, ?, ?)
    `).run(session.email, `request.${action}`, `product_access_request:${id}`, now)
    return NextResponse.json(db.prepare('SELECT * FROM product_access_requests WHERE id=?').get(Number(id)))
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}

async function triggerWorkspaceProvision(payload: { slug: string; email: string; full_name: string; products: string }) {
  const webhookUrl = await getArgoEventsWebhookUrl()
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    throw new Error(`Argo webhook responded ${res.status}`)
  }
}
