import { DatabaseSync } from 'node:sqlite'
import path from 'path'

const DB_DIR = process.env.DB_DIR ?? path.join(process.cwd(), 'db')

const SCHEMA = `
PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS products (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  key          TEXT UNIQUE NOT NULL,
  name         TEXT NOT NULL,
  initial      TEXT,
  orbit        INTEGER,
  category     TEXT,
  domain       TEXT,
  href         TEXT,
  accent       TEXT DEFAULT 'cyan',
  story        TEXT,
  visual_label TEXT,
  favicon      TEXT,
  float_stat_k TEXT,
  float_stat_v TEXT,
  compliance   TEXT,
  sort_order   INTEGER DEFAULT 0,
  active       INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS product_points (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  text       TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS sub_projects (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id  INTEGER REFERENCES products(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  href        TEXT,
  favicon     TEXT,
  sort_order  INTEGER DEFAULT 0,
  active      INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS founders (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT NOT NULL,
  role         TEXT,
  quote        TEXT,
  href         TEXT,
  favicon      TEXT,
  signal       TEXT DEFAULT 'active',
  signal_color TEXT DEFAULT 'gold',
  sort_order   INTEGER DEFAULT 0,
  active       INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS founder_traits (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  founder_id INTEGER REFERENCES founders(id) ON DELETE CASCADE,
  trait      TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS engine_systems (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  number      TEXT,
  heading     TEXT NOT NULL,
  description TEXT,
  sort_order  INTEGER DEFAULT 0,
  active      INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS engine_capabilities (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  capability TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS site_content (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  section    TEXT NOT NULL,
  key        TEXT NOT NULL,
  value      TEXT,
  sort_order INTEGER DEFAULT 0,
  UNIQUE(section, key)
);
`

let _db: DatabaseSync | null = null

export function getWebDb(): DatabaseSync {
  if (!_db) {
    _db = new DatabaseSync(path.join(DB_DIR, 'web.db'))
    _db.exec(SCHEMA)
  }
  return _db
}
