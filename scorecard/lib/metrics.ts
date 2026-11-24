import {
  BONUS_GOAL, BONUS_PER_DEAL, CHANNEL_ORDER, DEFAULT_INTRO_GOAL, INTRO_GOALS, START, channelForCampaign, isMeta,
} from "@/config/scorecard";
import type { AdRow, Data, Intro, Win } from "./types";

export const RANGES = [
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "all", label: "All time" },
] as const;
export type RangeKey = (typeof RANGES)[number]["key"];
export const parseRange = (r?: string): RangeKey => (RANGES.some((x) => x.key === r) ? (r as RangeKey) : "30d");

const sum = <T,>(xs: T[], f: (x: T) => number) => xs.reduce((s, x) => s + (f(x) || 0), 0);
const div = (a: number, b: number) => (b ? a / b : null);
const addDays = (day: string, n: number) => {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
const isApp = (r: AdRow) => r.result_type.includes("submit_application");
const yes = (v: string) => String(v).trim().toLowerCase() === "yes";

/** Window for the range. Intros and wins are logged by month, so 7/30-day views use the current month. */
export function windowFor(d: Data, range: RangeKey) {
  const until = d.adsThrough;
  const since = range === "7d" ? addDays(until, -6) : range === "30d" ? addDays(until, -29) : START;
  const months = range === "all" ? null : [until.slice(0, 7)];
  return { since, until, months };
}

function adStats(rows: AdRow[]) {
  const spend = sum(rows, (r) => r.spend);
  const impressions = sum(rows, (r) => r.impressions);
  const clicks = sum(rows, (r) => r.clicks);
  const applications = sum(rows.filter(isApp), (r) => r.results);
  return { spend, impressions, clicks, applications, ctr: div(clicks, impressions), cpc: div(spend, clicks), cpa: div(spend, applications) };
}

function introStats(xs: Intro[]) {
  const completed = xs.filter((r) => yes(r.completed)).length;
  const missed = xs.filter((r) => String(r.completed).trim().toLowerCase() === "no").length;
  return { booked: xs.length, completed, missed, other: xs.length - completed - missed, showRate: div(completed, completed + missed) };
}

const revenue = (ws: Win[]) => sum(ws, (w) => w.contract_value ?? 0);

export function overview(d: Data, range: RangeKey) {
  const w = windowFor(d, range);
  const inMonths = (m: string) => w.months === null || w.months.includes(m);
  const ads = adStats(d.ads.filter((r) => r.day >= w.since && r.day <= w.until));
  const salesSpend = sum(d.ads.filter((r) => inMonths(r.day.slice(0, 7))), (r) => r.spend);
  const metaIntros = introStats(d.intros.filter((r) => inMonths(r.month) && isMeta(r.ad_channel)));
  const allIntros = introStats(d.intros.filter((r) => inMonths(r.month)));
  const metaWins = d.wins.filter((x) => inMonths(x.close_month) && isMeta(x.channel));
  const allWins = d.wins.filter((x) => inMonths(x.close_month));
  const metaRevenue = revenue(metaWins);
  return {
    ...w,
    ads,
    salesSpend,
    metaIntros,
    allIntros,
    metaWins: metaWins.length,
    metaRevenue,
    allWins: allWins.length,
    allRevenue: revenue(allWins),
    roas: div(metaRevenue, salesSpend),
    cac: metaWins.length ? salesSpend / metaWins.length : null,
    costPerCompleted: div(salesSpend, metaIntros.completed),
  };
}

export function daily(d: Data, since: string, until: string) {
  const out: { date: string; spend: number; apps: number }[] = [];
  for (let day = since; day <= until; day = addDays(day, 1)) {
    const rows = d.ads.filter((r) => r.day === day);
    out.push({ date: day, spend: sum(rows, (r) => r.spend), apps: sum(rows.filter(isApp), (r) => r.results) });
  }
  return out;
}

/** Since Sept 1, one row per channel plus All Meta and All sources. */
export function byChannel(d: Data) {
  const ads = d.ads.map((r) => ({ ...r, channel: channelForCampaign(r.campaign) }));
  const make = (channel: string, a: AdRow[], i: Intro[], w: Win[]) => {
    const s = adStats(a);
    const st = introStats(i);
    const rev = revenue(w);
    return {
      channel, spend: s.spend, applications: s.applications, booked: st.booked, completed: st.completed, showRate: st.showRate,
      costPerCompleted: s.spend && st.completed ? s.spend / st.completed : null,
      won: w.length, revenue: rev, roas: s.spend ? rev / s.spend : null,
    };
  };
  const rows = CHANNEL_ORDER.map((c) => make(c, ads.filter((r) => r.channel === c), d.intros.filter((r) => r.ad_channel === c), d.wins.filter((r) => r.channel === c)))
    .filter((r) => r.spend > 0 || r.booked > 0 || r.won > 0);
  return {
    rows,
    allMeta: make("All Meta", ads, d.intros.filter((r) => isMeta(r.ad_channel)), d.wins.filter((r) => isMeta(r.channel))),
    all: make("All sources", ads, d.intros, d.wins),
  };
}

export function months(d: Data) {
  const ms = [...new Set([...d.ads.map((r) => r.day.slice(0, 7)), ...d.intros.map((r) => r.month), ...d.wins.map((w) => w.close_month)])].sort();
  return ms.map((m) => {
    const won = d.wins.filter((w) => w.close_month === m);
    const spend = sum(d.ads.filter((r) => r.day.startsWith(m)), (r) => r.spend);
    const metaRevenue = revenue(won.filter((w) => isMeta(w.channel)));
    return { month: m, spend, metaRevenue, allRevenue: revenue(won), roas: div(metaRevenue, spend) };
  });
}

/** Intros booked vs completed each month, with Cristina's bonus. */
export function bonus(d: Data) {
  const ms = [...new Set([...d.intros.map((r) => r.month), ...d.wins.map((w) => w.close_month)])].sort();
  return ms.map((m) => {
    const st = introStats(d.intros.filter((r) => r.month === m));
    const goal = INTRO_GOALS[m] ?? DEFAULT_INTRO_GOAL;
    const deals = d.wins.filter((w) => w.close_month === m && w.counts_for_bonus);
    const met = st.completed >= goal;
    const introBonus = met ? BONUS_GOAL : 0;
    return { month: m, ...st, goal, met, deals: deals.length, dealNames: deals.map((x) => x.company), introBonus, dealBonus: deals.length * BONUS_PER_DEAL, total: introBonus + deals.length * BONUS_PER_DEAL };
  });
}

export function campaigns(d: Data, since: string, until: string) {
  const by = new Map<string, AdRow[]>();
  for (const r of d.ads) if (r.day >= since && r.day <= until) by.set(r.id, [...(by.get(r.id) ?? []), r]);
  return [...by.values()]
    .map((rs) => ({ id: rs[0].id, name: rs[rs.length - 1].campaign, channel: channelForCampaign(rs[0].campaign), ...adStats(rs) }))
    .filter((c) => c.spend > 0)
    .sort((a, b) => b.spend - a.spend);
}

export const monthLabel = (m: string) =>
  new Date(`${m}-01T12:00:00Z`).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
