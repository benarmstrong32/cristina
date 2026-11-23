import { notFound } from "next/navigation";
import { getClient } from "@/config/clients";
import { requireAccess } from "@/lib/auth";
import { getCreatives, getSnapshot } from "@/lib/data";
import { kpiFor, parseRange } from "@/lib/metrics";
import { shortDate } from "@/lib/format";
import { Controls, TopBar } from "@/components/ui";
import { Overview } from "@/components/Overview";
import { Freshness } from "@/components/Freshness";

export const dynamic = "force-dynamic";

export default async function ClientView({
  params, searchParams,
}: { params: Promise<{ clientId: string }>; searchParams: Promise<{ range?: string }> }) {
  const { clientId } = await params;
  const client = getClient(clientId);
  if (!client) notFound();
  const session = await requireAccess(clientId);
  const range = parseRange((await searchParams).range);
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
        active="client"
        tabs={isTeam ? [
          { key: "team", label: "Team view", href: `/${clientId}/team` },
          { key: "client", label: "Client view", href: `/${clientId}` },
        ] : [{ key: "client", label: "Overview", href: `/${clientId}` }]}
      />
      {isTeam && <div className="notice"><strong>Preview:</strong> this is exactly what {client.name} sees when they sign in.</div>}
      {!snap || !k ? (
        <div className="notice">Results are being prepared. Please check back shortly.</div>
      ) : (
        <>
          <Freshness snap={snap} clientId={clientId} back={`/${clientId}?range=${range}`} error={error} team={isTeam} />
          <p className="period">{shortDate(k.since)} – {shortDate(k.until)}, compared with the same number of days before</p>
          <Overview k={k} snap={snap} creatives={creatives} client={client} />
        </>
      )}
    </main>
  );
}
