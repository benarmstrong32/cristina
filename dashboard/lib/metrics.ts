import type { KpiRow, RangeKey, Snapshot } from "./types";
export type { RangeKey } from "./types";

export const RANGES: { key: RangeKey; label: string }[] = [
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "max", label: "Maximum" },
];

export function parseRange(v: string | undefined): RangeKey {
  return (RANGES.find((r) => r.key === v)?.key ?? "30d") as RangeKey;
}

export function kpiFor(s: Snapshot, range: RangeKey): KpiRow | undefined {
  return s.kpis.find((k) => k.range === range);
}
