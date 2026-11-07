import { NextResponse } from "next/server";

// Subscriptions: stored by the email provider once connected (env NEWSLETTER_WEBHOOK).
// Until then the request is acknowledged and the visitor is sent back with a confirmation flag.
export async function POST(req: Request) {
  const form = await req.formData();
  const email = String(form.get("email") || "");
  const lang = String(form.get("lang") || "en");
  const island = String(form.get("island") || "all");
  const hook = process.env.NEWSLETTER_WEBHOOK;
  if (hook && email) {
    try {
      await fetch(hook, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, lang, island }) });
    } catch {}
  }
  return NextResponse.redirect(new URL(`/${lang}?subscribed=1`, req.url), 303);
}
