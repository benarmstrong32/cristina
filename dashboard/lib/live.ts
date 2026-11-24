// Live data: pulls Meta and GoHighLevel directly with API tokens, then runs the
// shared calculations. Results are cached for a few hours; the Refresh button
// clears the cache.
import type { ClientConfig } from "@/config/clients";
import type { Snapshot } from "./types";
import { computeSnapshot, loadPage } from "./logic/compute.mjs";

const GRAPH = "https://graph.facebook.com/v23.0";
const GHL = "https://services.leadconnectorhq.com";
const SINCE = "2026-10-14";

type Action = { action_type: string; value: string };
const act = (a: Action[] | undefined, type: string) => a?.find((x) => x.action_type === type)?.value ?? null;

async function graph(pathAndQuery: string, token: string): Promise<any[]> {
  const out: any[] = [];
  let url: string | null = `${GRAPH}/${pathAndQuery}${pathAndQuery.includes("?") ? "&" : "?"}limit=500&access_token=${encodeURIComponent(token)}`;
  while (url) {
    const res: Response = await fetch(url, { cache: "no-store" });
    const json = await res.json();
    if (!res.ok) throw new Error(`Meta: ${json?.error?.message ?? res.status}`);
    out.push(...json.data);
    url = json.paging?.next ?? null;
  }
  return out;
}

async function ghl(p: string, token: string, version: string, init: RequestInit = {}) {
  const res = await fetch(`${GHL}${p}`, {
    ...init,
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}`, Version: version, Accept: "application/json", "Content-Type": "application/json" },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`GoHighLevel ${p.split("?")[0]}: ${json?.message ?? res.status}`);
  return json;
}

/** Fetch every page; `get(page)` returns one answer, `more(answer)` says if another page follows. */
async function pages(get: (p: number) => Promise<any>, more: (a: any) => boolean, max = 20) {
  const all: any[] = [];
  for (let p = 1; p <= max; p++) {
    const a = await get(p);
    all.push(a);
    if (!more(a)) break;
  }
  return all;
}

async function rowsFrom(id: string, answers: any[]) {
  const out: any[] = [];
  for (const a of answers) out.push(...(await loadPage(id, a)));
  return out;
}

async function liveMeta(c: ClientConfig, meta: string) {
  const [dayRows, adRows, adStatus, setRows, setInfo] = await Promise.all([
    graph(`act_${c.metaAdAccountId}/insights?level=account&time_increment=1&date_preset=maximum&fields=spend,impressions,inline_link_clicks,actions`, meta),
    graph(`act_${c.metaAdAccountId}/insights?level=ad&date_preset=maximum&fields=ad_id,ad_name,adset_name,spend,impressions,inline_link_clicks,actions`, meta),
    graph(`act_${c.metaAdAccountId}/ads?fields=id,effective_status`, meta),
    graph(`act_${c.metaAdAccountId}/insights?level=adset&date_preset=maximum&fields=adset_id,adset_name,spend,impressions,inline_link_clicks,actions`, meta),
    graph(`act_${c.metaAdAccountId}/adsets?fields=id,name,effective_status,start_time,daily_budget`, meta),
  ]);
  const status = new Map(adStatus.map((a) => [a.id, a.effective_status]));
  const setStats = new Map(setRows.map((r) => [r.adset_id, r]));
  const metaAdsets = { ad_entities: setInfo.map((s) => { const r = setStats.get(s.id) || {}; return { id: s.id, name: s.name, effective_status: s.effective_status, start_time: s.start_time, daily_budget: s.daily_budget ? Number(s.daily_budget) / 100 : 0, amount_spent: r.spend, impressions: r.impressions, link_click: r.inline_link_clicks, lead: act(r.actions, "lead") }; }) };
  const metaDaily = { ad_entities: dayRows.map((r) => ({ date_start: r.date_start, amount_spent: r.spend, impressions: r.impressions, link_click: r.inline_link_clicks, landing_page_view: act(r.actions, "landing_page_view"), lead: act(r.actions, "lead") })) };
  const metaAds = { ad_entities: adRows.map((r) => ({ id: r.ad_id, name: r.ad_name, adset_name: r.adset_name, effective_status: status.get(r.ad_id) ?? "UNKNOWN", amount_spent: r.spend, impressions: r.impressions, link_click: r.inline_link_clicks, lead: act(r.actions, "lead") })) };
  return {
    meta_daily: await rowsFrom("meta_daily", [metaDaily]),
    meta_ads: await rowsFrom("meta_ads", [metaAds]),
    meta_adsets: await rowsFrom("meta_adsets", [metaAdsets]),
  };
}

/** Saved Meta rows (data/snapshot/meta-saved.json), refreshed through Claude's Meta connector. */
async function savedMeta(): Promise<{ savedAt: string; meta_daily: any[]; meta_ads: any[]; meta_adsets: any[] }> {
  const { readFile } = await import("node:fs/promises");
  const path = await import("node:path");
  return JSON.parse(await readFile(path.join(process.cwd(), "data", "snapshot", "meta-saved.json"), "utf8"));
}

/** Live GoHighLevel always; live Meta when a Meta token is set, otherwise the saved Meta copy. */
export async function fetchLive(c: ClientConfig, meta: string | undefined, ghlToken: string): Promise<Snapshot> {
  const loc = c.ghlLocationId;
  const until = "2030-12-31";

  let metaSavedAt: string | undefined;
  let metaRows: { meta_daily: any[]; meta_ads: any[]; meta_adsets: any[] };
  if (meta) {
    metaRows = await liveMeta(c, meta);
  } else {
    const saved = await savedMeta();
    metaSavedAt = saved.savedAt;
    metaRows = { meta_daily: saved.meta_daily, meta_ads: saved.meta_ads, meta_adsets: saved.meta_adsets };
  }

  // GoHighLevel.
  const start = new Date(`${SINCE}T00:00:00Z`).getTime();
  const [contacts, surveys, funnelB, events, opps, pipelines, orders] = await Promise.all([
    pages((page) => ghl("/contacts/search", ghlToken, "2021-07-28", {
      method: "POST",
      body: JSON.stringify({ locationId: loc, page, pageLimit: 100, filters: [{ field: "dateAdded", operator: "range", value: { gte: `${SINCE}T00:00:00Z`, lte: `${until}T23:59:59Z` } }], sort: [{ field: "dateAdded", direction: "desc" }] }),
    }), (a) => (a.contacts ?? []).length === 100),
    pages((page) => ghl(`/surveys/submissions?locationId=${loc}&startAt=${SINCE}&endAt=${until}&limit=100&page=${page}`, ghlToken, "2021-07-28"), (a) => !!a.meta?.nextPage),
    pages((page) => ghl(`/forms/submissions?locationId=${loc}&formId=${c.funnelBFormId}&startAt=${SINCE}&endAt=${until}&limit=100&page=${page}`, ghlToken, "2021-07-28"), (a) => !!a.meta?.nextPage),
    ghl(`/calendars/events?locationId=${loc}&calendarId=${c.introCalendarId}&startTime=${start}&endTime=${Date.UTC(2030, 11, 31)}`, ghlToken, "2021-04-15"),
    pages((page) => ghl(`/opportunities/search?location_id=${loc}&pipeline_id=${c.pipelineId}&limit=100&page=${page}`, ghlToken, "2021-07-28"), (a) => (a.opportunities ?? []).length === 100),
    ghl(`/opportunities/pipelines?locationId=${loc}`, ghlToken, "2021-07-28"),
    // Orders only feed the course-purchase count; don't let a missing payments scope break the page.
    ghl(`/payments/orders?altId=${loc}&altType=location&startAt=${SINCE}&limit=100`, ghlToken, "2021-07-28").catch((e) => {
      console.error(e);
      return { data: [] };
    }),
  ]);
  // One page at a time through the loaders, with "next page" hints removed.
  const strip = (a: any) => ({ ...a, meta: {} });

  const rows = {
    ...metaRows,
    ghl_contacts: await rowsFrom("ghl_contacts", contacts),
    ghl_surveys: await rowsFrom("ghl_surveys", surveys.map(strip)),
    ghl_funnel_b: await rowsFrom("ghl_funnel_b", funnelB.map(strip)),
    ghl_events: await rowsFrom("ghl_events", [events]),
    ghl_opps: await rowsFrom("ghl_opps", opps),
    ghl_stages: await rowsFrom("ghl_stages", [pipelines]),
    ghl_orders: await rowsFrom("ghl_orders", [orders]),
  };
  return computeSnapshot(c.id, rows, { source: "live", metaLive: !!meta, ...(metaSavedAt ? { metaSavedAt } : {}) });
}
