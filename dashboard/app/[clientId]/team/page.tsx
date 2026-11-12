import Link from "next/link";
import { notFound } from "next/navigation";
import { getClient } from "@/config/clients";
import { requireAccess } from "@/lib/auth";
import { getSnapshot } from "@/lib/data";
import { callStats, computeKpis, parseRange, resolveRange, type Kpis } from "@/lib/metrics";
import { dateTime, num, pct, shortDate, usd } from "@/lib/format";
import type { IntroCall, Snapshot } from "@/lib/types";
import { Controls, Kpi, TopBar } from "@/components/ui";
import { Overview } from "@/components/Overview";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "calls", label: "Intro calls" },
  { key: "leads", label: "Leads" },
  { key: "ads", label: "Ads" },
  { key: "health", label: "Data health" },
] as const;
type Tab = (typeof TABS)[number]["key"];

export default async function TeamView({
  params, searchParams,
}: { params: Promise<{ clientId: string }>; searchParams: Promise<{ range?: string; tab?: string }> }) {
  const { clientId } = await params;
  const client = getClient(clientId);
  if (!client) notFound();
  const session = await requireAccess(clientId, { teamOnly: true });
  const sp = await searchParams;
  const range = parseRange(sp.range);
  const tab: Tab = (TABS.find((t) => t.key === sp.tab)?.key ?? "overview") as Tab;
  const snap = await getSnapshot(client);
  const r = resolveRange(snap, range);
  const k = computeKpis(snap, r.since, r.until);
  const prev = computeKpis(snap, r.prevSince, r.prevUntil);
  const base = `/${clientId}/team`;

  return (
    <main className="shell">
      <TopBar client={client} session={session} />
      <Controls
        base={base}
        range={range}
        extra={{ tab }}
        active="team"
        tabs={[
          { key: "team", label: "Team view", href: base },
          { key: "client", label: "Client view", href: `/${clientId}` },
        ]}
      />
      <nav className="subtabs" aria-label="Team sections">
        {TABS.map((t) => (
          <Link key={t.key} href={`${base}?${new URLSearchParams({ range, tab: t.key })}`} aria-current={t.key === tab ? "page" : undefined}>
            {t.label}
          </Link>
        ))}
      </nav>
      <p className="period">
        {shortDate(r.since)} – {shortDate(r.until)}
        {!snap.meta.live && snap.meta.asOf && ` · Meta data snapshot through ${shortDate(snap.meta.asOf)}`}
        {snap.ghl.connected && !snap.ghl.live && " · GoHighLevel data from saved export"}
      </p>

      {tab === "overview" && <TeamOverview k={k} prev={prev} snap={snap} showRevenue />}
      {tab === "calls" && <Calls calls={snap.ghl.calls} connected={snap.ghl.connected} k={k} />}
      {tab === "leads" && <Leads k={k} snap={snap} />}
      {tab === "ads" && <Ads snap={snap} />}
      {tab === "health" && <Health snap={snap} k={k} />}
    </main>
  );
}

function TeamOverview({ k, prev, snap, showRevenue }: { k: Kpis; prev: Kpis; snap: Snapshot; showRevenue: boolean }) {
  const gap = k.leads != null ? k.leads - k.metaLeads : null;
  return (
    <>
      {snap.ghl.connected && (
        <div className="notice">
          <strong>Meta vs. CRM:</strong> Meta reports {k.metaLeads} leads; GoHighLevel has {k.leads} real ad leads
          {k.partials ? ` plus ${k.partials} abandoned application${k.partials === 1 ? "" : "s"} with no contact info` : ""}.
          {gap != null && gap !== 0 && ` Gap: ${gap > 0 ? "+" : ""}${gap}. Client-facing numbers use GoHighLevel.`}
        </div>
      )}
      <Overview k={k} prev={prev} showRevenue={showRevenue} audience="team" />
    </>
  );
}

function statusPill(c: IntroCall) {
  const now = new Date().toISOString();
  if (c.status === "showed") return <span className="pill good">Showed</span>;
  if (c.status === "no_show") return <span className="pill bad">No-show</span>;
  if (c.status === "cancelled") return <span className="pill">Cancelled</span>;
  if (c.startTime <= now) return <span className="pill warn">Outcome not marked</span>;
  return <span className="pill">Upcoming</span>;
}

function Calls({ calls, connected, k }: { calls: IntroCall[]; connected: boolean; k: Kpis }) {
  if (!connected) return <div className="notice">Connect GoHighLevel to see intro calls.</div>;
  const inRange = k.callList;
  const s = callStats(inRange);
  const sorted = [...calls].sort((a, b) => b.startTime.localeCompare(a.startTime));
  return (
    <>
      <div className="grid kpis four">
        <Kpi label="Calls booked" value={num(s.total - s.cancelled)} hint="Booked in this period, excluding cancellations" />
        <Kpi label="Show rate" value={pct(s.showRate, 0)} hint="Showed ÷ (showed + no-show)" />
        <Kpi label="Upcoming" value={num(s.upcoming)} hint="Scheduled, not yet happened" />
        <Kpi label="Outcome not marked" value={num(s.awaitingOutcome)}
          hint="Call time has passed but GHL still says confirmed. Mark Showed / No-show." />
      </div>
      <h2 className="section">All intro calls <span className="sub">Sales Growth Strategy Call · team test bookings hidden</span></h2>
      <div className="card table-wrap">
        <table>
          <thead><tr><th>Call time</th><th>Prospect</th><th>Booked</th><th>From ads</th><th>Status</th></tr></thead>
          <tbody>
            {sorted.length === 0 && <tr><td colSpan={5}>No intro calls yet.</td></tr>}
            {sorted.map((c) => (
              <tr key={c.id}>
                <td className="tnum">{dateTime(c.startTime)}</td>
                <td>{c.contactName}</td>
                <td className="tnum">{shortDate(c.bookedAt)}</td>
                <td>{c.fromMeta ? "Yes" : "—"}</td>
                <td>{statusPill(c)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Leads({ k, snap }: { k: Kpis; snap: Snapshot }) {
  if (!snap.ghl.connected) return <div className="notice">Connect GoHighLevel to see leads.</div>;
  const adName = new Map(snap.meta.ads.map((a) => [a.id, a.name]));
  const rows = [...k.leadList].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return (
    <>
      <p className="period">
        {rows.length} ad leads in this period{k.partials ? ` · ${k.partials} abandoned applications (no name/email) not counted` : ""} · tests & non-ad contacts excluded
      </p>
      <div className="card table-wrap">
        <table>
          <thead><tr><th>Date</th><th>Name</th><th>Form</th><th>Ad</th><th>Pipeline stage</th></tr></thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={5}>No ad leads in this period.</td></tr>}
            {rows.map((l) => (
              <tr key={l.contactId}>
                <td className="tnum">{shortDate(l.createdAt)}</td>
                <td>{l.name || "—"}</td>
                <td>{l.source}</td>
                <td>{l.adId ? adName.get(l.adId) ?? l.adId : "—"}</td>
                <td>{l.stage ? `${l.stage}${l.oppStatus && l.oppStatus !== "open" ? ` (${l.oppStatus})` : ""}` : <span className="pill warn">Not in pipeline</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Ads({ snap }: { snap: Snapshot }) {
  const ads = snap.meta.ads.filter((a) => a.spend > 0).sort((a, b) => b.spend - a.spend);
  const crmLeads = new Map<string, number>();
  for (const l of snap.ghl.leads) if (l.adId && !l.partial) crmLeads.set(l.adId, (crmLeads.get(l.adId) ?? 0) + 1);
  return (
    <>
      <p className="period">
        Ad-level results {shortDate(snap.meta.adsPeriod.since)} – {shortDate(snap.meta.adsPeriod.until)} (not affected by the range picker)
      </p>
      <div className="card table-wrap">
        <table>
          <thead>
            <tr><th>Ad</th><th>Ad set</th><th>Status</th><th className="r">Spend</th><th className="r">Impr.</th><th className="r">CPM</th><th className="r">Link CTR</th><th className="r">CPC</th><th className="r">Meta leads</th><th className="r">CRM leads*</th></tr>
          </thead>
          <tbody>
            {ads.map((a) => (
              <tr key={a.id}>
                <td>{a.name}</td>
                <td style={{ color: "var(--text-3)" }}>{a.adsetName}</td>
                <td>{a.status === "ACTIVE" ? <span className="pill good">Active</span> : <span className="pill">Paused</span>}</td>
                <td className="r tnum">{usd(a.spend)}</td>
                <td className="r tnum">{num(a.impressions)}</td>
                <td className="r tnum">{usd(a.impressions ? (a.spend / a.impressions) * 1000 : null, true)}</td>
                <td className="r tnum">{pct(a.impressions ? a.linkClicks / a.impressions : null, 2)}</td>
                <td className="r tnum">{usd(a.linkClicks ? a.spend / a.linkClicks : null, true)}</td>
                <td className="r tnum">{a.metaLeads || "—"}</td>
                <td className="r tnum">{crmLeads.get(a.id) ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="period" style={{ marginTop: 8 }}>* CRM leads matched to an ad through the utm_content tag. Leads without UTMs can’t be matched.</p>
    </>
  );
}

function Health({ snap, k }: { snap: Snapshot; k: Kpis }) {
  const leads = snap.ghl.leads.filter((l) => !l.partial);
  const notInPipeline = leads.filter((l) => !l.stage).length;
  const withAd = leads.filter((l) => l.adId).length;
  const now = new Date().toISOString();
  const unmarked = snap.ghl.calls.filter((c) => c.status === "booked" && c.startTime <= now).length;
  const items: { ok: boolean; title: string; detail: string }[] = [
    { ok: snap.meta.connected, title: "Meta Ads", detail: snap.meta.live ? "Live from the Meta API (refreshes hourly)." : `Using a saved snapshot through ${snap.meta.asOf}. Add META_ACCESS_TOKEN for live data.` },
    { ok: snap.ghl.connected, title: "GoHighLevel", detail: snap.ghl.connected ? (snap.ghl.live ? "Live from the GHL API (refreshes every 15 min)." : "Using a saved export. Add the GHL token for live data.") : snap.ghl.error ?? "Not connected." },
    { ok: notInPipeline === 0, title: "Every ad lead is in the pipeline", detail: `${notInPipeline} of ${leads.length} ad leads have no opportunity in “New Velocity Sales”. Without one, Qualified / Customer can’t be counted.` },
    { ok: withAd >= leads.length * 0.8, title: "Leads carry ad tracking (UTMs)", detail: `${withAd} of ${leads.length} leads can be traced to a specific ad.` },
    { ok: unmarked === 0, title: "Call outcomes are marked", detail: `${unmarked} intro call${unmarked === 1 ? "" : "s"} in the past still say “confirmed”. Mark Showed or No-show in GHL so Appointments Completed is accurate.` },
    { ok: (k.partials ?? 0) === 0, title: "Abandoned applications", detail: `${k.partials ?? 0} form starts in this period left no name or email. Worth checking the application form’s drop-off.` },
  ];
  return (
    <div className="card">
      <table>
        <tbody>
          {items.map((i) => (
            <tr key={i.title}>
              <td style={{ width: 120 }}>{i.ok ? <span className="pill good">OK</span> : <span className="pill warn">Needs attention</span>}</td>
              <td style={{ whiteSpace: "normal" }}><strong>{i.title}</strong><br /><span style={{ color: "var(--text-2)" }}>{i.detail}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
