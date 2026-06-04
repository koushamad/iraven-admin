-- Per-partner workspace DB schema.
-- Path: db/workspace/{slug}/workspace.db
-- Created by the workspace-provision Argo workflow during partner onboarding.

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

CREATE TABLE IF NOT EXISTS auth_tokens (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  token      TEXT UNIQUE NOT NULL,
  email      TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  used       INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS playground_products (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  product_key TEXT UNIQUE NOT NULL,
  status      TEXT NOT NULL DEFAULT 'enabled',
  enabled_at  INTEGER DEFAULT (unixepoch())
);

INSERT OR IGNORE INTO roles (name, permissions) VALUES
  ('admin',  '["*"]'),
  ('editor', '["read","write"]'),
  ('member', '["read"]');
