import type { Kpis } from "@/lib/metrics";
import { num, pct, ratio, usd } from "@/lib/format";
import { Funnel, Kpi } from "./ui";
import { BarChart } from "./BarChart";

/** The client-facing block: 6 KPI cards, funnel, optional revenue row, expandable ad stats. */
export function Overview({
  k, prev, showRevenue, audience,
}: { k: Kpis; prev: Kpis; showRevenue: boolean; audience: "client" | "team" }) {
  const crm = k.ghl;
  return (
    <>
      <div className="grid kpis">
        <Kpi label="Ad Spend" value={usd(k.spend)} hint="Spent on Meta ads (excludes management fees)"
          delta={{ now: k.spend, prev: prev.spend }} />
        <Kpi label="New Leads" value={num(crm ? k.leads : k.metaLeads)}
          hint={crm ? "New inquiries from the ads, counted in GoHighLevel" : "As reported by Meta"}
          delta={{ now: crm ? k.leads : k.metaLeads, prev: crm ? prev.leads : prev.metaLeads }} />
        <Kpi label="Cost Per Lead" value={usd(crm ? k.cpl : k.metaCpl)} hint="Ad spend ÷ new leads"
          delta={{ now: crm ? k.cpl : k.metaCpl, prev: crm ? prev.cpl : prev.metaCpl, lowerIsBetter: true }} />
        <Kpi label="Appointments Booked" value={num(k.booked)} muted={!crm}
          hint={crm ? "Ad leads who booked an intro call" : "Available once GoHighLevel is connected"}
          delta={{ now: k.booked, prev: prev.booked }} />
        <Kpi label="Cost Per Appointment" value={usd(k.cpa)} muted={!crm} hint="Ad spend ÷ appointments booked"
          delta={{ now: k.cpa, prev: prev.cpa, lowerIsBetter: true }} />
        <Kpi label="New Customers" value={num(k.customers)} muted={!crm} hint="Ad leads who became paying customers"
          delta={{ now: k.customers, prev: prev.customers }} />
      </div>

      <h2 className="section">Lead journey</h2>
      <Funnel
        steps={[
          { label: "New Leads", value: k.leads },
          { label: "Qualified Leads", value: k.qualified },
          { label: "Appointments Booked", value: k.booked },
          { label: "Appointments Completed", value: k.completed },
          { label: "New Customers", value: k.customers },
        ]}
      />

      {showRevenue && (
        <>
          <h2 className="section">Revenue</h2>
          <div className="grid kpis">
            <Kpi label="Revenue From Ads" value={usd(k.revenue)} hint="Closed-won value from ad leads" muted={!crm} />
            <Kpi label="Return on Ad Spend" value={ratio(k.roas)} hint="Revenue ÷ ad spend" muted={!crm} />
            <Kpi label="Ad Cost Per Customer" value={usd(k.cac)} hint="Ad spend ÷ new customers" muted={!crm} />
          </div>
        </>
      )}

      <h2 className="section">Daily trend</h2>
      <div className="grid two">
        <div className="card">
          <p className="chart-title">Ad spend per day</p>
          <BarChart data={k.days.map((d) => ({ date: d.date, value: d.spend }))} color="var(--series-spend)" format="usd" label="Daily ad spend" />
        </div>
        <div className="card">
          <p className="chart-title">{crm ? "New leads per day (GoHighLevel)" : "Leads per day (Meta-reported)"}</p>
          <BarChart data={leadsPerDay(k, crm)} color="var(--series-leads)" format="int" label="Daily leads" />
        </div>
      </div>

      <details className="card expand" style={{ marginTop: 16 }} open={audience === "team"}>
        <summary>Ad Performance</summary>
        <div className="mini">
          <Mini label="Impressions" value={num(k.impressions)} />
          <Mini label="Link clicks" value={num(k.linkClicks)} />
          <Mini label="Link CTR" value={pct(k.ctr, 2)} />
          <Mini label="Cost per link click" value={usd(k.cpc, true)} />
          <Mini label="CPM" value={usd(k.cpm, true)} />
          <Mini label="Landing page views" value={num(k.landingPageViews)} />
          <Mini label="Leads (Meta-reported)" value={num(k.metaLeads)} />
        </div>
      </details>
    </>
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

function leadsPerDay(k: Kpis, crm: boolean) {
  if (!crm) return k.days.map((d) => ({ date: d.date, value: d.metaLeads }));
  const counts = new Map<string, number>();
  for (const l of k.leadList) {
    const d = new Date(l.createdAt).toLocaleDateString("en-CA", { timeZone: "America/New_York" });
    counts.set(d, (counts.get(d) ?? 0) + 1);
  }
  return k.days.map((d) => ({ date: d.date, value: counts.get(d.date) ?? 0 }));
}
