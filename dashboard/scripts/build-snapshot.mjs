// Builds data/snapshot/<client>.json from saved connector answers in data/raw/.
// Used when the portal has no API tokens (it then shows this saved copy).
//
// Each data/raw/<dataset>.json is either the connector's answer as returned
// (Meta: {ad_entities}; GHL: {success, data}) or an array of rows in loader shape.
//
//   node scripts/build-snapshot.mjs [clientId] [--crm-through=YYYY-MM-DD]
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(root);
const { DATASETS, loadPage, computeSnapshot } = await import("../lib/logic/compute.mjs");

const args = process.argv.slice(2);
const clientId = args.find((a) => !a.startsWith("--")) || "new-velocity";
const crmThrough = args.find((a) => a.startsWith("--crm-through="))?.split("=")[1];

const rows = {};
for (const id of DATASETS) {
  const raw = JSON.parse(await readFile(path.join(root, "data", "raw", `${id}.json`), "utf8"));
  rows[id] = await loadPage(id, raw);
}
const snapshot = await computeSnapshot(clientId, rows, { source: "saved", ...(crmThrough ? { crmThrough } : {}) });
await mkdir(path.join(root, "data", "snapshot"), { recursive: true });
const out = path.join(root, "data", "snapshot", `${clientId}.json`);
await writeFile(out, JSON.stringify(snapshot, null, 1));
const k30 = snapshot.kpis.find((k) => k.range === "30d");
console.log(`Wrote ${path.relative(root, out)} (ads through ${snapshot.dataThrough}${crmThrough ? `, GoHighLevel through ${crmThrough}` : ""})`);
console.log(`30d: spend $${k30.spend.toFixed(2)}, applications ${k30.submitted}, qualified ${k30.qualified}, booked ${k30.booked}, Meta leads ${k30.meta_leads}`);
