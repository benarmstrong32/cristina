import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import type { Session } from "./session";

type User = Session & { passwordHash: string };

export function hashPassword(pw: string, salt = randomBytes(16).toString("hex")) {
  return `scrypt$${salt}$${scryptSync(pw, salt, 32).toString("hex")}`;
}

function users(): User[] {
  if (process.env.DASHBOARD_USERS) return JSON.parse(process.env.DASHBOARD_USERS);
  if (process.env.NODE_ENV === "production") return [];
  // Local development only: two demo logins (password "demo").
  return [
    { email: "team@demo", name: "9miles Team", role: "team", passwordHash: hashPassword("demo", "devsalt") },
    { email: "client@demo", name: "New Velocity", role: "client", clientId: "new-velocity", passwordHash: hashPassword("demo", "devsalt") },
  ];
}

export function verifyLogin(email: string, password: string): Session | null {
  const u = users().find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
  if (!u) return null;
  const [, salt, hex] = u.passwordHash.split("$");
  const want = Buffer.from(hex ?? "", "hex");
  const got = scryptSync(password, salt ?? "", 32);
  if (want.length !== got.length || !timingSafeEqual(want, got)) return null;
  const { passwordHash: _omit, ...session } = u;
  return session;
}
