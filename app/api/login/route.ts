import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, type SessionData } from "@/lib/session";

// very small in-memory rate limit by IP
const attempts = new Map<string, { count: number; reset: number }>();

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const now = Date.now();
  const rec = attempts.get(ip);

  if (rec && now < rec.reset && rec.count >= 5) {
    return NextResponse.json({ error: "too_many" }, { status: 429 });
  }

  attempts.set(ip, {
    count: (rec && now < rec.reset ? rec.count : 0) + 1,
    reset: rec && now < rec.reset ? rec.reset : now + 60_000,
  });

  const { password } = await req.json();
  if (password !== process.env.GALLERY_PASSWORD)
    return NextResponse.json({ error: "wrong" }, { status: 401 });
  const res = NextResponse.json({ ok: true });
  const session = await getIronSession<SessionData>(req, res, sessionOptions);
  session.authenticated = true;
  await session.save();
  return res;
}
