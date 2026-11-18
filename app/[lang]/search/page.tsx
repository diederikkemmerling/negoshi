import { notFound } from "next/navigation";
import { connection } from "next/server";
import type { Metadata } from "next";
import { Ticker, Masthead, Footer } from "@/components/Chrome";
import { FeedItem } from "@/components/Story";
import { allItems, loc, type Item } from "@/lib/data";
import { isLang, pick, type Lang } from "@/lib/i18n";

export const metadata: Metadata = { robots: { index: false } };

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

function search(q: string, lang: Lang): Item[] {
  const words = norm(q).split(/\s+/).filter((w) => w.length > 1);
  if (!words.length) return [];
  const scored: [Item, number][] = [];
  for (const it of allItems()) {
    if (it.sample) continue;
    const l = loc(it, lang);
    const title = norm(`${l.title} ${it.en.title}`);
    const all = norm(`${l.title} ${l.standfirst} ${l.keypoints.join(" ")} ${l.body.join(" ")} ${it.en.title} ${it.en.standfirst} ${it.island}`);
    if (!words.every((w) => all.includes(w))) continue;
    const score = words.reduce((s, w) => s + (title.includes(w) ? 3 : 1), 0) + Date.parse(it.published_at) / 1e13;
    scored.push([it, score]);
  }
  return scored.sort((a, b) => b[1] - a[1]).slice(0, 40).map((x) => x[0]);
}

export default async function SearchPage({ params, searchParams }: { params: Promise<{ lang: string }>; searchParams: Promise<{ q?: string }> }) {
  await connection();
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;
  const q = ((await searchParams).q || "").slice(0, 100);
  const results = search(q, lang);
  return (
    <>
      <Ticker lang={lang} />
      <Masthead lang={lang} path={`/search${q ? `?q=${encodeURIComponent(q)}` : ""}`} />
      <main className="wrap page">
        <div className="feed-wrap">
          <section className="feed">
            <form action={`/${lang}/search`} className="bigsearch" role="search">
              <input type="search" name="q" defaultValue={q} placeholder={pick(lang, "Search briefs", "Zoek berichten", "Buscar noticias")} aria-label={pick(lang, "Search", "Zoeken", "Buscar")} autoFocus />
              <button type="submit">{pick(lang, "Search", "Zoeken", "Buscar")}</button>
            </form>
            {q && <p className="hits">{results.length} {pick(lang, "results for", "resultaten voor", "resultados para")} “{q}”</p>}
            {results.map((it) => <FeedItem key={it.id} item={it} lang={lang} />)}
          </section>
        </div>
      </main>
      <Footer lang={lang} />
    </>
  );
}
