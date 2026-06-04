import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { getWorkspaceDb } from '@/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getWorkspaceDb()

  const playgroundReqs = db.prepare(`
    SELECT id, full_name, company_name, work_email, status,
           requested_slug as ref, source_page, created_at, 'playground' as type
    FROM playground_requests
    ORDER BY created_at DESC
  `).all() as object[]

  const productReqs = db.prepare(`
    SELECT id, full_name, company_name, work_email, status,
           product_key as ref, source_page, created_at, 'product-access' as type
    FROM product_access_requests
    ORDER BY created_at DESC
  `).all() as object[]

  const all = [...playgroundReqs, ...productReqs].sort((a, b) =>
    (b as { created_at: number }).created_at - (a as { created_at: number }).created_at
  )

  return NextResponse.json(all)
}
