import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, type SessionData } from "@/lib/session";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (password !== process.env.GALLERY_PASSWORD)
    return NextResponse.json({ error: "wrong" }, { status: 401 });
  const res = NextResponse.json({ ok: true });
  const session = await getIronSession<SessionData>(req, res, sessionOptions);
  session.authenticated = true;
  await session.save();
  return res;
}
