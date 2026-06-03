import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { getDb } from '@/lib/db'

export async function GET() {
  const db = getDb()
  type Row = Record<string, unknown>
  const products = db.prepare('SELECT * FROM products ORDER BY sort_order,id').all() as Row[]
  const points = db.prepare('SELECT * FROM product_points ORDER BY product_id,sort_order').all() as Row[]
  const subs = db.prepare('SELECT * FROM sub_projects ORDER BY product_id,sort_order').all() as Row[]

  const result = products.map(p => ({
    ...p,
    points: points.filter(pt => pt.product_id === p.id).map(pt => pt.text),
    sub_projects: subs.filter(s => s.product_id === p.id),
  }))
  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const db = getDb()

  const stmt = db.prepare(`
    INSERT INTO products (key,name,initial,orbit,category,domain,href,accent,story,visual_label,favicon,float_stat_k,float_stat_v,compliance,sort_order)
    VALUES (@key,@name,@initial,@orbit,@category,@domain,@href,@accent,@story,@visual_label,@favicon,@float_stat_k,@float_stat_v,@compliance,@sort_order)
  `)
  const result = stmt.run({
    key: body.key, name: body.name, initial: body.initial ?? '', orbit: body.orbit ?? 0,
    category: body.category ?? '', domain: body.domain ?? '', href: body.href ?? '',
    accent: body.accent ?? 'cyan', story: body.story ?? '', visual_label: body.visual_label ?? '',
    favicon: body.favicon ?? null, float_stat_k: body.float_stat_k ?? null,
    float_stat_v: body.float_stat_v ?? null, compliance: body.compliance ?? null,
    sort_order: body.sort_order ?? 0,
  })

  const productId = result.lastInsertRowid
  if (body.points?.length) {
    const insertPoint = db.prepare('INSERT INTO product_points (product_id,text,sort_order) VALUES (?,?,?)')
    body.points.forEach((text: string, i: number) => insertPoint.run(productId, text, i))
  }

  return NextResponse.json({ id: productId }, { status: 201 })
}
