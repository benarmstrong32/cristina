import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "tracker.db");

const SCHEMA = `
CREATE TABLE IF NOT EXISTS accounts (
  id            TEXT PRIMARY KEY,          -- act_123...
  name          TEXT NOT NULL,
  currency      TEXT NOT NULL DEFAULT 'USD',
  timezone      TEXT,
  business_name TEXT,
  account_status INTEGER,
  owner_type    TEXT NOT NULL DEFAULT 'client' CHECK (owner_type IN ('internal','client')),
  client_name   TEXT,                      -- grouping label, e.g. "Acme Co"
  target_roas   REAL,                      -- per-account goal, e.g. 3.0
  is_hidden     INTEGER NOT NULL DEFAULT 0,
  last_synced_at TEXT
);

CREATE TABLE IF NOT EXISTS campaigns (
  id              TEXT PRIMARY KEY,
  account_id      TEXT NOT NULL REFERENCES accounts(id),
  name            TEXT NOT NULL,
  objective       TEXT,
  effective_status TEXT,
  daily_budget    REAL,
  lifetime_budget REAL,
  updated_at      TEXT
);
CREATE INDEX IF NOT EXISTS idx_campaigns_account ON campaigns(account_id);

-- One row per campaign per day (account timezone), as Meta reports it.
CREATE TABLE IF NOT EXISTS daily_insights (
  campaign_id     TEXT NOT NULL,
  account_id      TEXT NOT NULL,
  date            TEXT NOT NULL,           -- YYYY-MM-DD
  spend           REAL NOT NULL DEFAULT 0,
  impressions     INTEGER NOT NULL DEFAULT 0,
  clicks          INTEGER NOT NULL DEFAULT 0, -- all clicks
  link_clicks     INTEGER NOT NULL DEFAULT 0,
  landing_page_views INTEGER NOT NULL DEFAULT 0,
  add_to_carts    REAL NOT NULL DEFAULT 0,
  checkouts       REAL NOT NULL DEFAULT 0,
  purchases       REAL NOT NULL DEFAULT 0,
  purchase_value  REAL NOT NULL DEFAULT 0, -- Meta-attributed revenue
  leads           REAL NOT NULL DEFAULT 0,
  fetched_at      TEXT NOT NULL,
  PRIMARY KEY (campaign_id, date)
);
CREATE INDEX IF NOT EXISTS idx_insights_account_date ON daily_insights(account_id, date);

-- Revenue from the source of truth (Shopify, Stripe, CRM...), uploaded per account per day.
CREATE TABLE IF NOT EXISTS actual_revenue (
  account_id TEXT NOT NULL REFERENCES accounts(id),
  date       TEXT NOT NULL,
  revenue    REAL NOT NULL,
  orders     INTEGER,
  source     TEXT,
  PRIMARY KEY (account_id, date)
);

CREATE TABLE IF NOT EXISTS sync_runs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  started_at  TEXT NOT NULL,
  finished_at TEXT,
  status      TEXT NOT NULL,               -- running | ok | error
  since       TEXT,
  until       TEXT,
  rows        INTEGER DEFAULT 0,
  message     TEXT
);
`;

let db: Database.Database | undefined;

export function getDb(): Database.Database {
  if (db) return db;
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(SCHEMA);
  return db;
}
