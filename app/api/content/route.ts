import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { getDb } from '@/lib/db'

export async function GET(req: NextRequest) {
  const section = req.nextUrl.searchParams.get('section')
  const db = getDb()
  const rows = section
    ? db.prepare('SELECT * FROM site_content WHERE section=? ORDER BY sort_order,id').all(section)
    : db.prepare('SELECT * FROM site_content ORDER BY section,sort_order,id').all()
  return NextResponse.json(rows)
}

export async function PUT(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const items = await req.json() // [{ section, key, value, sort_order }]
  const db = getDb()
  const upsert = db.prepare(`
    INSERT INTO site_content (section,key,value,sort_order) VALUES (?,?,?,?)
    ON CONFLICT(section,key) DO UPDATE SET value=excluded.value, sort_order=excluded.sort_order
  `)
  db.exec('BEGIN')
  try {
    for (const row of items) upsert.run(row.section, row.key, row.value, row.sort_order)
    db.exec('COMMIT')
  } catch (err) {
    db.exec('ROLLBACK')
    throw err
  }
  return NextResponse.json({ ok: true })
}
