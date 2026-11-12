import Link from "next/link";
import type { Session } from "@/lib/session";
import type { ClientConfig } from "@/config/clients";
import { RANGES, type RangeKey } from "@/lib/metrics";

export function TopBar({ client, session }: { client: ClientConfig; session: Session }) {
  return (
    <header className="topbar">
      <div className="brand">
        <h1>{client.name}</h1>
        <span className="by">Ad results</span>
      </div>
      <div className="who">
        <span>{session.name}</span>
        <form method="post" action="/api/logout">
          <button className="btn-link" type="submit">Sign out</button>
        </form>
      </div>
    </header>
  );
}

export function Controls({
  base, range, tabs, active, extra = {},
}: {
  base: string;
  range: RangeKey;
  tabs?: { href: string; label: string; key: string }[];
  active?: string;
  extra?: Record<string, string>;
}) {
  const q = (r: string) => `?${new URLSearchParams({ ...extra, range: r })}`;
  return (
    <div className="controls">
      <nav className="tabs" aria-label="Views">
        {tabs?.map((t) => (
          <Link key={t.key} href={`${t.href}?range=${range}`} aria-current={active === t.key ? "page" : undefined}>
            {t.label}
          </Link>
        ))}
      </nav>
      <nav className="range" aria-label="Date range">
        {RANGES.map((r) => (
          <Link key={r.key} href={`${base}${q(r.key)}`} aria-current={r.key === range ? "true" : undefined}>
            {r.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

type Delta = { now: number | null; prev: number | null; lowerIsBetter?: boolean } | undefined;

export function Kpi({
  label, value, hint, delta, muted, tag,
}: { label: string; value: string; hint?: string; delta?: Delta; muted?: boolean; tag?: string }) {
  return (
    <div className="card kpi">
      <div className="label">
        {label}
        {tag && <span className="tag">{tag}</span>}
      </div>
      <div className={`value tnum${muted ? " muted" : ""}`}>{value}</div>
      {hint && <div className="hint">{hint}</div>}
      <DeltaLine d={delta} />
    </div>
  );
}

function DeltaLine({ d }: { d: Delta }) {
  if (!d || d.now == null || d.prev == null || d.prev === 0) return null;
  const change = (d.now - d.prev) / d.prev;
  if (!isFinite(change)) return null;
  const up = change > 0;
  const good = d.lowerIsBetter ? !up : up;
  if (Math.abs(change) < 0.005) return <div className="delta">No change vs prior period</div>;
  return (
    <div className="delta tnum">
      <span className={good ? "good" : "bad"}>{up ? "▲" : "▼"} {Math.abs(change * 100).toFixed(0)}%</span> vs prior period
    </div>
  );
}

export function Funnel({ steps }: { steps: { label: string; value: number | null }[] }) {
  const top = Math.max(1, ...steps.map((s) => s.value ?? 0));
  const colors = ["var(--funnel-1)", "var(--funnel-2)", "var(--funnel-3)", "var(--funnel-4)", "var(--funnel-5)"];
  return (
    <div className="card funnel">
      {steps.map((s, i) => {
        const prev = i > 0 ? steps[i - 1].value : null;
        const conv = s.value != null && prev ? s.value / prev : null;
        return (
          <div className="f-row" key={s.label}>
            <div className="f-label">{s.label}</div>
            <div className="f-track">
              {s.value != null && <div className="f-bar" style={{ width: `${(s.value / top) * 100}%`, background: colors[i] }} />}
            </div>
            <div className="f-num tnum">
              {s.value ?? "—"}
              {conv != null && <small>{Math.round(conv * 100)}% of prior</small>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
