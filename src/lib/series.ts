import type { DailyPoint } from "./queries";

/** Trailing N-day ROAS from summed revenue/spend (smooths daily noise without averaging ratios). */
export function rollingRoas(points: DailyPoint[], n = 7): (number | null)[] {
  return points.map((_, i) => {
    const w = points.slice(Math.max(0, i - n + 1), i + 1);
    const spend = w.reduce((a, p) => a + p.spend, 0);
    const value = w.reduce((a, p) => a + p.purchase_value, 0);
    return spend > 0 ? value / spend : null;
  });
}
