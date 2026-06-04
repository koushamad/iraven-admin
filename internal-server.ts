/**
 * Admin internal server — port 3003
 * Service-to-service only.
 *
 * GET  /health          — no auth required
 * GET  /sync            — auth required, returns granted db data
 * POST /upload          — auth + 'rw' permission required, versioned db upload
 */
import { createServer, IncomingMessage, ServerResponse } from 'node:http'
import { renameSync, writeFileSync, mkdirSync } from 'node:fs'
import path from 'path'
import { verifyService, getDbDir, getDbVersion, setDbVersion, ServiceAuthResult } from './lib/db/admin-db'
import { getWebDb } from './lib/db/web-db'
import { DatabaseSync } from 'node:sqlite'

const PORT = parseInt(process.env.INTERNAL_PORT ?? '3003', 10)
const SQLITE_MAGIC = Buffer.from('SQLite format 3\0')

// ── helpers ───────────────────────────────────────────────────────────────────

function json(res: ServerResponse, data: unknown, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(data))
}

function readBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (c: Buffer) => chunks.push(c))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

function isValidSqlite(buf: Buffer): boolean {
  return buf.length >= 16 && buf.slice(0, 16).equals(SQLITE_MAGIC)
}

// ── db readers ────────────────────────────────────────────────────────────────

function getDbByName(name: string): DatabaseSync | null {
  if (name === 'web') return getWebDb()
  return null
}

function readWebData(db: DatabaseSync) {
  const products = db.prepare(`
    SELECT p.*, GROUP_CONCAT(pt.text, '||') as points_raw
    FROM products p
    LEFT JOIN product_points pt ON pt.product_id = p.id
    WHERE p.active = 1
    GROUP BY p.id ORDER BY p.sort_order, p.id
  `).all() as Record<string, unknown>[]

  const founders = db.prepare(`
    SELECT f.*, GROUP_CONCAT(ft.trait, '||') as traits_raw
    FROM founders f
    LEFT JOIN founder_traits ft ON ft.founder_id = f.id
    WHERE f.active = 1
    GROUP BY f.id ORDER BY f.sort_order, f.id
  `).all() as Record<string, unknown>[]

  return {
    products: products.map(p => ({ ...p, points_raw: undefined, points: p.points_raw ? String(p.points_raw).split('||') : [] })),
    founders: founders.map(f => ({ ...f, traits_raw: undefined, traits: f.traits_raw ? String(f.traits_raw).split('||') : [] })),
    engine_systems: db.prepare('SELECT * FROM engine_systems WHERE active=1 ORDER BY sort_order').all(),
    engine_capabilities: db.prepare('SELECT capability FROM engine_capabilities ORDER BY sort_order').all(),
    site_content: db.prepare('SELECT section, key, value FROM site_content ORDER BY section, sort_order').all(),
  }
}

// ── route handlers ────────────────────────────────────────────────────────────

function handleSync(res: ServerResponse, auth: ServiceAuthResult) {
  const result: Record<string, unknown> = {}
  for (const [dbName, perms] of Object.entries(auth.access)) {
    if (!perms.includes('r')) continue
    const db = getDbByName(dbName)
    if (!db) continue
    const version = getDbVersion(dbName)
    if (dbName === 'web') result.web = { version, ...readWebData(db) }
  }
  json(res, result)
}

async function handleUpload(req: IncomingMessage, res: ServerResponse, auth: ServiceAuthResult) {
  const dbName = String(req.headers['x-db-name'] ?? '')
  const claimedVersion = parseInt(String(req.headers['x-db-version'] ?? '0'), 10)

  if (!dbName) return json(res, { error: 'x-db-name header required' }, 400)
  if (!claimedVersion) return json(res, { error: 'x-db-version header required (integer)' }, 400)

  const perms = auth.access[dbName]
  if (!perms) return json(res, { error: `no access to db "${dbName}"` }, 403)
  if (perms !== 'rw') return json(res, { error: `db "${dbName}" is read-only for this service` }, 403)

  const currentVersion = getDbVersion(dbName)
  if (claimedVersion !== currentVersion + 1) {
    return json(res, {
      error: `version mismatch: current=${currentVersion}, expected upload=${currentVersion + 1}, got=${claimedVersion}`,
    }, 409)
  }

  const body = await readBody(req)
  if (!isValidSqlite(body)) {
    return json(res, { error: 'uploaded file is not a valid SQLite database' }, 422)
  }

  // Atomic write: temp file → rename
  const dbDir = getDbDir()
  mkdirSync(dbDir, { recursive: true })
  const dest = path.join(dbDir, `${dbName}.db`)
  const tmp = `${dest}.tmp-${Date.now()}`

  try {
    writeFileSync(tmp, body)
    renameSync(tmp, dest)
  } catch (err) {
    return json(res, { error: 'failed to save file' }, 500)
  }

  setDbVersion(dbName, claimedVersion, auth.serviceName)
  console.log(`[admin-internal] uploaded ${dbName}.db v${claimedVersion} by ${auth.serviceName} (${body.length} bytes)`)

  json(res, { ok: true, db: dbName, version: claimedVersion })
}

// ── server ────────────────────────────────────────────────────────────────────

const server = createServer(async (req, res) => {
  const urlPath = req.url?.split('?')[0] ?? ''

  if (urlPath === '/health' && req.method === 'GET') {
    return json(res, { ok: true, service: 'admin-internal', port: PORT })
  }

  const serviceName = String(req.headers['x-service-name'] ?? '')
  const secret = String(req.headers['x-internal-secret'] ?? '')
  const auth = verifyService(serviceName, secret)

  if (!auth) {
    console.warn(`[admin-internal] rejected ${req.method} ${urlPath} service="${serviceName}"`)
    return json(res, { error: 'unauthorized' }, 401)
  }

  console.log(`[admin-internal] ${req.method} ${urlPath} service="${serviceName}"`)

  if (urlPath === '/sync' && req.method === 'GET') return handleSync(res, auth)
  if (urlPath === '/upload' && req.method === 'POST') return handleUpload(req, res, auth)

  json(res, { error: 'not found' }, 404)
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[admin-internal] listening on :${PORT}`)
})
