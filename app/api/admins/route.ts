import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { getDb } from '@/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(getDb().prepare('SELECT * FROM admins ORDER BY id').all())
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  try {
    const db = getDb()
    const result = db.prepare('INSERT INTO admins (email) VALUES (?)').run(email.toLowerCase().trim())
    const admin = db.prepare('SELECT * FROM admins WHERE id=?').get(result.lastInsertRowid)
    return NextResponse.json(admin, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
  }
}
