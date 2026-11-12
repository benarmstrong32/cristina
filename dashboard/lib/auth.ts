import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { COOKIE, readSession, type Session } from "./session";

export async function getSession() {
  return readSession((await cookies()).get(COOKIE)?.value);
}

/** Team can see any client; a client user only their own client view. */
export async function requireAccess(clientId: string, opts: { teamOnly?: boolean } = {}): Promise<Session> {
  const s = await getSession();
  if (!s) redirect("/login");
  if (s.role === "team") return s;
  if (opts.teamOnly || s.clientId !== clientId) notFound();
  return s;
}
