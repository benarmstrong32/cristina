// Runs the shared loaders + calculations (funnel-logic.js, the same code as the
// Claude dashboard) and returns the snapshot the portal renders.
import { readFile } from "node:fs/promises";
import path from "node:path";

export const DATASETS = ["meta_daily", "meta_ads", "ghl_contacts", "ghl_surveys", "ghl_funnel_b", "ghl_events", "ghl_opps", "ghl_stages", "ghl_orders", "meta_adsets"];

let registry = null;
async function logic() {
  if (registry) return registry;
  const loaders = {}, calcs = {};
  const src = await readFile(path.join(process.cwd(), "lib", "logic", "funnel-logic.js"), "utf8");
  new Function("dash", src)({ loader: (id, o) => (loaders[id] = o), calc: (id, o) => (calcs[id] = o) });
  registry = { loaders, calcs };
  return registry;
}

/**
 * Turn one connector answer (one page) into rows. Paging is done by the caller,
 * so a loader asking for "the next page" gets an empty one.
 */
export async function loadPage(id, answer) {
  if (Array.isArray(answer)) return answer;
  const { loaders } = await logic();
  const empty = { success: true, data: { contacts: [], submissions: [], opportunities: [], events: [], meta: {} } };
  const res = await loaders[id].fn({ answer, items: [answer], call: async () => empty, args: { params: { body: {}, query: {} } } });
  return Array.isArray(res) ? res : res.rows;
}

/** rows: {datasetId: row[]} for every id in DATASETS. */
export async function computeSnapshot(clientId, rows, extra = {}) {
  const { calcs } = await logic();
  const values = { ...rows };
  const pending = new Set(Object.keys(calcs));
  while (pending.size) {
    let progressed = false;
    for (const id of [...pending]) {
      const c = calcs[id];
      if (!c.inputs.every((i) => i in values)) continue;
      values[id] = c.fn(...c.inputs.map((i) => values[i]));
      pending.delete(id);
      progressed = true;
    }
    if (!progressed) throw new Error("Unresolvable calculation inputs: " + [...pending].join(", "));
  }
  // Name each person's ad from the Meta ad list.
  const adName = new Map((values.meta_ads || []).map((a) => [a.ad_id, { name: a.ad_name, adset: a.adset_name, status: a.status }]));
  const people = values.people.map((p) => ({ ...p, ad_name: adName.get(p.ad_id)?.name || (p.ad_id ? `Ad ${p.ad_id}` : ''), adset_name: adName.get(p.ad_id)?.adset || '' }));
  // Ad sets with what they produced in GoHighLevel (via each person's ad).
  const adToSet = new Map((values.meta_ads || []).map((a) => [a.ad_id, a.adset_name]));
  const adsets = (values.meta_adsets || []).map((s) => {
    const mine = people.filter((p) => p.ad_id && adToSet.get(p.ad_id) === s.name);
    return { ...s, applicants: mine.filter((p) => p.funnel_a.startsWith('Completed')).length, qualified: mine.filter((p) => p.funnel_a === 'Completed · qualified').length, booked: mine.filter((p) => p.call !== '—' && p.call !== 'Cancelled').length, leads: mine.length };
  });
  return {
    clientId,
    generatedAt: new Date().toISOString(),
    dataThrough: values.meta_daily.reduce((m, d) => (d.date > m ? d.date : m), ""),
    ...extra,
    kpis: values.kpis,
    highlights: values.highlights,
    daily: values.daily,
    people,
    calls: values.calls,
    adTable: values.ad_table,
    adsets,
    health: values.health,
  };
}
