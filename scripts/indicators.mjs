#!/usr/bin/env node
/**
 * Negoshi indicators collector: fills data/indicators.json for the ticker and the "in numbers" band.
 * - Market data from keyless APIs (ECB via frankfurter.app, Brent via stooq.com).
 * - Island indicators extracted by Claude from the official pages (CBS Aruba, CBS Curaçao, ATA, CTB, Gobierno di Aruba).
 * Keeps the previous value when a source is unreachable, so the ticker never goes blank.
 *
 * Run: ANTHROPIC_API_KEY=... node scripts/indicators.mjs [--dry]
 */
import fs from "node:fs";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import { get, pageText, anchors, askJson, isBilling } from "./util.mjs";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const OUT = path.join(ROOT, "data/indicators.json");
const DRY = process.argv.includes("--dry");
const MODEL = process.env.NEGOSHI_MODEL_SMALL || "claude-haiku-5-5";
const client = DRY ? null : new Anthropic();

const prev = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : { updated_at: null, items: [] };
const prevById = Object.fromEntries((prev.items || []).map((i) => [i.id, i]));

/** Indicator definitions. `band: true` also shows in the homepage numbers band. */
const DEFS = [
  { id: "awg-usd", en: "AWG/USD", nl: "AWG/USD", unit: "", fixed: "1.79", note_en: "fixed", note_nl: "vast", source: "CBA", url: "https://www.cbaruba.org" },
  { id: "xcg-usd", en: "XCG/USD", nl: "XCG/USD", unit: "", fixed: "1.79", note_en: "fixed", note_nl: "vast", source: "CBCS", url: "https://www.centralbank.cw" },
  { id: "usd-eur", en: "USD/EUR", nl: "USD/EUR", unit: "", source: "ECB", url: "https://www.ecb.europa.eu" },
  { id: "brent", en: "Brent", nl: "Brent", unit: "$/bbl", source: "FRED / EIA", url: "https://fred.stlouisfed.org/series/DCOILBRENTEU" },
  { id: "cpi-aw", en: "Aruba inflation", nl: "Inflatie Aruba", unit: "% y/y", band: true, source: "CBS Aruba", url: "https://cbs.aw/wp/index.php/category/business-economy/inflation-prices/" },
  { id: "cpi-cw", en: "Curaçao inflation", nl: "Inflatie Curaçao", unit: "% y/y", band: true, source: "CBS Curaçao", url: "https://www.cbs.cw/inflation-rates" },
  { id: "arrivals-aw", en: "Aruba stay-over arrivals", nl: "Verblijfsgasten Aruba", unit: "% y/y", band: true, source: "ATA", url: "https://www.ata.aw" },
  { id: "arrivals-cw", en: "Curaçao stay-over arrivals", nl: "Verblijfsgasten Curaçao", unit: "% y/y", band: true, source: "CTB", url: "https://www.curacaotouristboard.com/monthly-statistics/" },
  { id: "fuel-aw", en: "Aruba gasoline", nl: "Benzine Aruba", unit: "AWG/l", band: true, source: "Gobierno di Aruba", url: "https://www.gobierno.aw" },
  { id: "cpi-bq", en: "Bonaire inflation", nl: "Inflatie Bonaire", unit: "% y/y", band: true, source: "CBS", url: "https://www.cbs.nl/nl-nl/dossier/caribisch-nederland" },
];

const results = {}; // id -> { value, period, change }

// 1. Market data, no key needed
try {
  const fx = JSON.parse(await get("https://api.frankfurter.app/latest?from=USD&to=EUR", { accept: "application/json" }));
  results["usd-eur"] = { value: Number(fx.rates.EUR).toFixed(3), period: fx.date };
  console.log("ok   usd-eur", results["usd-eur"].value);
} catch (e) { console.log("err  usd-eur", e.message); }
try {
  // FRED daily Brent spot (EIA), public CSV, last non-empty row wins
  const csv = await get("https://fred.stlouisfed.org/graph/fredgraph.csv?id=DCOILBRENTEU", { accept: "text/csv,*/*" });
  const rows = csv.trim().split("\n").slice(1).map((l) => l.split(",")).filter((r) => r[1] && r[1] !== ".");
  const last = rows[rows.length - 1];
  const close = Number(last?.[1]);
  if (Number.isFinite(close) && close > 0) { results.brent = { value: close.toFixed(2), period: last[0] }; console.log("ok   brent", close, last[0]); }
  else throw new Error("no value in csv");
} catch (e) { console.log("err  brent", e.message); }

// 2. Official pages -> Claude extraction (one call)
const PAGES = [
  { id: "cpi-aw", url: "https://cbs.aw/wp/index.php/category/business-economy/inflation-prices/" },
  { id: "cpi-cw", url: "https://www.cbs.cw/inflation-rates" },
  { id: "arrivals-aw", url: "https://www.ata.aw/" },
  { id: "arrivals-aw-2", url: "https://tourismanalytics.com/aruba-statistics.html" },
  { id: "arrivals-cw", url: "https://www.curacaotouristboard.com/monthly-statistics/" },
  { id: "arrivals-cw-2", url: "https://tourismanalytics.com/curacao-statistics.html" },
  { id: "cpi-bq", url: "https://www.cbs.nl/nl-nl/dossier/caribisch-nederland" },
];
// Aruba fuel: the government posts "prijsnan maximo <date>" pages; find the newest from the homepage
try {
  const home = await get("https://www.gobierno.aw/");
  const link = anchors(home, "https://www.gobierno.aw/").find((a) => /prijsnan-maximo/i.test(a.url));
  if (link) PAGES.push({ id: "fuel-aw", url: link.url });
} catch (e) { console.log("err  gobierno.aw home", e.message); }

const texts = [];
for (const p of PAGES) {
  try {
    const html = await get(p.url);
    const txt = pageText(html, 7000);
    texts.push(`### ${p.id} (${p.url})\n${txt}`);
    console.log(`page ${p.id}: ${txt.length} chars`);
  } catch (e) { console.log(`err  page ${p.id}: ${e.message}`); }
}

const SYSTEM = `You extract the latest official economic indicator values from page text for a news ticker. Be strict: only report a value that is explicitly stated in the text, with the period it refers to. Never estimate or compute. If a value is not present, return null for it.
Return ONLY JSON: {"cpi-aw": {"value": "<number as string>", "period": "<e.g. Sep 2026>", "change": null} | null, "cpi-cw": ..., "arrivals-aw": ..., "arrivals-cw": ..., "fuel-aw": ..., "cpi-bq": ...}
Definitions:
- cpi-aw: Aruba twelve-month (year-on-year) inflation or CPI change in %, latest month (CBS Aruba text).
- cpi-cw: Curaçao year-on-year inflation rate in %, latest month in the table (CBS Curaçao).
- arrivals-aw: Aruba stay-over (stopover) visitors, latest month, year-on-year % change (e.g. "+9.8"). Prefer ata.aw; else tourismanalytics headline.
- arrivals-cw: Curaçao stay-over visitors, latest month, year-on-year % change. Prefer CTB; else tourismanalytics headline.
- fuel-aw: Aruba maximum price of gasoline (gasolin / unleaded) per liter in AWG, from the "prijsnan maximo" page, with the date as period.
- cpi-bq: Bonaire year-on-year consumer price change in %, latest quarter, if stated.
Use "+" or "-" sign for % changes. value must be a plain number string like "3.4" or "+9.8".`;

if (texts.length && !DRY) {
  try {
    const j = await askJson(client, { model: MODEL, system: SYSTEM, user: texts.join("\n\n"), max_tokens: 800 });
    for (const [k, v] of Object.entries(j)) if (v && v.value != null && v.value !== "") { results[k] = { value: String(v.value), period: v.period || null, change: v.change ?? null }; console.log("ok  ", k, v.value, v.period); }
  } catch (e) {
    console.log("err  claude:", e.message.slice(0, 200));
    if (isBilling(e)) process.exitCode = 2;
  }
}

// 3. Merge: new value if found, else keep previous
const now = new Date().toISOString();
const items = DEFS.map((d) => {
  const r = results[d.id];
  const p = prevById[d.id];
  const base = { id: d.id, en: d.en, nl: d.nl, unit: d.unit, band: !!d.band, source: d.source, url: d.url, note_en: d.note_en || null, note_nl: d.note_nl || null };
  if (d.fixed) return { ...base, value: d.fixed, period: null, updated_at: now };
  if (r) return { ...base, value: r.value, period: r.period || null, change: r.change || null, updated_at: now };
  if (p?.value) return { ...base, value: p.value, period: p.period || null, change: p.change || null, updated_at: p.updated_at || null };
  return { ...base, value: null, period: null, updated_at: null };
});
const out = { updated_at: now, items };
if (!DRY) fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n");
console.log(`done: ${items.filter((i) => i.value).length}/${items.length} indicators have a value${DRY ? " (dry run)" : ""}`);
