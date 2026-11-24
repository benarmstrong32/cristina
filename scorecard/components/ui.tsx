import Link from "next/link";
import type { Session } from "@/lib/session";
import type { Data } from "@/lib/types";
import { RANGES, type RangeKey } from "@/lib/metrics";
import { dateTime, shortDate } from "@/lib/format";
import { REFRESH_HOURS } from "@/config/scorecard";

export function TopBar({ session }: { session: Session }) {
  return (
    <header className="topbar">
      <div className="brand">
        <img className="brand-icon" src="/icon.svg" alt="" width={36} height={36} />
        <div>
          <h1>9miles Media</h1>
          <span className="by">Growth scorecard</span>
        </div>
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
  { key: "intros", label: "Intros & bonus" },
  { key: "campaigns", label: "Campaigns" },
  { key: "deals", label: "Won deals" },
  { key: "log", label: "Intro log" },
] as const;
export type TabKey = (typeof TABS)[number]["key"];

export function Controls({ range, view }: { range: RangeKey; view: TabKey }) {
  return (
    <div className="controls">
      <nav className="tabs" aria-label="Views">
        {TABS.map((t) => (
          <Link key={t.key} href={`/?${new URLSearchParams({ view: t.key, range })}`} aria-current={t.key === view ? "page" : undefined}>
            {t.label}
          </Link>
        ))}
      </nav>
      <nav className="range" aria-label="Date range">
        {RANGES.map((r) => (
          <Link key={r.key} href={`/?${new URLSearchParams({ view, range: r.key })}`} aria-current={r.key === range ? "true" : undefined}>
            {r.label}
          </Link>
        ))}
      </nav>
    </div>
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
        {d.adsLive ? (
          <>Meta live · updated {dateTime(d.generatedAt)} ET · refreshes every {REFRESH_HOURS} hours</>
        ) : (
          <>Meta ad numbers through {shortDate(d.adsThrough)}</>
        )}
        {" "}· intros and deals from the sales ops sheet, updated {shortDate(d.sheetSavedAt)}
        {d.error ? <span className="fresh-err"> · Live update failed: {d.error}</span> : null}
      </span>
      {d.adsLive && (
        <form method="post" action="/api/refresh">
          <input type="hidden" name="back" value={back} />
          <button className="btn-link" type="submit">Refresh now</button>
        </form>
      )}
    </div>
  );
}
