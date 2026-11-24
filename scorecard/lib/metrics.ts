import {
  BONUS_GOAL, BONUS_PER_DEAL, CHANNEL_ORDER, DEFAULT_INTRO_GOAL, INTRO_GOALS, MONTHLY_AD_BUDGET, SALES_GOALS, DEFAULT_SALES_GOAL, SHEET_START, START,
  channelForCampaign, isMeta,
} from "@/config/scorecard";
import type { AdRow, Data, Intro, Triage, Win } from "./types";

export const RANGES = [
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "max", label: "Maximum" },
] as const;
export type RangeKey = (typeof RANGES)[number]["key"] | "custom";
export type Period = { range: RangeKey; from?: string; to?: string };

const ISO = /^\d{4}-\d{2}-\d{2}$/;
export function parsePeriod(sp: { range?: string; from?: string; to?: string }): Period {
  if (sp.range === "custom" && sp.from && sp.to && ISO.test(sp.from) && ISO.test(sp.to)) {
    return sp.from <= sp.to ? { range: "custom", from: sp.from, to: sp.to } : { range: "custom", from: sp.to, to: sp.from };
  }
  return { range: RANGES.some((x) => x.key === sp.range) ? (sp.range as RangeKey) : "30d" };
}
export const periodQuery = (p: Period): Record<string, string> =>
  p.range === "custom" ? { range: "custom", from: p.from!, to: p.to! } : { range: p.range };

const sum = <T,>(xs: T[], f: (x: T) => number) => xs.reduce((s, x) => s + (f(x) || 0), 0);
const div = (a: number, b: number) => (b ? a / b : null);
export const addDays = (day: string, n: number) => {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
const isApp = (r: AdRow) => r.result_type.includes("submit_application");
export const yes = (v: string) => String(v).trim().toLowerCase() === "yes";
const no = (v: string) => String(v).trim().toLowerCase() === "no";

/**
 * The date window. Meta numbers and triage calls (which have dates) use it exactly. Intros and deals are logged by
 * month, so they use every month that starts inside the window, plus the month the window ends in.
 */
export function windowFor(d: Data, p: Period) {
  const latest = d.adsThrough;
  let since: string, until: string;
  if (p.range === "custom") { since = p.from!; until = p.to!; }
  else if (p.range === "max") { since = START; until = latest; }
  else { until = latest; since = addDays(until, p.range === "7d" ? -6 : -29); }
  const months = new Set<string>([until.slice(0, 7)]);
  for (let m = since.slice(0, 7); m <= until.slice(0, 7); m = addDays(`${m}-28`, 7).slice(0, 7)) {
    if (`${m}-01` >= since) months.add(m);
  }
  return { since, until, months: [...months].sort() };
}

function adStats(rows: AdRow[]) {
  const spend = sum(rows, (r) => r.spend);
  const impressions = sum(rows, (r) => r.impressions);
  const clicks = sum(rows, (r) => r.clicks);
  const applications = sum(rows.filter(isApp), (r) => r.results);
  return { spend, impressions, clicks, applications, ctr: div(clicks, impressions), cpc: div(spend, clicks), cpa: div(spend, applications), cpm: impressions ? (spend / impressions) * 1000 : null };
}

export function introStats(xs: Intro[]) {
  const completed = xs.filter((r) => yes(r.completed)).length;
  const missed = xs.filter((r) => no(r.completed)).length;
  return { booked: xs.length, completed, missed, other: xs.length - completed - missed, showRate: div(completed, completed + missed) };
}

export function triageStats(xs: Triage[]) {
  const completed = xs.filter((r) => yes(r.completed)).length;
  const missed = xs.filter((r) => no(r.completed)).length;
  const bookedIntro = xs.filter((r) => yes(r.booked_intro)).length;
  return { calls: xs.length, completed, missed, showRate: div(completed, completed + missed), bookedIntro, introRate: div(bookedIntro, completed) };
}

const revenue = (ws: Win[]) => sum(ws, (w) => w.contract_value ?? 0);
const monthlyValue = (ws: Win[]) => sum(ws, (w) => w.monthly_value ?? 0);

export function overview(d: Data, p: Period) {
  const w = windowFor(d, p);
  const inMonths = (m: string) => w.months.includes(m);
  const ads = adStats(d.ads.filter((r) => r.day >= w.since && r.day <= w.until));
  const salesSpend = sum(d.ads.filter((r) => inMonths(r.day.slice(0, 7))), (r) => r.spend);
  const metaIntroRows = d.intros.filter((r) => inMonths(r.month) && isMeta(r.ad_channel));
  const metaIntros = introStats(metaIntroRows);
  const allIntros = introStats(d.intros.filter((r) => inMonths(r.month)));
  const triage = triageStats(d.triage.filter((t) => t.date >= w.since && t.date <= w.until));
  const metaWins = d.wins.filter((x) => inMonths(x.close_month) && isMeta(x.channel));
  const allWins = d.wins.filter((x) => inMonths(x.close_month));
  const metaRevenue = revenue(metaWins);
  return {
    ...w,
    ads,
    salesSpend,
    metaIntros,
    allIntros,
    triage,
    metaWins: metaWins.length,
    metaRevenue,
    allWins: allWins.length,
    allRevenue: revenue(allWins),
    roas: div(metaRevenue, salesSpend),
    cac: metaWins.length ? salesSpend / metaWins.length : null,
    costPerCompleted: div(salesSpend, metaIntros.completed),
    closeRate: div(metaWins.length, metaIntros.completed),
  };
}

/** Meta funnel: clicks → applications → intros booked → completed → deals won. Triage calls sit beside it (logged since Nov). */
export function funnel(o: ReturnType<typeof overview>) {
  return [
    { label: "Clicks", value: o.ads.clicks, note: "Meta, exact dates" },
    { label: "Applications", value: o.ads.applications, note: "as Meta reports them" },
    { label: "Intros booked", value: o.metaIntros.booked, note: "from Meta" },
    { label: "Intros completed", value: o.metaIntros.completed, note: "from Meta" },
    { label: "Deals won", value: o.metaWins, note: "from Meta" },
  ];
}

export function daily(d: Data, since: string, until: string) {
  const out: { date: string; spend: number; apps: number }[] = [];
  for (let day = since; day <= until; day = addDays(day, 1)) {
    const rows = d.ads.filter((r) => r.day === day);
    out.push({ date: day, spend: sum(rows, (r) => r.spend), apps: sum(rows.filter(isApp), (r) => r.results) });
  }
  return out;
}

/** This month's goals: completed intros and new monthly value won. */
export function goals(d: Data) {
  const m = d.adsThrough.slice(0, 7);
  const st = introStats(d.intros.filter((r) => r.month === m));
  const won = d.wins.filter((w) => w.close_month === m);
  const day = Number(d.adsThrough.slice(8, 10));
  const [y, mo] = m.split("-").map(Number);
  const daysInMonth = new Date(Date.UTC(y, mo, 0)).getUTCDate();
  const monthSpend = sum(d.ads.filter((r) => r.day.startsWith(m)), (r) => r.spend);
  const perDay = day ? monthSpend / day : 0;
  return {
    month: m,
    monthSpend,
    perDay,
    projected: perDay * daysInMonth,
    daysInMonth,
    day,
    budget: MONTHLY_AD_BUDGET,
    introGoal: INTRO_GOALS[m] ?? DEFAULT_INTRO_GOAL,
    completed: st.completed,
    salesGoal: SALES_GOALS[m] ?? DEFAULT_SALES_GOAL,
    wonMonthly: monthlyValue(won),
    wonTotal: revenue(won),
    deals: won.length,
  };
}

/** Best results since the ads started, in the spirit of the New Velocity highlights. */
export function highlights(d: Data) {
  const ads = d.adTotals.filter((a) => a.spend > 0);
  const topAd = [...ads].sort((a, b) => b.applications - a.applications || a.spend - b.spend)[0];
  const cheapest = ads.filter((a) => a.applications >= 2).map((a) => ({ ...a, cpa: a.spend / a.applications })).sort((a, b) => a.cpa - b.cpa)[0];
  const ctr = ads.filter((a) => a.impressions >= 1000).map((a) => ({ ...a, ctr: a.clicks / a.impressions })).sort((a, b) => b.ctr - a.ctr)[0];
  const totalApps = sum(ads, (a) => a.applications);
  const totalSpend = sum(ads, (a) => a.spend);
  // Best week (Monday start) for applications.
  const weeks = new Map<string, number>();
  for (const r of d.ads.filter(isApp)) {
    const dt = new Date(`${r.day}T00:00:00Z`);
    dt.setUTCDate(dt.getUTCDate() - ((dt.getUTCDay() + 6) % 7));
    const k = dt.toISOString().slice(0, 10);
    weeks.set(k, (weeks.get(k) ?? 0) + r.results);
  }
  const bestWeek = [...weeks.entries()].sort((a, b) => b[1] - a[1])[0];
  const meta = introStats(d.intros.filter((r) => isMeta(r.ad_channel)));
  const metaWins = d.wins.filter((w) => isMeta(w.channel)).length;
  const tri = triageStats(d.triage);
  return {
    topAd: topAd ? { name: topAd.name, applications: topAd.applications, share: div(topAd.applications, totalApps) } : null,
    cheapest: cheapest ? { name: cheapest.name, cpa: cheapest.cpa, overall: div(totalSpend, totalApps) } : null,
    ctr: ctr ? { name: ctr.name, ctr: ctr.ctr, cpc: div(ctr.spend, ctr.clicks) } : null,
    bestWeek: bestWeek ? { week: bestWeek[0], applications: bestWeek[1] } : null,
    closeRate: { rate: div(metaWins, meta.completed), won: metaWins, completed: meta.completed },
    triage: tri,
  };
}

/** One row per channel plus All Meta and All sources, for the months in the window. */
export function byChannel(d: Data, p: Period) {
  const w = windowFor(d, p);
  const inMonths = (m: string) => w.months.includes(m);
  const ads = d.ads.filter((r) => inMonths(r.day.slice(0, 7))).map((r) => ({ ...r, channel: channelForCampaign(r.campaign) }));
  const intros = d.intros.filter((r) => inMonths(r.month));
  const wins = d.wins.filter((r) => inMonths(r.close_month));
  const make = (channel: string, a: AdRow[], i: Intro[], ws: Win[]) => {
    const s = adStats(a);
    const st = introStats(i);
    const rev = revenue(ws);
    return {
      channel, spend: s.spend, applications: s.applications, booked: st.booked, completed: st.completed, showRate: st.showRate,
      costPerCompleted: s.spend && st.completed ? s.spend / st.completed : null,
      won: ws.length, revenue: rev, roas: s.spend ? rev / s.spend : null,
    };
  };
  const rows = CHANNEL_ORDER.map((c) => make(c, ads.filter((r) => r.channel === c), intros.filter((r) => r.ad_channel === c), wins.filter((r) => r.channel === c)))
    .filter((r) => r.spend > 0 || r.booked > 0 || r.won > 0);
  return {
    months: w.months,
    rows,
    allMeta: make("All Meta", ads, intros.filter((r) => isMeta(r.ad_channel)), wins.filter((r) => isMeta(r.channel))),
    all: make("All sources", ads, intros, wins),
  };
}

export function months(d: Data) {
  const ms = [...new Set([...d.ads.map((r) => r.day.slice(0, 7)), ...d.wins.map((w) => w.close_month)])].sort();
  return ms.map((m) => {
    const won = d.wins.filter((w) => w.close_month === m);
    const spend = sum(d.ads.filter((r) => r.day.startsWith(m)), (r) => r.spend);
    const metaRevenue = revenue(won.filter((w) => isMeta(w.channel)));
    return { month: m, spend, metaRevenue, allRevenue: revenue(won), roas: div(metaRevenue, spend) };
  });
}

/** Intros booked vs completed each month, with Cristina's bonus. */
export function bonus(d: Data) {
  const ms = [...new Set([...d.intros.map((r) => r.month), ...d.wins.map((w) => w.close_month)])].filter((m) => m >= SHEET_START && m <= d.adsThrough.slice(0, 7)).sort();
  return ms.map((m) => {
    const st = introStats(d.intros.filter((r) => r.month === m));
    const goal = INTRO_GOALS[m] ?? DEFAULT_INTRO_GOAL;
    const deals = d.wins.filter((w) => w.close_month === m && w.counts_for_bonus);
    const met = st.completed >= goal;
    const introBonus = met ? BONUS_GOAL : 0;
    return { month: m, ...st, goal, met, deals: deals.length, dealNames: deals.map((x) => x.company), introBonus, dealBonus: deals.length * BONUS_PER_DEAL, total: introBonus + deals.length * BONUS_PER_DEAL };
  });
}

export function triageByMonth(d: Data) {
  const ms = [...new Set(d.triage.map((t) => t.month))].sort();
  return ms.map((m) => ({ month: m, ...triageStats(d.triage.filter((t) => t.month === m)) }));
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
