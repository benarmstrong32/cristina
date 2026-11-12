import type { ClientConfig } from "@/config/clients";
import type { CallStatus, IntroCall, Lead } from "./types";

const BASE = "https://services.leadconnectorhq.com";

async function ghl(path: string, token: string, version: string, init: RequestInit = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Version: version,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    next: { revalidate: 900 },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`GHL ${path.split("?")[0]}: ${json?.message ?? res.status}`);
  return json;
}

/** Raw GHL records, exactly as the API returns them. */
export type GhlRaw = {
  contacts: any[];
  opportunities: any[];
  events: any[]; // each with an added calendarName
  stages: { id: string; name: string }[];
};

export async function fetchGhlRaw(client: ClientConfig, sinceIso: string, untilIso: string, token: string): Promise<GhlRaw> {
  const loc = client.ghlLocationId;

  const contacts: any[] = [];
  for (let page = 1; page <= 20; page++) {
    const r = await ghl("/contacts/search", token, "2021-07-28", {
      method: "POST",
      body: JSON.stringify({
        locationId: loc,
        page,
        pageLimit: 100,
        filters: [{ field: "dateAdded", operator: "range", value: { gte: sinceIso, lte: untilIso } }],
        sort: [{ field: "dateAdded", direction: "desc" }],
      }),
    });
    contacts.push(...(r.contacts ?? []));
    if (!r.contacts || r.contacts.length < 100) break;
  }

  const { pipelines = [] } = await ghl(`/opportunities/pipelines?locationId=${loc}`, token, "2021-07-28");
  const pipeline = pipelines.find((p: any) => p.id === client.pipelineId);
  const opportunities: any[] = [];
  for (let page = 1; page <= 20; page++) {
    const r = await ghl(
      `/opportunities/search?location_id=${loc}&pipeline_id=${client.pipelineId}&limit=100&page=${page}`,
      token, "2021-07-28",
    );
    opportunities.push(...(r.opportunities ?? []));
    if (!r.opportunities || r.opportunities.length < 100) break;
  }

  const { calendars = [] } = await ghl(`/calendars/?locationId=${loc}`, token, "2021-04-15");
  const start = new Date(sinceIso).getTime();
  const end = new Date(untilIso).getTime() + 60 * 864e5; // include calls scheduled ahead
  const events: any[] = [];
  for (const id of client.introCalendarIds) {
    const name = calendars.find((c: any) => c.id === id)?.name ?? "Intro call";
    const r = await ghl(`/calendars/events?locationId=${loc}&calendarId=${id}&startTime=${start}&endTime=${end}`, token, "2021-04-15");
    for (const e of r.events ?? []) events.push({ ...e, calendarName: name });
  }

  return { contacts, opportunities, events, stages: pipeline?.stages ?? [] };
}

// ---------- normalisation (pure; shared by live fetch and saved snapshots) ----------

const fullName = (c: any) =>
  [c?.firstName ?? c?.firstNameLowerCase, c?.lastName ?? c?.lastNameLowerCase].filter(Boolean).join(" ").trim();

export function isExcluded(client: ClientConfig, email?: string | null, name?: string | null) {
  const e = (email ?? "").toLowerCase();
  const n = (name ?? "").toLowerCase();
  const extra = (process.env.EXCLUDE_EMAILS ?? "").split(",").map((x) => x.trim()).filter(Boolean);
  if (e && [...client.excludeEmails, ...extra].map((x) => x.toLowerCase()).includes(e)) return true;
  if (e && client.excludeEmailDomains.some((d) => e.endsWith("@" + d.toLowerCase()))) return true;
  return client.excludeNameWords.some((w) => new RegExp(`\\b${w}\\b`, "i").test(n));
}

function metaAttributed(attr: any): boolean {
  if (!attr) return false;
  if (attr.fbclid || attr.utmFbclid || attr.fbc) return true;
  const hay = [attr.utmSource, attr.utmMedium, attr.sessionSource, attr.utmSessionSource, attr.referrer]
    .filter(Boolean).join(" ").toLowerCase();
  return /facebook|instagram|\bfb\b|\big\b/.test(hay);
}

function callStatus(s: string | undefined): CallStatus {
  switch ((s ?? "").toLowerCase()) {
    case "showed": return "showed";
    case "noshow": case "no_show": return "no_show";
    case "cancelled": case "canceled": case "invalid": return "cancelled";
    default: return "booked";
  }
}

export function normalizeGhl(client: ClientConfig, raw: GhlRaw): { leads: Lead[]; calls: IntroCall[] } {
  const stageName = new Map(raw.stages.map((s) => [s.id, s.name]));
  const qualified = new Set(client.qualifiedStages.map((s) => s.toLowerCase()));
  const oppByContact = new Map<string, any>();
  for (const o of raw.opportunities) {
    const prev = oppByContact.get(o.contactId);
    if (!prev || (o.updatedAt ?? "") > (prev.updatedAt ?? "")) oppByContact.set(o.contactId, o);
  }
  const sources = client.adLeadSources.map((s) => s.toLowerCase());

  const leads: Lead[] = [];
  for (const c of raw.contacts) {
    const name = fullName(c);
    const email = c.email ?? null;
    if (isExcluded(client, email, name)) continue;
    const o = oppByContact.get(c.id);
    const firstTouch = o?.attributions?.find((a: any) => a.isFirst) ?? c.attributionSource;
    const source = (c.source ?? "").trim();
    const fromForm = sources.some((s) => source.toLowerCase().includes(s));
    const fromMeta = fromForm || metaAttributed(firstTouch);
    if (!fromMeta) continue; // dashboard only tracks ad leads
    const stage = o ? stageName.get(o.pipelineStageId) : undefined;
    const won = o?.status === "won" || stage?.toLowerCase() === "closed";
    leads.push({
      contactId: c.id,
      name: name ? titleCase(name) : "",
      email,
      createdAt: c.dateAdded,
      source: source || "Unknown form",
      adId: firstTouch?.utmContent,
      fromMeta: true,
      partial: !email && !c.phone,
      stage,
      oppStatus: o?.status,
      qualified: won || (!!stage && qualified.has(stage.toLowerCase())),
      won,
      wonAt: won ? o?.lastStatusChangeAt ?? o?.lastStageChangeAt : undefined,
      value: won ? Number(o?.monetaryValue ?? 0) : 0,
    });
  }

  // Dedupe people who submitted twice with different emails but the same name on the same day.
  const seen = new Set<string>();
  const deduped = leads.filter((l) => {
    if (l.partial || !l.name) return true;
    const k = `${l.name.toLowerCase()}|${l.createdAt.slice(0, 10)}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  const leadIds = new Set(deduped.map((l) => l.contactId));
  const calls: IntroCall[] = raw.events
    .filter((e) => !e.deleted)
    .map((e) => {
      const f = e.appointmentMeta?.defaultFormDetails ?? {};
      const name = [f.firstName, f.lastName].filter(Boolean).join(" ") || (e.title ?? "").split(" + ")[0];
      return { e, name, email: f.email ?? null };
    })
    .filter(({ name, email }) => !isExcluded(client, email, name))
    .map(({ e, name }) => ({
      id: e.id,
      contactId: e.contactId,
      contactName: titleCase(name),
      calendarName: e.calendarName,
      bookedAt: e.dateAdded ?? e.startTime,
      startTime: new Date(e.startTime).toISOString(),
      status: callStatus(e.appointmentStatus),
      fromMeta: leadIds.has(e.contactId) || metaAttributed(oppByContact.get(e.contactId)?.attributions?.find((a: any) => a.isFirst)),
    }));

  return { leads: deduped, calls };
}

function titleCase(s: string) {
  return s.toLowerCase().replace(/\b\p{L}/gu, (m) => m.toUpperCase());
}
