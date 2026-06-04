-- Per-partner workspace schema
-- Applied when a new playground is provisioned

PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS users (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  email      TEXT UNIQUE NOT NULL,
  full_name  TEXT,
  role       TEXT NOT NULL DEFAULT 'member',
  status     TEXT NOT NULL DEFAULT 'active',
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS roles (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT UNIQUE NOT NULL,
  permissions TEXT NOT NULL DEFAULT '[]',
  created_at  INTEGER DEFAULT (unixepoch())
);

INSERT OR IGNORE INTO roles (name, permissions) VALUES
  ('admin',  '["*"]'),
  ('member', '["read"]');
