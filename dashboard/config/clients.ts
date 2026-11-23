// One entry per client. Live data needs the two token env vars below; without
// them the portal shows the saved copy in data/snapshot/<id>.json.
export type ClientConfig = {
  id: string;
  name: string;
  metaAdAccountId: string;
  ghlLocationId: string;
  introCalendarId: string;
  pipelineId: string;
  funnelBFormId: string;
  metaTokenEnv: string;
  ghlTokenEnv: string;
};

export const clients: Record<string, ClientConfig> = {
  "new-velocity": {
    id: "new-velocity",
    name: "New Velocity",
    metaAdAccountId: "827978840395530",
    ghlLocationId: "FyCroQaIulratBD4TQcv",
    introCalendarId: "UeAWFlOQFQU7zOVlKvNg", // Sales Growth Strategy Call with Chris Daltorio
    pipelineId: "GjTGTlPGk4kS0PlHjweF", // New Velocity Sales
    funnelBFormId: "rnCKN1nKCaItjrLlnpL6", // NV | Funnel B - X-Ray Opt-In
    metaTokenEnv: "META_ACCESS_TOKEN",
    ghlTokenEnv: "GHL_TOKEN_NEW_VELOCITY",
  },
};

export function getClient(id: string): ClientConfig | undefined {
  return clients[id];
}
