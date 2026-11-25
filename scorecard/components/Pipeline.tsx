import type { Stored } from "@/lib/store";
import type { Deal } from "@/lib/types";
import { dateTime, shortDate, usd } from "@/lib/format";
import { Kpi } from "@/components/ui";
import { RecordForm } from "@/components/Records";

const today = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
const total = (x: Deal) => (x.amountPerMonth ?? 0) * (x.months ?? 1);

const GROUPS: { title: string; sub: string; pick: (x: Deal) => boolean }[] = [
  { title: "Active · Ben", sub: "working now", pick: (x) => x.status === "Active" && x.owner !== "Cristina" && x.owner !== "Dan" },
  { title: "Active · Cristina", sub: "Cristina's deals", pick: (x) => x.status === "Active" && x.owner === "Cristina" },
  { title: "Active · Dan", sub: "Dan's deals", pick: (x) => x.status === "Active" && x.owner === "Dan" },
  { title: "On hold", sub: "paused by the prospect", pick: (x) => x.status === "On Hold" },
  { title: "Long-term", sub: "keep warm", pick: (x) => x.status === "Long-term" },
  { title: "Won", sub: "signed", pick: (x) => x.status === "Won" },
  { title: "Lost", sub: "closed out", pick: (x) => x.status === "Lost" },
];

function Row({ x, version, back, now }: { x: Deal; version: number; back: string; now: string }) {
  const overdue = x.status === "Active" && x.nextAction && x.nextAction < now;
  return (
    <details className="card person">
      <summary className="rec-row deal-row">
        <span className="pname">{x.company}<span className="pfunnel">{[x.dealType, x.leadSource].filter(Boolean).join(" · ")}</span></span>
        <span className="tnum">{x.amountPerMonth ? `${usd(x.amountPerMonth)}/mo` : "—"}{x.months ? <span className="pfunnel">{x.months} mo · {usd(total(x))}</span> : null}</span>
        <span className="tnum">{x.confidence != null ? `${Math.round(x.confidence * 100)}%` : "—"}</span>
        <span>{x.closeMonth || "—"}</span>
        <span className={overdue ? "overdue" : "pdate"}>{x.nextAction ? `Next ${shortDate(x.nextAction)}` : "No next date"}{overdue ? " · overdue" : ""}</span>
        <span className="pco wrapcell">{x.nextSteps || x.lastSummary}</span>
      </summary>
      <RecordForm kind="deals" row={x as unknown as Record<string, unknown>} version={version} back={back} />
    </details>
  );
}

function Mover({ id, version, back, first, last }: { id: string; version: number; back: string; first: boolean; last: boolean }) {
  const btn = (dir: string, label: string, title: string, off: boolean) => (
    <form method="post" action="/api/records">
      <input type="hidden" name="collection" value="deals" />
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="version" value={version} />
      <input type="hidden" name="back" value={back} />
      <input type="hidden" name="action" value="move" />
      <input type="hidden" name="dir" value={dir} />
      <button type="submit" className="mv" title={title} aria-label={title} disabled={off}>{label}</button>
    </form>
  );
  return (
    <div className="mover">
      {btn("top", "⤒", "Move to the top", first)}
      {btn("up", "▲", "Move up", first)}
      {btn("down", "▼", "Move down", last)}
    </div>
  );
}

export function Pipeline({ deals, back }: { deals: Stored<Deal> | null; back: string }) {
  if (!deals) return null;
  const now = today();
  const thisMonth = now.slice(0, 7);
  const monthName = new Date(now + "T12:00:00Z").toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
  const active = deals.rows.filter((x) => x.status === "Active");
  const mrr = active.reduce((s, x) => s + (x.amountPerMonth ?? 0), 0);
  const weighted = active.reduce((s, x) => s + (x.amountPerMonth ?? 0) * (x.confidence ?? 0), 0);
  const overdue = active.filter((x) => x.nextAction && x.nextAction < now).length;
  const closingNow = active.filter((x) => x.closeMonth.toLowerCase().startsWith(monthName.toLowerCase()));
  const hot = active.filter((x) => (x.confidence ?? 0) >= 0.7);
  return (
    <>
      <h2 className="section">Pipeline <span className="sub">every deal in play · ⤒ ▲ ▼ to put the hottest on top · click a deal to update it</span></h2>
      <div className="grid kpis five">
        <Kpi tone="lead" label="Active deals" value={String(active.length)} hint={`${hot.length} at 70%+ confidence`} />
        <Kpi tone="sale" label="Active pipeline" value={`${usd(mrr)}/mo`} hint="Sum of monthly amounts" />
        <Kpi tone="qualified" label="Weighted pipeline" value={`${usd(weighted)}/mo`} hint="Monthly amount × confidence" />
        <Kpi tone="booked" label={`Expected to close in ${monthName}`} value={String(closingNow.length)} hint={closingNow.length ? `${usd(closingNow.reduce((s, x) => s + (x.amountPerMonth ?? 0), 0))}/mo` : undefined} />
        <Kpi tone="cost" label="Overdue next actions" value={String(overdue)} hint={overdue ? "Next action date has passed" : "All caught up"} />
      </div>
      <details className="card expand add-card">
        <summary>＋ Add a deal</summary>
        <RecordForm kind="deals" version={deals.version} back={back} label="Add deal" />
      </details>
      {GROUPS.map((g) => {
        const rows = deals.rows.filter(g.pick);
        if (!rows.length) return null;
        const sum = rows.reduce((s, x) => s + (x.amountPerMonth ?? 0), 0);
        return (
          <section key={g.title}>
            <h3 className="group-h">{g.title} <span className="sub">{rows.length} deal{rows.length === 1 ? "" : "s"} · {usd(sum)}/mo · {g.sub}</span></h3>
            <div className="deal-head rec-row deal-row with-mover" aria-hidden><span>Deal</span><span>Amount</span><span>Conf.</span><span>Close</span><span>Next action</span><span>Next steps</span></div>
            <div className="people-list">
              {rows.map((x, i) => (
                <div className="deal-item" id={`d-${x.id}`} key={x.id}>
                  <Mover id={x.id} version={deals.version} back={back} first={i === 0} last={i === rows.length - 1} />
                  <Row x={x} version={deals.version} back={back} now={now} />
                </div>
              ))}
            </div>
          </section>
        );
      })}
      <p className="note">
        Started from the 1126 Pipeline tab of the sales ops sheet.{deals.updatedAt ? ` Last change ${dateTime(deals.updatedAt)} ET by ${deals.updatedBy}.` : ""} Won deals here are a sales tracker; the Won deals tab and Cristina's bonus still come from the intro log. Lost and archived deals stay listed so nothing gets lost.
      </p>
    </>
  );
}
