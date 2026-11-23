// Runs the shared loaders + calculations (funnel-logic.js, the same code as the
// Claude dashboard) and returns the snapshot the portal renders.
import { readFile } from "node:fs/promises";
import path from "node:path";

export const DATASETS = ["meta_daily", "meta_ads", "ghl_contacts", "ghl_surveys", "ghl_funnel_b", "ghl_events", "ghl_opps", "ghl_stages"];

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
  return {
    clientId,
    generatedAt: new Date().toISOString(),
    dataThrough: values.meta_daily.reduce((m, d) => (d.date > m ? d.date : m), ""),
    ...extra,
    kpis: values.kpis,
    highlights: values.highlights,
    daily: values.daily,
    people: values.people,
    calls: values.calls,
    adTable: values.ad_table,
    health: values.health,
  };
}
