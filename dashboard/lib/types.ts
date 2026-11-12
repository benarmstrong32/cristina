export type MetaDay = {
  date: string; // YYYY-MM-DD
  spend: number;
  impressions: number;
  clicks: number;
  linkClicks: number;
  landingPageViews: number;
  metaLeads: number;
};

export type MetaAd = {
  id: string;
  name: string;
  adsetName: string;
  status: string;
  spend: number;
  impressions: number;
  reach: number;
  linkClicks: number;
  metaLeads: number;
};

export type CallStatus = "booked" | "showed" | "no_show" | "cancelled";

export type IntroCall = {
  id: string;
  contactId: string;
  contactName: string;
  calendarName: string;
  bookedAt: string; // ISO
  startTime: string; // ISO
  status: CallStatus;
  fromMeta: boolean;
};

export type Lead = {
  contactId: string;
  name: string;
  email: string | null;
  createdAt: string; // ISO
  source: string; // GHL form/survey that created the contact
  adId?: string; // Meta ad id from UTM, when present
  fromMeta: boolean;
  partial: boolean; // started a form but left no email/phone
  stage?: string;
  oppStatus?: string;
  qualified: boolean;
  won: boolean;
  wonAt?: string;
  value: number;
};

export type Snapshot = {
  clientId: string;
  generatedAt: string;
  meta: {
    connected: boolean;
    live: boolean; // false = bundled snapshot
    asOf: string;
    days: MetaDay[];
    ads: MetaAd[];
    adsPeriod: { since: string; until: string };
  };
  ghl: {
    connected: boolean;
    live?: boolean;
    error?: string;
    leads: Lead[];
    calls: IntroCall[];
  };
};
