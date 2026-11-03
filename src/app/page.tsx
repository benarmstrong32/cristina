import Link from "next/link";
import { Filters, SegLinks } from "../components/Filters";
import { Change, Kpi, RoasStatus } from "../components/Kpi";
import { TrendChart } from "../components/TrendChart";
import { previousPeriod, resolveRange } from "../lib/dates";
import { ago, money, num, pct, roas } from "../lib/format";
import { change, derive } from "../lib/metrics";
import { accountSummaries, currencies, daily, lastSync, totals, type Scope } from "../lib/queries";
import { rollingRoas } from "../lib/series";

export const dynamic = "force-dynamic";

type SP = Promise<Record<string, string | undefined>>;

export default async function Portfolio({ searchParams }: { searchParams: SP }) {
  const params = await searchParams;
  const range = resolveRange(params);
  const curList = currencies();

  if (!curList.length) return <Empty />;

  const currency = params.currency && curList.some((c) => c.currency === params.currency) ? params.currency : curList[0].currency;
  const owner = params.owner === "internal" || params.owner === "client" ? params.owner : undefined;
  const scope: Scope = { currency, ownerType: owner };
  const prevRange = previousPeriod(range.since, range.until);

  const cur = totals(scope, range.since, range.until);
  const prev = totals(scope, prevRange.since, prevRange.until);
  const d = derive(cur), p = derive(prev);
  const rows = accountSummaries(scope, range.since, range.until);
  const points = daily(scope, range.since, range.until);
  const sync = lastSync();
  const hasActual = points.some((x) => x.actual_revenue != null);
  const m = (v: number | null) => money(v, currency);
  const linkParams = { range: params.range, since: params.since, until: params.until };

  return (
    <>
      <h1>Portfolio</h1>
      <div className="muted small">
        {range.since} → {range.until} · compared with {prevRange.since} → {prevRange.until} · last sync {ago(sync?.finished_at ?? sync?.started_at)}
        {sync?.status === "error" && <> · <Link href="/settings">last sync had errors</Link></>}
      </div>

      <Filters basePath="/" params={params} range={range} extra={<>
        <SegLinks basePath="/" params={params} name="owner" current={owner}
          options={[{ label: "All" }, { value: "internal", label: "Ours" }, { value: "client", label: "Clients" }]} />
        {curList.length > 1 && (
          <SegLinks basePath="/" params={params} name="currency" current={currency}
            options={curList.map((c) => ({ value: c.currency, label: c.currency }))} />
        )}
      </>} />

      {curList.length > 1 && (
        <div className="notice small">Accounts bill in {curList.length} currencies. Totals only add up accounts in <b>{currency}</b>. Switch currency above to see the others.</div>
      )}

      <div className="kpis">
        <Kpi label="Ad spend" value={m(cur.spend)} change={change(cur.spend, prev.spend)} goodWhenUp={true} />
        <Kpi label="Revenue (Meta-attributed)" value={m(cur.purchase_value)} change={change(cur.purchase_value, prev.purchase_value)} />
        <Kpi label="ROAS" value={roas(d.roas)} change={change(d.roas, p.roas)} />
        {cur.actual_revenue != null && (
          <Kpi label="Blended ROAS" value={roas(d.blended_roas)} sub={`uploaded revenue ÷ spend · ${cur.actual_accounts} of ${rows.length} accounts`} change={change(d.blended_roas, p.blended_roas)} />
        )}
        <Kpi label="Purchases" value={num(cur.purchases)} change={change(cur.purchases, prev.purchases)} />
        <Kpi label="Cost per purchase" value={m(d.cpa)} change={change(d.cpa, p.cpa)} goodWhenUp={false} />
        <Kpi label="Avg order value" value={m(d.aov)} change={change(d.aov, p.aov)} />
        <Kpi label="Revenue − ad spend" value={m(d.profit_after_ads)} change={change(d.profit_after_ads, p.profit_after_ads)} />
        <Kpi label="Link CTR" value={pct(d.ctr)} change={change(d.ctr, p.ctr)} />
        <Kpi label="CPM" value={m(d.cpm)} change={change(d.cpm, p.cpm)} goodWhenUp={false} />
        {cur.leads > 0 && <Kpi label="Leads" value={num(cur.leads)} sub={`${m(d.cpl)} per lead`} change={change(cur.leads, prev.leads)} />}
      </div>

      <div className="grid2" style={{ marginTop: 12 }}>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Revenue vs spend, daily</h2>
          <TrendChart dates={points.map((x) => x.date)} unit={{ kind: "money", currency }} series={[
            { key: "rev", label: "Meta revenue", color: "var(--series-1)", values: points.map((x) => x.purchase_value) },
            { key: "spend", label: "Spend", color: "var(--series-2)", values: points.map((x) => x.spend) },
            ...(hasActual ? [{ key: "act", label: "Uploaded revenue", color: "var(--series-3)", dashed: true, values: points.map((x) => x.actual_revenue) }] : []),
          ]} />
        </div>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>ROAS, 7-day rolling</h2>
          <TrendChart dates={points.map((x) => x.date)} unit={{ kind: "roas" }}
            series={[{ key: "roas", label: "ROAS", color: "var(--series-1)", values: rollingRoas(points) }]} />
        </div>
      </div>

      <h2>Accounts <a className="small" style={{ fontWeight: 400, marginLeft: 8 }}
        href={`/api/export?${new URLSearchParams({ since: range.since, until: range.until, currency, ...(owner ? { owner } : {}) })}`}>Export CSV</a></h2>
      <div className="tablewrap">
        <table>
          <thead>
            <tr>
              <th>Account</th><th>Spend</th><th>Δ</th><th>Revenue</th><th>ROAS</th><th>Δ</th><th>vs target</th>
              <th>Blended ROAS</th><th>Purchases</th><th>CPA</th><th>AOV</th><th>CTR</th><th>CPM</th><th>Active</th><th>Synced</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const rd = derive(r.cur), rp = derive(r.prev);
              return (
                <tr key={r.id}>
                  <td>
                    <Link href={{ pathname: `/accounts/${r.id}`, query: linkParams as Record<string, string> }}>{r.client_name || r.name}</Link>{" "}
                    <span className="badge">{r.owner_type === "internal" ? "ours" : "client"}</span>
                    {r.client_name && r.client_name !== r.name && <div className="small muted">{r.name}</div>}
                  </td>
                  <td>{m(r.cur.spend)}</td>
                  <td><Change v={change(r.cur.spend, r.prev.spend)} /></td>
                  <td>{m(r.cur.purchase_value)}</td>
                  <td><b>{roas(rd.roas)}</b></td>
                  <td><Change v={change(rd.roas, rp.roas)} /></td>
                  <td><RoasStatus roas={rd.roas} target={r.target_roas} /></td>
                  <td>{roas(rd.blended_roas)}</td>
                  <td>{num(r.cur.purchases)}</td>
                  <td>{m(rd.cpa)}</td>
                  <td>{m(rd.aov)}</td>
                  <td>{pct(rd.ctr)}</td>
                  <td>{m(rd.cpm)}</td>
                  <td>{r.active_campaigns}</td>
                  <td className="small muted">{ago(r.last_synced_at)}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <td>Total ({rows.length})</td><td>{m(cur.spend)}</td><td><Change v={change(cur.spend, prev.spend)} /></td>
              <td>{m(cur.purchase_value)}</td><td>{roas(d.roas)}</td><td><Change v={change(d.roas, p.roas)} /></td><td></td>
              <td>{roas(d.blended_roas)}</td><td>{num(cur.purchases)}</td><td>{m(d.cpa)}</td><td>{m(d.aov)}</td>
              <td>{pct(d.ctr)}</td><td>{m(d.cpm)}</td><td></td><td></td>
            </tr>
          </tfoot>
        </table>
      </div>
      <p className="small muted">
        Revenue and ROAS are what Meta attributes using each ad set&apos;s attribution setting (same as Ads Manager).
        Blended ROAS uses revenue you upload per account from your store/CRM, and is shown only where uploaded.
      </p>
    </>
  );
}

function Empty() {
  return (
    <div className="card" style={{ maxWidth: 680 }}>
      <h1>No data yet</h1>
      <p>Connect your Meta Business Manager to start tracking:</p>
      <ol>
        <li>Copy <code>.env.example</code> to <code>.env</code> and set <code>META_ACCESS_TOKEN</code> (a System User token with <code>ads_read</code>) and optionally <code>META_BUSINESS_ID</code>.</li>
        <li>Backfill history: <code>npm run sync -- --since 2026-01-01</code></li>
        <li>Then go to <Link href="/settings">Accounts &amp; sync</Link> to label which accounts are ours vs clients and set target ROAS.</li>
      </ol>
      <p className="muted">Just want to look around? Run <code>npm run seed:demo</code> to load sample data.</p>
    </div>
  );
}
