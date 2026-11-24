import { Fragment } from "react";
import { requireSession } from "@/lib/auth";
import { getData } from "@/lib/data";
import {
  bonus, byChannel, campaigns, daily, funnel, goals, highlights, monthLabel, months, overview, parsePeriod,
  triageByMonth, triageStats, yes, type Period,
} from "@/lib/metrics";
import { num, pct, ratio, shortDate, usd } from "@/lib/format";
import { Controls, Freshness, Funnel, Kpi, TABS, TopBar, type TabKey } from "@/components/ui";
import { BarChart } from "@/components/BarChart";
import { MonthBars } from "@/components/MonthBars";
import { AdPreview } from "@/components/AdPreview";
import { BONUS_GOAL, BONUS_PER_DEAL, SHEET_START } from "@/config/scorecard";
import type { Applicant, Data } from "@/lib/types";

export const dynamic = "force-dynamic";

type SP = { range?: string; from?: string; to?: string; view?: string };

export default async function Home({ searchParams }: { searchParams: Promise<SP> }) {
  const session = await requireSession();
  const sp = await searchParams;
  const period = parsePeriod(sp);
  const view: TabKey = (TABS.find((t) => t.key === sp.view)?.key ?? "overview") as TabKey;
  const d = await getData();
  const o = overview(d, period);
  const back = `/?${new URLSearchParams({ view, ...(sp.range ? { range: sp.range } : {}), ...(sp.from ? { from: sp.from } : {}), ...(sp.to ? { to: sp.to } : {}) })}`;

  return (
    <main className="shell">
      <TopBar session={session} />
      <Controls period={period} view={view} />
      <Freshness d={d} back={back} />
      <p className="period">
        {shortDate(o.since)} – {shortDate(o.until)} · Meta and triage calls use these exact dates · intros and deals use{" "}
        {o.months.map(monthLabel).join(", ")} (the sheet logs them by month)
        {o.since < `${SHEET_START}-01` ? <> · the intro and triage logs start in Sept 2026, so earlier months show ad results and deals only</> : null}
      </p>
      {view === "overview" && <Overview d={d} period={period} />}
      {view === "funnel" && <FunnelTab d={d} period={period} />}
      {view === "people" && <People d={d} period={period} />}
      {view === "which-ad" && <WhichAd d={d} period={period} />}
      {view === "ads" && <Ads d={d} period={period} />}
      {view === "intros" && <Intros d={d} />}
      {view === "triage" && <TriageTab d={d} period={period} />}
      {view === "deals" && <Deals d={d} />}
      {view === "log" && <Log d={d} />}
      {view === "how" && <How />}
    </main>
  );
}

function Overview({ d, period }: { d: Data; period: Period }) {
  const o = overview(d, period);
  const g = goals(d);
  const h = highlights(d, period);
  const ch = byChannel(d, period);
  const ms = months(d);
  const days = daily(d, o.since, o.until);
  const introPct = Math.min(1, g.completed / g.introGoal);
  const salesPct = Math.min(1, g.wonMonthly / g.salesGoal);
  return (
    <>
      <div className="grid kpis four">
        <Kpi tone="spend" label="Ad spend" value={usd(o.ads.spend)} hint="Spent on Meta ads" />
        <Kpi tone="lead" label="Applications & leads" value={num(o.ads.applications)} hint={`Applications and lead forms Meta counted · ${usd(o.ads.cpa)} each`} />
        <Kpi tone="partial" label="Triage calls" value={num(o.triage.completed)} hint={`Completed by Cristina · ${num(o.triage.bookedIntro)} booked an intro`} />
        <Kpi tone="booked" label="Intros completed" value={num(o.allIntros.completed)} hint={`${num(o.allIntros.booked)} booked · ${pct(o.allIntros.showRate, 0)} show rate · all sources`} />
        <Kpi tone="qualified" label="Deals won" value={num(o.allWins)} hint={`${o.metaWins} from Meta · ${usd(o.allRevenue)} contract value`} />
        <Kpi tone="sale" label="Revenue from Meta" value={usd(o.metaRevenue)} hint="Contract value of Meta deals closed" />
        <Kpi tone="cost" label="Meta ROAS" value={ratio(o.roas)} hint={`Revenue from Meta ÷ ${usd(o.salesSpend)} spend in the same months`} />
        <Kpi tone="cost" label="Cost per completed intro" value={usd(o.costPerCompleted)} hint={`Meta CAC ${usd(o.cac)} per deal`} />
      </div>

      <h2 className="section">This month <span className="sub">{monthLabel(g.month)} 1 – {g.daysInMonth} · doesn't change with the date range</span></h2>
      <div className="grid kpis four">
        <div className="card kpi tone-spend">
          <div className="label">Ad spend this month</div>
          <div className="value tnum">{usd(g.monthSpend)}{g.budget ? <span style={{ fontSize: 16, color: "var(--text-3)", fontWeight: 500 }}> / {usd(g.budget)}</span> : null}</div>
          <div className="hint">Meta, {monthLabel(g.month)} 1 – {g.day} · {usd(g.perDay)} a day on average{g.budget ? ` · ${usd(Math.max(0, g.budget - g.monthSpend))} of budget left` : ""}</div>
          {g.budget ? <div className="goal-track"><div className={`goal-bar${g.projected > g.budget ? " over" : ""}`} style={{ width: `${Math.min(100, (g.monthSpend / g.budget) * 100)}%` }} /></div> : null}
        </div>
        <div className="card kpi tone-spend">
          <div className="label">On track to spend by the {g.daysInMonth}th</div>
          <div className="value tnum">{usd(g.onTrack)}{g.budget ? <span style={{ fontSize: 16, color: "var(--text-3)", fontWeight: 500 }}> / {usd(g.budget)}</span> : null}</div>
          <div className="hint">{usd(g.monthSpend)} so far + {usd(g.last7)} a day (last 7 days' pace) × {g.daysLeft} day{g.daysLeft === 1 ? "" : "s"} left</div>
          {g.budget ? <div className="goal-track"><div className={`goal-bar${g.onTrack > g.budget ? " over" : ""}`} style={{ width: `${Math.min(100, (g.onTrack / g.budget) * 100)}%` }} /></div> : null}
        </div>
        <div className="card kpi">
          <div className="label">Completed intros</div>
          <div className="value tnum">{g.completed} / {g.introGoal}</div>
          <div className="hint">{g.completed >= g.introGoal ? "Goal met: Cristina earns the $100" : `${g.introGoal - g.completed} more for the goal and Cristina's $${BONUS_GOAL}`}</div>
          <div className="goal-track"><div className={`goal-bar${introPct >= 1 ? " met" : ""}`} style={{ width: `${introPct * 100}%` }} /></div>
        </div>
        <div className="card kpi">
          <div className="label">New monthly value won</div>
          <div className="value tnum">{usd(g.wonMonthly)} / {usd(g.salesGoal)}</div>
          <div className="hint">{g.deals} deal{g.deals === 1 ? "" : "s"} · {usd(g.wonTotal)} total contract value · {usd(Math.max(0, g.salesGoal - g.wonMonthly))} left to win</div>
          <div className="goal-track"><div className={`goal-bar${salesPct >= 1 ? " met" : ""}`} style={{ width: `${salesPct * 100}%` }} /></div>
        </div>
      </div>

      <h2 className="section">Highlights <span className="sub">best results, {shortDate(h.since)} – {shortDate(h.until)}</span></h2>
      <div className="grid hl-grid">
        <div className="card hl"><div className="label">Top ad for applications</div><div className="big">{h.topAd?.name ?? "—"}</div><p>{h.topAd ? `${h.topAd.applications} applications and leads, ${pct(h.topAd.share, 0)} of all Meta results in this period.` : "No applications in this period."}</p></div>
        <div className="card hl"><div className="label">Lowest cost per application</div><div className="big">{usd(h.cheapest?.cpa ?? null)}</div><p>{h.cheapest ? `From “${h.cheapest.name}”, against ${usd(h.cheapest.overall)} across all ads.` : "Not enough applications in this period."}</p></div>
        <div className="card hl"><div className="label">Highest click-through rate</div><div className="big">{pct(h.ctr?.ctr ?? null)}</div><p>{h.ctr ? `“${h.ctr.name}” at ${usd(h.ctr.cpc, true)} per click.` : "Not enough impressions in this period."}</p></div>
        <div className="card hl"><div className="label">{h.best?.isDay ? "Best day for applications" : "Best week for applications"}</div><div className="big">{h.best ? `${h.best.applications} application${h.best.applications === 1 ? "" : "s"}` : "—"}</div><p>{h.best ? (h.best.isDay ? `${shortDate(h.best.key)}.` : `Week of ${shortDate(h.best.key)}.`) : "No applications in this period."}</p></div>
        <div className="card hl"><div className="label">Meta close rate</div><div className="big">{pct(h.closeRate.rate, 0)}</div><p>{h.closeRate.months.length ? `${h.closeRate.won} deal${h.closeRate.won === 1 ? "" : "s"} from ${h.closeRate.completed} completed Meta intros (${h.closeRate.months.map(monthLabel).join(", ")}).` : "The intro log starts in Sept 2026."}</p></div>
        <div className="card hl"><div className="label">Triage to intro</div><div className="big">{pct(h.triage.introRate, 0)}</div><p>{h.triage.completed ? `${h.triage.bookedIntro} of ${h.triage.completed} completed triage calls booked an intro.` : "No completed triage calls in this period."}</p></div>
      </div>

      <h2 className="section">Daily <span className="sub">{shortDate(o.since)} – {shortDate(o.until)}</span></h2>
      <div className="grid two">
        <div className="card"><p className="chart-title">Ad spend</p><BarChart data={days.map((x) => ({ date: x.date, value: x.spend }))} color="var(--t-spend)" format="usd" label="Daily Meta spend" /></div>
        <div className="card"><p className="chart-title">Applications</p><BarChart data={days.map((x) => ({ date: x.date, value: x.apps }))} color="var(--t-lead)" format="int" label="Daily applications" /></div>
      </div>

      <h2 className="section">By channel <span className="sub">{ch.months.map(monthLabel).join(", ")} · deals counted in the month they closed</span></h2>
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
        <div className="card"><p className="chart-title">Revenue won from Meta (by close month)</p><MonthBars data={ms.map((m) => ({ month: m.month, value: m.metaRevenue }))} color="var(--gold)" format="usd" label="Revenue won from Meta by month" /></div>
      </div>
    </>
  );
}

function FunnelTab({ d, period }: { d: Data; period: Period }) {
  const o = overview(d, period);
  return (
    <>
      <h2 className="section">Meta funnel <span className="sub">from ad click to deal won</span></h2>
      <Funnel steps={funnel(o)} />
      <p className="note">Clicks and applications use the exact dates. Intros and deals use the months listed above. Each percentage compares a step with the one before it. Triage calls are shown separately below because the sheet has only logged them since November.</p>
      <div className="grid kpis" style={{ marginTop: 16 }}>
        <Kpi tone="cost" label="Cost per application" value={usd(o.ads.cpa)} />
        <Kpi tone="cost" label="Cost per completed intro" value={usd(o.costPerCompleted)} hint="Meta intros" />
        <Kpi tone="cost" label="Cost per deal (Meta CAC)" value={usd(o.cac)} />
        <Kpi tone="booked" label="Intro show rate" value={pct(o.metaIntros.showRate, 0)} hint="Meta intros" />
        <Kpi tone="qualified" label="Close rate" value={pct(o.closeRate, 0)} hint="Meta deals ÷ completed Meta intros" />
        <Kpi tone="partial" label="Triage show rate" value={pct(o.triage.showRate, 0)} hint={`${o.triage.completed} of ${o.triage.calls} triage calls happened`} />
      </div>
      <h2 className="section">Ad delivery</h2>
      <div className="card">
        <div className="mini">
          <div><div className="label">Impressions</div><div className="value tnum">{num(o.ads.impressions)}</div></div>
          <div><div className="label">Clicks</div><div className="value tnum">{num(o.ads.clicks)}</div></div>
          <div><div className="label">CTR</div><div className="value tnum">{pct(o.ads.ctr, 2)}</div></div>
          <div><div className="label">Cost per click</div><div className="value tnum">{usd(o.ads.cpc, true)}</div></div>
          <div><div className="label">CPM</div><div className="value tnum">{usd(o.ads.cpm, true)}</div></div>
        </div>
      </div>
    </>
  );
}

const inWindow = (a: Applicant, since: string, until: string) => a.createdAt >= since && a.createdAt <= until;

function NeedsPeople({ d }: { d: Data }) {
  if (d.applicants.length) return null;
  return <div className="notice"><strong>Applicants are loading.</strong> The list of people who applied comes from GoHighLevel and appears here once it has been pulled.</div>;
}

function People({ d, period }: { d: Data; period: Period }) {
  const o = overview(d, period);
  const ps = d.applicants.filter((a) => inWindow(a, o.since, o.until)).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  const supers = ps.filter((a) => a.superQualified).length;
  const stars = d.applicants.filter((a) => a.superQualified).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return (
    <>
      <NeedsPeople d={d} />
      <div className="grid kpis four">
        <Kpi tone="lead" label="Applications & leads" value={num(ps.filter((a) => a.status === "submitted").length)} hint={funnelSplit(ps.filter((a) => a.status === "submitted"))} />
        <Kpi tone="partial" label="Partial applications" value={num(ps.filter((a) => a.status === "partial").length)} hint="Started but didn't submit" />
        <Kpi tone="cost" label="Disqualified by the form" value={num(ps.filter((a) => a.disqualified).length)} hint="Mostly revenue under $250K" />
        <Kpi tone="qualified" label="Super qualified ★" value={num(supers)} hint="Click a ★ to see why" />
      </div>
      {stars.length ? (
        <>
          <h2 className="section">★ Super qualified <span className="sub">$1M+ revenue, a decision-maker, and a clear buying signal · all applicants</span></h2>
          <div className="grid two">
            {stars.map((a) => (
              <div className="card notable-card" key={a.contactId}>
                <div className="notable-head"><span className="notable-company">★ {a.company || a.name}</span>{a.ghlUrl ? <a className="ad-links" href={a.ghlUrl} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: "var(--accent)", textDecoration: "none" }}>Open in GHL ↗</a> : null}</div>
                <div className="notable-lead">{a.name}<span> · applied {shortDate(a.createdAt)}{a.stage && a.stage !== "Disqualified by the form" ? ` · ${a.stage}` : ""}</span></div>
                <p>{a.why}</p>
              </div>
            ))}
          </div>
        </>
      ) : null}
      <h2 className="section">Everyone who applied <span className="sub">newest first · click anyone for every answer and detail</span></h2>
      <div className="people-list">
        {ps.map((a) => (
          <details className="card person" key={a.contactId}>
            <summary className="person-row">
              <span className="star">{a.superQualified ? "★" : ""}</span>
              <span className="pname">{a.name || <span className="muted">No name given</span>}</span>
              <span className="pco">{a.company || "—"}{a.funnel ? <span className="pfunnel">{a.funnel}</span> : null}</span>
              <span className="pdate">{shortDate(a.createdAt)}</span>
              <span><span className={`pill ${a.status === "submitted" ? (a.disqualified ? "bad" : "good") : "warn"}`}>{a.status === "submitted" ? (a.disqualified ? "Disqualified" : "Submitted") : "Partial"}</span></span>
              <span className="pstage">
                {a.disqualified || a.triage ? <TriageNote a={a} /> : null}
                {a.stage && a.stage !== "Disqualified by the form" ? <span className="stage-sub">{a.stage}</span> : null}
              </span>
            </summary>
            {a.superQualified ? <div className="why">★ {a.why}</div> : null}
            <dl className="answers">
              {a.email ? <><dt>Email</dt><dd>{a.email}</dd></> : null}
              {a.phone ? <><dt>Phone</dt><dd>{a.phone}</dd></> : null}
              {a.answers.map((x, i) => <Fragment key={i}><dt>{x.question}</dt><dd>{x.answer || "—"}</dd></Fragment>)}
              {a.calls?.length ? <><dt>Calls</dt><dd>{a.calls.map((c) => `${shortDate(c.date)} · ${c.title} · ${c.status}`).join("\n")}</dd></> : null}
              {a.attribution?.adId ? <><dt>Ad clicked</dt><dd>{adName(d, a.attribution.adId)}</dd></> : null}
              {a.source ? <><dt>Source</dt><dd>{a.source}</dd></> : null}
              {a.tags?.length ? <><dt>Tags</dt><dd>{a.tags.join(", ")}</dd></> : null}
            </dl>
            {a.ghlUrl ? <p style={{ margin: "10px 0 0" }}><a href={a.ghlUrl} target="_blank" rel="noreferrer" style={{ color: "var(--accent)", textDecoration: "none", fontSize: 13 }}>Open in GHL ↗</a></p> : null}
          </details>
        ))}
        {!ps.length && d.applicants.length ? <div className="card">No applications in this period.</div> : null}
      </div>
    </>
  );
}

function TriageNote({ a }: { a: Applicant }) {
  const t = a.triage;
  if (!t) return <span className="tri none">No triage call booked</span>;
  const label = {
    completed: `Triage call ${shortDate(t.date)} · completed${t.bookedIntro.toLowerCase() === "yes" ? " · booked intro" : t.bookedIntro.toLowerCase() === "no" ? " · no intro" : ""}`,
    "no-show": `Triage call ${shortDate(t.date)} · no-show`,
    cancelled: `Triage call ${shortDate(t.date)} · cancelled`,
    upcoming: `Triage call booked for ${shortDate(t.date)}`,
    booked: `Triage call ${shortDate(t.date)} · not logged in the sheet`,
  }[t.state];
  const tone = t.state === "completed" ? "good" : t.state === "upcoming" || t.state === "booked" ? "warn" : "bad";
  return <span className={`tri ${tone}`}>{label}</span>;
}

function funnelSplit(xs: Applicant[]) {
  const by = new Map<string, number>();
  for (const a of xs) by.set(a.funnel ?? "Unlimited Video", (by.get(a.funnel ?? "Unlimited Video") ?? 0) + 1);
  return [...by.entries()].map(([k, v]) => `${v} ${k}`).join(" · ") || "Submitted an application or lead form";
}

const adName = (d: Data, id: string) => d.adTotals.find((x) => x.id === id)?.name ?? `Ad ${id}`;

function WhichAd({ d, period }: { d: Data; period: Period }) {
  const o = overview(d, period);
  const ps = d.applicants.filter((a) => inWindow(a, o.since, o.until));
  const names = new Map(d.adTotals.map((a) => [a.id, a]));
  const groups = new Map<string, Applicant[]>();
  for (const a of ps) {
    const byName = a.attribution?.adName ? d.adTotals.find((x) => x.name.trim().toLowerCase() === a.attribution!.adName!.trim().toLowerCase())?.id : undefined;
    const k = a.attribution?.adId ?? byName ?? (a.attribution?.adName ? `name:${a.attribution.adName}` : "none");
    groups.set(k, [...(groups.get(k) ?? []), a]);
  }
  const sorted = [...groups.entries()].filter(([k]) => k !== "none").sort((a, b) => b[1].length - a[1].length);
  const untracked = groups.get("none")?.length ?? 0;
  return (
    <>
      <NeedsPeople d={d} />
      <h2 className="section">Which ad each applicant came from <span className="sub">the ad each person clicked before applying, from GoHighLevel's tracking</span></h2>
      <div className="ads-by-lead">
        {sorted.map(([id, people]) => {
          const ad = names.get(id);
          return (
            <AdPreview key={id} ad={ad ?? (id.startsWith("name:") ? { id: "", name: id.slice(5), status: "", spend: 0, impressions: 0, clicks: 0, applications: 0 } : undefined)} c={d.creatives[id]}>
              <div className="ad-meta" style={{ marginTop: 6 }}><b>{people.length} {people.length === 1 ? "person" : "people"}</b> from GoHighLevel clicked this ad · {people.filter((x) => x.status === "submitted").length} applied · {people.filter((x) => x.superQualified).length} ★</div>
              <table className="ad-people"><tbody>
                {people.map((p) => (
                  <tr key={p.contactId}>
                    <td><strong>{p.superQualified ? "★ " : ""}{p.name || "No name given"}</strong>{p.company ? <span style={{ color: "var(--text-3)" }}> · {p.company}</span> : null}</td>
                    <td className="muted">{p.status === "submitted" ? (p.disqualified ? "Applied · disqualified" : "Applied") : "Started, did not finish"}{p.stage && p.stage !== "Disqualified by the form" ? ` · ${p.stage}` : ""}</td>
                    <td className="r">{p.ghlUrl ? <a href={p.ghlUrl} target="_blank" rel="noreferrer">Open in GHL ↗</a> : null}</td>
                  </tr>
                ))}
              </tbody></table>
            </AdPreview>
          );
        })}
      </div>
      {untracked ? <p className="note">{untracked} {untracked === 1 ? "person has" : "people have"} no ad recorded (organic, direct, or tracking was blocked).</p> : null}
    </>
  );
}

function Ads({ d, period }: { d: Data; period: Period }) {
  const o = overview(d, period);
  const cs = campaigns(d, o.since, o.until);
  const active = d.adTotals.filter((a) => a.status === "ACTIVE").sort((a, b) => b.spend - a.spend);
  const statusPill = (s: string) => (s === "ACTIVE" ? <span className="pill good">Active</span> : <span className="pill">{s.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}</span>);
  return (
    <>
      <h2 className="section">Active ads <span className="sub">ads running now, with results since the ads started (not affected by the date range)</span></h2>
      <div className="ads-by-lead">
        {active.map((a) => <AdPreview key={a.id} ad={a} c={d.creatives[a.id]} />)}
      </div>
      <details className="card expand" style={{ marginTop: 12 }}>
        <summary>Active ads as a table</summary>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Ad</th><th>Status</th><th className="r">Spend</th><th className="r">Impr.</th><th className="r">CTR</th><th className="r">Cost per click</th><th className="r">Applications</th><th className="r">Per application</th></tr></thead>
          <tbody>{active.map((a) => (
            <tr key={a.id}><td>{a.name}</td><td>{statusPill(a.status)}</td><td className="r tnum">{usd(a.spend)}</td><td className="r tnum">{num(a.impressions)}</td><td className="r tnum">{pct(a.impressions ? a.clicks / a.impressions : null, 2)}</td><td className="r tnum">{usd(a.clicks ? a.spend / a.clicks : null, true)}</td><td className="r tnum">{num(a.applications)}</td><td className="r tnum">{usd(a.applications ? a.spend / a.applications : null)}</td></tr>
          ))}</tbody>
        </table>
      </div>
      </details>
      <h2 className="section">Campaigns <span className="sub">{shortDate(o.since)} – {shortDate(o.until)}</span></h2>
      <div className="card table-wrap">
        <table>
          <thead><tr><th>Campaign</th><th>Channel</th><th className="r">Spend</th><th className="r">Impressions</th><th className="r">Clicks</th><th className="r">CTR</th><th className="r">Applications</th><th className="r">Per application</th></tr></thead>
          <tbody>{cs.length ? cs.map((c) => (
            <tr key={c.id}><td>{c.name}</td><td>{c.channel}</td><td className="r tnum">{usd(c.spend)}</td><td className="r tnum">{num(c.impressions)}</td><td className="r tnum">{num(c.clicks)}</td><td className="r tnum">{pct(c.ctr)}</td><td className="r tnum">{num(c.applications)}</td><td className="r tnum">{usd(c.cpa)}</td></tr>
          )) : <tr><td colSpan={8}>No spend in this period.</td></tr>}</tbody>
        </table>
      </div>
      <details className="card expand" style={{ marginTop: 16 }}>
        <summary>Every ad since April, including paused</summary>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Ad</th><th>Status</th><th className="r">Spend</th><th className="r">CTR</th><th className="r">Applications</th><th className="r">Per application</th></tr></thead>
            <tbody>{[...d.adTotals].sort((a, b) => b.spend - a.spend).map((a) => (
              <tr key={a.id}><td>{a.name}</td><td>{statusPill(a.status)}</td><td className="r tnum">{usd(a.spend)}</td><td className="r tnum">{pct(a.impressions ? a.clicks / a.impressions : null, 2)}</td><td className="r tnum">{num(a.applications)}</td><td className="r tnum">{usd(a.applications ? a.spend / a.applications : null)}</td></tr>
            ))}</tbody>
          </table>
        </div>
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
        <Kpi tone="cost" label="Cristina's bonus · since Sept" value={usd(total)} hint={`$${BONUS_GOAL} per goal met + $${BONUS_PER_DEAL} per deal`} />
      </div>
      <h2 className="section">Intros booked vs completed <span className="sub">dashed line = the month's completed-intro goal</span></h2>
      <div className="card">
        <p className="chart-title"><span style={{ color: "var(--border)" }}>■</span> Booked &nbsp; <span style={{ color: "var(--t-booked)" }}>■</span> Completed</p>
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
      {d.intros.some((r) => r.month > current) ? <p className="note">{d.intros.filter((r) => r.month > current).length} intros are already booked for next month.</p> : null}
    </>
  );
}

function TriageTab({ d, period }: { d: Data; period: Period }) {
  const o = overview(d, period);
  const rows = d.triage.filter((t) => t.date >= o.since && t.date <= o.until).sort((a, b) => (a.date < b.date ? 1 : -1));
  const st = triageStats(rows);
  const bm = triageByMonth(d);
  return (
    <>
      <div className="grid kpis four">
        <Kpi tone="partial" label="Triage calls" value={num(st.calls)} hint="On Cristina's calendar in this period" />
        <Kpi tone="booked" label="Completed" value={num(st.completed)} hint={`${pct(st.showRate, 0)} show rate`} />
        <Kpi tone="qualified" label="Booked an intro" value={num(st.bookedIntro)} hint={`${pct(st.introRate, 0)} of completed triage calls`} />
        <Kpi tone="cost" label="Ad spend per triage call" value={usd(st.completed ? o.ads.spend / st.completed : null)} hint="Meta spend ÷ completed triage calls" />
      </div>
      <h2 className="section">By month</h2>
      <div className="card table-wrap">
        <table>
          <thead><tr><th>Month</th><th className="r">Calls</th><th className="r">Completed</th><th className="r">No-show</th><th className="r">Show rate</th><th className="r">Booked an intro</th><th className="r">Triage → intro</th></tr></thead>
          <tbody>{[...bm].reverse().map((m) => (
            <tr key={m.month}><td>{monthLabel(m.month)}</td><td className="r tnum">{m.calls}</td><td className="r tnum">{m.completed}</td><td className="r tnum">{m.missed}</td><td className="r tnum">{pct(m.showRate, 0)}</td><td className="r tnum">{m.bookedIntro}</td><td className="r tnum">{pct(m.introRate, 0)}</td></tr>
          ))}</tbody>
        </table>
      </div>
      <h2 className="section">Every triage call <span className="sub">{shortDate(o.since)} – {shortDate(o.until)}, newest first</span></h2>
      <div className="card table-wrap">
        <table className="people">
          <thead><tr><th>Date</th><th>Company / prospect</th><th>Source</th><th>Completed</th><th>Booked intro</th><th>Notes</th></tr></thead>
          <tbody>
            {rows.map((t, i) => (
              <tr key={t.date + t.company + i}>
                <td>{shortDate(t.date)}</td><td>{t.company}</td><td>{t.lead_source}</td>
                <td><span className={`pill ${yes(t.completed) ? "good" : "bad"}`}>{t.completed || "—"}</span></td>
                <td><span className={`pill ${yes(t.booked_intro) ? "good" : ""}`}>{t.booked_intro || "—"}</span></td>
                <td className="wrap">{t.notes}</td>
              </tr>
            ))}
            {!rows.length ? <tr><td colSpan={6}>No triage calls in this period.</td></tr> : null}
          </tbody>
        </table>
      </div>
      <p className="note">From the Triage Calls tab of the sales ops sheet, updated {shortDate(d.sheetSavedAt)}.</p>
    </>
  );
}

function Deals({ d }: { d: Data }) {
  const ws = [...d.wins].sort((a, b) => (a.close_month < b.close_month ? 1 : a.close_month > b.close_month ? -1 : (b.contract_value ?? 0) - (a.contract_value ?? 0)));
  return (
    <>
      <h2 className="section">Won deals <span className="sub">every deal closed since the ads started in April, newest first</span></h2>
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
                <td>{yes(r.won) ? <span className="pill good">Won</span> : ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function How() {
  return (
    <div className="card">
      <dl className="defs">
        <dt>Ad spend, clicks</dt><dd>Meta, 9miles Media ad account, for the exact dates chosen. Campaigns are grouped by name: Unlimited Video, Closers.io, and Home Services or MFM.</dd>
        <dt>Applications</dt><dd>Website applications as Meta reports them.</dd>
        <dt>People</dt><dd>Everyone who submitted or started the Unlimited Video application, from GoHighLevel. ★ marks applicants who look super qualified based on their answers; click it to see why.</dd>
        <dt>Which ad</dt><dd>The Meta ad recorded in GoHighLevel's tracking when the person first came in.</dd>
        <dt>Triage calls</dt><dd>From the Triage Calls tab of the sales ops sheet: one row per call Cristina takes. Show rate = completed ÷ (completed + not completed).</dd>
        <dt>Intros</dt><dd>From the Intros Booked tab, all sources unless marked “from Meta”. Logged by month, so they use every month that starts in the chosen range plus the month it ends in.</dd>
        <dt>Deals and revenue</dt><dd>Won deals from the monthly pipeline tabs, counted in the month they closed. Revenue is contract value (monthly value × months). Deals from a Meta intro count toward Meta.</dd>
        <dt>ROAS</dt><dd>Revenue from Meta ÷ Meta spend in the same months.</dd>
        <dt>Goals</dt><dd>Completed intros against the month's goal (15 in Oct and Nov, 20 otherwise) and new monthly value won against the month's sales goal ($25,000 in November).</dd>
        <dt>Cristina's bonus</dt><dd>$100 when completed intros meet the goal, plus $50 per deal closed. Add-ons, change orders and renewals don't count.</dd>
        <dt>Updates</dt><dd>Meta numbers are a saved copy until a Meta token is added; then they refresh every 3 hours. Sheet numbers and the people list update each morning or when a new sheet is sent.</dd>
      </dl>
    </div>
  );
}

