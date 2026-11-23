import Link from "next/link";
import { notFound } from "next/navigation";
import { getClient } from "@/config/clients";
import { requireAccess } from "@/lib/auth";
import { getSnapshot } from "@/lib/data";
import { kpiFor, parseRange } from "@/lib/metrics";
import { dateTime, num, pct, shortDate, usd } from "@/lib/format";
import { Controls, Kpi, TopBar } from "@/components/ui";
import { Freshness } from "@/components/Freshness";
import { PeopleTable } from "@/components/PeopleTable";
import { AdsTable } from "@/components/AdsTable";

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
  const { snap, error } = await getSnapshot(client);
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
          <Freshness snap={snap} clientId={clientId} back={`${base}?${new URLSearchParams({ range, tab })}`} error={error} team />

          {tab === "people" && <PeopleTable people={snap.people} showTracking />}

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
              <AdsTable ads={snap.adTable} />
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
