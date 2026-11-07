import { NextResponse } from "next/server";

/** Remembers whether a visitor on Aruba, Curaçao or Bonaire wants their own island only or all islands. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const lang = url.searchParams.get("lang") === "nl" ? "nl" : "en";
  const res = NextResponse.redirect(new URL(`/${lang}`, url.origin), 303);
  if (url.searchParams.get("mode") === "all") res.cookies.set("ns_view", "all", { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  else res.cookies.delete("ns_view");
  return res;
}
