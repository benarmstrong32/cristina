import { requireSession } from "@/lib/auth";
import { getData } from "@/lib/data";
import { bonus, byChannel, campaigns, daily, monthLabel, months, overview, parseRange } from "@/lib/metrics";
import { num, pct, ratio, shortDate, usd } from "@/lib/format";
import { Controls, Freshness, Kpi, TABS, TopBar, type TabKey } from "@/components/ui";
import { BarChart } from "@/components/BarChart";
import { MonthBars } from "@/components/MonthBars";
import { BONUS_GOAL, BONUS_PER_DEAL } from "@/config/scorecard";
import type { Data } from "@/lib/types";
import type { RangeKey } from "@/lib/metrics";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ range?: string; view?: string }> }) {
  const session = await requireSession();
  const sp = await searchParams;
  const range = parseRange(sp.range);
  const view: TabKey = (TABS.find((t) => t.key === sp.view)?.key ?? "overview") as TabKey;
  const d = await getData();
  const o = overview(d, range);

  return (
    <main className="shell">
      <TopBar session={session} />
      <Controls range={range} view={view} />
      <Freshness d={d} back={`/?view=${view}&range=${range}`} />
      <p className="period">
        Ads: {shortDate(o.since)} – {shortDate(o.until)}
        {o.months ? <> · Intros and deals: {monthLabel(o.months[0])} so far (the sheet logs them by month)</> : <> · Intros and deals: since Sept 1</>}
      </p>
      {view === "overview" && <Overview d={d} range={range} />}
      {view === "intros" && <Intros d={d} />}
      {view === "campaigns" && <Campaigns d={d} range={range} />}
      {view === "deals" && <Deals d={d} />}
      {view === "log" && <Log d={d} />}
    </main>
  );
}

function Overview({ d, range }: { d: Data; range: RangeKey }) {
  const o = overview(d, range);
  const ch = byChannel(d);
  const ms = months(d);
  const days = daily(d, o.since, o.until);
  const salesNote = o.months ? "this month" : "since Sept 1";
  return (
    <>
      <div className="grid kpis">
        <Kpi tone="spend" label="Meta ad spend" value={usd(o.ads.spend)} hint={`${num(o.ads.clicks)} clicks · ${pct(o.ads.ctr)} CTR`} />
        <Kpi tone="lead" label="Applications" value={num(o.ads.applications)} hint={`${usd(o.ads.cpa)} each, as Meta reports them`} />
        <Kpi tone="booked" label={`Intros booked · ${salesNote}`} value={num(o.allIntros.booked)} hint={`${num(o.allIntros.completed)} completed · ${pct(o.allIntros.showRate, 0)} show rate`} />
        <Kpi tone="sale" label={`Revenue from Meta · ${salesNote}`} value={usd(o.metaRevenue)} hint={`${o.metaWins} Meta deal${o.metaWins === 1 ? "" : "s"} closed`} />
        <Kpi tone="qualified" label={`Meta ROAS · ${salesNote}`} value={ratio(o.roas)} hint={`Revenue from Meta ÷ ${usd(o.salesSpend)} Meta spend`} />
        <Kpi tone="cost" label={`Cost per completed intro · ${salesNote}`} value={usd(o.costPerCompleted)} hint={`Meta CAC ${usd(o.cac)} per deal`} />
      </div>

      <h2 className="section">Daily Meta spend <span className="sub">{shortDate(o.since)} – {shortDate(o.until)}</span></h2>
      <div className="grid two">
        <div className="card"><p className="chart-title">Ad spend</p><BarChart data={days.map((x) => ({ date: x.date, value: x.spend }))} color="var(--t-spend)" format="usd" label="Daily Meta spend" /></div>
        <div className="card"><p className="chart-title">Applications</p><BarChart data={days.map((x) => ({ date: x.date, value: x.apps }))} color="var(--t-lead)" format="int" label="Daily applications" /></div>
      </div>

      <h2 className="section">By channel <span className="sub">since Sept 1 · deals counted in the month they closed</span></h2>
      <div className="card table-wrap">
        <table>
          <thead><tr><th>Channel</th><th className="r">Spend</th><th className="r">Applications</th><th className="r">Intros</th><th className="r">Show rate</th><th className="r">Per completed intro</th><th className="r">Won</th><th className="r">Revenue</th><th className="r">ROAS</th></tr></thead>
          <tbody>
            {[...ch.rows, ch.allMeta, ch.all].map((r) => (
              <tr key={r.channel} style={r.channel.startsWith("All") ? { fontWeight: 600 } : undefined}>
                <td>{r.channel}</td><td className="r tnum">{usd(r.spend)}</td><td className="r tnum">{num(r.applications)}</td>
                <td className="r tnum">{num(r.booked)}</td><td className="r tnum">{pct(r.showRate, 0)}</td><td className="r tnum">{usd(r.costPerCompleted)}</td>
                <td className="r tnum">{num(r.won)}</td><td className="r tnum">{usd(r.revenue)}</td><td className="r tnum">{ratio(r.roas)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="section">Month by month <span className="sub">the current month is still in progress</span></h2>
      <div className="grid two">
        <div className="card"><p className="chart-title">Meta spend</p><MonthBars data={ms.map((m) => ({ month: m.month, value: m.spend }))} color="var(--t-spend)" format="usd" label="Meta spend by month" /></div>
        <div className="card"><p className="chart-title">Revenue won from Meta (by close month)</p><MonthBars data={ms.map((m) => ({ month: m.month, value: m.metaRevenue }))} color="var(--t-sale)" format="usd" label="Revenue won from Meta by month" /></div>
      </div>
      <div className="card table-wrap" style={{ marginTop: 12 }}>
        <table>
          <thead><tr><th>Month</th><th className="r">Meta spend</th><th className="r">Revenue from Meta</th><th className="r">ROAS</th><th className="r">All deals closed</th></tr></thead>
          <tbody>{ms.map((m) => <tr key={m.month}><td>{monthLabel(m.month)}</td><td className="r tnum">{usd(m.spend)}</td><td className="r tnum">{usd(m.metaRevenue)}</td><td className="r tnum">{ratio(m.roas)}</td><td className="r tnum">{usd(m.allRevenue)}</td></tr>)}</tbody>
        </table>
      </div>

      <details className="card expand" style={{ marginTop: 20 }}>
        <summary>How these numbers are worked out</summary>
        <dl className="defs">
          <dt>Meta ad spend</dt><dd>From the 9miles Media ad account. Campaigns are grouped by name: Unlimited Video, Closers.io, and Home Services or MFM.</dd>
          <dt>Applications</dt><dd>Website applications as Meta reports them.</dd>
          <dt>Intros, show rate</dt><dd>From the Intros Booked tab. Show rate = completed ÷ (completed + no-show).</dd>
          <dt>Revenue, ROAS</dt><dd>Contract value (monthly value × months) of won deals, counted in the month they closed. Deals from a Meta intro count toward Meta. ROAS = revenue from Meta ÷ Meta spend for the same months.</dd>
          <dt>7 and 30 days</dt><dd>Meta numbers match the window exactly. The sheet logs intros and deals by month, so those use the current month so far.</dd>
        </dl>
      </details>
    </>
  );
}

function Intros({ d }: { d: Data }) {
  const b = bonus(d);
  const total = b.reduce((s, x) => s + x.total, 0);
  const cur = b[b.length - 1];
  const current = d.adsThrough.slice(0, 7);
  return (
    <>
      <div className="grid kpis">
        <Kpi tone="booked" label={`Completed intros · ${cur ? monthLabel(cur.month) : ""}`} value={cur ? `${cur.completed} / ${cur.goal}` : "—"} hint={cur ? (cur.met ? "Goal met" : `${Math.max(0, cur.goal - cur.completed)} to go for the $${BONUS_GOAL}`) : undefined} />
        <Kpi tone="sale" label={`Cristina's bonus · ${cur ? monthLabel(cur.month) : ""}`} value={cur ? usd(cur.total) : "—"} hint={cur ? `${cur.deals} qualifying deal${cur.deals === 1 ? "" : "s"} so far` : undefined} />
        <Kpi tone="cost" label="Cristina's bonus · since Sept 1" value={usd(total)} hint={`$${BONUS_GOAL} per goal met + $${BONUS_PER_DEAL} per deal`} />
      </div>
      <h2 className="section">Intros booked vs completed <span className="sub">dashed line = the month's completed-intro goal</span></h2>
      <div className="card">
        <p className="chart-title"><span style={{ color: "var(--text-3)" }}>■</span> Booked &nbsp; <span style={{ color: "var(--t-booked)" }}>■</span> Completed</p>
        <MonthBars data={b.map((x) => ({ month: x.month, value: x.booked, second: x.completed, target: x.goal }))} color="var(--border)" secondColor="var(--t-booked)" format="int" label="Intros booked and completed by month" width={1100} />
      </div>
      <h2 className="section">Cristina's bonus by month <span className="sub">${BONUS_GOAL} for meeting the completed-intro goal + ${BONUS_PER_DEAL} per deal closed · add-ons, change orders and renewals don't count</span></h2>
      <div className="card table-wrap">
        <table>
          <thead><tr><th>Month</th><th className="r">Booked</th><th className="r">Completed</th><th className="r">No-show</th><th className="r">Other</th><th className="r">Show rate</th><th className="r">Goal</th><th>Goal met</th><th>Deals counted</th><th className="r">Bonus</th></tr></thead>
          <tbody>
            {[...b].reverse().map((x) => (
              <tr key={x.month}>
                <td>{monthLabel(x.month)}</td><td className="r tnum">{x.booked}</td><td className="r tnum">{x.completed}</td><td className="r tnum">{x.missed}</td><td className="r tnum">{x.other}</td>
                <td className="r tnum">{pct(x.showRate, 0)}</td><td className="r tnum">{x.goal}</td>
                <td>{x.met ? <span className="pill good">Yes</span> : x.month === current ? <span className="pill warn">Not yet</span> : <span className="pill bad">No</span>}</td>
                <td className="wrap">{x.deals ? x.dealNames.join(", ") : "—"}</td>
                <td className="r tnum"><strong>{usd(x.total)}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Campaigns({ d, range }: { d: Data; range: RangeKey }) {
  const o = overview(d, range);
  const cs = campaigns(d, o.since, o.until);
  return (
    <>
      <h2 className="section">Meta campaigns <span className="sub">{shortDate(o.since)} – {shortDate(o.until)} · campaigns with spend</span></h2>
      <div className="card table-wrap">
        <table>
          <thead><tr><th>Campaign</th><th>Channel</th><th className="r">Spend</th><th className="r">Impressions</th><th className="r">Clicks</th><th className="r">CTR</th><th className="r">Applications</th><th className="r">Per application</th></tr></thead>
          <tbody>
            {cs.length ? cs.map((c) => (
              <tr key={c.id}><td>{c.name}</td><td>{c.channel}</td><td className="r tnum">{usd(c.spend)}</td><td className="r tnum">{num(c.impressions)}</td><td className="r tnum">{num(c.clicks)}</td><td className="r tnum">{pct(c.ctr)}</td><td className="r tnum">{num(c.applications)}</td><td className="r tnum">{usd(c.cpa)}</td></tr>
            )) : <tr><td colSpan={8}>No spend in this period.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Deals({ d }: { d: Data }) {
  const ws = [...d.wins].sort((a, b) => (a.close_month < b.close_month ? 1 : a.close_month > b.close_month ? -1 : (b.contract_value ?? 0) - (a.contract_value ?? 0)));
  return (
    <>
      <h2 className="section">Won deals <span className="sub">every deal closed since Sept 1, newest first</span></h2>
      <div className="card table-wrap">
        <table>
          <thead><tr><th>Closed</th><th>Company</th><th>Channel</th><th>Type</th><th className="r">Per month</th><th className="r">Months</th><th className="r">Contract value</th><th>Bonus deal</th></tr></thead>
          <tbody>
            {ws.map((w) => (
              <tr key={w.close_month + w.company}>
                <td>{monthLabel(w.close_month)}</td><td>{w.company}</td><td>{w.channel}</td><td>{w.deal_type || "—"}</td>
                <td className="r tnum">{usd(w.monthly_value)}</td><td className="r tnum">{w.months ?? "—"}</td><td className="r tnum">{usd(w.contract_value)}</td>
                <td><span className={`pill ${w.counts_for_bonus ? "good" : ""}`}>{w.counts_for_bonus ? "Yes" : "No"}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Log({ d }: { d: Data }) {
  const xs = [...d.intros].reverse().sort((a, b) => (a.month < b.month ? 1 : a.month > b.month ? -1 : 0));
  const tone = (c: string) => (c.toLowerCase() === "yes" ? "good" : c.toLowerCase() === "no" ? "bad" : "warn");
  return (
    <>
      <h2 className="section">Intro log <span className="sub">every intro in the sales ops sheet, newest month first</span></h2>
      <div className="card table-wrap">
        <table className="people">
          <thead><tr><th>Month</th><th>Company</th><th>Source</th><th>Channel</th><th>Completed</th><th>Won</th></tr></thead>
          <tbody>
            {xs.map((r, i) => (
              <tr key={r.month + r.company + i}>
                <td>{monthLabel(r.month)}</td><td>{r.company}</td><td>{r.lead_source}</td><td>{r.ad_channel}</td>
                <td><span className={`pill ${tone(r.completed)}`}>{r.completed || "—"}</span></td>
                <td>{r.won.toLowerCase() === "yes" ? <span className="pill good">Won</span> : ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
