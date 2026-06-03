import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth/magic-link'
import { createSession } from '@/lib/auth/session'

export async function GET(req: NextRequest) {
  const appUrl = process.env.APP_URL ?? 'http://localhost:3000'
  const token = req.nextUrl.searchParams.get('token')
  if (!token) return NextResponse.redirect(new URL('/login?error=invalid', appUrl))

  const email = verifyToken(token)
  if (!email) return NextResponse.redirect(new URL('/login?error=expired', appUrl))

  await createSession(email)
  return NextResponse.redirect(new URL('/admin', appUrl))
}
