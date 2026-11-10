#!/usr/bin/env node
/**
 * Negoshi content pipeline.
 * 1. Collect candidate article URLs per source: RSS feed when it exists, otherwise the
 *    source's listing pages (HTML) filtered by a URL pattern.
 * 2. Skip URLs already published (data/items.json) or already judged (data/seen.json).
 * 3. Fetch the article page, extract title / date / text.
 * 4. Ask Claude to (a) decide if the item is business / economy / politics for the ABC islands,
 *    (b) tag island + topic, (c) write an ORIGINAL brief in English and Dutch.
 * 5. Append accepted items to data/items.json (newest first, capped at MAX_ITEMS).
 *
 * Run: ANTHROPIC_API_KEY=... node scripts/pipeline.mjs [--dry]
 * The GitHub Action commits the updated JSON; Vercel redeploys on push.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import Parser from "rss-parser";
import Anthropic from "@anthropic-ai/sdk";
import { askJson } from "./util.mjs";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const SOURCES = JSON.parse(fs.readFileSync(path.join(ROOT, "data/sources.json"), "utf8"));
const ITEMS_PATH = path.join(ROOT, "data/items.json");
const SEEN_PATH = path.join(ROOT, "data/seen.json");
const items = JSON.parse(fs.readFileSync(ITEMS_PATH, "utf8"));
const seen = fs.existsSync(SEEN_PATH) ? JSON.parse(fs.readFileSync(SEEN_PATH, "utf8")) : {};

const LOOKBACK_HOURS = Number(process.env.LOOKBACK_HOURS || 48);
const MAX_ITEMS = Number(process.env.MAX_ITEMS || 400);
const MAX_NEW_PER_RUN = Number(process.env.MAX_NEW_PER_RUN || 20);
const MAX_JUDGED_PER_RUN = Number(process.env.MAX_JUDGED_PER_RUN || 45);
const MAX_PER_SOURCE = Number(process.env.MAX_PER_SOURCE || 12);
const MODEL = process.env.NEGOSHI_MODEL || "claude-sonnet-5-5";
const DRY = process.argv.includes("--dry");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36 NegoshiBot/1.0 (+https://negoshi.news)";

const parser = new Parser({ timeout: 15000, headers: { "user-agent": UA } });
const client = DRY ? null : new Anthropic();

const known = new Set(items.map((i) => i.source_url));
const cutoff = Date.now() - LOOKBACK_HOURS * 36e5;

function slugify(s) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80);
}

async function get(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 20000);
  try {
    const r = await fetch(url, { headers: { "user-agent": UA, accept: "text/html,application/xhtml+xml,*/*" }, redirect: "follow", signal: ctrl.signal });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.text();
  } finally {
    clearTimeout(t);
  }
}

const decode = (s) =>
  s.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, e) => {
    if (e[0] === "#") return String.fromCodePoint(parseInt(e[1] === "x" ? e.slice(2) : e.slice(1), e[1] === "x" ? 16 : 10));
    return { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", eacute: "é", egrave: "è", ccedil: "ç", uuml: "ü", ouml: "ö", euml: "ë", iuml: "ï", aacute: "á", iacute: "í", oacute: "ó", uacute: "ú", ntilde: "ñ", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", hellip: "…", mdash: "—", ndash: "–" }[e.toLowerCase()] ?? m;
  });
const strip = (html) => decode(html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<!--[\s\S]*?-->/gi, "").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
const meta = (html, name) => {
  const re = new RegExp(`<meta[^>]+(?:property|name)=["']${name}["'][^>]+content=["']([^"']*)["']|<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${name}["']`, "i");
  const m = html.match(re);
  return m ? decode(m[1] || m[2] || "") : "";
};

/** Extract title, published date and readable text from an article page. */
function extractArticle(html) {
  const title = meta(html, "og:title") || strip(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || "") || strip(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "");
  const dateRaw = meta(html, "article:published_time") || meta(html, "og:updated_time") || meta(html, "date") || meta(html, "DCTERMS.issued") || (html.match(/<time[^>]+datetime=["']([^"']+)["']/i)?.[1] ?? "");
  const ts = dateRaw ? Date.parse(dateRaw) : NaN;
  // prefer <article> / <main>, else the whole body
  const region = html.match(/<article[\s\S]*?<\/article>/i)?.[0] || html.match(/<main[\s\S]*?<\/main>/i)?.[0] || html;
  const paras = [...region.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map((m) => strip(m[1])).filter((p) => p.length > 40);
  let text = paras.join("\n");
  if (text.length < 300) text = (meta(html, "og:description") || meta(html, "description")) + "\n" + strip(region).slice(0, 4000);
  return { title: title.trim(), published_at: Number.isFinite(ts) ? new Date(ts).toISOString() : null, text: text.slice(0, 5000) };
}

/** Candidate URLs from an RSS feed. */
async function fromFeed(src) {
  const feed = await parser.parseURL(src.feed);
  const out = [];
  for (const e of feed.items || []) {
    const url = e.link;
    if (!url) continue;
    const ts = e.isoDate ? Date.parse(e.isoDate) : NaN;
    if (Number.isFinite(ts) && ts < cutoff) continue;
    out.push({ url, title: e.title || "", published_at: Number.isFinite(ts) ? new Date(ts).toISOString() : null, text: (e.contentSnippet || e.content || e.summary || "").replace(/\s+/g, " ").slice(0, 4000) });
  }
  return out;
}

/** Candidate URLs from HTML listing pages, filtered by src.pattern (regex on the absolute URL). */
async function fromListings(src) {
  const re = new RegExp(src.pattern, "i");
  const urls = new Set();
  for (const page of src.listings || []) {
    try {
      const html = await get(page);
      for (const m of html.matchAll(/href=["']([^"'#?]+)/gi)) {
        let u = m[1];
        try { u = new URL(u, page).toString(); } catch { continue; }
        if (re.test(u)) urls.add(u.replace(/\/$/, ""));
      }
    } catch (err) {
      console.log(`list err ${src.id} ${page}: ${err.message}`);
    }
  }
  // Newest first: listing pages often show older items first. When URLs end in a numeric id
  // (e.g. noticiacla.com/news/42243) sort on that id; otherwise keep page order.
  const list = [...urls];
  const num = (u) => Number(u.match(/(\d+)$/)?.[1] ?? NaN);
  if (list.length && list.every((u) => Number.isFinite(num(u)))) list.sort((a, b) => num(b) - num(a));
  return list.map((url) => ({ url, title: "", published_at: null, text: "" }));
}

async function fetchCandidates() {
  const out = [];
  for (const src of SOURCES) {
    if (!src.feed && !src.listings) continue;
    let list = [];
    try {
      if (src.feed) {
        try { list = await fromFeed(src); } catch (err) { console.log(`feed err ${src.id}: ${err.message}`); }
      }
      if (!list.length && src.listings) list = await fromListings(src);
    } catch (err) {
      console.log(`src err  ${src.id}: ${err.message}`);
    }
    const fresh = list.filter((c) => !known.has(c.url) && !seen[c.url]).slice(0, MAX_PER_SOURCE);
    console.log(`source   ${src.id}: ${list.length} found, ${fresh.length} new`);
    for (const c of fresh) out.push({ src, ...c });
  }
  return out;
}

async function hydrate(c) {
  if (c.text.length > 600 && c.title) return c;
  const html = await get(c.url);
  const a = extractArticle(html);
  return { ...c, title: c.title || a.title, published_at: c.published_at || a.published_at, text: a.text || c.text };
}

const SYSTEM = `You are the editor of Negoshi, a business, economy and politics news service for Aruba, Curaçao and Bonaire.
You receive one article from a local source (often in Papiamento, Dutch or English).
Decide if it is relevant: business, economy, public finance, real estate, tourism economics, labour market, energy, infrastructure, trade, regulation, or island/kingdom politics with economic consequences. Reject crime, sport, lifestyle, entertainment, weather, accidents, obituaries, advertorials, vacancies, pure party politics with no policy content. Reject anything that is not about Aruba, Curaçao, Bonaire or the Kingdom's relation to them.
Island: the island the story is mainly about (a Kingdom-wide or Caribbean Netherlands story about Bonaire is "bonaire"; a CBCS or Cft story mainly about Curaçao is "curacao").
If relevant, write an ORIGINAL brief in plain business English and in Dutch. Never copy or closely paraphrase sentences from the source. State what happened, what changed and who it affects. Use figures only if they appear in the source; never estimate. Standfirst: 1-2 sentences. Key points: 3-4 bullets. Body: 2-3 short paragraphs (120-220 words total per language).
Return ONLY JSON matching: {"keep": boolean, "island": "aruba"|"curacao"|"bonaire", "topic": "business"|"economy"|"politics", "en": {"title","standfirst","keypoints":[...],"body":[...]}, "nl": {"title","standfirst","keypoints":[...],"body":[...]}}`;


// Duplicate guard: the same story often appears twice (two outlets, or one site publishing a
// press release under two URLs). Compare English titles with recent briefs on the same island.
const STOP = new Set(["the","a","an","of","for","to","in","on","and","or","as","at","by","with","from","is","are","be","its","new"]);
const words = (t) => new Set(String(t || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9% ]+/g, " ").split(/\s+/).filter((w) => w && !STOP.has(w)));
function similarity(a, b) {
  const A = words(a), B = words(b);
  if (!A.size || !B.size) return 0;
  let n = 0;
  for (const w of A) if (B.has(w)) n++;
  return n / Math.min(A.size, B.size);
}
const near = (a, b) => a.island === b.island && Math.abs(Date.parse(a.published_at) - Date.parse(b.published_at)) < 72 * 36e5 && similarity(a.en?.title, b.en?.title) >= 0.75;
function findDuplicate(title, island, whenIso) {
  const probe = { island, published_at: whenIso || new Date().toISOString(), en: { title } };
  return items.find((i) => !i.sample && near(i, probe));
}
/** Drops later near-duplicates already in the feed; keeps the first-published brief. */
function pruneDuplicates() {
  const live = items.filter((i) => !i.sample).sort((a, b) => (a.published_at < b.published_at ? -1 : 1));
  const drop = new Set();
  for (let x = 0; x < live.length; x++) {
    if (drop.has(live[x].id)) continue;
    for (let y = x + 1; y < live.length; y++) {
      if (drop.has(live[y].id) || !near(live[x], live[y])) continue;
      drop.add(live[y].id);
      (live[x].also_covered ||= []).push(live[y].source_url);
      console.log(`dedupe   ${live[y].en.title} = ${live[x].en.title}`);
    }
  }
  if (drop.size) { const keep = items.filter((i) => !drop.has(i.id)); items.length = 0; items.push(...keep); }
  return drop.size;
}


/** Headlines already published in the last 72h, so Claude can spot the same story told differently. */
function recentList() {
  const since = Date.now() - 72 * 36e5;
  const recent = items.filter((i) => !i.sample && Date.parse(i.published_at) > since).slice(0, 80);
  if (!recent.length) return "";
  return `\n\nALREADY PUBLISHED (last 72 hours):\n${recent.map((i) => `${i.id} | ${i.island} | ${i.en.title}`).join("\n")}\n\nIf this article reports the same news event as one of these (same decision, announcement, figure or incident, even if worded differently or with a different angle), do not write a brief: reply only with {"keep": false, "duplicate_of": "<id>"}. A genuinely new development on the same topic is not a duplicate.`;
}

/** Semantic clean-up: asks Claude which recent briefs cover the same news event and keeps only the first. */
async function semanticDedupe() {
  if (DRY) return 0;
  const since = Date.now() - 72 * 36e5;
  const recent = items.filter((i) => !i.sample && Date.parse(i.published_at) > since);
  if (recent.length < 2) return 0;
  let groups;
  try {
    groups = await askJson(client, {
      model: MODEL,
      max_tokens: 4000,
      system: "You find duplicate news briefs. Two briefs are duplicates when they report the same news event (same decision, announcement, figure or incident), even if worded differently or from a different outlet. Follow-ups with genuinely new facts are not duplicates. Reply with JSON only.",
      user: `Briefs (id | island | published | title):\n${recent.map((i) => `${i.id} | ${i.island} | ${i.published_at.slice(0, 16)} | ${i.en.title}`).join("\n")}\n\nReturn {"groups": [["id1","id2"], ...]} listing only groups of 2 or more duplicates. Return {"groups": []} if there are none. Output the JSON only, no explanation.`,
    });
  } catch (err) {
    console.log(`dedupe check failed: ${String(err.message || err).slice(0, 200)}`);
    return 0;
  }
  const byId = new Map(items.map((i) => [i.id, i]));
  const drop = new Set();
  for (const g of groups?.groups || []) {
    const members = g.map((id) => byId.get(id)).filter(Boolean).sort((a, b) => (a.published_at < b.published_at ? -1 : 1));
    if (members.length < 2) continue;
    const [first, ...rest] = members;
    for (const m of rest) {
      drop.add(m.id);
      (first.also_covered ||= []).push(m.source_url);
      console.log(`dedupe   ${m.en.title} = ${first.en.title}`);
    }
  }
  if (drop.size) { const keep = items.filter((i) => !drop.has(i.id)); items.length = 0; items.push(...keep); }
  return drop.size;
}

async function brief(c) {
  if (DRY) return { keep: true, island: c.src.island, topic: "business", en: { title: c.title, standfirst: "", keypoints: [], body: [] }, nl: { title: c.title, standfirst: "", keypoints: [], body: [] } };
  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 1800,
    system: SYSTEM,
    messages: [{ role: "user", content: `Source: ${c.src.name} (${c.src.island}, language ${c.src.lang})\nURL: ${c.url}\nTitle: ${c.title}\n\nText:\n${c.text || "(no text; judge from the title)"}${recentList()}` }],
  });
  const raw = msg.content.map((b) => (b.type === "text" ? b.text : "")).join("");
  const json = raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1);
  return JSON.parse(json);
}

const candidates = await fetchCandidates();
console.log(`${candidates.length} new candidates`);
let added = 0, judged = 0, billingError = false;
for (const c0 of candidates) {
  if (added >= MAX_NEW_PER_RUN || judged >= MAX_JUDGED_PER_RUN || billingError) break;
  try {
    const c = await hydrate(c0);
    if (c.published_at && Date.parse(c.published_at) < cutoff) { seen[c.url] = "old"; console.log(`old      ${c.src.id}: ${c.title.slice(0, 60)}`); continue; }
    if (!c.title && !c.text) { seen[c.url] = "empty"; console.log(`empty    ${c.src.id}: ${c.url}`); continue; }
    judged++;
    const r = await brief(c);
    if (r.duplicate_of) {
      seen[c.url] = "dup";
      const orig = items.find((i) => i.id === r.duplicate_of);
      if (orig) (orig.also_covered ||= []).includes(c.url) || orig.also_covered.push(c.url);
      console.log(`dup      ${c.src.id}: ${c.title.slice(0, 60)} = ${orig?.en.title || r.duplicate_of}`);
      continue;
    }
    seen[c.url] = r.keep ? "kept" : "skip";
    if (!r.keep) { console.log(`skip     ${c.src.id}: ${c.title.slice(0, 60)}`); continue; }
    const dup = findDuplicate(r.en?.title, r.island || c.src.island, c.published_at);
    if (dup) {
      seen[c.url] = "dup";
      (dup.also_covered ||= []).includes(c.url) || dup.also_covered.push(c.url);
      console.log(`dup      ${c.src.id}: ${r.en.title} = ${dup.en.title}`);
      continue;
    }
    const id = crypto.createHash("sha1").update(c.url).digest("hex").slice(0, 12);
    const slug = `${slugify(r.en.title)}-${id.slice(0, 6)}`;
    items.unshift({
      id, slug, island: r.island || c.src.island, topic: r.topic,
      published_at: c.published_at || new Date().toISOString(), source_id: c.src.id, source_name: c.src.name, source_url: c.url,
      also_covered: [], en: r.en, nl: r.nl,
    });
    known.add(c.url);
    added++;
    console.log(`added    ${c.src.id}: ${r.en.title}`);
  } catch (err) {
    const m = err.message || String(err);
    if (/credit balance|billing/i.test(m)) billingError = true;
    console.log(`error    ${c0.src.id}: ${m.slice(0, 300)}`);
  }
}

const pruned = pruneDuplicates() + (billingError ? 0 : await semanticDedupe());
if (pruned) console.log(`removed ${pruned} duplicate briefs`);

// once real items exist, drop the sample seed
const live = items.filter((i) => !i.sample);
const final = (live.length >= 6 ? live : items).sort((a, b) => (a.published_at < b.published_at ? 1 : -1)).slice(0, MAX_ITEMS);
if (!DRY) {
  fs.writeFileSync(ITEMS_PATH, JSON.stringify(final, null, 2) + "\n");
  // keep seen.json bounded: forget judged URLs after ~30 days worth of entries
  const seenKeys = Object.keys(seen);
  const trimmed = seenKeys.length > 3000 ? Object.fromEntries(seenKeys.slice(-3000).map((k) => [k, seen[k]])) : seen;
  fs.writeFileSync(SEEN_PATH, JSON.stringify(trimmed, null, 0) + "\n");
}
console.log(`done: ${added} added, ${judged} judged, ${final.length} items total${DRY ? " (dry run, nothing written)" : ""}${billingError ? " STOPPED: Anthropic credit balance too low" : ""}`);
if (billingError) process.exitCode = 2;
