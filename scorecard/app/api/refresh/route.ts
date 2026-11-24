import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { COOKIE, readSession } from "@/lib/session";
import { LIVE_TAG } from "@/lib/data";

// Clears the cached Meta numbers so the next page load pulls fresh ones.
export async function POST(req: Request) {
  const session = await readSession((await cookies()).get(COOKIE)?.value);
  if (!session) return NextResponse.redirect(new URL("/login", req.url), 303);
  const back = String((await req.formData()).get("back") ?? "/");
  revalidateTag(LIVE_TAG);
  return NextResponse.redirect(new URL(back.startsWith("/") ? back : "/", req.url), 303);
}
