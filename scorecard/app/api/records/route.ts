import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, readSession } from "@/lib/session";
import { StaleError, newId, writeCollection, type Collection } from "@/lib/store";
import { FIELDS, channelForSource, dealGroup } from "@/config/fields";

type Row = Record<string, unknown> & { id: string };

function clean(c: Collection, form: FormData, prev: Row | undefined): Row {
  const row: Row = { ...(prev ?? {}), id: prev?.id ?? newId() };
  for (const f of FIELDS[c as keyof typeof FIELDS]) {
    const raw = String(form.get(f.key) ?? "").trim();
    if (f.type === "number") {
      const n = raw === "" ? null : Number(raw.replace(/[$,%\s]/g, ""));
      row[f.key] = n === null || Number.isNaN(n) ? null : n;
    } else {
      row[f.key] = raw;
    }
  }
  if (c === "deals" && typeof row.confidence === "number" && row.confidence > 1) row.confidence = row.confidence / 100;
  if (c === "intros") {
    const ch = String(row.ad_channel ?? "");
    row.ad_channel = !ch || ch.startsWith("Auto") ? channelForSource(String(row.lead_source ?? "")) : ch;
    const mv = row.monthly_value as number | null, m = row.months as number | null;
    row.contract_value = mv != null && m != null ? Math.round(mv * m * 100) / 100 : null;
  }
  if (c === "triage") row.month = String(row.date ?? "").slice(0, 7);
  return row;
}

/** Moves one deal within its Pipeline section: up, down, or to the top. */
function move(rows: Row[], id: string, dir: string): Row[] {
  const me = rows.find((r) => r.id === id);
  if (!me) throw new StaleError("That deal was changed or removed. Reload and try again.");
  const g = dealGroup(me);
  const peers = rows.map((r, i) => ({ r, i })).filter((x) => dealGroup(x.r) === g);
  const k = peers.findIndex((x) => x.r.id === id);
  const target = dir === "top" ? 0 : dir === "up" ? k - 1 : dir === "down" ? k + 1 : k;
  if (target < 0 || target >= peers.length || target === k) return rows;
  const order = peers.map((x) => x.r);
  order.splice(k, 1);
  order.splice(target, 0, me);
  const next = [...rows];
  peers.forEach((x, j) => (next[x.i] = order[j]));
  return next;
}

export async function POST(req: Request) {
  const session = await readSession((await cookies()).get(COOKIE)?.value);
  if (!session) return NextResponse.redirect(new URL("/login", req.url), 303);
  const form = await req.formData();
  const c = String(form.get("collection")) as Collection;
  const back = String(form.get("back") ?? "/");
  const to = (msg: string, ok: boolean, hash = "") => {
    const u = new URL(back.startsWith("/") ? back : "/", req.url);
    if (msg) u.searchParams.set(ok ? "saved" : "error", msg);
    if (hash) u.hash = hash;
    return NextResponse.redirect(u, 303);
  };
  if (!["deals", "intros", "triage", "bonus"].includes(c)) return to("Unknown list.", false);
  if (c === "bonus") {
    const key = String(form.get("id") ?? ""), counts = String(form.get("counts") ?? "");
    if (!key || !["Yes", "No"].includes(counts)) return to("Pick Yes or No.", false);
    try {
      await writeCollection<Row>("bonus", session.name, Number(form.get("version") ?? 0), (rows) => [...rows.filter((r) => r.id !== key), { id: key, counts }]);
      return to("Bonus deal updated.", true);
    } catch (e) {
      return to((e as Error).message, false);
    }
  }
  const id = String(form.get("id") ?? "");
  const action = String(form.get("action") ?? "save");
  const version = Number(form.get("version") ?? 0);
  try {
    await writeCollection<Row>(c, session.name, version, (rows) => {
      if (action === "move") return move(rows, id, String(form.get("dir") ?? ""));
      if (action === "delete") {
        if (form.get("confirm") !== "yes") throw new Error("Tick “Yes, delete it” to confirm.");
        return rows.filter((r) => r.id !== id);
      }
      const prev = id ? rows.find((r) => r.id === id) : undefined;
      if (id && !prev) throw new StaleError("That record was changed or removed. Reload and try again.");
      const row = clean(c, form, prev);
      if (!String(row.company ?? "").trim()) throw new Error("Add a company or prospect name.");
      return prev ? rows.map((r) => (r.id === id ? row : r)) : [row, ...rows];
    });
    if (action === "move") return to("", true, `d-${id}`);
    return to(action === "delete" ? "Deleted." : "Saved.", true);
  } catch (e) {
    return to((e as Error).message, false);
  }
}
