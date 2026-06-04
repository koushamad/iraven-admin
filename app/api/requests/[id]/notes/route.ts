import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { getWorkspaceDb } from '@/lib/db'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const db = getWorkspaceDb()

  const prRow = db.prepare('SELECT id FROM playground_requests WHERE id=?').get(Number(id))
  const subjectType = prRow ? 'playground' : 'product-access'

  const notes = db.prepare('SELECT * FROM admin_notes WHERE subject_type=? AND subject_id=? ORDER BY created_at ASC').all(subjectType, Number(id))
  return NextResponse.json(notes)
}

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { body } = await req.json() as { body: string }
  if (!body?.trim()) return NextResponse.json({ error: 'Body required' }, { status: 400 })

  const db = getWorkspaceDb()
  const prRow = db.prepare('SELECT id FROM playground_requests WHERE id=?').get(Number(id))
  const subjectType = prRow ? 'playground' : 'product-access'

  const result = db.prepare(`
    INSERT INTO admin_notes (subject_type, subject_id, author_email, body) VALUES (?, ?, ?, ?)
  `).run(subjectType, Number(id), session.email, body.trim())

  const note = db.prepare('SELECT * FROM admin_notes WHERE id=?').get(result.lastInsertRowid)
  return NextResponse.json(note, { status: 201 })
}
