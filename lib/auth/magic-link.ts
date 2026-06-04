import { nanoid } from 'nanoid'
import { getAdminDb as getDb } from '@/lib/db'

const TOKEN_DURATION = 15 * 60 // 15 minutes

export function createToken(email: string): string {
  const db = getDb()
  const token = nanoid(64)
  const expiresAt = Math.floor(Date.now() / 1000) + TOKEN_DURATION
  db.prepare('INSERT INTO auth_tokens (token,email,expires_at) VALUES (?,?,?)').run(token, email, expiresAt)
  return token
}

export function verifyToken(token: string): string | null {
  const db = getDb()
  const row = db.prepare('SELECT email,expires_at,used FROM auth_tokens WHERE token=?').get(token) as
    | { email: string; expires_at: number; used: number }
    | undefined

  if (!row || row.used || row.expires_at < Math.floor(Date.now() / 1000)) return null

  db.prepare('UPDATE auth_tokens SET used=1 WHERE token=?').run(token)
  return row.email
}

export function isAdminEmail(email: string): boolean {
  const db = getDb()
  return !!db.prepare('SELECT 1 FROM admin_users WHERE email=?').get(email)
}
