import { notFound } from "next/navigation";
import { getClient } from "@/config/clients";
import { requireAccess } from "@/lib/auth";
import { getSnapshot } from "@/lib/data";
import { computeKpis, parseRange, resolveRange } from "@/lib/metrics";
import { shortDate } from "@/lib/format";
import { Controls, TopBar } from "@/components/ui";
import { Overview } from "@/components/Overview";

export default async function ClientView({
  params, searchParams,
}: { params: Promise<{ clientId: string }>; searchParams: Promise<{ range?: string }> }) {
  const { clientId } = await params;
  const client = getClient(clientId);
  if (!client) notFound();
  const session = await requireAccess(clientId);
  const range = parseRange((await searchParams).range);
  const snap = await getSnapshot(client);
  const r = resolveRange(snap, range);
  const k = computeKpis(snap, r.since, r.until);
  const prev = computeKpis(snap, r.prevSince, r.prevUntil);
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
      {isTeam && (
        <div className="notice">
          <strong>Preview:</strong> this is exactly what {client.name} sees when they sign in.
        </div>
      )}
      <p className="period">
        {shortDate(r.since)} – {shortDate(r.until)} · compared with the {Math.round((Date.parse(r.until) - Date.parse(r.since)) / 864e5) + 1} days before
      </p>
      <Overview k={k} prev={prev} showRevenue={client.showRevenueToClient} audience="client" />
    </main>
  );
}
