export const usd = (n: number | null, cents = false) =>
  n == null ? "—" : n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: cents ? 2 : 0, minimumFractionDigits: cents ? 2 : 0 });
export const num = (n: number | null) => (n == null ? "—" : Math.round(n).toLocaleString("en-US"));
export const pct = (n: number | null, d = 1) => (n == null ? "—" : `${(n * 100).toFixed(d)}%`);
export const ratio = (n: number | null) => (n == null ? "—" : `${n.toFixed(2)}x`);
export const shortDate = (iso: string) =>
  new Date(iso.length === 10 ? iso + "T12:00:00Z" : iso).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/New_York" });
export const dateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/New_York" });
