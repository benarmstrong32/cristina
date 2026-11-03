# Meta Campaign Tracker

One dashboard for every Meta (Facebook/Instagram) ad account we run — ours and our clients'. It syncs campaign data from the Meta Marketing API into a local database and shows ROAS, revenue, CPA and funnel metrics with period-over-period change.

## What it tracks

| Level | Metrics |
|---|---|
| Portfolio (all accounts, filter ours vs clients) | Spend, Meta-attributed revenue, ROAS, blended ROAS, purchases, cost per purchase, AOV, revenue − ad spend, link CTR, CPM, leads/CPL; each vs previous period |
| Account | Everything above + CPC, click→purchase rate, daily revenue vs spend chart, 7-day rolling ROAS vs target, funnel (impressions → clicks → LPV → ATC → checkout → purchase) |
| Campaign | Status, budget, spend, revenue, ROAS, vs-target flag, purchases, CPA, AOV, CTR, CPM, adds to cart |

Plus: per-account **target ROAS** with on-target / near / below flags, **CSV export**, and **uploaded actual revenue** (Shopify/Stripe/CRM) for blended ROAS.

## How the numbers stay accurate

- **No double-counting.** Meta reports one purchase under several action types (`omni_purchase`, `purchase`, `offsite_conversion.fb_pixel_purchase`). We take the first one present in priority order, matching Ads Manager's "Purchases" column (`src/lib/actions.ts`).
- **Same attribution as Ads Manager.** Insights are requested with `use_unified_attribution_setting=true`, so each ad set's own attribution window is used.
- **Late conversions are picked up.** Meta keeps attributing purchases to past days. Every sync re-pulls the trailing `SYNC_LOOKBACK_DAYS` (default 28) and replaces those days.
- **Ratios come from totals.** ROAS, CPA, CTR, etc. are always total ÷ total, never an average of daily ratios.
- **No mixing currencies.** Portfolio totals only sum accounts with the same currency; there's a currency switcher when clients bill in different ones.
- **Blended ROAS is like-for-like.** Uploaded revenue is divided by Meta spend on exactly the same account-days.
- Reach and frequency are left out on purpose: they can't be summed across days or campaigns.

## Setup

1. **Get a token.** In Meta Business Settings → Users → System Users, create a system user, assign it every ad account (owned + client accounts shared to your Business Manager) with at least "View performance", and generate a token with `ads_read`.
2. **Configure.**
   ```bash
   cp .env.example .env   # then fill in META_ACCESS_TOKEN, META_BUSINESS_ID, APP_PASSWORD
   npm install
   ```
3. **Backfill history** (once):
   ```bash
   npm run sync -- --since 2026-01-01
   ```
4. **Run it.**
   ```bash
   npm run build && npm start      # http://localhost:3000
   ```
5. In **Accounts & sync**, mark each account as ours/client, give it a client name and target ROAS, and hide anything you don't want tracked.
6. **Keep it fresh.** Schedule the sync, e.g. every 3 hours:
   ```cron
   0 */3 * * * cd /path/to/app && npm run sync >> sync.log 2>&1
   ```

Want to look around first? `npm run seed:demo` loads clearly-labelled fake data (delete `data/tracker.db` to remove it).

### Uploading actual revenue

On an account page, upload a CSV:
```csv
date,revenue,orders
2026-10-01,4210.55,61
2026-10-02,3890.10,57
```
Re-uploading a date overwrites it.

## Deploying

The app stores data in SQLite (`DATABASE_PATH`), so it needs a host with a persistent disk: a small VPS, Railway/Render/Fly.io with a volume, or an office machine. Serverless hosts like Vercel won't keep the database between requests. Always set `APP_PASSWORD` when it's reachable from the internet — this holds client data.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run sync` | Re-pull the lookback window for all accounts |
| `npm run sync -- --since 2026-06-01 --until 2026-06-30 --account act_123` | Targeted backfill |
| `npm run seed:demo` | Load fake demo data |
| `npm test` | Unit tests for metric math and action de-duplication |
| `npm run typecheck` | TypeScript check |

## Layout

```
src/lib/meta.ts      Meta API client: account discovery, insights sync, retries/backoff
src/lib/actions.ts   Action-type de-duplication (purchases, ATC, checkouts, leads, LPV)
src/lib/metrics.ts   Derived metrics (ROAS, CPA, AOV, CTR, CPM, ...)
src/lib/queries.ts   SQL aggregation for portfolio / account / campaign views
src/lib/db.ts        SQLite schema
src/app/             Pages: portfolio, accounts/[id], settings; /api/export CSV
src/proxy.ts         Password protection (HTTP basic auth)
scripts/             sync + demo seed CLIs
```
