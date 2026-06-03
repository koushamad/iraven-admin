import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { getDb } from '@/lib/db'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json()
  getDb().prepare(`UPDATE engine_systems SET number=@number,heading=@heading,description=@description,sort_order=@sort_order,active=@active WHERE id=@id`)
    .run({ ...body, id })
  return NextResponse.json({ ok: true })
}
