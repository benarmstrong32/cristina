import { resolveRange } from "../../../lib/dates";
import { derive } from "../../../lib/metrics";
import { accountSummaries } from "../../../lib/queries";

export const dynamic = "force-dynamic";

const r2 = (v: number | null) => (v == null ? "" : v.toFixed(2));
const esc = (s: string) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);

export async function GET(req: Request) {
  const q = Object.fromEntries(new URL(req.url).searchParams);
  const range = resolveRange(q);
  const owner = q.owner === "internal" || q.owner === "client" ? q.owner : undefined;
  const rows = accountSummaries({ currency: q.currency || undefined, ownerType: owner }, range.since, range.until);
  const header = ["account_id", "account", "client", "owner", "currency", "spend", "meta_revenue", "roas", "target_roas",
    "actual_revenue", "blended_roas", "purchases", "cpa", "aov", "impressions", "link_clicks", "ctr", "cpm", "cpc", "add_to_carts", "checkouts", "leads", "cpl"];
  const lines = rows.map((r) => {
    const d = derive(r.cur);
    return [r.id, esc(r.name), esc(r.client_name ?? ""), r.owner_type, r.currency, r2(r.cur.spend), r2(r.cur.purchase_value), r2(d.roas),
      r2(r.target_roas), r2(r.cur.actual_revenue), r2(d.blended_roas), r.cur.purchases, r2(d.cpa), r2(d.aov), r.cur.impressions,
      r.cur.link_clicks, d.ctr == null ? "" : (d.ctr * 100).toFixed(2) + "%", r2(d.cpm), r2(d.cpc), r.cur.add_to_carts, r.cur.checkouts, r.cur.leads, r2(d.cpl)].join(",");
  });
  return new Response([header.join(","), ...lines].join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="meta-accounts_${range.since}_${range.until}.csv"`,
    },
  });
}
