// Shared helpers for the Negoshi collectors (no dependencies).
export const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36 NegoshiBot/1.0 (+https://negoshi.news)";

export async function get(url, { timeout = 20000, accept = "text/html,application/xhtml+xml,*/*" } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeout);
  try {
    const r = await fetch(url, { headers: { "user-agent": UA, accept }, redirect: "follow", signal: ctrl.signal });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.text();
  } finally {
    clearTimeout(t);
  }
}

const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", eacute: "é", egrave: "è", ccedil: "ç", uuml: "ü", ouml: "ö", euml: "ë", iuml: "ï", aacute: "á", iacute: "í", oacute: "ó", uacute: "ú", ntilde: "ñ", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", hellip: "…", mdash: "—", ndash: "–" };
export const decode = (s) =>
  s.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, e) => {
    if (e[0] === "#") return String.fromCodePoint(parseInt(e[1] === "x" ? e.slice(2) : e.slice(1), e[1] === "x" ? 16 : 10));
    return ENT[e.toLowerCase()] ?? m;
  });

export const strip = (html) =>
  decode(html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<!--[\s\S]*?-->/gi, "").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();

/** Readable text of a page: main/article region if present, else whole body, capped. */
export function pageText(html, cap = 8000) {
  const region = html.match(/<main[\s\S]*?<\/main>/i)?.[0] || html.match(/<article[\s\S]*?<\/article>/i)?.[0] || html.replace(/<nav[\s\S]*?<\/nav>|<footer[\s\S]*?<\/footer>|<header[\s\S]*?<\/header>/gi, "");
  return strip(region).slice(0, cap);
}

/** All anchors on a page as { url, text }, resolved against base. */
export function anchors(html, base) {
  const out = [];
  for (const m of html.matchAll(/<a\b[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    let url;
    try { url = new URL(m[1], base).toString(); } catch { continue; }
    out.push({ url, text: strip(m[2]).slice(0, 200) });
  }
  return out;
}

/** Ask Claude for JSON. Returns the parsed object or throws. */
export async function askJson(client, { model, system, user, max_tokens = 4000 }) {
  const msg = await client.messages.create({ model, max_tokens, system, messages: [{ role: "user", content: user }] });
  const raw = msg.content.map((b) => (b.type === "text" ? b.text : "")).join("");
  const s = raw.indexOf("{"), a = raw.indexOf("[");
  const start = s < 0 ? a : a < 0 ? s : Math.min(s, a);
  const end = Math.max(raw.lastIndexOf("}"), raw.lastIndexOf("]"));
  return JSON.parse(raw.slice(start, end + 1));
}

export const isBilling = (err) => /credit balance|billing/i.test(err?.message || String(err));
