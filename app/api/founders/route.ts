import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { getDb } from '@/lib/db'

export async function GET() {
  const db = getDb()
  const founders = db.prepare('SELECT * FROM founders ORDER BY sort_order,id').all() as { id: number }[]
  const traits = db.prepare('SELECT * FROM founder_traits ORDER BY founder_id,sort_order').all() as { founder_id: number; trait: string }[]
  return NextResponse.json(founders.map(f => ({
    ...f,
    traits: traits.filter(t => t.founder_id === f.id).map(t => t.trait),
  })))
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const db = getDb()
  const result = db.prepare(`
    INSERT INTO founders (name,role,quote,href,favicon,signal,signal_color,sort_order)
    VALUES (@name,@role,@quote,@href,@favicon,@signal,@signal_color,@sort_order)
  `).run({ name: body.name, role: body.role ?? null, quote: body.quote ?? null, href: body.href ?? null, favicon: body.favicon ?? null, signal: body.signal ?? 'active', signal_color: body.signal_color ?? 'gold', sort_order: body.sort_order ?? 0 })

  const founderId = result.lastInsertRowid
  if (body.traits?.length) {
    const ins = db.prepare('INSERT INTO founder_traits (founder_id,trait,sort_order) VALUES (?,?,?)')
    body.traits.forEach((trait: string, i: number) => ins.run(founderId, trait, i))
  }
  return NextResponse.json({ id: founderId }, { status: 201 })
}
