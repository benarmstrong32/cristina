import { NextResponse } from "next/server";

// Saves the light / dark choice in a cookie and goes back to the page.
export async function POST(req: Request) {
  const form = await req.formData();
  const theme = String(form.get("theme") ?? "");
  const back = String(form.get("back") ?? "/");
  const res = NextResponse.redirect(new URL(back.startsWith("/") ? back : "/", req.url), 303);
  if (theme === "light" || theme === "dark") res.cookies.set("theme", theme, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  else res.cookies.delete("theme");
  return res;
}
