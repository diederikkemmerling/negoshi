#!/usr/bin/env node
/**
 * Negoshi content pipeline.
 * 1. Fetch every source feed in data/sources.json (RSS where available).
 * 2. Skip items already in data/items.json (by source URL) or older than LOOKBACK_HOURS.
 * 3. Ask Claude to (a) decide if the item is business / economy / politics for the ABC islands,
 *    (b) tag island + topic, (c) write an ORIGINAL brief in English and Dutch: title, standfirst,
 *    key points, 2-3 short paragraphs. No sentence copied from the source.
 * 4. Append accepted items to data/items.json (newest first, capped at MAX_ITEMS).
 *
 * Run: ANTHROPIC_API_KEY=... node scripts/pipeline.mjs
 * The GitHub Action commits the updated JSON; Vercel redeploys on push.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import Parser from "rss-parser";
import Anthropic from "@anthropic-ai/sdk";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const SOURCES = JSON.parse(fs.readFileSync(path.join(ROOT, "data/sources.json"), "utf8"));
const ITEMS_PATH = path.join(ROOT, "data/items.json");
const items = JSON.parse(fs.readFileSync(ITEMS_PATH, "utf8"));

const LOOKBACK_HOURS = Number(process.env.LOOKBACK_HOURS || 36);
const MAX_ITEMS = Number(process.env.MAX_ITEMS || 400);
const MAX_NEW_PER_RUN = Number(process.env.MAX_NEW_PER_RUN || 25);
const MODEL = process.env.NEGOSHI_MODEL || "claude-sonnet-4-5";
const DRY = process.argv.includes("--dry");

const parser = new Parser({ timeout: 15000, headers: { "user-agent": "NegoshiBot/1.0 (+https://negoshi.news)" } });
const client = DRY ? null : new Anthropic();

const known = new Set(items.map((i) => i.source_url));
const cutoff = Date.now() - LOOKBACK_HOURS * 36e5;

function slugify(s) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80);
}

async function fetchCandidates() {
  const out = [];
  for (const src of SOURCES) {
    if (!src.feed) continue;
    try {
      const feed = await parser.parseURL(src.feed);
      for (const e of feed.items || []) {
        const url = e.link;
        if (!url || known.has(url)) continue;
        const ts = e.isoDate ? Date.parse(e.isoDate) : Date.now();
        if (ts < cutoff) continue;
        const text = (e.contentSnippet || e.content || e.summary || "").replace(/\s+/g, " ").slice(0, 4000);
        out.push({ src, url, title: e.title || "", text, published_at: new Date(ts).toISOString() });
      }
      console.log(`feed ok  ${src.id}: ${feed.items?.length ?? 0} entries`);
    } catch (err) {
      console.log(`feed err ${src.id}: ${err.message}`);
    }
  }
  return out;
}

const SYSTEM = `You are the editor of Negoshi, a business, economy and politics news service for Aruba, Curaçao and Bonaire.
You receive one article from a local source (often in Papiamento, Dutch or English).
Decide if it is relevant: business, economy, public finance, real estate, tourism economics, labour market, energy, infrastructure, trade, regulation, or island/kingdom politics with economic consequences. Reject crime, sport, lifestyle, entertainment, weather, accidents, obituaries, pure party politics with no policy content.
If relevant, write an ORIGINAL brief in plain business English and in Dutch. Never copy or closely paraphrase sentences from the source. State what happened, what changed and who it affects. Use figures only if they appear in the source; never estimate. Standfirst: 1-2 sentences. Key points: 3-4 bullets. Body: 2-3 short paragraphs (120-220 words total per language).
Return ONLY JSON matching: {"keep": boolean, "island": "aruba"|"curacao"|"bonaire", "topic": "business"|"economy"|"politics", "en": {"title","standfirst","keypoints":[...],"body":[...]}, "nl": {"title","standfirst","keypoints":[...],"body":[...]}}`;

async function brief(c) {
  if (DRY) return { keep: true, island: c.src.island, topic: "business", en: { title: c.title, standfirst: "", keypoints: [], body: [] }, nl: { title: c.title, standfirst: "", keypoints: [], body: [] } };
  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 1800,
    system: SYSTEM,
    messages: [{ role: "user", content: `Source: ${c.src.name} (${c.src.island}, language ${c.src.lang})\nURL: ${c.url}\nTitle: ${c.title}\n\nText:\n${c.text || "(no text in feed; judge from the title)"}` }],
  });
  const raw = msg.content.map((b) => (b.type === "text" ? b.text : "")).join("");
  const json = raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1);
  return JSON.parse(json);
}

const candidates = await fetchCandidates();
console.log(`${candidates.length} new candidates`);
let added = 0;
for (const c of candidates.slice(0, MAX_NEW_PER_RUN * 3)) {
  if (added >= MAX_NEW_PER_RUN) break;
  try {
    const r = await brief(c);
    if (!r.keep) { console.log(`skip     ${c.src.id}: ${c.title.slice(0, 60)}`); continue; }
    const id = crypto.createHash("sha1").update(c.url).digest("hex").slice(0, 12);
    const slug = `${slugify(r.en.title)}-${id.slice(0, 6)}`;
    items.unshift({
      id, slug, island: r.island || c.src.island, topic: r.topic,
      published_at: c.published_at, source_id: c.src.id, source_name: c.src.name, source_url: c.url,
      also_covered: [], en: r.en, nl: r.nl,
    });
    known.add(c.url);
    added++;
    console.log(`added    ${c.src.id}: ${r.en.title}`);
  } catch (err) {
    console.log(`error    ${c.src.id}: ${err.message}`);
  }
}

// once real items exist, drop the sample seed
const live = items.filter((i) => !i.sample);
const final = (live.length >= 6 ? live : items).sort((a, b) => (a.published_at < b.published_at ? 1 : -1)).slice(0, MAX_ITEMS);
if (!DRY) fs.writeFileSync(ITEMS_PATH, JSON.stringify(final, null, 2) + "\n");
console.log(`done: ${added} added, ${final.length} items total${DRY ? " (dry run, nothing written)" : ""}`);
