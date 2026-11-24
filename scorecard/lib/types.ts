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
};

export type Triage = {
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
  stage?: string;
  tags?: string[];
  source?: string;
  attribution?: { utmSource?: string; campaignId?: string; adsetId?: string; adId?: string; pageUrl?: string };
  answers: { question: string; answer: string }[];
  calls?: { date: string; title: string; status: string }[];
  ghlUrl?: string;
  disqualified?: boolean;
  triage?: { date: string; state: "completed" | "no-show" | "cancelled" | "upcoming" | "booked"; bookedIntro: string } | null;
  superQualified?: boolean;
  why?: string;
};

export type Creative = { format?: string; image?: string; headline?: string; body?: string; about?: string; adset?: string };

export type Data = {
  ads: AdRow[];
  adsThrough: string;
  adsLive: boolean;
  adsSavedAt?: string;
  intros: Intro[];
  wins: Win[];
  triage: Triage[];
  adTotals: AdTotal[];
  adTotalsThrough: string;
  creatives: Record<string, Creative>;
  applicants: Applicant[];
  applicantsSavedAt?: string;
  sheetSavedAt: string;
  generatedAt: string;
  error?: string;
};
