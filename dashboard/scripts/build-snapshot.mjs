// Builds data/snapshot/<client>.json from raw Meta + GoHighLevel answers in data/raw/.
//
// Each data/raw/<dataset>.json is either the connector's answer exactly as returned
// (Meta: {ad_entities: ...}; GHL: {success, data: {...}}) or an array of rows already
// in the shape the loader produces. Datasets: meta_daily, meta_ads, ghl_contacts,
// ghl_surveys, ghl_funnel_b, ghl_events, ghl_opps, ghl_stages.
//
// The loaders and calculations live in lib/logic/funnel-logic.js, the same code the
// Claude dashboard runs, so both show the same numbers.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const clientId = process.argv[2] || "new-velocity";
const rawDir = path.join(root, "data", "raw");

const loaders = {};
const calcs = {};
const dash = { loader: (id, o) => (loaders[id] = o), calc: (id, o) => (calcs[id] = o) };
const logic = await readFile(path.join(root, "lib", "logic", "funnel-logic.js"), "utf8");
new Function("dash", logic)(dash);

const DATASETS = ["meta_daily", "meta_ads", "ghl_contacts", "ghl_surveys", "ghl_funnel_b", "ghl_events", "ghl_opps", "ghl_stages"];
const values = {};
for (const id of DATASETS) {
  const raw = JSON.parse(await readFile(path.join(rawDir, `${id}.json`), "utf8"));
  if (Array.isArray(raw)) { values[id] = raw; continue; }
  const call = () => { throw new Error(`${id}: answer has more pages; save every page's rows as an array instead`); };
  const res = await loaders[id].fn({ answer: raw, items: [raw], call, args: { params: { body: {}, query: {} } } });
  values[id] = Array.isArray(res) ? res : res.rows;
  if (res && res.cut) console.warn(`warning: ${id} is incomplete`);
}

// Run calculations once their inputs are ready.
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

const dataThrough = values.meta_daily.reduce((m, d) => (d.date > m ? d.date : m), "");
const snapshot = {
  clientId,
  generatedAt: new Date().toISOString(),
  dataThrough,
  kpis: values.kpis,
  highlights: values.highlights,
  daily: values.daily,
  people: values.people,
  calls: values.calls,
  adTable: values.ad_table,
  health: values.health,
};
await mkdir(path.join(root, "data", "snapshot"), { recursive: true });
const out = path.join(root, "data", "snapshot", `${clientId}.json`);
await writeFile(out, JSON.stringify(snapshot, null, 1));
const k30 = snapshot.kpis.find((k) => k.range === "30d");
console.log(`Wrote ${path.relative(root, out)} (data through ${dataThrough})`);
console.log(`30d: spend $${k30.spend.toFixed(2)}, applications ${k30.submitted}, qualified ${k30.qualified}, booked ${k30.booked}, Meta leads ${k30.meta_leads}`);
