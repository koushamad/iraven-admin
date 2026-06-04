import { cookies } from 'next/headers'
import { nanoid } from 'nanoid'
import { getAdminDb as getDb } from '@/lib/db'

const SESSION_COOKIE = 'iraven_session'
const SESSION_DURATION = 7 * 24 * 60 * 60 // 7 days in seconds

export async function createSession(email: string): Promise<string> {
  const db = getDb()
  const id = nanoid(48)
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_DURATION
  db.prepare('INSERT INTO sessions (id,email,expires_at) VALUES (?,?,?)').run(id, email, expiresAt)

  const jar = await cookies()
  jar.set(SESSION_COOKIE, id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DURATION,
  })
  return id
}

export async function getSession(): Promise<{ email: string } | null> {
  const jar = await cookies()
  const id = jar.get(SESSION_COOKIE)?.value
  if (!id) return null

  const db = getDb()
  const session = db.prepare('SELECT email,expires_at FROM sessions WHERE id=?').get(id) as
    | { email: string; expires_at: number }
    | undefined

  if (!session || session.expires_at < Math.floor(Date.now() / 1000)) {
    if (session) db.prepare('DELETE FROM sessions WHERE id=?').run(id)
    // Cookie deletion must happen in a Route Handler/Server Action, not here
    return null
  }
  return { email: session.email }
}

export async function deleteSession(): Promise<void> {
  const jar = await cookies()
  const id = jar.get(SESSION_COOKIE)?.value
  if (id) {
    getDb().prepare('DELETE FROM sessions WHERE id=?').run(id)
    jar.delete(SESSION_COOKIE)
  }
}
