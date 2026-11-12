import type { MetaAd, MetaDay } from "./types";

const GRAPH = "https://graph.facebook.com/v23.0";
const LEAD_TYPES = ["lead", "onsite_conversion.lead_grouped", "offsite_conversion.fb_pixel_lead"];

type Action = { action_type: string; value: string };

function leadsFrom(actions?: Action[]): number {
  if (!actions) return 0;
  // "lead" is Meta's de-duplicated total; fall back to the specific types if it's absent.
  const total = actions.find((a) => a.action_type === "lead");
  if (total) return Number(total.value);
  return actions.filter((a) => LEAD_TYPES.includes(a.action_type)).reduce((s, a) => s + Number(a.value), 0);
}
function actionCount(actions: Action[] | undefined, type: string): number {
  return Number(actions?.find((a) => a.action_type === type)?.value ?? 0);
}

async function graph<T>(path: string, params: Record<string, string>, token: string): Promise<T[]> {
  const out: T[] = [];
  let url: string | null = `${GRAPH}/${path}?${new URLSearchParams({ ...params, access_token: token, limit: "500" })}`;
  while (url) {
    const res: Response = await fetch(url, { next: { revalidate: 3600 } });
    const json = await res.json();
    if (!res.ok) throw new Error(`Meta API: ${json?.error?.message ?? res.status}`);
    out.push(...(json.data as T[]));
    url = json.paging?.next ?? null;
  }
  return out;
}

export async function fetchMeta(adAccountId: string, since: string, until: string, token: string) {
  const time_range = JSON.stringify({ since, until });
  const dayRows = await graph<any>(`act_${adAccountId}/insights`, {
    level: "account",
    time_increment: "1",
    time_range,
    fields: "spend,impressions,clicks,inline_link_clicks,actions",
  }, token);
  const days: MetaDay[] = dayRows.map((r) => ({
    date: r.date_start,
    spend: Number(r.spend ?? 0),
    impressions: Number(r.impressions ?? 0),
    clicks: Number(r.clicks ?? 0),
    linkClicks: Number(r.inline_link_clicks ?? 0),
    landingPageViews: actionCount(r.actions, "landing_page_view"),
    metaLeads: leadsFrom(r.actions),
  }));

  const [adRows, adMeta] = await Promise.all([
    graph<any>(`act_${adAccountId}/insights`, {
      level: "ad",
      time_range,
      fields: "ad_id,ad_name,adset_name,spend,impressions,reach,inline_link_clicks,actions",
    }, token),
    graph<any>(`act_${adAccountId}/ads`, { fields: "id,effective_status" }, token),
  ]);
  const status = new Map(adMeta.map((a) => [a.id, a.effective_status]));
  const ads: MetaAd[] = adRows.map((r) => ({
    id: r.ad_id,
    name: r.ad_name,
    adsetName: r.adset_name,
    status: status.get(r.ad_id) ?? "UNKNOWN",
    spend: Number(r.spend ?? 0),
    impressions: Number(r.impressions ?? 0),
    reach: Number(r.reach ?? 0),
    linkClicks: Number(r.inline_link_clicks ?? 0),
    metaLeads: leadsFrom(r.actions),
  }));
  return { days, ads };
}
