export function money(v: number | null | undefined, currency = "USD", compact = false) {
  if (v == null || !Number.isFinite(v)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency,
    notation: compact && Math.abs(v) >= 10_000 ? "compact" : "standard",
    maximumFractionDigits: compact || Math.abs(v) >= 1000 ? 0 : 2,
  }).format(v);
}
export const num = (v: number | null | undefined, digits = 0) =>
  v == null || !Number.isFinite(v) ? "—" : new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(v);
export const pct = (v: number | null | undefined, digits = 2) =>
  v == null || !Number.isFinite(v) ? "—" : `${(v * 100).toFixed(digits)}%`;
export const roas = (v: number | null | undefined) => (v == null || !Number.isFinite(v) ? "—" : `${v.toFixed(2)}x`);

export function delta(v: number | null) {
  if (v == null) return "";
  const s = `${v >= 0 ? "▲" : "▼"} ${Math.abs(v * 100).toFixed(0)}%`;
  return s;
}

export function ago(isoTs: string | null | undefined) {
  if (!isoTs) return "never";
  const mins = Math.round((Date.now() - Date.parse(isoTs)) / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (mins < 48 * 60) return `${Math.round(mins / 60)}h ago`;
  return `${Math.round(mins / 1440)}d ago`;
}
