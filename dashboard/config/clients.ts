// One entry per client. The data for each comes from data/snapshot/<id>.json.
export type ClientConfig = { id: string; name: string };

export const clients: Record<string, ClientConfig> = {
  "new-velocity": { id: "new-velocity", name: "New Velocity" },
};

export function getClient(id: string): ClientConfig | undefined {
  return clients[id];
}
