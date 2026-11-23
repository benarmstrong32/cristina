export type RangeKey = "7d" | "14d" | "30d" | "90d";

export type KpiRow = {
  range: RangeKey; since: string; until: string;
  spend: number; impressions: number; link_clicks: number; landing_page_views: number; meta_leads: number;
  ctr: number | null; cpc: number | null; cpm: number | null;
  started: number; submitted: number; qualified: number; disqualified: number;
  booked: number; attended: number; no_show: number; confirmed: number; customers: number; revenue: number;
  funnel_b: number; funnel_b_from_dq: number; inquiries: number;
  cost_per_qualified: number | null; cost_per_booked: number | null; cost_per_inquiry: number | null;
  ad_form_events: number; ad_form_people: number; untracked_submissions: number;
  upcoming: number; unmarked: number;
  spend_chg: number | null; inquiries_chg: number | null; qualified_chg: number | null; booked_chg: number | null;
  cost_per_qualified_chg: number | null; cost_per_booked_chg: number | null;
};

export type Snapshot = {
  clientId: string;
  generatedAt: string;
  dataThrough: string;
  source?: "live" | "saved";
  crmThrough?: string;
  kpis: KpiRow[];
  highlights: { key: string; value: string; detail: string }[];
  daily: { date: string; spend: number; applications: number }[];
  people: Person[];
  calls: { id: string; name: string; booked_date: string; call_at: string; start_label: string; outcome: string }[];
  adTable: { ad_id: string; ad_name: string; adset_name: string; status: string; spend: number; impressions: number; ctr: number | null; cpc: number | null; meta_leads: number; ghl_submissions: number; qualified: number }[];
  health: { check: string; ok: string; detail: string }[];
};

export type Person = {
  person: string; name: string; first_date: string; lead_tag: string;
  ad_id: string; ad_name: string; adset_name: string; contact_id: string;
  email: string; phone: string; company: string; role: string; team_size: string; challenge: string;
  budget: string; timeline: string; decision_maker: string; training: string; notes: string;
  funnel_a: string; funnel_b: string; call: string; sales: string; from_ads: string;
};
