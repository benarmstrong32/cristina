import { delta } from "../lib/format";

/** `goodWhenUp=false` for cost metrics (CPA, CPM) where a rise is bad. */
export function Kpi({ label, value, change, sub, goodWhenUp = true }: {
  label: string; value: string; change?: number | null; sub?: string; goodWhenUp?: boolean;
}) {
  const cls = change == null || change === 0 ? "" : (change > 0) === goodWhenUp ? "up" : "down";
  return (
    <div className="kpi">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      <div className="sub">
        {change != null && <span className={cls} title="vs previous period">{delta(change)} </span>}
        {sub}
      </div>
    </div>
  );
}

export function Change({ v, goodWhenUp = true }: { v: number | null; goodWhenUp?: boolean }) {
  if (v == null) return <span className="muted small">—</span>;
  const cls = v === 0 ? "" : (v > 0) === goodWhenUp ? "up" : "down";
  return <span className={`small ${cls}`}>{delta(v)}</span>;
}

/** ROAS vs target: color + icon + label so state is never color-alone. */
export function RoasStatus({ roas, target }: { roas: number | null; target: number | null }) {
  if (target == null || roas == null) return <span className="muted small">—</span>;
  const [color, icon, label] =
    roas >= target ? ["var(--good)", "✓", "On target"] :
    roas >= target * 0.8 ? ["var(--warning)", "!", "Near"] :
    ["var(--critical)", "✕", "Below"];
  return (
    <span className="status" title={`Target ${target.toFixed(2)}x`}>
      <i style={{ background: color }} aria-hidden />{icon} {label}
    </span>
  );
}
