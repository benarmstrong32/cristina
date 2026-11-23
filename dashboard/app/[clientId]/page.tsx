import { notFound } from "next/navigation";
import { getClient } from "@/config/clients";
import { requireAccess } from "@/lib/auth";
import { getCreatives, getSnapshot } from "@/lib/data";
import { kpiFor, parseRange } from "@/lib/metrics";
import { shortDate } from "@/lib/format";
import { Controls, TopBar } from "@/components/ui";
import { CLIENT_TABS, Overview, type ClientTab } from "@/components/Overview";
import Link from "next/link";
import { Freshness } from "@/components/Freshness";

export const dynamic = "force-dynamic";

export default async function ClientView({
  params, searchParams,
}: { params: Promise<{ clientId: string }>; searchParams: Promise<{ range?: string; view?: string }> }) {
  const { clientId } = await params;
  const client = getClient(clientId);
  if (!client) notFound();
  const session = await requireAccess(clientId);
  const sp = await searchParams;
  const range = parseRange(sp.range);
  const view: ClientTab = (CLIENT_TABS.find((t) => t.key === sp.view)?.key ?? "overview") as ClientTab;
  const { snap, error } = await getSnapshot(client);
  const creatives = await getCreatives();
  const k = snap ? kpiFor(snap, range) : undefined;
  const isTeam = session.role === "team";

  return (
    <main className="shell">
      <TopBar client={client} session={session} />
      <Controls
        base={`/${clientId}`}
        range={range}
        extra={{ view }}
        active="client"
        tabs={isTeam ? [
          { key: "team", label: "Team view", href: `/${clientId}/team` },
          { key: "client", label: "Client view", href: `/${clientId}` },
        ] : undefined}
      />
      {isTeam && <div className="notice"><strong>Preview:</strong> this is exactly what {client.name} sees when they sign in.</div>}
      {!snap || !k ? (
        <div className="notice">Results are being prepared. Please check back shortly.</div>
      ) : (
        <>
          <nav className="subtabs" aria-label="Sections">
            {CLIENT_TABS.map((t) => (
              <Link key={t.key} href={`/${clientId}?${new URLSearchParams({ range, view: t.key })}`} aria-current={t.key === view ? "page" : undefined}>{t.label}</Link>
            ))}
          </nav>
          <Freshness snap={snap} clientId={clientId} back={`/${clientId}?range=${range}&view=${view}`} error={error} team={isTeam} />
          <p className="period">{shortDate(k.since)} – {shortDate(k.until)}{range === "max" ? ", since the ads started" : ", compared with the same number of days before"}</p>
          <Overview k={k} snap={snap} creatives={creatives} client={client} view={view} />
        </>
      )}
    </main>
  );
}
