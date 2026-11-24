import type { KpiRow, Snapshot } from "@/lib/types";
import { num, pct, ratio, shortDate, usd } from "@/lib/format";
import { Funnel, Kpi } from "./ui";
import { BarChart } from "./BarChart";

const div = (a: number, b: number) => (b ? a / b : null);
/** The calc stores change as (now - prev) / prev; recover prev for the delta line. */
const prevOf = (now: number | null, chg: number | null) => (now == null || chg == null || chg === -1 ? null : now / (1 + chg));

/** Team-only performance: every rate and cost, both funnels, daily trend and the Meta/GHL reconciliation. */
export function TeamPerformance({ k, snap }: { k: KpiRow; snap: Snapshot }) {
  const partial = Math.max(0, k.started - k.submitted);
  const revenue = k.revenue + k.funnel_b_revenue;
  const daily = snap.daily.filter((d) => d.date >= k.since && d.date <= k.until);
  const learningDays = 14;

  return (
    <>
      <h2 className="section">Spend and leads</h2>
      <div className="grid kpis four">
        <Kpi tone="spend" label="Ad spend" value={usd(k.spend)} delta={{ now: k.spend, prev: prevOf(k.spend, k.spend_chg) }} />
        <Kpi tone="lead" label="Leads (tagged)" value={num(k.inquiries)} hint={`${num(k.meta_leads)} leads reported by Meta`} delta={{ now: k.inquiries, prev: prevOf(k.inquiries, k.inquiries_chg) }} />
        <Kpi tone="cost" label="Cost per lead" value={usd(k.cost_per_inquiry)} hint="Ad spend ÷ tagged leads" />
        <Kpi tone="cost" label="Cost per Meta lead" value={usd(div(k.spend, k.meta_leads))} hint="Ad spend ÷ Meta-reported leads" />
      </div>

      <h2 className="section">Funnel A: application to sale</h2>
      <div className="grid kpis four">
        <Kpi tone="partial" label="Partial applications" value={num(partial)} hint={`${pct(div(partial, k.started), 0)} of starts didn’t submit`} />
        <Kpi label="Completed applications" value={num(k.submitted)} hint={`${pct(div(k.submitted, k.started), 0)} completion rate · ${usd(div(k.spend, k.submitted))} each`} />
        <Kpi tone="qualified" label="Qualified applicants" value={num(k.qualified)} hint={`${pct(div(k.qualified, k.submitted), 0)} of completed applications`} delta={{ now: k.qualified, prev: prevOf(k.qualified, k.qualified_chg) }} />
        <Kpi tone="cost" label="Cost per qualified" value={usd(k.cost_per_qualified)} delta={{ now: k.cost_per_qualified, prev: prevOf(k.cost_per_qualified, k.cost_per_qualified_chg), lowerIsBetter: true }} />
        <Kpi tone="booked" label="Booked calls" value={num(k.booked)} hint={`${pct(div(k.booked, k.qualified), 0)} of qualified booked · ${num(k.upcoming)} upcoming`} delta={{ now: k.booked, prev: prevOf(k.booked, k.booked_chg) }} />
        <Kpi tone="cost" label="Cost per booked call" value={usd(k.cost_per_booked)} delta={{ now: k.cost_per_booked, prev: prevOf(k.cost_per_booked, k.cost_per_booked_chg), lowerIsBetter: true }} />
        <Kpi label="Attended / no-show" value={`${num(k.attended)} / ${num(k.no_show)}`} hint={`${pct(div(k.attended, k.attended + k.no_show), 0)} show rate · ${num(k.unmarked)} nurturing (not marked)`} />
        <Kpi label="Customers" value={num(k.customers)} hint={`${num(k.confirmed)} reached Proposal Sent or Closed`} />
      </div>
      <Funnel steps={[
        { label: "Started application", value: k.started },
        { label: "Completed application", value: k.submitted },
        { label: "Qualified applicant", value: k.qualified },
        { label: "Booked call", value: k.booked },
        { label: "Attended call", value: k.attended },
        { label: "Customer", value: k.customers },
      ]} />

      <h2 className="section">Funnel B: X-Ray offer</h2>
      <div className="grid kpis four">
        <Kpi tone="reroute" label="Re-routed" value={num(k.disqualified)} hint="Completed the application, sent to the X-Ray offer" />
        <Kpi tone="pdf" label="Opted in (free PDF)" value={num(k.funnel_b)} hint={`${num(k.funnel_b_from_dq)} of them came from the application · ${pct(div(k.funnel_b_from_dq, k.disqualified), 0)} of re-routed`} />
        <Kpi tone="sale" label="Course purchases" value={num(k.funnel_b_purchases)} hint={`${pct(div(k.funnel_b_purchases, k.funnel_b), 0)} of opt-ins · ${usd(k.funnel_b_revenue)}`} />
        <Kpi label="Revenue / ROAS" value={usd(revenue)} hint={`${ratio(div(revenue, k.spend))} return on ad spend (won deals + course sales)`} />
      </div>

      <h2 className="section">Daily trend <span className="sub">{shortDate(k.since)} – {shortDate(k.until)}</span></h2>
      <div className="grid two">
        <div className="card"><div className="label">Ad spend per day</div><BarChart data={daily.map((d) => ({ date: d.date, value: d.spend }))} color="var(--funnel-1)" format="usd" label="Ad spend per day" /></div>
        <div className="card"><div className="label">Completed applications per day</div><BarChart data={daily.map((d) => ({ date: d.date, value: d.applications }))} color="var(--funnel-3)" format="int" label="Applications per day" /></div>
      </div>

      <h2 className="section">Delivery</h2>
      <div className="card">
        <div className="mini">
          <Mini label="Impressions" value={num(k.impressions)} />
          <Mini label="Link clicks" value={num(k.link_clicks)} />
          <Mini label="Link CTR" value={pct(k.ctr, 2)} />
          <Mini label="Cost per link click" value={usd(k.cpc, true)} />
          <Mini label="CPM" value={usd(k.cpm, true)} />
          <Mini label="Landing page views" value={num(k.landing_page_views)} />
          <Mini label="Click → page view" value={pct(div(k.landing_page_views, k.link_clicks), 0)} />
          <Mini label="Page view → start" value={pct(div(k.started, k.landing_page_views), 1)} />
        </div>
      </div>

      <h2 className="section">Tracking reconciliation</h2>
      <div className="card table-wrap">
        <table>
          <tbody>
            <tr><td>Leads reported by Meta</td><td className="r tnum">{num(k.meta_leads)}</td></tr>
            <tr><td>Ad-tracked form submissions in GoHighLevel</td><td className="r tnum">{num(k.ad_form_events)}</td></tr>
            <tr><td>People behind those submissions</td><td className="r tnum">{num(k.ad_form_people)}</td></tr>
            <tr><td>Submissions with no ad tracking</td><td className="r tnum">{num(k.untracked_submissions)}</td></tr>
            <tr><td>Meta leads matched in GoHighLevel</td><td className="r tnum">{pct(div(Math.min(k.ad_form_events, k.meta_leads), k.meta_leads), 0)}</td></tr>
          </tbody>
        </table>
      </div>
      <p className="note">Ad sets younger than {learningDays} days are still learning; judge them on cost per lead, not cost per booked call.</p>
    </>
  );
}

/** Per ad set: budget, age, delivery, and how far each lead got. */
export function AdSetsTable({ snap }: { snap: Snapshot }) {
  const sets = [...(snap.adsets ?? [])].sort((a, b) => (a.status === b.status ? b.spend - a.spend : a.status === "ACTIVE" ? -1 : 1));
  const today = new Date(snap.dataThrough + "T12:00:00Z").getTime();
  if (!sets.length) return <div className="notice">No ad set data yet.</div>;
  return (
    <div className="card table-wrap">
      <table>
        <thead>
          <tr>
            <th>Ad set</th><th>Status</th><th className="r">Started</th><th className="r">Days</th><th className="r">Budget/day</th>
            <th className="r">Spend</th><th className="r">CTR</th><th className="r">CPC</th><th className="r">Meta leads</th>
            <th className="r">Leads</th><th className="r">Applied</th><th className="r">Qualified</th><th className="r">Booked</th>
            <th className="r">Cost/lead</th><th className="r">Cost/qualified</th>
          </tr>
        </thead>
        <tbody>
          {sets.map((s) => {
            const days = s.start_time ? Math.max(0, Math.floor((today - new Date(s.start_time).getTime()) / 864e5)) : null;
            const active = s.status === "ACTIVE";
            return (
              <tr key={s.adset_id}>
                <td className="wrap">{s.name}</td>
                <td><span className={active ? (days != null && days < 14 ? "pill warn" : "pill good") : "pill"}>{active ? (days != null && days < 14 ? "Learning" : "Active") : "Off"}</span></td>
                <td className="r tnum">{s.start_time ? shortDate(s.start_time.slice(0, 10)) : "—"}</td>
                <td className="r tnum">{days ?? "—"}</td>
                <td className="r tnum">{active ? usd(s.daily_budget) : "—"}</td>
                <td className="r tnum">{usd(s.spend)}</td>
                <td className="r tnum">{pct(div(s.link_clicks, s.impressions), 2)}</td>
                <td className="r tnum">{usd(div(s.spend, s.link_clicks), true)}</td>
                <td className="r tnum">{num(s.meta_leads)}</td>
                <td className="r tnum">{num(s.leads)}</td>
                <td className="r tnum">{num(s.applicants)}</td>
                <td className="r tnum">{num(s.qualified)}</td>
                <td className="r tnum">{num(s.booked)}</td>
                <td className="r tnum">{usd(div(s.spend, s.leads))}</td>
                <td className="r tnum">{usd(div(s.spend, s.qualified))}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="label">{label}</div>
      <div className="value tnum">{value}</div>
    </div>
  );
}
