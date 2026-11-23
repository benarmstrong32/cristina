import type { KpiRow, Snapshot } from "@/lib/types";
import { num, pct, usd } from "@/lib/format";
import { Funnel, Kpi } from "./ui";
import { PeopleTable } from "./PeopleTable";
import { AdsTable } from "./AdsTable";
import { AdsByLead } from "./AdsByLead";
import type { AdCreative } from "@/lib/data";
import type { ClientConfig } from "@/config/clients";

export const CLIENT_TABS = [
  { key: "overview", label: "Overview" },
  { key: "funnels", label: "Funnels" },
  { key: "people", label: "People" },
  { key: "sources", label: "Which ad" },
  { key: "ads", label: "Ads" },
  { key: "counting", label: "How we count" },
] as const;
export type ClientTab = (typeof CLIENT_TABS)[number]["key"];

/** The client-facing page, one tab at a time. */
export function Overview({ k, snap, creatives, client, view }: { k: KpiRow; snap: Snapshot; creatives: Record<string, AdCreative>; client: ClientConfig; view: ClientTab }) {
  return (
    <>
      {view === "overview" && (<>
      <div className="grid kpis">
        <Kpi label="Ad Spend" value={usd(k.spend)} hint="Spent on Meta ads" />
        <Kpi label="Leads" value={num(k.inquiries)} hint="Everyone who came in through the application page, tagged “9miles media lead” in GoHighLevel" delta={{ now: k.inquiries, prev: prevOf(k.inquiries, k.inquiries_chg) }} />
        <Kpi label="Qualified Applicants" value={num(k.qualified)} hint="Completed the Funnel A application and passed its qualifying questions" delta={{ now: k.qualified, prev: prevOf(k.qualified, k.qualified_chg) }} />
        <Kpi label="Cost Per Qualified Applicant" value={usd(k.cost_per_qualified)} hint="Ad spend ÷ qualified applicants" delta={{ now: k.cost_per_qualified, prev: prevOf(k.cost_per_qualified, k.cost_per_qualified_chg), lowerIsBetter: true }} />
        <Kpi label="Booked Calls" value={num(k.booked)} hint="Applicants who booked a call with Chris (cancellations excluded)" delta={{ now: k.booked, prev: prevOf(k.booked, k.booked_chg) }} />
        <Kpi label="Cost Per Booked Call" value={usd(k.cost_per_booked)} hint="Ad spend ÷ booked calls" delta={{ now: k.cost_per_booked, prev: prevOf(k.cost_per_booked, k.cost_per_booked_chg), lowerIsBetter: true }} />
      </div>

      {snap.highlights.length > 0 && (
        <>
          <h2 className="section">Highlights <span className="sub">best results since the campaign started</span></h2>
          <div className="grid kpis">
            {snap.highlights.map((h) => (
              <div className="card kpi" key={h.key}>
                <div className="label">{HIGHLIGHT_LABELS[h.key] ?? h.key}</div>
                <div className="value hl tnum">{h.value}</div>
                <div className="hint">{h.detail}</div>
              </div>
            ))}
          </div>
        </>
      )}

      </>)}

      {view === "funnels" && (<>
      <h2 className="section">Funnel A: application to sale <span className="sub">people who reached each step in this period</span></h2>
      <Funnel
        steps={[
          { label: "Started application", value: k.started },
          { label: "Completed application", value: k.submitted },
          { label: "Qualified applicant", value: k.qualified },
          { label: "Booked call", value: k.booked },
          { label: "Attended call", value: k.attended },
          { label: "Customer", value: k.customers },
        ]}
      />
      <p className="note">
        {k.disqualified} applicant{k.disqualified === 1 ? "" : "s"} did not qualify. Attended and customer counts fill in as calls are marked and deals move forward.
      </p>

      <h2 className="section">Funnel B: X-Ray opt-ins</h2>
      <div className="grid kpis">
        <Kpi label="Funnel B contacts" value={num(k.funnel_b)} hint="People who opted into the X-Ray offer" />
        <Kpi label="Of those, disqualified in Funnel A first" value={num(k.funnel_b_from_dq)} hint="Applied, didn’t qualify, then took the X-Ray offer" />
      </div>

      </>)}

      {view === "people" && (<>
      <h2 className="section">People <span className="sub">everyone who entered either funnel since the ads started, and the furthest step they reached</span></h2>
      <PeopleTable people={snap.people} />

      </>)}

      {view === "sources" && (<>
      <h2 className="section">Which ad each lead came from <span className="sub">the ad each person clicked before entering the funnel, from GoHighLevel’s tracking</span></h2>
      <AdsByLead people={snap.people} creatives={creatives} metaAccountId={client.metaAdAccountId} ghlLocationId={client.ghlLocationId} />

      </>)}

      {view === "ads" && (<>
      <h2 className="section">Ads <span className="sub">each ad’s results over the last 90 days (not affected by the date range)</span></h2>
      <AdsTable ads={snap.adTable} />

      <details className="card expand" style={{ marginTop: 16 }} open>
        <summary>Ad performance in this period</summary>
        <div className="mini">
          <Mini label="Impressions" value={num(k.impressions)} />
          <Mini label="Link clicks" value={num(k.link_clicks)} />
          <Mini label="Link CTR" value={pct(k.ctr, 2)} />
          <Mini label="Cost per link click" value={usd(k.cpc, true)} />
          <Mini label="CPM" value={usd(k.cpm, true)} />
          <Mini label="Landing page views" value={num(k.landing_page_views)} />
        </div>
      </details>
      </>)}

      {view === "counting" && (<>
      <h2 className="section">Why Meta shows a different number</h2>
      <div className="card table-wrap">
        <table>
          <thead><tr><th>Count</th><th className="r">This period</th><th>What it is</th></tr></thead>
          <tbody>
            <tr><td>Leads reported by Meta</td><td className="r tnum">{num(k.meta_leads)}</td><td className="wrap">Every form submission Meta’s pixel saw from an ad click. One person who fills in two forms counts twice.</td></tr>
            <tr><td>Form submissions from ads in GoHighLevel</td><td className="r tnum">{num(k.ad_form_events)}</td><td className="wrap">Application submissions plus Funnel B opt-ins with Facebook or Instagram ad tracking. This should match Meta closely.</td></tr>
            <tr><td>People behind those submissions</td><td className="r tnum">{num(k.ad_form_people)}</td><td className="wrap">The same submissions, counted once per person.</td></tr>
            <tr><td>Submissions with no ad tracking</td><td className="r tnum">{num(k.untracked_submissions)}</td><td className="wrap">Real applicants whose visit lost its ad tags. GoHighLevel counts them; Meta may not.</td></tr>
          </tbody>
        </table>
      </div>

      <details className="card expand" style={{ marginTop: 16 }} open>
        <summary>What each number means</summary>
        <dl className="defs">
          <dt>Started application</dt><dd>Entered name and contact details on the first page of the Funnel A application but did not finish it.</dd>
          <dt>Completed application</dt><dd>Submitted the Sales Growth Call Qualifier survey (either version).</dd>
          <dt>Qualified applicant</dt><dd>Completed the application and was not marked disqualified by its qualifying questions.</dd>
          <dt>Booked call</dt><dd>Booked a Sales Growth Strategy Call with Chris. Cancelled bookings are not counted.</dd>
          <dt>Attended call</dt><dd>The booking is marked Showed in GoHighLevel.</dd>
          <dt>Confirmed qualified</dt><dd>After the call, the opportunity reached Proposal Sent or Closed in the New Velocity Sales pipeline.</dd>
          <dt>Customer</dt><dd>The opportunity is marked Won or moved to Closed.</dd>
          <dt>Funnel B contact</dt><dd>Opted into the X-Ray offer form.</dd>
          <dt>Lead</dt><dd>Anyone who came into GoHighLevel through the application page, whether or not they finished it or booked a call. Each is tagged “9miles media lead” in GoHighLevel.</dd>
          <dt>Left out</dt><dd>Internal test records and blank records with no name or email.</dd>
        </dl>
      </details>
      </>)}
    </>
  );
}

const HIGHLIGHT_LABELS: Record<string, string> = {
  top_ad: "Top-performing ad",
  best_cpa: "Lowest cost per applicant",
  best_ctr: "Highest click-through rate",
  best_week: "Best week for applications",
  qual_rate: "Qualification rate",
  tracking: "Meta leads found in GoHighLevel",
};

/** The calc stores change as (now - prev) / prev; recover prev for the delta line. */
function prevOf(now: number | null, chg: number | null) {
  if (now == null || chg == null || chg === -1) return null;
  return now / (1 + chg);
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="label">{label}</div>
      <div className="value tnum">{value}</div>
    </div>
  );
}
