import { NextResponse } from "next/server";
import { verifyLogin } from "@/lib/users";
import { COOKIE, signSession } from "@/lib/session";

export async function POST(req: Request) {
  const form = await req.formData();
  const session = verifyLogin(String(form.get("email") ?? ""), String(form.get("password") ?? ""));
  if (!session) return NextResponse.redirect(new URL("/login?error=1", req.url), 303);
  const res = NextResponse.redirect(new URL("/", req.url), 303);
  res.cookies.set(COOKIE, await signSession(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 14 * 86400,
  });
  return res;
}
