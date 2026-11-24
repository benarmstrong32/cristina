import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE, readSession, type Session } from "./session";

export async function requireSession(): Promise<Session> {
  const s = await readSession((await cookies()).get(COOKIE)?.value);
  if (!s) redirect("/login");
  return s;
}
