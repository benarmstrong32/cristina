import { getDb } from "./db";
import { previousPeriod } from "./dates";
import { EMPTY_TOTALS, type Totals } from "./metrics";

const SUMS = `
  COALESCE(SUM(i.spend),0) AS spend,
  COALESCE(SUM(i.impressions),0) AS impressions,
  COALESCE(SUM(i.clicks),0) AS clicks,
  COALESCE(SUM(i.link_clicks),0) AS link_clicks,
  COALESCE(SUM(i.landing_page_views),0) AS landing_page_views,
  COALESCE(SUM(i.add_to_carts),0) AS add_to_carts,
  COALESCE(SUM(i.checkouts),0) AS checkouts,
  COALESCE(SUM(i.purchases),0) AS purchases,
  COALESCE(SUM(i.purchase_value),0) AS purchase_value,
  COALESCE(SUM(i.leads),0) AS leads`;

export type Account = {
  id: string; name: string; currency: string; timezone: string | null;
  business_name: string | null; account_status: number | null;
  owner_type: "internal" | "client"; client_name: string | null;
  target_roas: number | null; is_hidden: number; last_synced_at: string | null;
};

export type Scope = { ownerType?: "internal" | "client"; currency?: string; accountId?: string };

function scopeSql(scope: Scope) {
  const where = ["a.is_hidden = 0"];
  const args: unknown[] = [];
  if (scope.ownerType) { where.push("a.owner_type = ?"); args.push(scope.ownerType); }
  if (scope.currency) { where.push("a.currency = ?"); args.push(scope.currency); }
  if (scope.accountId) { where.push("a.id = ?"); args.push(scope.accountId); }
  return { where: where.join(" AND "), args };
}

export function listAccounts(includeHidden = false): Account[] {
  return getDb().prepare(
    `SELECT * FROM accounts ${includeHidden ? "" : "WHERE is_hidden = 0"}
     ORDER BY owner_type DESC, COALESCE(client_name, name)`,
  ).all() as Account[];
}

export function getAccount(id: string): Account | undefined {
  return getDb().prepare(`SELECT * FROM accounts WHERE id = ?`).get(id) as Account | undefined;
}

export function currencies(): { currency: string; spend: number }[] {
  return getDb().prepare(`
    SELECT a.currency, COALESCE(SUM(i.spend),0) AS spend FROM accounts a
    LEFT JOIN daily_insights i ON i.account_id = a.id
    WHERE a.is_hidden = 0 GROUP BY a.currency ORDER BY spend DESC`).all() as { currency: string; spend: number }[];
}

type Actual = { revenue: number; spend: number };

/**
 * Uploaded revenue per account, plus the Meta spend on exactly those account-days.
 * Blended ROAS = revenue / that spend, so accounts or days without uploads don't dilute it.
 */
function actualRevenue(scope: Scope, since: string, until: string): Map<string, Actual> {
  const { where, args } = scopeSql(scope);
  const rows = getDb().prepare(`
    SELECT r.account_id, SUM(r.revenue) AS revenue,
      COALESCE(SUM((SELECT SUM(i.spend) FROM daily_insights i WHERE i.account_id = r.account_id AND i.date = r.date)), 0) AS spend
    FROM actual_revenue r JOIN accounts a ON a.id = r.account_id
    WHERE ${where} AND r.date BETWEEN ? AND ? GROUP BY r.account_id`)
    .all(...args, since, until) as { account_id: string; revenue: number; spend: number }[];
  return new Map(rows.map((r) => [r.account_id, { revenue: r.revenue, spend: r.spend }]));
}

const actualFields = (a: Actual | undefined) => ({ actual_revenue: a?.revenue ?? null, actual_spend: a?.spend ?? 0 });

export function totals(scope: Scope, since: string, until: string): Totals & { actual_accounts: number } {
  const { where, args } = scopeSql(scope);
  const row = getDb().prepare(`
    SELECT ${SUMS} FROM daily_insights i JOIN accounts a ON a.id = i.account_id
    WHERE ${where} AND i.date BETWEEN ? AND ?`).get(...args, since, until) as Omit<Totals, "actual_revenue" | "actual_spend">;
  const actual = [...actualRevenue(scope, since, until).values()];
  return {
    ...EMPTY_TOTALS, ...row,
    actual_revenue: actual.length ? actual.reduce((a, b) => a + b.revenue, 0) : null,
    actual_spend: actual.reduce((a, b) => a + b.spend, 0),
    actual_accounts: actual.length,
  };
}

export type AccountRow = Account & { cur: Totals; prev: Totals; active_campaigns: number };

export function accountSummaries(scope: Scope, since: string, until: string): AccountRow[] {
  const db = getDb();
  const { where, args } = scopeSql(scope);
  const prev = previousPeriod(since, until);
  const sumBy = (s: string, u: string) => new Map(
    (db.prepare(`
      SELECT i.account_id, ${SUMS} FROM daily_insights i JOIN accounts a ON a.id = i.account_id
      WHERE ${where} AND i.date BETWEEN ? AND ? GROUP BY i.account_id`).all(...args, s, u) as
      (Omit<Totals, "actual_revenue" | "actual_spend"> & { account_id: string })[]).map((r) => [r.account_id, r]),
  );
  const cur = sumBy(since, until);
  const old = sumBy(prev.since, prev.until);
  const actCur = actualRevenue(scope, since, until);
  const actPrev = actualRevenue(scope, prev.since, prev.until);
  const active = new Map(
    (db.prepare(`SELECT account_id, COUNT(*) AS n FROM campaigns WHERE effective_status = 'ACTIVE' GROUP BY account_id`)
      .all() as { account_id: string; n: number }[]).map((r) => [r.account_id, r.n]),
  );
  const accounts = db.prepare(`SELECT a.* FROM accounts a WHERE ${where}`).all(...args) as Account[];
  return accounts.map((a) => ({
    ...a,
    cur: { ...EMPTY_TOTALS, ...cur.get(a.id), ...actualFields(actCur.get(a.id)) },
    prev: { ...EMPTY_TOTALS, ...old.get(a.id), ...actualFields(actPrev.get(a.id)) },
    active_campaigns: active.get(a.id) ?? 0,
  })).sort((x, y) => y.cur.spend - x.cur.spend);
}

export type DailyPoint = { date: string; spend: number; purchase_value: number; purchases: number; actual_revenue: number | null };

export function daily(scope: Scope, since: string, until: string): DailyPoint[] {
  const { where, args } = scopeSql(scope);
  const rows = getDb().prepare(`
    SELECT i.date, SUM(i.spend) AS spend, SUM(i.purchase_value) AS purchase_value, SUM(i.purchases) AS purchases
    FROM daily_insights i JOIN accounts a ON a.id = i.account_id
    WHERE ${where} AND i.date BETWEEN ? AND ? GROUP BY i.date ORDER BY i.date`)
    .all(...args, since, until) as Omit<DailyPoint, "actual_revenue">[];
  const actual = new Map(
    (getDb().prepare(`
      SELECT r.date, SUM(r.revenue) AS revenue FROM actual_revenue r JOIN accounts a ON a.id = r.account_id
      WHERE ${where} AND r.date BETWEEN ? AND ? GROUP BY r.date`).all(...args, since, until) as
      { date: string; revenue: number }[]).map((r) => [r.date, r.revenue]),
  );
  // Fill gaps so the chart's x-axis is continuous.
  const byDate = new Map(rows.map((r) => [r.date, r]));
  const out: DailyPoint[] = [];
  for (let d = since; d <= until; ) {
    const r = byDate.get(d);
    out.push({ date: d, spend: r?.spend ?? 0, purchase_value: r?.purchase_value ?? 0, purchases: r?.purchases ?? 0, actual_revenue: actual.get(d) ?? null });
    const n = new Date(d + "T00:00:00Z"); n.setUTCDate(n.getUTCDate() + 1); d = n.toISOString().slice(0, 10);
  }
  return out;
}

export type CampaignRow = {
  id: string; name: string; objective: string | null; effective_status: string | null;
  daily_budget: number | null; lifetime_budget: number | null; cur: Totals; prev: Totals;
};

export function campaignSummaries(accountId: string, since: string, until: string): CampaignRow[] {
  const db = getDb();
  const prev = previousPeriod(since, until);
  const sumBy = (s: string, u: string) => new Map(
    (db.prepare(`SELECT i.campaign_id, ${SUMS} FROM daily_insights i WHERE i.account_id = ? AND i.date BETWEEN ? AND ? GROUP BY i.campaign_id`)
      .all(accountId, s, u) as (Omit<Totals, "actual_revenue" | "actual_spend"> & { campaign_id: string })[]).map((r) => [r.campaign_id, r]),
  );
  const cur = sumBy(since, until);
  const old = sumBy(prev.since, prev.until);
  const campaigns = db.prepare(`SELECT * FROM campaigns WHERE account_id = ?`).all(accountId) as Omit<CampaignRow, "cur" | "prev">[];
  return campaigns
    .filter((c) => cur.has(c.id) || c.effective_status === "ACTIVE")
    .map((c) => ({
      ...c,
      cur: { ...EMPTY_TOTALS, ...cur.get(c.id) },
      prev: { ...EMPTY_TOTALS, ...old.get(c.id) },
    }))
    .sort((a, b) => b.cur.spend - a.cur.spend);
}

export function lastSync() {
  return getDb().prepare(`SELECT * FROM sync_runs ORDER BY id DESC LIMIT 1`).get() as
    | { started_at: string; finished_at: string | null; status: string; rows: number; message: string | null }
    | undefined;
}
