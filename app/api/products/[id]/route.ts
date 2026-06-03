import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { getDb } from '@/lib/db'

type Params = { params: Promise<{ id: string }> }

export async function GET(_: NextRequest, { params }: Params) {
  const { id } = await params
  const db = getDb()
  const product = db.prepare('SELECT * FROM products WHERE id=?').get(id)
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const points = db.prepare('SELECT text FROM product_points WHERE product_id=? ORDER BY sort_order').all(id) as { text: string }[]
  const subs = db.prepare('SELECT * FROM sub_projects WHERE product_id=? ORDER BY sort_order').all(id)
  return NextResponse.json({ ...product, points: points.map(p => p.text), sub_projects: subs })
}

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const db = getDb()

  db.prepare(`
    UPDATE products SET key=@key,name=@name,initial=@initial,orbit=@orbit,category=@category,
    domain=@domain,href=@href,accent=@accent,story=@story,visual_label=@visual_label,
    favicon=@favicon,float_stat_k=@float_stat_k,float_stat_v=@float_stat_v,
    compliance=@compliance,sort_order=@sort_order,active=@active WHERE id=@id
  `).run({ ...body, id })

  if (body.points !== undefined) {
    db.prepare('DELETE FROM product_points WHERE product_id=?').run(id)
    const insertPoint = db.prepare('INSERT INTO product_points (product_id,text,sort_order) VALUES (?,?,?)')
    body.points.forEach((text: string, i: number) => insertPoint.run(id, text, i))
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(_: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  getDb().prepare('DELETE FROM products WHERE id=?').run(id)
  return NextResponse.json({ ok: true })
}
