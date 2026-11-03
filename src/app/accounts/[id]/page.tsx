import Link from "next/link";
import { notFound } from "next/navigation";
import { clearRevenue, uploadRevenue } from "../../actions";
import { Filters } from "../../../components/Filters";
import { Change, Kpi, RoasStatus } from "../../../components/Kpi";
import { TrendChart } from "../../../components/TrendChart";
import { previousPeriod, resolveRange } from "../../../lib/dates";
import { ago, money, num, pct, roas } from "../../../lib/format";
import { change, derive } from "../../../lib/metrics";
import { campaignSummaries, daily, getAccount, totals } from "../../../lib/queries";
import { rollingRoas } from "../../../lib/series";

export const dynamic = "force-dynamic";

export default async function AccountPage({ params, searchParams }: {
  params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const account = getAccount(decodeURIComponent(id));
  if (!account) notFound();

  const range = resolveRange(sp);
  const prevRange = previousPeriod(range.since, range.until);
  const scope = { accountId: account.id };
  const cur = totals(scope, range.since, range.until);
  const prev = totals(scope, prevRange.since, prevRange.until);
  const d = derive(cur), p = derive(prev);
  const points = daily(scope, range.since, range.until);
  const campaigns = campaignSummaries(account.id, range.since, range.until);
  const m = (v: number | null) => money(v, account.currency);
  const hasActual = points.some((x) => x.actual_revenue != null);
  const base = `/accounts/${encodeURIComponent(account.id)}`;

  return (
    <>
      <div className="small"><Link href="/">← Portfolio</Link></div>
      <h1>{account.client_name || account.name}</h1>
      <div className="muted small">
        {account.name} · {account.id} · {account.currency} · {account.timezone ?? "—"} ·{" "}
        {account.owner_type === "internal" ? "our account" : "client"} · target ROAS {account.target_roas ? roas(account.target_roas) : <Link href="/settings">set one</Link>} · synced {ago(account.last_synced_at)}
      </div>

      <Filters basePath={base} params={sp} range={range} />

      <div className="kpis">
        <Kpi label="Ad spend" value={m(cur.spend)} change={change(cur.spend, prev.spend)} />
        <Kpi label="Revenue (Meta-attributed)" value={m(cur.purchase_value)} change={change(cur.purchase_value, prev.purchase_value)} />
        <Kpi label="ROAS" value={roas(d.roas)} change={change(d.roas, p.roas)} sub={account.target_roas ? `target ${roas(account.target_roas)}` : undefined} />
        {cur.actual_revenue != null && <>
          <Kpi label="Uploaded revenue" value={m(cur.actual_revenue)} change={change(cur.actual_revenue, prev.actual_revenue)} />
          <Kpi label="Blended ROAS" value={roas(d.blended_roas)} change={change(d.blended_roas, p.blended_roas)} sub="uploaded revenue ÷ Meta spend" />
        </>}
        <Kpi label="Purchases" value={num(cur.purchases)} change={change(cur.purchases, prev.purchases)} />
        <Kpi label="Cost per purchase" value={m(d.cpa)} change={change(d.cpa, p.cpa)} goodWhenUp={false} />
        <Kpi label="Avg order value" value={m(d.aov)} change={change(d.aov, p.aov)} />
        <Kpi label="Revenue − ad spend" value={m(d.profit_after_ads)} change={change(d.profit_after_ads, p.profit_after_ads)} />
        <Kpi label="CPM" value={m(d.cpm)} change={change(d.cpm, p.cpm)} goodWhenUp={false} />
        <Kpi label="Link CTR" value={pct(d.ctr)} change={change(d.ctr, p.ctr)} />
        <Kpi label="Cost per link click" value={m(d.cpc)} change={change(d.cpc, p.cpc)} goodWhenUp={false} />
        <Kpi label="Click → purchase" value={pct(d.cvr)} change={change(d.cvr, p.cvr)} />
        {cur.leads > 0 && <Kpi label="Leads" value={num(cur.leads)} sub={`${m(d.cpl)} per lead`} change={change(cur.leads, prev.leads)} />}
      </div>

      <div className="grid2" style={{ marginTop: 12 }}>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Revenue vs spend, daily</h2>
          <TrendChart dates={points.map((x) => x.date)} unit={{ kind: "money", currency: account.currency }} series={[
            { key: "rev", label: "Meta revenue", color: "var(--series-1)", values: points.map((x) => x.purchase_value) },
            { key: "spend", label: "Spend", color: "var(--series-2)", values: points.map((x) => x.spend) },
            ...(hasActual ? [{ key: "act", label: "Uploaded revenue", color: "var(--series-3)", dashed: true, values: points.map((x) => x.actual_revenue) }] : []),
          ]} />
        </div>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>ROAS, 7-day rolling</h2>
          <TrendChart dates={points.map((x) => x.date)} unit={{ kind: "roas" }}
            reference={account.target_roas ? { value: account.target_roas, label: `Target ${roas(account.target_roas)}` } : undefined}
            series={[{ key: "roas", label: "ROAS", color: "var(--series-1)", values: rollingRoas(points) }]} />
        </div>
      </div>

      <h2>Funnel</h2>
      <Funnel steps={[
        ["Impressions", cur.impressions], ["Link clicks", cur.link_clicks], ["Landing page views", cur.landing_page_views],
        ["Adds to cart", cur.add_to_carts], ["Checkouts started", cur.checkouts], ["Purchases", cur.purchases],
      ]} />

      <h2>Campaigns</h2>
      <div className="tablewrap">
        <table>
          <thead>
            <tr><th>Campaign</th><th>Status</th><th>Budget</th><th>Spend</th><th>Δ</th><th>Revenue</th><th>ROAS</th><th>Δ</th><th>vs target</th>
              <th>Purchases</th><th>CPA</th><th>AOV</th><th>CTR</th><th>CPM</th><th>ATC</th>{cur.leads > 0 && <th>Leads</th>}</tr>
          </thead>
          <tbody>
            {campaigns.map((c) => {
              const cd = derive(c.cur), cp = derive(c.prev);
              return (
                <tr key={c.id}>
                  <td title={c.id}>{c.name}<div className="small muted">{c.objective?.replace("OUTCOME_", "").toLowerCase()}</div></td>
                  <td><span className="badge">{c.effective_status?.toLowerCase() ?? "—"}</span></td>
                  <td>{c.daily_budget ? `${m(c.daily_budget)}/day` : c.lifetime_budget ? `${m(c.lifetime_budget)} total` : "ad set"}</td>
                  <td>{m(c.cur.spend)}</td><td><Change v={change(c.cur.spend, c.prev.spend)} /></td>
                  <td>{m(c.cur.purchase_value)}</td><td><b>{roas(cd.roas)}</b></td><td><Change v={change(cd.roas, cp.roas)} /></td>
                  <td><RoasStatus roas={cd.roas} target={account.target_roas} /></td>
                  <td>{num(c.cur.purchases)}</td><td>{m(cd.cpa)}</td><td>{m(cd.aov)}</td><td>{pct(cd.ctr)}</td><td>{m(cd.cpm)}</td>
                  <td>{num(c.cur.add_to_carts)}</td>{cur.leads > 0 && <td>{num(c.cur.leads)}</td>}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <h2>Actual revenue (source of truth)</h2>
      <div className="card">
        <p className="small muted" style={{ marginTop: 0 }}>
          Meta&apos;s revenue is modelled and can over- or under-count. Upload daily revenue from Shopify, Stripe or the CRM to see
          blended ROAS (total revenue ÷ Meta spend). CSV columns: <code>date,revenue,orders</code> with dates as YYYY-MM-DD.
          Re-uploading a day overwrites it.
        </p>
        <form action={uploadRevenue} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <input type="hidden" name="account_id" value={account.id} />
          <input type="file" name="file" accept=".csv,text/csv" required />
          <button type="submit">Upload CSV</button>
        </form>
        {hasActual && (
          <form action={clearRevenue} style={{ marginTop: 8 }}>
            <input type="hidden" name="account_id" value={account.id} />
            <button className="ghost" type="submit">Remove all uploaded revenue for this account</button>
          </form>
        )}
      </div>
    </>
  );
}

function Funnel({ steps }: { steps: [string, number][] }) {
  const top = steps[0][1] || 1;
  return (
    <div className="card">
      {steps.map(([label, v], i) => {
        const prevV = i ? steps[i - 1][1] : null;
        return (
          <div key={label} style={{ display: "grid", gridTemplateColumns: "150px 1fr 120px", gap: 10, alignItems: "center", margin: "4px 0" }}>
            <span className="small">{label}</span>
            <div style={{ background: "var(--grid)", borderRadius: 4, height: 14 }}>
              <div style={{ width: `${Math.max(0.5, Math.sqrt(v / top) * 100)}%`, height: 14, background: "var(--series-1)", borderRadius: 4 }} />
            </div>
            <span className="small" style={{ textAlign: "right" }}>
              {num(v)}{prevV ? <span className="muted"> · {pct(v / prevV, 1)}</span> : null}
            </span>
          </div>
        );
      })}
      <div className="small muted">Bar length uses a square-root scale so lower steps stay visible; percentages are step-to-step conversion.</div>
    </div>
  );
}
