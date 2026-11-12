import { NextResponse, type NextRequest } from "next/server";
import { COOKIE, readSession } from "./lib/session";

export async function middleware(req: NextRequest) {
  const session = await readSession(req.cookies.get(COOKIE)?.value);
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/((?!login|api/login|_next|favicon.ico).*)"] };
