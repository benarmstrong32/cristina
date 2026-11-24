// What each editable record holds, and how the edit forms show it.
export type Field = {
  key: string;
  label: string;
  type: "text" | "date" | "month" | "number" | "select" | "textarea";
  options?: string[];
  hint?: string;
  wide?: boolean;
};

export const LEAD_SOURCES = ["Unlimited", "Closers", "MFM", "Google", "Instagram", "Organic", "Referral", "Previous Client", "Previous Prospect", "Current Client", "Website Traffic", "LinkedIn", "Other"];

export const AD_CHANNELS = ["Meta – Unlimited Video", "Meta – Closers.io", "Meta – MFM / Home Services", "Not paid (organic / referral)"];

/** The channel a lead source counts toward, as in the sheet's "Ad Channel (auto)" column. */
export function channelForSource(source: string) {
  const s = source.toLowerCase();
  if (s.startsWith("unlimited")) return "Meta – Unlimited Video";
  if (s.startsWith("closers")) return "Meta – Closers.io";
  if (s.startsWith("mfm")) return "Meta – MFM / Home Services";
  return "Not paid (organic / referral)";
}

export const DEAL_STATUSES = ["Active", "On Hold", "Long-term", "Won", "Lost"];

export const FIELDS: Record<"deals" | "intros" | "triage", Field[]> = {
  deals: [
    { key: "company", label: "Deal / company", type: "text" },
    { key: "status", label: "Status", type: "select", options: DEAL_STATUSES },
    { key: "owner", label: "Owner", type: "select", options: ["Ben", "Cristina", "Dan"] },
    { key: "leadSource", label: "Lead source", type: "select", options: LEAD_SOURCES },
    { key: "dealType", label: "Type of deal", type: "text", hint: "Unlimited, Content Day, Stand Alone, Add on…" },
    { key: "closeMonth", label: "Close month", type: "text", hint: "e.g. Dec." },
    { key: "contact", label: "Point of contact", type: "text" },
    { key: "email", label: "Contact email", type: "text" },
    { key: "lastAction", label: "Last action", type: "date" },
    { key: "nextAction", label: "Next action", type: "date" },
    { key: "amountPerMonth", label: "Amount / month ($)", type: "number" },
    { key: "months", label: "# months", type: "number" },
    { key: "confidence", label: "Confidence (0–100%)", type: "number", hint: "Enter 50 for 50%" },
    { key: "lastSummary", label: "Last conversation summary", type: "textarea", wide: true },
    { key: "nextSteps", label: "Next steps", type: "textarea", wide: true },
  ],
  intros: [
    { key: "company", label: "Company / prospect", type: "text" },
    { key: "month", label: "Intro month", type: "month" },
    { key: "completed", label: "Intro completed?", type: "select", options: ["Yes", "No", "Upcoming", "Reschedule in process"] },
    { key: "lead_source", label: "Lead source", type: "select", options: LEAD_SOURCES },
    { key: "ad_channel", label: "Counts toward", type: "select", options: ["Auto (from lead source)", ...AD_CHANNELS], hint: "Leave on Auto unless a deal should count differently" },
    { key: "won", label: "Won?", type: "select", options: ["", "Yes"] },
    { key: "monthly_value", label: "Monthly value ($)", type: "number" },
    { key: "months", label: "# months", type: "number" },
    { key: "notes", label: "Notes", type: "textarea", wide: true },
  ],
  triage: [
    { key: "company", label: "Company / prospect", type: "text" },
    { key: "date", label: "Triage date", type: "date" },
    { key: "completed", label: "Triage completed?", type: "select", options: ["Yes", "No", "Upcoming"] },
    { key: "lead_source", label: "Lead source", type: "select", options: LEAD_SOURCES },
    { key: "booked_intro", label: "Booked intro?", type: "select", options: ["Yes", "No", ""] },
    { key: "notes", label: "Notes", type: "textarea", wide: true },
  ],
};
