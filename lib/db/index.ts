// Uses Node.js built-in sqlite (Node 22.5+, stable in Node 23+)
import { DatabaseSync } from 'node:sqlite'
import path from 'path'
import { SCHEMA } from './schema'

const DB_PATH = process.env.DATABASE_PATH ?? path.join(process.cwd(), 'iraven.db')

let _db: DatabaseSync | null = null

export function getDb(): DatabaseSync {
  if (!_db) {
    _db = new DatabaseSync(DB_PATH)
    _db.exec(SCHEMA)
  }
  return _db
}

export type Product = {
  id: number; key: string; name: string; initial: string; orbit: number
  category: string; domain: string; href: string; accent: 'cyan' | 'violet' | 'gold'
  story: string; visual_label: string; favicon: string | null
  float_stat_k: string | null; float_stat_v: string | null; compliance: string | null
  sort_order: number; active: number
}

export type Founder = {
  id: number; name: string; role: string | null; quote: string | null
  href: string | null; favicon: string | null; sort_order: number; active: number
}
