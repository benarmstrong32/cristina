import { readFile } from "node:fs/promises";
import path from "node:path";
import type { ClientConfig } from "@/config/clients";
import { fetchMeta } from "./meta";
import { fetchGhlRaw, normalizeGhl, type GhlRaw } from "./ghl";
import type { Snapshot } from "./types";

const DATA_START = "2026-10-01"; // earliest date the dashboard looks at

function today() { return new Date().toISOString().slice(0, 10); }

export async function getSnapshot(client: ClientConfig): Promise<Snapshot> {
  const until = today();
  let meta: Snapshot["meta"];
  const metaToken = process.env.META_ACCESS_TOKEN;
  if (metaToken) {
    try {
      const m = await fetchMeta(client.metaAdAccountId, DATA_START, until, metaToken);
      meta = { connected: true, live: true, asOf: until, ...m, adsPeriod: { since: DATA_START, until } };
    } catch (e) {
      meta = { ...(await bundledMeta(client.id)), connected: true, live: false };
      console.error(e);
    }
  } else {
    meta = await bundledMeta(client.id);
  }

  let ghl: Snapshot["ghl"] = { connected: false, leads: [], calls: [] };
  const ghlToken = process.env[client.ghlTokenEnv];
  if (ghlToken) {
    try {
      const raw = await fetchGhlRaw(client, `${DATA_START}T00:00:00Z`, `${until}T23:59:59Z`, ghlToken);
      ghl = { connected: true, live: true, ...normalizeGhl(client, raw) };
    } catch (e) {
      ghl = { connected: false, error: (e as Error).message, leads: [], calls: [] };
    }
  } else {
    // Local preview: a saved GHL export (gitignored; contains contact details).
    const saved = await readJson<GhlRaw>(`${client.id}.ghl.local.json`);
    if (saved) ghl = { connected: true, live: false, ...normalizeGhl(client, saved) };
  }
  return { clientId: client.id, generatedAt: new Date().toISOString(), meta, ghl };
}

async function readJson<T>(file: string): Promise<T | null> {
  try {
    return JSON.parse(await readFile(path.join(process.cwd(), "data", file), "utf8"));
  } catch {
    return null;
  }
}

async function bundledMeta(clientId: string): Promise<Snapshot["meta"]> {
  const m = await readJson<Omit<Snapshot["meta"], "connected" | "live">>(`${clientId}.meta.local.json`);
  if (m) return { connected: true, live: false, ...m };
  return { connected: false, live: false, asOf: "", days: [], ads: [], adsPeriod: { since: "", until: "" } };
}
