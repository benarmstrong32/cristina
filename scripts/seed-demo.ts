import "./env";
import { getDb } from "../src/lib/db";
import { addDays, iso } from "../src/lib/dates";

// Fills the database with clearly-labelled FAKE data so you can explore the UI
// before connecting Meta. Remove with: rm data/tracker.db
const db = getDb();
let seed = 42;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

const accounts = [
  { id: "act_demo_1", name: "DEMO – Our Agency", owner: "internal", client: "Our Agency", target: 2.5, currency: "USD", scale: 80 },
  { id: "act_demo_2", name: "DEMO – Bloom Skincare", owner: "client", client: "Bloom Skincare", target: 3.0, currency: "USD", scale: 400 },
  { id: "act_demo_3", name: "DEMO – Ridge Outdoor", owner: "client", client: "Ridge Outdoor", target: 2.2, currency: "USD", scale: 650 },
  { id: "act_demo_4", name: "DEMO – Casa Pizza", owner: "client", client: "Casa Pizza", target: 4.0, currency: "USD", scale: 60 },
] as const;
const campaignNames = ["ASC – Prospecting", "Retargeting – 30d", "Advantage+ Catalog", "Creative Test – Hooks", "Offer – BFCM Preview"];

const until = addDays(iso(new Date()), -1);
const since = addDays(until, -119);
const now = new Date().toISOString();

db.transaction(() => {
  for (const a of accounts) {
    db.prepare(`INSERT OR REPLACE INTO accounts (id, name, currency, timezone, owner_type, client_name, target_roas, last_synced_at)
      VALUES (?, ?, ?, 'America/New_York', ?, ?, ?, ?)`).run(a.id, a.name, a.currency, a.owner, a.client, a.target, now);
    campaignNames.forEach((cn, ci) => {
      const cid = `${a.id}_c${ci}`;
      const active = ci !== 4;
      db.prepare(`INSERT OR REPLACE INTO campaigns (id, account_id, name, objective, effective_status, daily_budget, updated_at)
        VALUES (?, ?, ?, 'OUTCOME_SALES', ?, ?, ?)`).run(cid, a.id, cn, active ? "ACTIVE" : "PAUSED", Math.round(a.scale / (ci + 1)), now);
      const baseRoas = a.target * (0.6 + rand() * 0.9) * (ci === 1 ? 1.6 : 1);
      for (let d = since; d <= until; d = addDays(d, 1)) {
        if (!active && d > addDays(until, -30)) continue;
        const spend = (a.scale / (ci + 1)) * (0.7 + rand() * 0.6);
        const cpm = 9 + rand() * 8;
        const impressions = Math.round((spend / cpm) * 1000);
        const linkClicks = Math.round(impressions * (0.008 + rand() * 0.012));
        const lpv = Math.round(linkClicks * (0.7 + rand() * 0.2));
        const atc = Math.round(lpv * (0.08 + rand() * 0.06));
        const ic = Math.round(atc * (0.45 + rand() * 0.2));
        const roas = baseRoas * (0.6 + rand() * 0.8);
        const value = spend * roas;
        const aov = 45 + rand() * 40;
        const purchases = Math.max(0, Math.round(value / aov));
        db.prepare(`INSERT OR REPLACE INTO daily_insights (campaign_id, account_id, date, spend, impressions, clicks, link_clicks,
          landing_page_views, add_to_carts, checkouts, purchases, purchase_value, leads, fetched_at)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(cid, a.id, d, +spend.toFixed(2), impressions, Math.round(linkClicks * 1.6),
          linkClicks, lpv, atc, ic, purchases, purchases ? +value.toFixed(2) : 0, 0, now);
      }
    });
  }
  // Uploaded "actual" revenue for one client, to show blended ROAS.
  for (let d = since; d <= until; d = addDays(d, 1)) {
    const meta = (db.prepare(`SELECT SUM(purchase_value) v FROM daily_insights WHERE account_id='act_demo_2' AND date=?`).get(d) as { v: number }).v;
    db.prepare(`INSERT OR REPLACE INTO actual_revenue (account_id, date, revenue, orders, source) VALUES ('act_demo_2', ?, ?, NULL, 'demo')`)
      .run(d, +(meta * (1.1 + rand() * 0.5)).toFixed(2));
  }
})();
console.log(`Seeded demo data ${since} → ${until}`);
