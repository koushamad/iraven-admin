import { DatabaseSync } from 'node:sqlite'
import path from 'path'

const DB_DIR = process.env.DB_DIR ?? path.join(process.cwd(), 'db')

const SCHEMA = `
PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS platform_users (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  email             TEXT UNIQUE NOT NULL,
  full_name         TEXT,
  status            TEXT NOT NULL DEFAULT 'invited',
  is_platform_admin INTEGER NOT NULL DEFAULT 0,
  last_login_at     INTEGER,
  created_at        INTEGER DEFAULT (unixepoch()),
  updated_at        INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS playgrounds (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  slug                TEXT UNIQUE NOT NULL,
  display_name        TEXT NOT NULL,
  owner_email         TEXT,
  status              TEXT NOT NULL DEFAULT 'active',
  lock_reason         TEXT,
  provisioning_status TEXT NOT NULL DEFAULT 'not_started',
  billing_status      TEXT NOT NULL DEFAULT 'not_configured',
  billing_email       TEXT,
  pm_brand            TEXT,
  pm_last4            TEXT,
  pm_exp              TEXT,
  created_at          INTEGER DEFAULT (unixepoch()),
  updated_at          INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS playground_requests (
  id                      INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name               TEXT NOT NULL,
  work_email              TEXT NOT NULL,
  company_name            TEXT NOT NULL,
  website                 TEXT,
  requested_slug          TEXT NOT NULL,
  interested_products     TEXT,
  description             TEXT,
  company_stage           TEXT,
  source_page             TEXT,
  agreed_to_contact       INTEGER NOT NULL DEFAULT 0,
  status                  TEXT NOT NULL DEFAULT 'submitted',
  converted_playground_id INTEGER,
  created_at              INTEGER DEFAULT (unixepoch()),
  updated_at              INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS product_access_requests (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name         TEXT NOT NULL,
  work_email        TEXT NOT NULL,
  company_name      TEXT NOT NULL,
  playground_slug   TEXT,
  product_key       TEXT NOT NULL,
  use_case          TEXT,
  source_page       TEXT,
  agreed_to_contact INTEGER NOT NULL DEFAULT 0,
  status            TEXT NOT NULL DEFAULT 'submitted',
  created_at        INTEGER DEFAULT (unixepoch()),
  updated_at        INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS playground_products (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  playground_id INTEGER NOT NULL,
  product_key   TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'not_requested',
  enabled_at    INTEGER,
  created_at    INTEGER DEFAULT (unixepoch()),
  UNIQUE(playground_id, product_key)
);

CREATE TABLE IF NOT EXISTS provisioning_runs (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  playground_id INTEGER NOT NULL,
  run_id        TEXT,
  status        TEXT NOT NULL DEFAULT 'not_started',
  current_step  TEXT,
  started_at    INTEGER,
  finished_at   INTEGER,
  created_at    INTEGER DEFAULT (unixepoch()),
  updated_at    INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  actor_email   TEXT,
  actor_type    TEXT NOT NULL DEFAULT 'user',
  playground_id INTEGER,
  action        TEXT NOT NULL,
  target        TEXT,
  metadata      TEXT,
  created_at    INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS admin_notes (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  subject_type TEXT NOT NULL,
  subject_id   INTEGER NOT NULL,
  author_email TEXT,
  body         TEXT NOT NULL,
  created_at   INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS reserved_subdomains (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  slug             TEXT UNIQUE NOT NULL,
  reason           TEXT,
  created_by_email TEXT,
  created_at       INTEGER DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS catalog_products (
  key                 TEXT PRIMARY KEY,
  name                TEXT NOT NULL,
  tagline             TEXT,
  entry_url           TEXT,
  app_url_pattern     TEXT,
  required_permission TEXT NOT NULL,
  accent              TEXT DEFAULT 'cyan',
  status              TEXT DEFAULT 'available',
  sort_order          INTEGER DEFAULT 0,
  description         TEXT
);
`

let _db: DatabaseSync | null = null

function seed(db: DatabaseSync): void {
  const count = (db.prepare('SELECT COUNT(*) as c FROM catalog_products').get() as { c: number }).c
  if (count > 0) return

  const ic = db.prepare(`INSERT OR IGNORE INTO catalog_products (key,name,tagline,entry_url,app_url_pattern,required_permission,accent,status,sort_order) VALUES (?,?,?,?,?,?,?,?,?)`)
  const catalog: [string,string,string,string,string,string,string,string,number][] = [
    ['playground','Playground','Your isolated partner runtime','workspace.iraven.io','{slug}.iraven.io','playground.read','cyan','available',0],
    ['media','Media','Content, campaigns & publishing OS','media.iraven.io','{slug}-media.iraven.io','media.read','cyan','available',1],
    ['database','Database','Managed visibility into your data layer','database.iraven.io','{slug}-database.iraven.io','database.read','cyan','available',2],
    ['ai','AI','Practical AI for business operations','ai.iraven.io','{slug}-ai.iraven.io','ai.read','cyan','available',3],
    ['agent','Agent','Controlled automations with oversight','agent.iraven.io','{slug}-agent.iraven.io','agent.read','cyan','available',4],
    ['ads','Ads','Operate & monitor paid campaigns','ads.iraven.io','{slug}-ads.iraven.io','ads.read','cyan','available',5],
    ['advertise','Advertise','Plan advertising strategy','advertise.iraven.io','{slug}-advertise.iraven.io','advertise.read','cyan','available',6],
    ['cloud','Cloud','Deployments, domains & GitOps visibility','cloud.iraven.io','{slug}-cloud.iraven.io','cloud.read','cyan','available',7],
  ]
  for (const r of catalog) ic.run(...r)

  const is = db.prepare(`INSERT OR IGNORE INTO reserved_subdomains (slug,reason) VALUES (?,?)`)
  for (const slug of ['workspace','admin','api','auth','login','billing','media','database','db','ai','agent','agents','claude','ads','advertise','cloud','app','apps','docs','support','status','mail','www','root','system','internal','dev','staging','prod','production','test','iraven'])
    is.run(slug, 'system')

  const iu = db.prepare(`INSERT OR IGNORE INTO platform_users (email,full_name,status,is_platform_admin) VALUES (?,?,?,?)`)
  iu.run('ops@iraven.io','IRaven Operator','active',1)
  iu.run('maya.chen@nike.example','Maya Chen','active',0)
  iu.run('pat.doyle@globex.example','Pat Doyle','active',0)
  iu.run('sam.cole@initech.example','Sam Cole','disabled',0)

  const ipg = db.prepare(`INSERT OR IGNORE INTO playgrounds (slug,display_name,owner_email,status,provisioning_status,billing_status,billing_email,pm_brand,pm_last4) VALUES (?,?,?,?,?,?,?,?,?)`)
  ipg.run('nike','Nike Growth Lab','maya.chen@nike.example','active','completed','active','billing@nike.example','Visa','4242')
  ipg.run('northwind','Northwind Labs',null,'active','queued','trialing',null,null,null)
  ipg.run('globex','Globex','pat.doyle@globex.example','payment_failed','completed','payment_failed',null,null,null)

  const ipr = db.prepare(`INSERT OR IGNORE INTO playground_requests (id,full_name,work_email,company_name,requested_slug,interested_products,status,source_page,agreed_to_contact,created_at) VALUES (?,?,?,?,?,?,?,?,1,unixepoch()-?)`)
  ipr.run(101,'Alex Rivera','alex@adidas.example','Adidas','adidas','["media","ads","advertise"]','pending_review','workspace.iraven.io',86400)
  ipr.run(102,'Jordan Lee','jordan@northwind.example','Northwind Labs','northwind','["ai","agent","database"]','approved','ai.iraven.io',518400)

  const ipar = db.prepare(`INSERT OR IGNORE INTO product_access_requests (id,full_name,work_email,company_name,playground_slug,product_key,use_case,status,source_page,agreed_to_contact,created_at) VALUES (?,?,?,?,?,?,?,?,?,1,unixepoch()-?)`)
  ipar.run(201,'Maya Chen','maya.chen@nike.example','Nike','nike','cloud','Need deploy & GitOps visibility','pending_review','cloud.iraven.io',172800)
  ipar.run(202,'Pat Doyle','pat.doyle@globex.example','Globex','globex','storage','Need object storage for asset backups','pending_review','storage.iraven.io',43200)

  const nikeId = (db.prepare(`SELECT id FROM playgrounds WHERE slug='nike'`).get() as {id:number}|undefined)?.id
  const northwindId = (db.prepare(`SELECT id FROM playgrounds WHERE slug='northwind'`).get() as {id:number}|undefined)?.id
  const globexId = (db.prepare(`SELECT id FROM playgrounds WHERE slug='globex'`).get() as {id:number}|undefined)?.id

  const ipp = db.prepare(`INSERT OR IGNORE INTO playground_products (playground_id,product_key,status) VALUES (?,?,?)`)
  if (nikeId) { ipp.run(nikeId,'playground','enabled'); ipp.run(nikeId,'media','enabled'); ipp.run(nikeId,'ai','enabled'); ipp.run(nikeId,'cloud','requested') }
  if (northwindId) { ipp.run(northwindId,'playground','enabled') }
  if (globexId) { ipp.run(globexId,'playground','enabled'); ipp.run(globexId,'media','enabled') }

  const irun = db.prepare(`INSERT OR IGNORE INTO provisioning_runs (playground_id,run_id,status,current_step,started_at,finished_at) VALUES (?,?,?,?,unixepoch()-3600,unixepoch()-3000)`)
  if (nikeId) irun.run(nikeId,'prv_8f21','completed','Sync GitOps repo')
  if (northwindId) db.prepare(`INSERT OR IGNORE INTO provisioning_runs (playground_id,run_id,status,current_step,started_at) VALUES (?,?,?,?,unixepoch()-600)`).run(northwindId,'prv_9a07','running','Deploy products')
  if (globexId) irun.run(globexId,'prv_5c33','completed','Trigger Argo Workflow')

  const ia = db.prepare(`INSERT OR IGNORE INTO audit_logs (actor_email,actor_type,playground_id,action,target) VALUES (?,?,?,?,?)`)
  ia.run('ops@iraven.io','admin',nikeId??null,'playground.created','nike')
  ia.run('ops@iraven.io','admin',nikeId??null,'product.enabled','media')
  ia.run('ops@iraven.io','admin',nikeId??null,'product.enabled','ai')
  ia.run('maya.chen@nike.example','user',nikeId??null,'product.access_requested','cloud')
  ia.run('pat.doyle@globex.example','user',globexId??null,'product.access_requested','storage')
}

export function getWorkspaceDb(): DatabaseSync {
  if (!_db) {
    _db = new DatabaseSync(path.join(DB_DIR, 'workspace.db'))
    _db.exec(SCHEMA)
  }
  return _db
}
