import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { getWorkspaceDb } from '@/lib/db'

type Params = { params: Promise<{ slug: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug } = await params
  const db = getWorkspaceDb()

  const pg = db.prepare('SELECT * FROM playgrounds WHERE slug=?').get(slug) as Record<string, unknown> | undefined
  if (!pg) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const products = db.prepare(`
    SELECT pp.product_key, pp.status, pp.enabled_at,
           cp.name as product_name
    FROM playground_products pp
    LEFT JOIN catalog_products cp ON cp.key = pp.product_key
    WHERE pp.playground_id = ?
    ORDER BY pp.product_key
  `).all(pg.id as number)

  return NextResponse.json({ ...pg, products })
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug } = await params
  const { action } = await req.json() as { action: string }

  const db = getWorkspaceDb()
  const pg = db.prepare('SELECT * FROM playgrounds WHERE slug=?').get(slug) as { id: number } | undefined
  if (!pg) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const now = Math.floor(Date.now() / 1000)

  if (action === 'lock') {
    db.prepare("UPDATE playgrounds SET status='locked', lock_reason='admin', updated_at=? WHERE slug=?").run(now, slug)
  } else if (action === 'unlock') {
    db.prepare("UPDATE playgrounds SET status='active', lock_reason=NULL, updated_at=? WHERE slug=?").run(now, slug)
  } else if (action === 'suspend') {
    db.prepare("UPDATE playgrounds SET status='suspended', updated_at=? WHERE slug=?").run(now, slug)
  } else {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  db.prepare(`
    INSERT INTO audit_logs (actor_email, actor_type, playground_id, action, target, created_at)
    VALUES (?, 'admin', ?, ?, ?, ?)
  `).run(session.email, pg.id, `playground.${action}`, slug, now)

  const updated = db.prepare('SELECT * FROM playgrounds WHERE slug=?').get(slug)
  const products = db.prepare(`
    SELECT pp.product_key, pp.status FROM playground_products pp WHERE pp.playground_id = ?
  `).all(pg.id)

  return NextResponse.json({ ...updated as object, products })
}
