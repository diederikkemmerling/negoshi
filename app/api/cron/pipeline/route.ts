import { NextResponse } from "next/server";

/**
 * Called hourly by Vercel Cron (vercel.json). Starts the GitHub "content pipeline" workflow,
 * because GitHub's own schedule fires only a few times a day.
 * Needs env GH_DISPATCH_TOKEN: a fine-grained GitHub token for this repo with "Actions: read and write".
 */
const REPO = "diederikkemmerling/negoshi";
const WORKFLOW = "pipeline.yml";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const ua = req.headers.get("user-agent") || "";
  if (secret ? req.headers.get("authorization") !== `Bearer ${secret}` : !ua.startsWith("vercel-cron")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const token = process.env.GH_DISPATCH_TOKEN;
  if (!token) return NextResponse.json({ error: "GH_DISPATCH_TOKEN not set" }, { status: 500 });
  const gh = (path: string, init?: RequestInit) =>
    fetch(`https://api.github.com/repos/${REPO}${path}`, {
      ...init,
      headers: { authorization: `Bearer ${token}`, accept: "application/vnd.github+json", "x-github-api-version": "2022-11-28", "user-agent": "negoshi-cron", ...(init?.headers || {}) },
      cache: "no-store",
    });

  // Skip if a run started in the last 30 minutes or is still going.
  const runs = await gh(`/actions/workflows/${WORKFLOW}/runs?per_page=3`);
  if (runs.ok) {
    const { workflow_runs = [] } = (await runs.json()) as { workflow_runs?: { status: string; created_at: string }[] };
    const busy = workflow_runs.find((r) => r.status !== "completed" || Date.now() - new Date(r.created_at).getTime() < 30 * 60_000);
    if (busy) return NextResponse.json({ skipped: "recent or running", at: busy.created_at });
  }
  const res = await gh(`/actions/workflows/${WORKFLOW}/dispatches`, { method: "POST", body: JSON.stringify({ ref: "main", inputs: { dry: "false" } }) });
  if (!res.ok) return NextResponse.json({ error: `dispatch failed ${res.status}`, detail: await res.text() }, { status: 502 });
  return NextResponse.json({ dispatched: true });
}
