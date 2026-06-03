import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { getDb } from '@/lib/db'

type Params = { params: Promise<{ id: string }> }

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const db = getDb()

  db.prepare(`UPDATE founders SET name=@name,role=@role,quote=@quote,href=@href,favicon=@favicon,signal=@signal,signal_color=@signal_color,sort_order=@sort_order,active=@active WHERE id=@id`)
    .run({ ...body, id })

  if (body.traits !== undefined) {
    db.prepare('DELETE FROM founder_traits WHERE founder_id=?').run(id)
    const ins = db.prepare('INSERT INTO founder_traits (founder_id,trait,sort_order) VALUES (?,?,?)')
    body.traits.forEach((trait: string, i: number) => ins.run(id, trait, i))
  }
  return NextResponse.json({ ok: true })
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  getDb().prepare('DELETE FROM founders WHERE id=?').run(id)
  return NextResponse.json({ ok: true })
}
