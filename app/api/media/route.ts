import { NextRequest, NextResponse } from "next/server";
import { listMedia } from "@/lib/r2";

export const runtime = "nodejs";
export const revalidate = 60;

export async function GET(req: NextRequest) {
  const album = req.nextUrl.searchParams.get("album") ?? "";
  const prefix = album && album !== "all" ? `${album}/` : "";
  try {
    const media = await listMedia(prefix);
    return NextResponse.json({ media });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "R2 error" }, { status: 500 });
  }
}
