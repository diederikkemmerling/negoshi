#!/usr/bin/env node
/**
 * Negoshi reports collector: finds new PDF publications from the islands' institutions and adds them
 * to data/reports.json (titles in EN + NL, category, island). Claude only classifies and translates titles;
 * the PDFs themselves are linked, never copied.
 *
 * Run: ANTHROPIC_API_KEY=... node scripts/reports.mjs [--dry]
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import Anthropic from "@anthropic-ai/sdk";
import { get, anchors, askJson, isBilling } from "./util.mjs";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const OUT = path.join(ROOT, "data/reports.json");
const SEEN_PATH = path.join(ROOT, "data/reports-seen.json");
const DRY = process.argv.includes("--dry");
const MODEL = process.env.NEGOSHI_MODEL_SMALL || "claude-haiku-5-5";
const MAX_NEW_PER_PUBLISHER = Number(process.env.MAX_NEW_PER_PUBLISHER || 8);
const MAX_REPORTS = 600;
const client = DRY ? null : new Anthropic();

const reports = JSON.parse(fs.readFileSync(OUT, "utf8"));
const seen = fs.existsSync(SEEN_PATH) ? JSON.parse(fs.readFileSync(SEEN_PATH, "utf8")) : {};
const firstRun = Object.keys(seen).length === 0;
const known = new Set(reports.map((r) => r.url));

const PDF = /\.pdf(\?|$)/i;
/**
 * Publisher config: listing pages, a pattern for document links, and an optional `follow` pattern for
 * sub-pages (newest first on the listing) that are scanned for documents too.
 */
const PUBLISHERS = [
  { id: "cba", name: "Centrale Bank van Aruba", island: "aruba",
    listings: ["https://www.cbaruba.org/monthly-bulletins/", "https://www.cbaruba.org/state-of-the-economy/", "https://www.cbaruba.org/economic-outlook/", "https://www.cbaruba.org/quarterly-economic-bulletins/", "https://www.cbaruba.org/press-releases/", "https://www.cbaruba.org/annual-statistical-digest-asd/", "https://www.cbaruba.org/tables-selected-economic-indicators/", "https://www.cbaruba.org/getDocumentList.do"],
    doc: /readBlob\.do\?id=\d+|\.pdf(\?|$)/i, follow: /cbaruba\.org\/(getDocument\.do|document\/)/i },
  { id: "cbcs", name: "CBCS", island: "curacao",
    listings: ["https://www.centralbank.cw/publications", "https://www.centralbank.cw/publications/press-releases", "https://www.centralbank.cw/publications/economic-bulletins", "https://www.centralbank.cw/publications/financial-stability-reports", "https://www.centralbank.cw/publications/research"],
    doc: PDF, follow: /centralbank\.cw\/publications\/[a-z-]+\/20\d\d\/[^/]+$/i },
  { id: "cbs-aw", name: "CBS Aruba", island: "aruba",
    listings: ["https://cbs.aw/wp/index.php/category/business-economy/", "https://cbs.aw/wp/index.php/category/business-economy/inflation-prices/reports-cpi/", "https://cbs.aw/wp/index.php/category/business-economy/inflation-prices/press-release-cpi/press-releases-cpi-english/", "https://cbs.aw/wp/index.php/category/population/", "https://cbs.aw/wp/index.php/category/labour/"],
    doc: PDF, follow: /cbs\.aw\/wp\/index\.php\/20\d\d\/\d\d\/\d\d\//i },
  { id: "cbs-cw", name: "CBS Curaçao", island: "curacao",
    listings: ["https://www.cbs.cw/", "https://www.cbs.cw/inflationprices", "https://www.cbs.cw/publications", "https://www.cbs.cw/press-releases", "https://digitallibrary.cbs.cw/"],
    doc: PDF, follow: /cbs\.cw\/[a-z0-9-]{20,}$/i },
  { id: "cft", name: "College financieel toezicht", island: "kingdom",
    listings: ["https://www.cft.cw/publicaties-zoeken/", "https://www.cft.cw/en/documents/"],
    doc: /cft\.cw\/(en\/)?publication\/[^/]+\/[^/]+\/?$|\.pdf(\?|$)/i, follow: /cft\.cw\/(en\/)?publication\/[^/]+\/?$/i, onePerPage: true },
  { id: "ctb", name: "Curaçao Tourist Board", island: "curacao",
    listings: ["https://www.curacaotouristboard.com/monthly-statistics/"], doc: PDF },
  { id: "ata", name: "Aruba Tourism Authority", island: "aruba",
    listings: ["https://www.ata.aw/knowledge-base"], doc: PDF, follow: /ata\.aw\/knowledge-base\/[^/]+$/i },
];

const ISLAND_HINT = (u, t) => (/aruba/i.test(u + t) ? "aruba" : /cura[cç]ao/i.test(u + t) ? "curacao" : /bonaire/i.test(u + t) ? "bonaire" : /sint[- ]maarten|st\.? ?maarten/i.test(u + t) ? "kingdom" : null);
const prettify = (u) => decodeURIComponent(u.split("/").filter(Boolean).pop() || "").replace(/\.pdf.*$/i, "").replace(/[-_]+/g, " ").trim();

async function collect(pub) {
  const found = new Map(); // url -> title
  const subpages = new Set();
  for (const page of pub.listings) {
    let html;
    try { html = await get(page); } catch (e) { console.log(`list err ${pub.id} ${page}: ${e.message}`); continue; }
    for (const a of anchors(html, page)) {
      if (pub.doc.test(a.url)) { if (!found.has(a.url)) found.set(a.url, a.text); }
      else if (pub.follow && pub.follow.test(a.url) && subpages.size < 10) subpages.add(a.url);
    }
  }
  for (const sp of subpages) {
    if (seen[sp]) continue; // sub-page already scanned on an earlier run
    try {
      const html = await get(sp);
      const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "").replace(/\s+/g, " ").trim();
      let took = 0;
      for (const a of anchors(html, sp)) if (pub.doc.test(a.url) && !found.has(a.url) && !(pub.onePerPage && took++)) found.set(a.url, a.text && a.text.length > 8 && !/download|pdf|english|dutch|nederlands|papiamentu/i.test(a.text) ? a.text : title);
      seen[sp] = "scanned";
    } catch (e) { console.log(`sub err  ${pub.id} ${sp}: ${e.message}`); }
  }
  const JUNK = /reproduction|disclaimer|privacy|cookie|terms of use|copyright|unusual transactions|reporting form/i;
  return [...found].map(([url, title]) => ({ url, title: (title || "").trim() || prettify(url) })).filter((d) => !JUNK.test(d.title));
}

const SYSTEM = `You curate a reports library for Negoshi, a business and economy news site for Aruba, Curaçao and Bonaire. You get a list of documents (publisher, link text, URL). For each, decide if it is a substantive publication worth listing: economic bulletins, statistical reports, press releases with data, annual reports, financial stability reports, supervisory advice, budgets, outlooks, tourism statistics. Drop forms, privacy statements, brochures, job vacancies, event flyers, duplicates in another language of the same document (keep the English one if present, else Dutch), and anything older than 2023 if a year is visible.
Return ONLY a JSON array, same order as input, one object per input: {"keep": boolean, "island": "aruba"|"curacao"|"bonaire"|"kingdom", "en": {"title": "<concise English title, include period e.g. 'Monthly Economic Bulletin, August 2026'>", "category": "<one of: Monetary, Statistics, Tourism, Supervision, Public finance, Annual report, Outlook, Policy>"}, "nl": {"title": "<Dutch title>", "category": "<Dutch: Monetair, Statistiek, Toerisme, Toezicht, Overheidsfinanciën, Jaarverslag, Vooruitzichten, Beleid>"}, "date": "<YYYY-MM-DD if a date or month is visible, else null>"}`;

let added = 0;
for (const pub of PUBLISHERS) {
  let docs = [];
  try { docs = await collect(pub); } catch (e) { console.log(`pub err  ${pub.id}: ${e.message}`); }
  const fresh = docs.filter((d) => !known.has(d.url) && !seen[d.url]);
  console.log(`${pub.id}: ${docs.length} documents, ${fresh.length} new`);
  const batch = fresh.slice(0, MAX_NEW_PER_PUBLISHER);
  // On the very first run, anything beyond the batch is archived silently so the library starts with recent items only.
  if (firstRun) for (const d of fresh.slice(MAX_NEW_PER_PUBLISHER)) seen[d.url] = "archived";
  if (!batch.length) continue;
  if (DRY) { batch.forEach((d) => console.log(`  would judge: ${d.title.slice(0, 70)} ${d.url}`)); continue; }
  try {
    const judged = await askJson(client, { model: MODEL, system: SYSTEM, user: JSON.stringify(batch.map((d) => ({ publisher: pub.name, text: d.title, url: d.url }))), max_tokens: 3000 });
    batch.forEach((d, i) => {
      const j = judged[i];
      seen[d.url] = j?.keep ? "kept" : "skip";
      if (!j?.keep) return;
      const id = crypto.createHash("sha1").update(d.url).digest("hex").slice(0, 10);
      reports.unshift({ id, island: j.island || ISLAND_HINT(d.url, d.title) || pub.island, publisher: pub.name, url: d.url, published_at: j.date || new Date().toISOString().slice(0, 10), en: j.en, nl: j.nl });
      known.add(d.url);
      added++;
      console.log(`  added: ${j.en.title}`);
    });
  } catch (e) {
    console.log(`judge err ${pub.id}: ${e.message.slice(0, 200)}`);
    if (isBilling(e)) { process.exitCode = 2; break; }
  }
}

const live = reports.filter((r) => !r.sample);
const final = (live.length >= 4 ? live : reports).sort((a, b) => (a.published_at < b.published_at ? 1 : -1)).slice(0, MAX_REPORTS);
if (!DRY) {
  fs.writeFileSync(OUT, JSON.stringify(final, null, 2) + "\n");
  fs.writeFileSync(SEEN_PATH, JSON.stringify(seen) + "\n");
}
console.log(`done: ${added} added, ${final.length} reports total${DRY ? " (dry run)" : ""}`);
