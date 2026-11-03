export type Totals = {
  spend: number;
  impressions: number;
  clicks: number;
  link_clicks: number;
  landing_page_views: number;
  add_to_carts: number;
  checkouts: number;
  purchases: number;
  purchase_value: number;
  leads: number;
  actual_revenue: number | null; // null = no uploaded revenue for this scope
  /** Meta spend on only the account-days that have uploaded revenue, so blended ROAS compares like with like. */
  actual_spend: number;
};

export const EMPTY_TOTALS: Totals = {
  spend: 0, impressions: 0, clicks: 0, link_clicks: 0, landing_page_views: 0,
  add_to_carts: 0, checkouts: 0, purchases: 0, purchase_value: 0, leads: 0,
  actual_revenue: null, actual_spend: 0,
};

const div = (a: number, b: number) => (b > 0 ? a / b : null);

/** Ratios are always computed from summed totals, never by averaging daily ratios. */
export function derive(t: Totals) {
  return {
    roas: div(t.purchase_value, t.spend),
    blended_roas: t.actual_revenue == null ? null : div(t.actual_revenue, t.actual_spend),
    cpa: div(t.spend, t.purchases),
    aov: div(t.purchase_value, t.purchases),
    cpm: t.impressions > 0 ? (t.spend / t.impressions) * 1000 : null,
    ctr: div(t.link_clicks, t.impressions),
    cpc: div(t.spend, t.link_clicks),
    cvr: div(t.purchases, t.link_clicks),
    lpv_rate: div(t.landing_page_views, t.link_clicks),
    cpl: div(t.spend, t.leads),
    profit_after_ads: t.purchase_value - t.spend,
  };
}

export type Derived = ReturnType<typeof derive>;

/** Fractional change vs the prior period, or null when there's no baseline. */
export function change(cur: number | null, prev: number | null): number | null {
  if (cur == null || prev == null || prev === 0) return null;
  return (cur - prev) / Math.abs(prev);
}
