"use server";
import { revalidatePath } from "next/cache";
import { getDb } from "../lib/db";
import { runSync } from "../lib/meta";

let syncInFlight: Promise<unknown> | null = null;

/** Kicks off a sync in the background; progress shows on the settings page. */
export async function startSync() {
  if (syncInFlight) return;
  syncInFlight = runSync().catch((e) => console.error("[sync]", e)).finally(() => {
    syncInFlight = null;
  });
  // Give it a moment so the "running" row exists before the page re-renders.
  await new Promise((r) => setTimeout(r, 300));
  revalidatePath("/settings");
}

export async function updateAccount(form: FormData) {
  const id = String(form.get("id"));
  const owner = form.get("owner_type") === "internal" ? "internal" : "client";
  const client = String(form.get("client_name") ?? "").trim() || null;
  const targetRaw = String(form.get("target_roas") ?? "").trim();
  const target = targetRaw ? Number(targetRaw) : null;
  const hidden = form.get("is_hidden") ? 1 : 0;
  getDb().prepare(`UPDATE accounts SET owner_type=?, client_name=?, target_roas=?, is_hidden=? WHERE id=?`)
    .run(owner, client, target != null && Number.isFinite(target) ? target : null, hidden, id);
  revalidatePath("/", "layout");
}

/**
 * CSV with header row containing `date` and `revenue` (optional `orders`).
 * Dates must be YYYY-MM-DD. Existing days are overwritten.
 */
export async function uploadRevenue(form: FormData): Promise<void> {
  const accountId = String(form.get("account_id"));
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) return;
  const text = await file.text();
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  const header = lines.shift()?.toLowerCase().split(",").map((h) => h.trim().replace(/"/g, "")) ?? [];
  const di = header.indexOf("date"), ri = header.indexOf("revenue"), oi = header.indexOf("orders");
  if (di < 0 || ri < 0) throw new Error("CSV needs 'date' and 'revenue' columns");
  const db = getDb();
  const stmt = db.prepare(`INSERT INTO actual_revenue (account_id, date, revenue, orders, source) VALUES (?, ?, ?, ?, 'csv')
    ON CONFLICT(account_id, date) DO UPDATE SET revenue=excluded.revenue, orders=excluded.orders, source='csv'`);
  db.transaction(() => {
    for (const line of lines) {
      const cols = line.split(",").map((c) => c.trim().replace(/"/g, ""));
      const date = cols[di];
      const revenue = Number(cols[ri].replace(/[$,]/g, ""));
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(revenue)) continue;
      stmt.run(accountId, date, revenue, oi >= 0 && cols[oi] ? Number(cols[oi]) : null);
    }
  })();
  revalidatePath(`/accounts/${accountId}`);
}

export async function clearRevenue(form: FormData) {
  const accountId = String(form.get("account_id"));
  getDb().prepare(`DELETE FROM actual_revenue WHERE account_id = ?`).run(accountId);
  revalidatePath(`/accounts/${accountId}`);
}
