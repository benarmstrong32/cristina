import Link from "next/link";
import { notFound } from "next/navigation";
import { getClient } from "@/config/clients";
import { requireAccess } from "@/lib/auth";
import { getSnapshot } from "@/lib/data";
import { kpiFor, parseRange } from "@/lib/metrics";
import { dateTime, num, pct, shortDate, usd } from "@/lib/format";
import { Controls, Kpi, TopBar } from "@/components/ui";

export const dynamic = "force-dynamic";

const TABS = [
  { key: "people", label: "People" },
  { key: "calls", label: "Intro calls" },
  { key: "ads", label: "Ads" },
  { key: "health", label: "Data health" },
] as const;
type Tab = (typeof TABS)[number]["key"];

const pill = (v: string, good: string[], warn: string[], bad: string[] = []) =>
  good.includes(v) ? "pill good" : warn.includes(v) ? "pill warn" : bad.includes(v) ? "pill bad" : "pill";

export default async function TeamView({
  params, searchParams,
}: { params: Promise<{ clientId: string }>; searchParams: Promise<{ range?: string; tab?: string }> }) {
  const { clientId } = await params;
  const client = getClient(clientId);
  if (!client) notFound();
  const session = await requireAccess(clientId, { teamOnly: true });
  const sp = await searchParams;
  const range = parseRange(sp.range);
  const tab: Tab = (TABS.find((t) => t.key === sp.tab)?.key ?? "people") as Tab;
  const snap = await getSnapshot(clientId);
  const k = snap ? kpiFor(snap, range) : undefined;
  const base = `/${clientId}/team`;

  return (
    <main className="shell">
      <TopBar client={client} session={session} />
      <Controls base={base} range={range} extra={{ tab }} active="team"
        tabs={[{ key: "team", label: "Team view", href: base }, { key: "client", label: "Client view", href: `/${clientId}` }]} />
      <nav className="subtabs" aria-label="Team sections">
        {TABS.map((t) => (
          <Link key={t.key} href={`${base}?${new URLSearchParams({ range, tab: t.key })}`} aria-current={t.key === tab ? "page" : undefined}>{t.label}</Link>
        ))}
      </nav>
      {!snap || !k ? <div className="notice">No snapshot yet. Run the data refresh.</div> : (
        <>
          <p className="period">Data through {shortDate(snap.dataThrough)} · snapshot built {dateTime(snap.generatedAt)} ET</p>

          {tab === "people" && (
            <div className="card table-wrap">
              <table>
                <thead><tr><th>First seen</th><th>Name</th><th>Funnel A application</th><th>Funnel B</th><th>Call with Chris</th><th>Sales outcome</th><th>Ad tracking</th></tr></thead>
                <tbody>
                  {snap.people.map((p) => (
                    <tr key={p.person}>
                      <td className="tnum">{shortDate(p.first_date)}</td><td>{p.name}</td>
                      <td><span className={pill(p.funnel_a, ["Completed · qualified"], ["Started, did not finish"])}>{p.funnel_a}</span></td>
                      <td>{p.funnel_b}</td>
                      <td><span className={pill(p.call, ["Attended"], ["Booked · outcome not marked"], ["No-show"])}>{p.call}</span></td>
                      <td><span className={pill(p.sales, ["Customer"], [], ["Lost"])}>{p.sales}</span></td>
                      <td>{p.from_ads}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === "calls" && (
            <>
              <div className="grid kpis four">
                <Kpi label="Calls booked" value={num(k.booked)} hint="Booked in this period, not cancelled" />
                <Kpi label="Calls attended" value={num(k.attended)} hint="Marked Showed in GoHighLevel" />
                <Kpi label="Upcoming" value={num(k.upcoming)} hint="Scheduled, not yet happened" />
                <Kpi label="Outcome not marked" value={num(k.unmarked)} hint="Call time passed but GoHighLevel still says confirmed" />
              </div>
              <h2 className="section">All intro calls <span className="sub">test bookings hidden</span></h2>
              <div className="card table-wrap">
                <table>
                  <thead><tr><th>Call time</th><th>Prospect</th><th>Booked</th><th>Status</th></tr></thead>
                  <tbody>
                    {snap.calls.length === 0 && <tr><td colSpan={4}>No intro calls booked yet.</td></tr>}
                    {snap.calls.map((c) => (
                      <tr key={c.id}>
                        <td className="tnum">{c.start_label}</td><td>{c.name}</td><td className="tnum">{shortDate(c.booked_date)}</td>
                        <td><span className={pill(c.outcome, ["Attended"], ["Outcome not marked"], ["No-show"])}>{c.outcome}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {tab === "ads" && (
            <>
              <p className="period">Each ad’s results over the last 90 days (not affected by the range picker).</p>
              <div className="card table-wrap">
                <table>
                  <thead><tr><th>Ad</th><th>Ad set</th><th>Status</th><th className="r">Spend</th><th className="r">Impr.</th><th className="r">Link CTR</th><th className="r">CPC</th><th className="r">Meta leads</th><th className="r">GHL submissions</th><th className="r">Qualified</th></tr></thead>
                  <tbody>
                    {snap.adTable.map((a) => (
                      <tr key={a.ad_id}>
                        <td>{a.ad_name}</td><td style={{ color: "var(--text-3)" }}>{a.adset_name}</td>
                        <td><span className={a.status === "Active" ? "pill good" : "pill"}>{a.status}</span></td>
                        <td className="r tnum">{usd(a.spend)}</td><td className="r tnum">{num(a.impressions)}</td>
                        <td className="r tnum">{pct(a.ctr, 2)}</td><td className="r tnum">{usd(a.cpc, true)}</td>
                        <td className="r tnum">{num(a.meta_leads)}</td><td className="r tnum">{num(a.ghl_submissions)}</td><td className="r tnum">{num(a.qualified)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {tab === "health" && (
            <div className="card table-wrap">
              <table>
                <tbody>
                  {snap.health.map((h) => (
                    <tr key={h.check}>
                      <td style={{ width: 150 }}><span className={h.ok === "OK" ? "pill good" : "pill warn"}>{h.ok}</span></td>
                      <td className="wrap"><strong>{h.check}</strong><br /><span style={{ color: "var(--text-2)" }}>{h.detail}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </main>
  );
}
