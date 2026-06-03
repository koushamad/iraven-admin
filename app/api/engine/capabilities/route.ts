import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { getDb } from '@/lib/db'

export async function GET() {
  const rows = getDb().prepare('SELECT capability FROM engine_capabilities ORDER BY sort_order').all()
  return NextResponse.json(rows)
}

export async function PUT(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const caps: string[] = await req.json()
  const db = getDb()
  const ins = db.prepare('INSERT INTO engine_capabilities (capability,sort_order) VALUES (?,?)')
  db.exec('BEGIN')
  try {
    db.exec('DELETE FROM engine_capabilities')
    caps.filter(Boolean).forEach((c, i) => ins.run(c, i + 1))
    db.exec('COMMIT')
  } catch (err) {
    db.exec('ROLLBACK')
    throw err
  }
  return NextResponse.json({ ok: true })
}
