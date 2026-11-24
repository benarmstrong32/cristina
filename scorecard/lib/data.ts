import { readFile } from "node:fs/promises";
import path from "node:path";
import { unstable_cache } from "next/cache";
import { AD_ACCOUNT_ID, REFRESH_HOURS, START } from "@/config/scorecard";
import type { AdRow, AdTotal, Applicant, Data, Intro, Triage, Win } from "./types";

export const LIVE_TAG = "meta-live";

async function readJson(name: string) {
  return JSON.parse(await readFile(path.join(process.cwd(), "data", name), "utf8"));
}

export const todayET = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });

/** Daily campaign rows straight from the Meta Marketing API. */
async function liveAds(token: string): Promise<AdRow[]> {
  const out: AdRow[] = [];
  const range = encodeURIComponent(JSON.stringify({ since: START, until: todayET() }));
  let url: string | null =
    `https://graph.facebook.com/v23.0/act_${AD_ACCOUNT_ID}/insights?level=campaign&time_increment=1&time_range=${range}` +
    `&fields=campaign_id,campaign_name,spend,impressions,clicks,actions&limit=500&access_token=${encodeURIComponent(token)}`;
  while (url) {
    const res: Response = await fetch(url, { cache: "no-store" });
    const json = await res.json();
    if (!res.ok) throw new Error(`Meta: ${json?.error?.message ?? res.status}`);
    for (const r of json.data as any[]) {
      // Meta reports the same application under several action types; take the largest, never the sum.
      const apps = (r.actions ?? [])
        .filter((a: any) => String(a.action_type).includes("submit_application"))
        .reduce((m: number, a: any) => Math.max(m, Number(a.value) || 0), 0);
      out.push({
        day: r.date_start,
        id: String(r.campaign_id),
        campaign: r.campaign_name,
        spend: Number(r.spend) || 0,
        impressions: Number(r.impressions) || 0,
        clicks: Number(r.clicks) || 0,
        result_type: apps ? "submit_application" : "",
        results: apps,
      });
    }
    url = json.paging?.next ?? null;
  }
  return out;
}

const cachedLiveAds = unstable_cache(
  async () => ({ rows: await liveAds(process.env.META_ACCESS_TOKEN!), at: new Date().toISOString() }),
  ["meta-live-ads"],
  { revalidate: REFRESH_HOURS * 3600, tags: [LIVE_TAG] },
);

/** Live Meta numbers when META_ACCESS_TOKEN is set (cached, cleared by Refresh); otherwise the saved copy. */
export async function getData(): Promise<Data> {
  const sheet = await readJson("sheet.json");
  const adFile = await readJson("meta-ads.json").catch(() => ({ ads: [], through: "" }));
  const people = await readJson("applicants.json").catch(() => ({ people: [], savedAt: undefined }));
  const base = {
    applicants: people.people as Applicant[],
    applicantsSavedAt: people.savedAt as string | undefined,
    intros: sheet.intros as Intro[],
    wins: sheet.wins as Win[],
    triage: (sheet.triage ?? []) as Triage[],
    adTotals: adFile.ads as AdTotal[],
    adTotalsThrough: adFile.through as string,
    sheetSavedAt: sheet.savedAt as string,
  };
  const fromSaved = async (error?: string): Promise<Data> => {
    const saved = await readJson("meta-saved.json");
    return {
      ...base,
      ads: saved.rows,
      adsThrough: saved.through,
      adsLive: false,
      adsSavedAt: saved.savedAt,
      generatedAt: saved.savedAt,
      ...(error ? { error } : {}),
    };
  };
  if (!process.env.META_ACCESS_TOKEN) return fromSaved();
  try {
    const live = await cachedLiveAds();
    return { ...base, ads: live.rows, adsThrough: todayET(), adsLive: true, generatedAt: live.at };
  } catch (e) {
    console.error(e);
    return fromSaved((e as Error).message);
  }
}
