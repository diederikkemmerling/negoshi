import { allItems, loc } from "@/lib/data";
import { isLang, t } from "@/lib/i18n";

const SITE = "https://negoshi.news";
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** RSS feed of the newest 50 briefs in one language (for readers, Buffer, Zapier and news aggregators). */
export async function GET(_req: Request, { params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) return new Response("Not found", { status: 404 });
  const d = t(lang);
  const items = allItems().filter((i) => !i.sample).slice(0, 50);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>Negoshi</title>
<link>${SITE}/${lang}</link>
<description>${esc(d.tagline)}</description>
<language>${lang}</language>
<atom:link href="${SITE}/${lang}/rss.xml" rel="self" type="application/rss+xml"/>
${items.map((i) => { const l = loc(i, lang); return `<item>
<title>${esc(l.title)}</title>
<link>${SITE}/${lang}/brief/${i.slug}</link>
<guid isPermaLink="true">${SITE}/${lang}/brief/${i.slug}</guid>
<pubDate>${new Date(i.published_at).toUTCString()}</pubDate>
<category>${esc(d.islands[i.island])}</category>
<description>${esc(l.standfirst)}</description>
</item>`; }).join("\n")}
</channel>
</rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=600, s-maxage=600" } });
}
