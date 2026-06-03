import { NextRequest, NextResponse } from 'next/server'
import { isAdminEmail, createToken } from '@/lib/auth/magic-link'
import { sendMagicLink } from '@/lib/auth/email'

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email required' }, { status: 400 })
  }

  if (!isAdminEmail(email.toLowerCase().trim())) {
    // Return same response to avoid email enumeration
    return NextResponse.json({ ok: true })
  }

  const token = createToken(email.toLowerCase().trim())
  await sendMagicLink(email.toLowerCase().trim(), token)

  return NextResponse.json({ ok: true })
}
