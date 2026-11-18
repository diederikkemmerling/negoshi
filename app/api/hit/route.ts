import { NextResponse } from "next/server";
import { after } from "next/server";
import { recordHit } from "@/lib/hits";

const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram|discord|curl|wget|python|headless/i;

/** Receives a view beacon from a brief page. */
export async function POST(req: Request) {
  const ua = req.headers.get("user-agent") || "";
  const id = (await req.text()).trim().slice(0, 40);
  if (id && /^[a-f0-9]{8,40}$/.test(id) && !BOT.test(ua)) after(() => recordHit(id));
  return new NextResponse(null, { status: 204 });
}
