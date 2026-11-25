export type AdRow = {
  day: string;
  id: string;
  campaign: string;
  spend: number;
  impressions: number;
  clicks: number;
  result_type: string;
  results: number;
};

export type Intro = {
  id?: string;
  notes?: string;
  triaged?: string;
  month: string;
  company: string;
  completed: string;
  lead_source: string;
  ad_channel: string;
  won: string;
  monthly_value: number | null;
  months: number | null;
  contract_value: number | null;
};

export type Win = {
  close_month: string;
  company: string;
  channel: string;
  deal_type: string;
  monthly_value: number | null;
  months: number | null;
  contract_value: number | null;
  counts_for_bonus: boolean;
  bonus_key?: string;
  bonus_edited?: boolean;
};

export type BonusFlag = { id: string; counts: string };

export type Triage = {
  id?: string;
  month: string;
  company: string;
  date: string;
  completed: string;
  lead_source: string;
  booked_intro: string;
  notes: string;
};

export type AdTotal = {
  id: string;
  name: string;
  status: string;
  spend: number;
  impressions: number;
  clicks: number;
  applications: number;
};

export type Applicant = {
  contactId: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  website?: string;
  createdAt: string;
  status: "submitted" | "partial";
  funnel?: string;
  stage?: string;
  tags?: string[];
  source?: string;
  attribution?: { utmSource?: string; campaignId?: string; adsetId?: string; adId?: string; adName?: string; pageUrl?: string };
  answers: { question: string; answer: string }[];
  calls?: { date: string; title: string; status: string }[];
  ghlUrl?: string;
  disqualified?: boolean;
  triage?: { date: string; state: "completed" | "no-show" | "cancelled" | "upcoming" | "booked"; bookedIntro: string } | null;
  superQualified?: boolean;
  why?: string;
};

export type AdDay = { day: string; id: string; spend: number; impressions: number; clicks: number; applications: number; leads: number };

export type Creative = { format?: string; image?: string; headline?: string; body?: string; about?: string; adset?: string };

export type Data = {
  versions: { intros: number; triage: number; bonus: number };
  liveUpdated: { intros: string; triage: string };
  ads: AdRow[];
  adsThrough: string;
  adsLive: boolean;
  adsSavedAt?: string;
  intros: Intro[];
  wins: Win[];
  triage: Triage[];
  adTotals: AdTotal[];
  adDaily: AdDay[];
  adWindows: Record<string, { since: string; through: string; ads: { id: string; spend: number; impressions: number; clicks: number; applications: number }[] }>;
  adTotalsThrough: string;
  creatives: Record<string, Creative>;
  applicants: Applicant[];
  wonContacts: Record<string, string>;
  applicantsSavedAt?: string;
  sheetSavedAt: string;
  generatedAt: string;
  error?: string;
};

export type Deal = {
  id: string;
  owner: string;
  closeMonth: string;
  company: string;
  leadSource: string;
  status: string;
  dealType: string;
  contact: string;
  email: string;
  lastAction: string;
  nextAction: string;
  lastSummary: string;
  nextSteps: string;
  amountPerMonth: number | null;
  confidence: number | null;
  months: number | null;
  /** Month (YYYY-MM) we starred it as closing; the star clears itself when the month ends. */
  starredFor?: string;
};
