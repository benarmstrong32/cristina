import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { getClient } from "@/config/clients";
import { COOKIE, readSession } from "@/lib/session";
import { liveTag } from "@/lib/data";

// Clears the cached live data so the next page load pulls fresh numbers.
export async function POST(req: Request) {
  const session = await readSession((await cookies()).get(COOKIE)?.value);
  const form = await req.formData();
  const clientId = String(form.get("clientId") ?? "");
  const back = String(form.get("back") ?? "/");
  if (!session || !getClient(clientId) || (session.role === "client" && session.clientId !== clientId)) {
    return NextResponse.redirect(new URL("/login", req.url), 303);
  }
  revalidateTag(liveTag(clientId));
  return NextResponse.redirect(new URL(back.startsWith("/") ? back : "/", req.url), 303);
}
