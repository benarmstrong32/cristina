import type { IntroCall, Lead, MetaDay, Snapshot } from "./types";

export type RangeKey = "7d" | "14d" | "30d" | "all";
export const RANGES: { key: RangeKey; label: string }[] = [
  { key: "7d", label: "Last 7 days" },
  { key: "14d", label: "Last 14 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "all", label: "All time" },
];

export function parseRange(v: string | undefined): RangeKey {
  return (RANGES.find((r) => r.key === v)?.key ?? "30d") as RangeKey;
}

function addDays(d: string, n: number) {
  const t = new Date(d + "T00:00:00Z");
  t.setUTCDate(t.getUTCDate() + n);
  return t.toISOString().slice(0, 10);
}

/** Range is anchored to the newest day of data, so a snapshot still reads sensibly. */
export function resolveRange(s: Snapshot, key: RangeKey) {
  const until = s.meta.asOf || new Date().toISOString().slice(0, 10);
  const first = s.meta.days.find((d) => d.spend > 0)?.date ?? until;
  const n = key === "7d" ? 7 : key === "14d" ? 14 : key === "30d" ? 30 : 0;
  const since = n ? addDays(until, -(n - 1)) : first;
  const span = n || Math.round((Date.parse(until) - Date.parse(first)) / 864e5) + 1;
  return { since, until, prevSince: addDays(since, -span), prevUntil: addDays(since, -1) };
}

const inRange = (iso: string | undefined, since: string, until: string) =>
  !!iso && iso.slice(0, 10) >= since && iso.slice(0, 10) <= until;

const div = (a: number, b: number) => (b > 0 ? a / b : null);

export type Kpis = ReturnType<typeof computeKpis>;

export function computeKpis(s: Snapshot, since: string, until: string) {
  const days: MetaDay[] = s.meta.days.filter((d) => d.date >= since && d.date <= until);
  const sum = (k: keyof MetaDay) => days.reduce((a, d) => a + (d[k] as number), 0);
  const spend = sum("spend");
  const impressions = sum("impressions");
  const linkClicks = sum("linkClicks");
  const metaLeads = sum("metaLeads");

  const ghl = s.ghl.connected;
  const inWindow = s.ghl.leads.filter((l) => l.fromMeta && inRange(l.createdAt, since, until));
  const leads: Lead[] = inWindow.filter((l) => !l.partial);
  const partials = inWindow.length - leads.length;
  const calls: IntroCall[] = s.ghl.calls.filter((c) => inRange(c.bookedAt, since, until));
  const metaCalls = calls.filter((c) => c.fromMeta);
  const booked = metaCalls.filter((c) => c.status !== "cancelled").length;
  const completed = s.ghl.calls.filter((c) => c.fromMeta && c.status === "showed" && inRange(c.startTime, since, until)).length;
  const customers = s.ghl.leads.filter((l) => l.fromMeta && l.won && inRange(l.wonAt, since, until));
  const revenue = customers.reduce((a, l) => a + l.value, 0);

  return {
    spend, impressions, linkClicks, metaLeads,
    landingPageViews: sum("landingPageViews"),
    cpm: div(spend * 1000, impressions),
    ctr: div(linkClicks, impressions),
    cpc: div(spend, linkClicks),
    metaCpl: div(spend, metaLeads),
    ghl,
    leads: ghl ? leads.length : null,
    partials: ghl ? partials : null,
    leadList: leads,
    callList: calls,
    qualified: ghl ? leads.filter((l) => l.qualified).length : null,
    booked: ghl ? booked : null,
    completed: ghl ? completed : null,
    customers: ghl ? customers.length : null,
    cpl: ghl ? div(spend, leads.length) : null,
    cpa: ghl ? div(spend, booked) : null,
    revenue: ghl ? revenue : null,
    roas: ghl ? div(revenue, spend) : null,
    cac: ghl ? div(spend, customers.length) : null,
    days,
  };
}

export function callStats(calls: IntroCall[]) {
  const now = new Date().toISOString();
  const c = (st: IntroCall["status"]) => calls.filter((x) => x.status === st).length;
  const showed = c("showed"), noShow = c("no_show");
  return {
    total: calls.length,
    upcoming: calls.filter((x) => x.status === "booked" && x.startTime > now).length,
    awaitingOutcome: calls.filter((x) => x.status === "booked" && x.startTime <= now).length,
    showed, noShow, cancelled: c("cancelled"),
    showRate: div(showed, showed + noShow),
  };
}
