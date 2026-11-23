import { readFile } from "node:fs/promises";
import path from "node:path";
import { unstable_cache } from "next/cache";
import type { ClientConfig } from "@/config/clients";
import { fetchLive } from "./live";
import type { Snapshot } from "./types";

export const REFRESH_HOURS = 3;
export const liveTag = (clientId: string) => `live-${clientId}`;

async function saved(clientId: string): Promise<Snapshot | null> {
  try {
    return JSON.parse(await readFile(path.join(process.cwd(), "data", "snapshot", `${clientId}.json`), "utf8"));
  } catch {
    return null;
  }
}

export function hasLiveTokens(c: ClientConfig) {
  return !!(process.env[c.metaTokenEnv] && process.env[c.ghlTokenEnv]);
}

/**
 * Live data when both tokens are set (cached for REFRESH_HOURS, cleared by the
 * Refresh button); otherwise, or if the live pull fails, the saved copy.
 */
export async function getSnapshot(c: ClientConfig): Promise<{ snap: Snapshot | null; error?: string }> {
  if (hasLiveTokens(c)) {
    try {
      const cached = unstable_cache(
        () => fetchLive(c, process.env[c.metaTokenEnv]!, process.env[c.ghlTokenEnv]!),
        ["live-snapshot", c.id],
        { revalidate: REFRESH_HOURS * 3600, tags: [liveTag(c.id)] },
      );
      return { snap: await cached() };
    } catch (e) {
      console.error(e);
      return { snap: await saved(c.id), error: (e as Error).message };
    }
  }
  return { snap: await saved(c.id) };
}
