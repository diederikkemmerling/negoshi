import { allItems, loc } from "@/lib/data";
import { LANGS } from "@/lib/i18n";

const SITE = "https://negoshi.news";
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Google News sitemap: briefs from the last 48 hours, in every language. */
export async function GET() {
  const since = Date.now() - 48 * 36e5;
  const items = allItems().filter((i) => !i.sample && Date.parse(i.published_at) > since);
  const urls = items.flatMap((i) => LANGS.map((lang) => `<url><loc>${SITE}/${lang}/brief/${i.slug}</loc><news:news><news:publication><news:name>Negoshi</news:name><news:language>${lang}</news:language></news:publication><news:publication_date>${new Date(i.published_at).toISOString()}</news:publication_date><news:title>${esc(loc(i, lang).title)}</news:title></news:news></url>`));
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n${urls.join("\n")}\n</urlset>`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=600, s-maxage=600" } });
}
