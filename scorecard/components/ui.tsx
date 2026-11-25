import Link from "next/link";
import type { Session } from "@/lib/session";
import type { Data } from "@/lib/types";
import { RANGES, periodQuery, type Period } from "@/lib/metrics";
import { dateTime, shortDate } from "@/lib/format";
import { START } from "@/config/scorecard";

export function TopBar({ session }: { session: Session }) {
  return (
    <header className="topbar">
      <div className="brand">
        <picture>
          <source srcSet="/brand/logo-white.png" media="(prefers-color-scheme: dark)" />
          <img className="brand-logo" src="/brand/logo-black.png" alt="9miles Media" width={186} height={40} />
        </picture>
        <span className="brand-sub">Growth Scorecard</span>
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

export const TABS = [
  { key: "overview", label: "Overview" },
  { key: "deals", label: "Won" },
  { key: "pipeline", label: "Pipeline" },
  { key: "log", label: "Intro log" },
  { key: "triage", label: "Triage calls" },
  { key: "intros", label: "Intros & bonus" },
  { key: "people", label: "People" },
  { key: "which-ad", label: "Which ad" },
  { key: "ads", label: "Ads" },
  { key: "how", label: "How we count" },
  { key: "funnel", label: "Funnel", hidden: true },
] as const;
export type TabKey = (typeof TABS)[number]["key"];

export function Controls({ period, view }: { period: Period; view: TabKey }) {
  const q = (extra: Record<string, string>) => `/?${new URLSearchParams({ view, ...extra })}`;
  return (
    <>
      <div className="controls">
        <span className="period-label">{RANGES.find((r) => r.key === period.range)?.label ?? "Custom range"}</span>
        <div className="range-wrap">
          <nav className="range" aria-label="Date range">
            {RANGES.map((r) => (
              <Link key={r.key} href={q({ range: r.key })} aria-current={r.key === period.range ? "true" : undefined}>{r.label}</Link>
            ))}
          </nav>
          <details className="custom-range" open={period.range === "custom" ? true : undefined}>
            <summary aria-current={period.range === "custom" ? "true" : undefined}>Custom</summary>
            <form method="get" action="/">
              <input type="hidden" name="view" value={view} />
              <input type="hidden" name="range" value="custom" />
              <label>From <input type="date" name="from" min={START} defaultValue={period.from ?? ""} required /></label>
              <label>To <input type="date" name="to" min={START} defaultValue={period.to ?? ""} required /></label>
              <button type="submit">Apply</button>
            </form>
          </details>
        </div>
      </div>
      <nav className="subtabs" aria-label="Sections">
        {TABS.filter((t) => !("hidden" in t)).map((t) => (
          <Link key={t.key} href={`/?${new URLSearchParams({ view: t.key, ...periodQuery(period) })}`} aria-current={t.key === view ? "page" : undefined}>{t.label}</Link>
        ))}
      </nav>
    </>
  );
}

export type Tone = "spend" | "lead" | "partial" | "qualified" | "booked" | "cost" | "sale" | "neutral";

export function Kpi({ label, value, hint, tone = "neutral", muted }: { label: string; value: string; hint?: string; tone?: Tone; muted?: boolean }) {
  return (
    <div className={`card kpi tone-${tone}`}>
      <div className="label">{label}</div>
      <div className={`value tnum${muted ? " muted" : ""}`}>{value}</div>
      {hint && <div className="hint">{hint}</div>}
    </div>
  );
}

export function Freshness({ d, back }: { d: Data; back: string }) {
  return (
    <div className="freshness">
      <span>
        {d.adsLive ? <>Meta live · updated {dateTime(d.generatedAt)} ET</> : <>Meta through {shortDate(d.adsThrough)}</>}
        {" "}· people from GoHighLevel {d.applicantsSavedAt ? `as of ${shortDate(d.applicantsSavedAt)}` : ""}
        {" "}· intros, triage calls and pipeline are edited live in the app
        {d.error ? <span className="fresh-err"> · Live update failed: {d.error}</span> : null}
      </span>
      <form method="post" action="/api/refresh">
        <input type="hidden" name="back" value={back} />
        <button className="btn-link btn-refresh" type="submit">↻ Refresh</button>
      </form>
    </div>
  );
}

export function Funnel({ steps }: { steps: { label: string; value: number | null; note?: string }[] }) {
  const top = Math.max(1, ...steps.map((s) => s.value ?? 0));
  return (
    <div className="card funnel">
      {steps.map((s, i) => {
        const prev = i > 0 ? steps[i - 1].value : null;
        const conv = s.value != null && prev ? s.value / prev : null;
        return (
          <div className="f-row" key={s.label}>
            <div className="f-label">{s.label}{s.note ? <small style={{ display: "block", color: "var(--text-3)", fontSize: 12 }}>{s.note}</small> : null}</div>
            <div className="f-track">
              {s.value != null && <div className="f-bar" style={{ width: `${(s.value / top) * 100}%`, background: "var(--accent)" }} />}
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
