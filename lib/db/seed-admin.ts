/**
 * Seeds admin.db:
 *   - admin_users        (human admins for the panel)
 *   - service_users      (service-to-service identities)
 *   - service_db_access  (which db each service can access, and with what permissions)
 *   - db_registry        (initial version tracking per db)
 *
 * Run: npx tsx lib/db/seed-admin.ts
 * Requires INTERNAL_SECRET env var.
 */
import { getAdminDb, hashSecret, setDbVersion } from './admin-db'

const secret = process.env.INTERNAL_SECRET
if (!secret) {
  console.error('INTERNAL_SECRET env var is required')
  process.exit(1)
}

const db = getAdminDb()

// ── Human admin users ──────────────────────────────────────────────────────────
db.prepare('INSERT OR IGNORE INTO admin_users (email) VALUES (?)').run('kousha@iraven.io')

// ── Service users ──────────────────────────────────────────────────────────────
const upsertService = db.prepare(`
  INSERT INTO service_users (service_name, secret_hash) VALUES (?, ?)
  ON CONFLICT(service_name) DO UPDATE SET secret_hash=excluded.secret_hash
`)
const upsertAccess = db.prepare(`
  INSERT INTO service_db_access (service_id, db_name, permissions) VALUES (?, ?, ?)
  ON CONFLICT(service_id, db_name) DO UPDATE SET permissions=excluded.permissions
`)
const getId = (name: string) =>
  (db.prepare('SELECT id FROM service_users WHERE service_name=?').get(name) as { id: number } | undefined)?.id

// iraven-web: read-only on web.db
upsertService.run('iraven-web', hashSecret(secret))
const webId = getId('iraven-web')!
upsertAccess.run(webId, 'web', 'r')

// ── DB version registry ────────────────────────────────────────────────────────
// Initialize each managed db at version 1 if not already tracked
setDbVersion('web', 1, 'seed')

// ── Summary ───────────────────────────────────────────────────────────────────
console.log('admin.db seeded:')
console.log('  admin_users:', db.prepare('SELECT email FROM admin_users').all())
console.log('  services+access:',
  db.prepare(`
    SELECT su.service_name, sda.db_name, sda.permissions
    FROM service_db_access sda
    JOIN service_users su ON su.id = sda.service_id
  `).all()
)
console.log('  db_registry:', db.prepare('SELECT * FROM db_registry').all())
