// Settings for the 9miles Growth Scorecard. Numbers that change (spend, intros, deals) live in data/.
export const AD_ACCOUNT_ID = "1890396841064251"; // 9miles Media Ad Account
export const START = "2026-09-01"; // The sales ops sheet starts in September 2026.
export const REFRESH_HOURS = 3;

/** Completed-intro goal per month (Intros Scorecard tab). Months not listed use DEFAULT_INTRO_GOAL. */
export const INTRO_GOALS: Record<string, number> = { "2026-09": 20, "2026-10": 15, "2026-11": 15 };
export const DEFAULT_INTRO_GOAL = 20;

/** Monthly sales goal: new monthly value won ($/month), from the pipeline tab. */
export const SALES_GOAL_MONTHLY = 30000;

/** Monthly Meta ad budget for tracking. Set a number (e.g. 5000) to show spend against it; null shows spend and pace only. */
export const MONTHLY_AD_BUDGET: number | null = null;

/** Cristina's bonus: $100 for meeting the completed-intro goal, plus $50 per qualifying deal closed. */
export const BONUS_GOAL = 100;
export const BONUS_PER_DEAL = 50;

/** Which channel a Meta campaign belongs to, from its name. */
export function channelForCampaign(name: string) {
  if (/unlimited video/i.test(name)) return "Meta – Unlimited Video";
  if (/closers/i.test(name)) return "Meta – Closers.io";
  if (/home services|mfm/i.test(name)) return "Meta – MFM / Home Services";
  return "Meta – Other";
}

export const isMeta = (channel: string) => channel.startsWith("Meta");

export const CHANNEL_ORDER = [
  "Meta – Unlimited Video",
  "Meta – Closers.io",
  "Meta – MFM / Home Services",
  "Meta – Other",
  "Not paid (organic / referral)",
  "Not from an intro (existing clients / upsells)",
];
