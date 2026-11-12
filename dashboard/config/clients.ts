// One entry per client. Adding a client = add an entry here + a GHL token env var.
export type ClientConfig = {
  id: string;
  name: string;
  metaAdAccountId: string;
  ghlLocationId: string;
  /** Env var holding this client's GHL Private Integration token. */
  ghlTokenEnv: string;
  /** GHL calendars that count as "intro calls". */
  introCalendarIds: string[];
  /** Pipeline used for the funnel. */
  pipelineId: string;
  /** Stage names (in pipeline order) that mean "qualified or further along". */
  qualifiedStages: string[];
  /**
   * A contact is an ad lead when its GHL "source" (the form/survey that created it) contains
   * one of these, OR its first-touch attribution is Facebook/Instagram.
   */
  adLeadSources: string[];
  /** Contacts to ignore everywhere (team tests). Matched against email and name, case-insensitive. */
  excludeEmailDomains: string[];
  excludeEmails: string[];
  excludeNameWords: string[];
  /** Show the revenue row (Revenue From Ads, ROAS, Ad Cost Per Customer) to the client. */
  showRevenueToClient: boolean;
};

export const clients: Record<string, ClientConfig> = {
  "new-velocity": {
    id: "new-velocity",
    name: "New Velocity",
    metaAdAccountId: "827978840395530",
    ghlLocationId: "FyCroQaIulratBD4TQcv",
    ghlTokenEnv: "GHL_TOKEN_NEW_VELOCITY",
    introCalendarIds: ["UeAWFlOQFQU7zOVlKvNg"], // Sales Growth Strategy Call with Chris Daltorio
    pipelineId: "GjTGTlPGk4kS0PlHjweF", // New Velocity Sales
    qualifiedStages: ["Contacted", "Call Booked", "Call Showed", "Proposal Sent", "Closed"],
    adLeadSources: ["NV | Sales Growth Call Qualifier", "NV | Funnel B"],
    excludeEmailDomains: ["9milesmedia.com", "mynewvelocity.com"],
    excludeEmails: [], // plus anything in the EXCLUDE_EMAILS env var (comma-separated)
    excludeNameWords: ["test"],
    showRevenueToClient: false,
  },
};

export function getClient(id: string): ClientConfig | undefined {
  return clients[id];
}
