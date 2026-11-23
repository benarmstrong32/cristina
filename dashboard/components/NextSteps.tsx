import type { Snapshot } from "@/lib/types";
import { NEXT_STEPS } from "@/config/next-steps";
import { num, shortDate, usd } from "@/lib/format";

const DAY = 864e5;

function runningFor(start: string, now: Date) {
  const days = Math.max(0, Math.floor((now.getTime() - new Date(start).getTime()) / DAY));
  return days === 1 ? "1 day" : `${days} days`;
}

/** The client's "Next steps" tab: recent changes, new ad sets, the learning-phase note and the plan. */
export function NextSteps({ snap }: { snap: Snapshot }) {
  const now = new Date();
  const adsets = (snap.adsets || [])
    .filter((s) => s.status === "ACTIVE")
    .sort((a, b) => b.start_time.localeCompare(a.start_time));
  return (
    <>
      <h2 className="section">What’s changed recently</h2>
      <div className="grid steps">
        {NEXT_STEPS.recentChanges.map((c) => (
          <div className="card step change" key={c.title}>
            <div className="step-title">{c.title}</div>
            <p>{c.detail}</p>
          </div>
        ))}
      </div>

      <h2 className="section">How long each ad set has been running <span className="sub">ads running now, results since each one started</span></h2>
      <div className="grid kpis">
        {adsets.map((s) => {
          const isNew = now.getTime() - new Date(s.start_time).getTime() < 21 * DAY;
          return (
            <div className="card adset" key={s.adset_id}>
              <div className="adset-head">
                <span className="adset-name">{s.name}</span>
                {isNew && <span className="pill warn">Still learning</span>}
              </div>
              <div className="adset-days tnum">{runningFor(s.start_time, now)}</div>
              <div className="hint">Running since {shortDate(s.start_time.slice(0, 10))} · {usd(s.daily_budget)}/day</div>
              <dl className="adset-stats">
                <div><dt>Spent</dt><dd className="tnum">{usd(s.spend)}</dd></div>
                <div><dt>Leads</dt><dd className="tnum">{num(s.leads)}</dd></div>
                <div><dt>Qualified</dt><dd className="tnum">{num(s.qualified)}</dd></div>
                <div><dt>Booked calls</dt><dd className="tnum">{num(s.booked)}</dd></div>
              </dl>
            </div>
          );
        })}
      </div>

      <div className="card explainer">
        <div className="step-title">{NEXT_STEPS.learningPhase.title}</div>
        {NEXT_STEPS.learningPhase.body.map((p) => <p key={p.slice(0, 20)}>{p}</p>)}
      </div>

      <h2 className="section">What we’re doing next <span className="sub">as of {shortDate(NEXT_STEPS.asOf)}</span></h2>
      <ol className="steps-list">
        {NEXT_STEPS.nextSteps.map((s) => (
          <li className="card step" key={s.title}>
            <div className="step-title">{s.title}</div>
            <p>{s.detail}</p>
          </li>
        ))}
      </ol>
    </>
  );
}
