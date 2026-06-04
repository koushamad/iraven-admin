import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { getWorkspaceDb } from '@/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getWorkspaceDb()
  const rows = db.prepare(`
    SELECT p.*,
      (SELECT COUNT(*) FROM playground_products pp WHERE pp.playground_id = p.id AND pp.status = 'enabled') as product_count
    FROM playgrounds p
    ORDER BY p.created_at DESC
  `).all()

  return NextResponse.json(rows)
}
