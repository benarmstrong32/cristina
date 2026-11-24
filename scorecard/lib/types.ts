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

export type Data = {
  ads: AdRow[];
  adsThrough: string;
  adsLive: boolean;
  adsSavedAt?: string;
  intros: Intro[];
  wins: Win[];
  sheetSavedAt: string;
  generatedAt: string;
  error?: string;
};
