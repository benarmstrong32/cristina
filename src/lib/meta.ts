import { ACTION_PRIORITY, pickAction, type MetaAction } from "./actions";
import { addDays, chunkRange, iso } from "./dates";
import { getDb } from "./db";

const VERSION = () => process.env.META_API_VERSION || "v24.0";
const TOKEN = () => {
  const t = process.env.META_ACCESS_TOKEN;
  if (!t) throw new Error("META_ACCESS_TOKEN is not set. See .env.example.");
  return t;
};

// Error codes Meta uses for throttling / transient failures.
const RETRYABLE = new Set([1, 2, 4, 17, 32, 341, 613, 80000, 80003, 80004, 80014]);

class MetaError extends Error {
  constructor(message: string, public code?: number) {
    super(message);
  }
}

async function graph<T>(pathOrUrl: string, params: Record<string, string> = {}): Promise<T> {
  const url = pathOrUrl.startsWith("http")
    ? new URL(pathOrUrl)
    : new URL(`https://graph.facebook.com/${VERSION()}/${pathOrUrl}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  if (!url.searchParams.has("access_token")) url.searchParams.set("access_token", TOKEN());

  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url);
    const body = await res.json().catch(() => ({}));
    if (res.ok && !body.error) return body as T;
    const code: number | undefined = body?.error?.code;
    const msg = body?.error?.message || `HTTP ${res.status}`;
    if (attempt < 5 && (RETRYABLE.has(code ?? -1) || res.status >= 500)) {
      const wait = 2 ** attempt * 5_000; // 5s, 10s, 20s, 40s, 80s
      console.warn(`[meta] ${msg} (code ${code}); retrying in ${wait / 1000}s`);
      await new Promise((r) => setTimeout(r, wait));
      continue;
    }
    throw new MetaError(`Meta API: ${msg}`, code);
  }
}

async function paginate<T>(path: string, params: Record<string, string>): Promise<T[]> {
  const out: T[] = [];
  let page = await graph<{ data: T[]; paging?: { next?: string } }>(path, params);
  out.push(...page.data);
  while (page.paging?.next) {
    page = await graph(page.paging.next);
    out.push(...page.data);
  }
  return out;
}

type MetaAccount = {
  id: string; name: string; currency: string; timezone_name?: string;
  account_status?: number; business?: { name?: string };
};

const ACCOUNT_FIELDS = "id,name,currency,timezone_name,account_status,business{name}";

/** Every ad account the token can see: owned + client accounts when a business id is set. */
export async function fetchAdAccounts(): Promise<MetaAccount[]> {
  const biz = process.env.META_BUSINESS_ID;
  const lists = biz
    ? await Promise.all([
        paginate<MetaAccount>(`${biz}/owned_ad_accounts`, { fields: ACCOUNT_FIELDS, limit: "200" }),
        paginate<MetaAccount>(`${biz}/client_ad_accounts`, { fields: ACCOUNT_FIELDS, limit: "200" }),
      ])
    : [await paginate<MetaAccount>("me/adaccounts", { fields: ACCOUNT_FIELDS, limit: "200" })];
  const byId = new Map<string, MetaAccount>();
  lists.flat().forEach((a) => byId.set(a.id, a));
  return [...byId.values()];
}

type CampaignRow = {
  id: string; name: string; objective?: string; effective_status?: string;
  daily_budget?: string; lifetime_budget?: string;
};

type InsightRow = {
  campaign_id: string; campaign_name: string; objective?: string; date_start: string;
  spend?: string; impressions?: string; clicks?: string; inline_link_clicks?: string;
  actions?: MetaAction[]; action_values?: MetaAction[];
};

const INSIGHT_FIELDS = [
  "campaign_id", "campaign_name", "objective", "spend", "impressions", "clicks",
  "inline_link_clicks", "actions", "action_values",
].join(",");

/** Budgets come back in the currency's minor unit (cents), except zero-decimal currencies like JPY. */
const ZERO_DECIMAL = new Set(["JPY", "KRW", "CLP", "COP", "CRC", "HUF", "ISK", "IDR", "PYG", "TWD", "VND"]);
const budget = (v: string | undefined, currency: string) =>
  v ? Number(v) / (ZERO_DECIMAL.has(currency) ? 1 : 100) : null;

export async function syncAccount(accountId: string, currency: string, since: string, until: string): Promise<number> {
  const db = getDb();
  const now = new Date().toISOString();

  const campaigns = await paginate<CampaignRow>(`${accountId}/campaigns`, {
    fields: "id,name,objective,effective_status,daily_budget,lifetime_budget",
    limit: "500",
  });
  const upsertCampaign = db.prepare(`
    INSERT INTO campaigns (id, account_id, name, objective, effective_status, daily_budget, lifetime_budget, updated_at)
    VALUES (@id, @account_id, @name, @objective, @effective_status, @daily_budget, @lifetime_budget, @updated_at)
    ON CONFLICT(id) DO UPDATE SET name=excluded.name, objective=excluded.objective,
      effective_status=excluded.effective_status, daily_budget=excluded.daily_budget,
      lifetime_budget=excluded.lifetime_budget, updated_at=excluded.updated_at`);
  db.transaction(() => {
    for (const c of campaigns) {
      upsertCampaign.run({
        id: c.id, account_id: accountId, name: c.name, objective: c.objective ?? null,
        effective_status: c.effective_status ?? null, daily_budget: budget(c.daily_budget, currency),
        lifetime_budget: budget(c.lifetime_budget, currency), updated_at: now,
      });
    }
  })();

  const upsertInsight = db.prepare(`
    INSERT INTO daily_insights (campaign_id, account_id, date, spend, impressions, clicks, link_clicks,
      landing_page_views, add_to_carts, checkouts, purchases, purchase_value, leads, fetched_at)
    VALUES (@campaign_id, @account_id, @date, @spend, @impressions, @clicks, @link_clicks,
      @landing_page_views, @add_to_carts, @checkouts, @purchases, @purchase_value, @leads, @fetched_at)
    ON CONFLICT(campaign_id, date) DO UPDATE SET spend=excluded.spend, impressions=excluded.impressions,
      clicks=excluded.clicks, link_clicks=excluded.link_clicks, landing_page_views=excluded.landing_page_views,
      add_to_carts=excluded.add_to_carts, checkouts=excluded.checkouts, purchases=excluded.purchases,
      purchase_value=excluded.purchase_value, leads=excluded.leads, fetched_at=excluded.fetched_at`);
  const ensureCampaign = db.prepare(`
    INSERT INTO campaigns (id, account_id, name, objective, updated_at) VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(id) DO NOTHING`);

  let rows = 0;
  for (const chunk of chunkRange(since, until, 30)) {
    const data = await paginate<InsightRow>(`${accountId}/insights`, {
      level: "campaign",
      time_increment: "1",
      time_range: JSON.stringify(chunk),
      fields: INSIGHT_FIELDS,
      // Use each ad set's own attribution setting -- matches what Ads Manager shows.
      use_unified_attribution_setting: "true",
      limit: "500",
    });
    db.transaction(() => {
      // Replace the window so campaigns that dropped to zero don't keep stale numbers.
      db.prepare(`DELETE FROM daily_insights WHERE account_id = ? AND date BETWEEN ? AND ?`)
        .run(accountId, chunk.since, chunk.until);
      for (const r of data) {
        ensureCampaign.run(r.campaign_id, accountId, r.campaign_name, r.objective ?? null, now);
        upsertInsight.run({
          campaign_id: r.campaign_id,
          account_id: accountId,
          date: r.date_start,
          spend: Number(r.spend ?? 0),
          impressions: Number(r.impressions ?? 0),
          clicks: Number(r.clicks ?? 0),
          link_clicks: Number(r.inline_link_clicks ?? 0),
          landing_page_views: pickAction(r.actions, ACTION_PRIORITY.landing_page_views),
          add_to_carts: pickAction(r.actions, ACTION_PRIORITY.add_to_carts),
          checkouts: pickAction(r.actions, ACTION_PRIORITY.checkouts),
          purchases: pickAction(r.actions, ACTION_PRIORITY.purchases),
          purchase_value: pickAction(r.action_values, ACTION_PRIORITY.purchases),
          leads: pickAction(r.actions, ACTION_PRIORITY.leads),
          fetched_at: now,
        });
      }
    })();
    rows += data.length;
  }
  db.prepare(`UPDATE accounts SET last_synced_at = ? WHERE id = ?`).run(now, accountId);
  return rows;
}

export type SyncOptions = { since?: string; until?: string; accountIds?: string[]; log?: (m: string) => void };

/** Discover accounts, then re-pull the trailing lookback window (or an explicit range) for each. */
export async function runSync(opts: SyncOptions = {}) {
  const log = opts.log ?? console.log;
  const db = getDb();
  const lookback = Number(process.env.SYNC_LOOKBACK_DAYS || 28);
  const until = opts.until ?? iso(new Date());
  const since = opts.since ?? addDays(until, -(lookback - 1));
  const run = db.prepare(`INSERT INTO sync_runs (started_at, status, since, until) VALUES (?, 'running', ?, ?)`)
    .run(new Date().toISOString(), since, until);
  const runId = run.lastInsertRowid;
  let total = 0;
  const failures: string[] = [];

  try {
    const accounts = await fetchAdAccounts();
    log(`Found ${accounts.length} ad accounts`);
    const upsert = db.prepare(`
      INSERT INTO accounts (id, name, currency, timezone, business_name, account_status)
      VALUES (@id, @name, @currency, @timezone, @business_name, @account_status)
      ON CONFLICT(id) DO UPDATE SET name=excluded.name, currency=excluded.currency,
        timezone=excluded.timezone, business_name=excluded.business_name, account_status=excluded.account_status`);
    db.transaction(() => {
      for (const a of accounts) {
        upsert.run({
          id: a.id, name: a.name, currency: a.currency, timezone: a.timezone_name ?? null,
          business_name: a.business?.name ?? null, account_status: a.account_status ?? null,
        });
      }
    })();

    const hidden = new Set(
      (db.prepare(`SELECT id FROM accounts WHERE is_hidden = 1`).all() as { id: string }[]).map((r) => r.id),
    );
    const targets = accounts.filter(
      (a) => !hidden.has(a.id) && (!opts.accountIds || opts.accountIds.includes(a.id)),
    );
    for (const a of targets) {
      try {
        const n = await syncAccount(a.id, a.currency, since, until);
        total += n;
        log(`  ${a.name} (${a.id}): ${n} campaign-days`);
      } catch (e) {
        failures.push(`${a.name}: ${(e as Error).message}`);
        log(`  ${a.name} (${a.id}): FAILED ${(e as Error).message}`);
      }
    }
    const status = failures.length ? "error" : "ok";
    db.prepare(`UPDATE sync_runs SET finished_at=?, status=?, rows=?, message=? WHERE id=?`)
      .run(new Date().toISOString(), status, total, failures.join("\n") || null, runId);
    return { status, rows: total, failures };
  } catch (e) {
    db.prepare(`UPDATE sync_runs SET finished_at=?, status='error', rows=?, message=? WHERE id=?`)
      .run(new Date().toISOString(), total, (e as Error).message, runId);
    throw e;
  }
}
