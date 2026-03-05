import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, type SessionData } from "@/lib/session";

const PUBLIC = ["/login", "/api/login", "/_next", "/favicon", ".ico"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Allow public paths
  if (PUBLIC.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }
  
  // Create response to pass to getIronSession
  const res = NextResponse.next();
  
  try {
    const session = await getIronSession<SessionData>(req, res, sessionOptions);
    
    // If not authenticated, redirect to login
    if (!session.authenticated) {
      const url = new URL("/login", req.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
  } catch (error) {
    // If session error, redirect to login
    const url = new URL("/login", req.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }
  
  return res;
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
