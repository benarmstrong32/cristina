import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { COOKIE, readSession } from "@/lib/session";
import { StaleError, newId, writeCollection, type Collection } from "@/lib/store";
import { FIELDS, channelForSource } from "@/config/fields";

type Row = Record<string, unknown> & { id: string };

function clean(c: Collection, form: FormData, prev: Row | undefined): Row {
  const row: Row = { ...(prev ?? {}), id: prev?.id ?? newId() };
  for (const f of FIELDS[c]) {
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

export async function POST(req: Request) {
  const session = await readSession((await cookies()).get(COOKIE)?.value);
  if (!session) return NextResponse.redirect(new URL("/login", req.url), 303);
  const form = await req.formData();
  const c = String(form.get("collection")) as Collection;
  const back = String(form.get("back") ?? "/");
  const to = (msg: string, ok: boolean) => {
    const u = new URL(back.startsWith("/") ? back : "/", req.url);
    u.searchParams.set(ok ? "saved" : "error", msg);
    return NextResponse.redirect(u, 303);
  };
  if (!["deals", "intros", "triage"].includes(c)) return to("Unknown list.", false);
  const id = String(form.get("id") ?? "");
  const action = String(form.get("action") ?? "save");
  const version = Number(form.get("version") ?? 0);
  try {
    await writeCollection<Row>(c, session.name, version, (rows) => {
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
    return to(action === "delete" ? "Deleted." : "Saved.", true);
  } catch (e) {
    return to((e as Error).message, false);
  }
}
