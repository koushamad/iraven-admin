import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET() {
  const rows = getDb().prepare('SELECT * FROM engine_systems WHERE active=1 ORDER BY sort_order').all()
  return NextResponse.json(rows)
}
