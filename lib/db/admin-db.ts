import { DatabaseSync } from 'node:sqlite'
import { createHash } from 'node:crypto'
import path from 'path'

const DB_DIR = process.env.DB_DIR ?? path.join(process.cwd(), 'db')

const SCHEMA = `
PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS admin_users (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  email      TEXT UNIQUE NOT NULL,
  created_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS service_users (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  service_name TEXT UNIQUE NOT NULL,
  secret_hash  TEXT NOT NULL,
  created_at   INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS service_db_access (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  service_id  INTEGER REFERENCES service_users(id) ON DELETE CASCADE,
  db_name     TEXT NOT NULL,
  permissions TEXT NOT NULL DEFAULT 'r',
  UNIQUE(service_id, db_name)
);

CREATE TABLE IF NOT EXISTS db_registry (
  db_name    TEXT PRIMARY KEY,
  version    INTEGER NOT NULL DEFAULT 1,
  updated_by TEXT,
  updated_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS auth_tokens (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  token      TEXT UNIQUE NOT NULL,
  email      TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  used       INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS sessions (
  id         TEXT PRIMARY KEY,
  email      TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER DEFAULT (unixepoch())
);
`

let _db: DatabaseSync | null = null

export function getAdminDb(): DatabaseSync {
  if (!_db) {
    _db = new DatabaseSync(path.join(DB_DIR, 'admin.db'))
    _db.exec(SCHEMA)
  }
  return _db
}

export function getDbDir(): string {
  return DB_DIR
}

export function hashSecret(secret: string): string {
  return createHash('sha256').update(secret).digest('hex')
}

export interface ServiceAuthResult {
  serviceId: number
  serviceName: string
  access: Record<string, 'r' | 'rw'>
}

export function verifyService(serviceName: string, secret: string): ServiceAuthResult | null {
  const db = getAdminDb()
  const service = db.prepare(
    'SELECT id FROM service_users WHERE service_name=? AND secret_hash=?'
  ).get(serviceName, hashSecret(secret)) as { id: number } | undefined

  if (!service) return null

  const rows = db.prepare(
    'SELECT db_name, permissions FROM service_db_access WHERE service_id=?'
  ).all(service.id) as { db_name: string; permissions: 'r' | 'rw' }[]

  const access: Record<string, 'r' | 'rw'> = {}
  for (const r of rows) access[r.db_name] = r.permissions

  return { serviceId: service.id, serviceName, access }
}

export function getDbVersion(dbName: string): number {
  const db = getAdminDb()
  const row = db.prepare('SELECT version FROM db_registry WHERE db_name=?').get(dbName) as
    | { version: number }
    | undefined
  return row?.version ?? 1
}

export function setDbVersion(dbName: string, version: number, updatedBy: string): void {
  getAdminDb().prepare(`
    INSERT INTO db_registry (db_name, version, updated_by, updated_at)
    VALUES (?, ?, ?, unixepoch())
    ON CONFLICT(db_name) DO UPDATE SET version=excluded.version, updated_by=excluded.updated_by, updated_at=excluded.updated_at
  `).run(dbName, version, updatedBy)
}
