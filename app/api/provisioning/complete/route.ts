import { NextRequest, NextResponse } from 'next/server'
import { getWorkspaceDb } from '@/lib/db'

export async function POST(req: NextRequest) {
  const { slug, status } = await req.json() as { slug?: string; status?: string }
  if (!slug || !status) return NextResponse.json({ error: 'slug and status required' }, { status: 400 })

  const db = getWorkspaceDb()
  const now = Math.floor(Date.now() / 1000)

  db.prepare(`
    UPDATE playgrounds SET provisioning_status=?, updated_at=? WHERE slug=?
  `).run(status, now, slug)

  return NextResponse.json({ ok: true })
}
