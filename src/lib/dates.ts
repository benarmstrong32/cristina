export function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function addDays(isoDate: string, n: number): string {
  const d = new Date(isoDate + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return iso(d);
}

export function daysBetween(since: string, until: string): number {
  return Math.round(
    (Date.parse(until + "T00:00:00Z") - Date.parse(since + "T00:00:00Z")) / 86_400_000,
  ) + 1;
}

/** The same-length window immediately before [since, until]. */
export function previousPeriod(since: string, until: string) {
  const len = daysBetween(since, until);
  return { since: addDays(since, -len), until: addDays(since, -1) };
}

export function chunkRange(since: string, until: string, size: number) {
  const out: { since: string; until: string }[] = [];
  let s = since;
  while (s <= until) {
    const e = addDays(s, size - 1);
    out.push({ since: s, until: e < until ? e : until });
    s = addDays(s, size);
  }
  return out;
}

export const PRESETS: Record<string, number> = {
  "7d": 7, "14d": 14, "30d": 30, "90d": 90,
};

const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Resolve ?range=30d or ?since=&until= into a concrete window ending yesterday by default. */
export function resolveRange(params: { range?: string; since?: string; until?: string }) {
  if (params.since && params.until && ISO_RE.test(params.since) && ISO_RE.test(params.until)) {
    return { since: params.since, until: params.until, label: "custom" };
  }
  const key = params.range && PRESETS[params.range] ? params.range : "30d";
  const until = addDays(iso(new Date()), -1); // today is incomplete
  return { since: addDays(until, -(PRESETS[key] - 1)), until, label: key };
}
