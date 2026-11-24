// Editable records (deals, intros, triage calls) kept in a private Vercel Blob store.
// Each collection is one JSON file. Every save also keeps a dated backup copy.
import { get, put } from "@vercel/blob";
import { readFile } from "node:fs/promises";
import path from "node:path";

export type Collection = "deals" | "intros" | "triage";
export type Stored<T> = { version: number; updatedAt: string; updatedBy: string; rows: T[] };

const file = (c: Collection) => `store/${c}.json`;
export const storeEnabled = () => !!process.env.BLOB_READ_WRITE_TOKEN;

async function seed<T>(c: Collection): Promise<Stored<T>> {
  try {
    const s = JSON.parse(await readFile(path.join(process.cwd(), "data", "seed.json"), "utf8"));
    return { version: 0, updatedAt: "", updatedBy: "sales ops sheet (Nov 19)", rows: (s[c] ?? []) as T[] };
  } catch {
    return { version: 0, updatedAt: "", updatedBy: "", rows: [] };
  }
}

export async function readCollection<T>(c: Collection): Promise<Stored<T>> {
  if (!storeEnabled()) return seed<T>(c);
  const res = await get(file(c), { access: "private", useCache: false }).catch(() => null);
  if (!res) return seed<T>(c);
  const text = await new Response(res.stream).text();
  return JSON.parse(text) as Stored<T>;
}

export class StaleError extends Error {}

/** Applies `change` to the latest rows and saves. Refuses if someone saved since `expectedVersion`. */
export async function writeCollection<T>(c: Collection, by: string, expectedVersion: number, change: (rows: T[]) => T[]) {
  if (!storeEnabled()) throw new Error("Storage isn't connected to this deployment.");
  const cur = await readCollection<T>(c);
  if (cur.version !== expectedVersion) throw new StaleError("Someone else saved a change a moment ago. Reload the page and try again.");
  const next: Stored<T> = { version: cur.version + 1, updatedAt: new Date().toISOString(), updatedBy: by, rows: change(cur.rows) };
  const body = JSON.stringify(next);
  if (cur.version > 0) {
    await put(`history/${c}/${cur.updatedAt.replace(/[:.]/g, "-")}-v${cur.version}.json`, JSON.stringify(cur), { access: "private", addRandomSuffix: false, allowOverwrite: true, contentType: "application/json" });
  }
  await put(file(c), body, { access: "private", addRandomSuffix: false, allowOverwrite: true, contentType: "application/json", cacheControlMaxAge: 60 });
  return next;
}

export const newId = () => Math.random().toString(36).slice(2, 12);
