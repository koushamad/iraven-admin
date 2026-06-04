import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/session'
import { getWorkspaceDb } from '@/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = getWorkspaceDb()
  const users = db.prepare('SELECT * FROM platform_users ORDER BY created_at DESC').all()
  return NextResponse.json(users)
}
