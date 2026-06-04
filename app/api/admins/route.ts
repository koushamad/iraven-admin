import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { getAdminDb } from '@/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(getAdminDb().prepare('SELECT * FROM admin_users ORDER BY id').all())
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  try {
    const db = getAdminDb()
    const result = db.prepare('INSERT INTO admin_users (email) VALUES (?)').run(email.toLowerCase().trim())
    const admin = db.prepare('SELECT * FROM admin_users WHERE id=?').get(result.lastInsertRowid)
    return NextResponse.json(admin, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
  }
}
