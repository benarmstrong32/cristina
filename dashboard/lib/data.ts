import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Snapshot } from "./types";

/** Reads the latest snapshot built by scripts/build-snapshot.mjs. */
export async function getSnapshot(clientId: string): Promise<Snapshot | null> {
  try {
    const raw = await readFile(path.join(process.cwd(), "data", "snapshot", `${clientId}.json`), "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
