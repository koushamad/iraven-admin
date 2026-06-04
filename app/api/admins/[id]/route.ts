import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { getAdminDb } from '@/lib/db'

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  getAdminDb().prepare('DELETE FROM admin_users WHERE id=?').run(id)
  return NextResponse.json({ ok: true })
}
