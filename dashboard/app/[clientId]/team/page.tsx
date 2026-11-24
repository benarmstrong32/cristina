import Link from "next/link";
import { notFound } from "next/navigation";
import { getClient } from "@/config/clients";
import { requireAccess } from "@/lib/auth";
import { getCreatives, getSnapshot } from "@/lib/data";
import { kpiFor, parseRange } from "@/lib/metrics";
import { dateTime, num, pct, shortDate, usd } from "@/lib/format";
import { Controls, Kpi, TopBar } from "@/components/ui";
import { Freshness } from "@/components/Freshness";
import { PeopleTable } from "@/components/PeopleTable";
import { AdsTable } from "@/components/AdsTable";
import { AdsByLead } from "@/components/AdsByLead";
import { AdSetsTable, TeamPerformance } from "@/components/TeamPerformance";

export const dynamic = "force-dynamic";

const TABS = [
  { key: "performance", label: "Performance" },
  { key: "adsets", label: "Ad sets" },
  { key: "people", label: "People" },
  { key: "sources", label: "Lead sources" },
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
  const tab: Tab = (TABS.find((t) => t.key === sp.tab)?.key ?? "performance") as Tab;
  const { snap, error } = await getSnapshot(client);
  const k = snap ? kpiFor(snap, range) : undefined;
  const creatives = tab === "sources" ? await getCreatives() : {};
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

          {tab === "performance" && <TeamPerformance k={k} snap={snap} />}

          {tab === "adsets" && (
            <>
              <p className="period">Each ad set since it started (not affected by the range picker). “Learning” means under 14 days old.</p>
              <AdSetsTable snap={snap} />
            </>
          )}

          {tab === "people" && <PeopleTable people={snap.people} showTracking />}

          {tab === "sources" && (
            <>
              <p className="period">The ad each lead clicked, from GoHighLevel’s tracking. {snap.people.filter((p) => !p.ad_id).length} people have no ad recorded (organic, direct, or tracking lost); they’re listed under People.</p>
              <AdsByLead people={snap.people} creatives={creatives} metaAccountId={client.metaAdAccountId} ghlLocationId={client.ghlLocationId} />
            </>
          )}

          {tab === "calls" && (
            <>
              <div className="grid kpis four">
                <Kpi label="Calls booked" value={num(k.booked)} hint="Booked in this period, not cancelled" />
                <Kpi label="Calls attended" value={num(k.attended)} hint="Marked Showed in GoHighLevel" />
                <Kpi label="Upcoming" value={num(k.upcoming)} hint="Scheduled, not yet happened" />
                <Kpi label="Nurturing leads" value={num(k.unmarked)} hint="Booked calls whose time has passed, still marked confirmed in GoHighLevel" />
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
                        <td><span className={pill(c.outcome, ["Attended"], ["Nurturing lead"], ["No-show"])}>{c.outcome}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {tab === "ads" && (
            <>
              <p className="period">Every ad, active and off, since the campaign started (not affected by the range picker).</p>
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
