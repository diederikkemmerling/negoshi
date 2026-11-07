import { notFound } from "next/navigation";
import { connection } from "next/server";
import type { Metadata } from "next";
import { Ticker, Masthead, Footer } from "@/components/Chrome";
import { BarsArt, LineArt, ParliamentArt } from "@/components/Art";
import { allItems, itemBySlug, fmtDate, loc, itemsByIsland } from "@/lib/data";
import { isLang, LANGS, ISLAND_COLOR, t, type Lang } from "@/lib/i18n";

export function generateStaticParams() {
  return LANGS.flatMap((lang) => allItems().map((i) => ({ lang, slug: i.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params;
  const item = itemBySlug(slug);
  if (!item || !isLang(lang)) return {};
  return { title: `${loc(item, lang).title} · Negoshi`, description: loc(item, lang).standfirst };
}

export default async function BriefPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  await connection();
  const { lang: raw, slug } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;
  const item = itemBySlug(slug);
  if (!item) notFound();
  const d = t(lang);
  const l = loc(item, lang);
  const related = itemsByIsland(item.island).filter((i) => i.id !== item.id).slice(0, 3);

  return (
    <>
      <Ticker lang={lang} />
      <Masthead lang={lang} island={item.island} path={`/brief/${item.slug}`} />
      <main className="wrap page">
        <div className="article">
          <article className="art-body">
            <nav className="crumbs" aria-label="Breadcrumb">
              <a href={`/${lang}`}>Home</a><span>/</span>
              <a href={`/${lang}/${item.island}`}>{d.islands[item.island]}</a><span>/</span>
              <span>{d.topics[item.topic]}</span>
            </nav>
            {item.sample && <span className="sample">{d.sampleNotice}</span>}
            <div className="kicker"><span className={`tag-${item.island}`}>{d.islands[item.island]}</span><span className="sep">/</span><span style={{ color: "var(--muted)" }}>{d.topics[item.topic]}</span></div>
            <h1>{l.title}</h1>
            <p className="standfirst">{l.standfirst}</p>
            <div className="art">
              {item.topic === "business" ? <BarsArt accent={ISLAND_COLOR[item.island]} /> : item.topic === "economy" ? <LineArt accent={ISLAND_COLOR[item.island]} /> : <ParliamentArt accent={ISLAND_COLOR[item.island]} />}
            </div>
            <div className="byline">
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}><span className="n">N</span><b style={{ color: "var(--ink)" }}>{d.negoshiBrief}</b></span>
              <span>{d.published} {fmtDate(item.published_at, lang)}</span>
              <span>{Math.max(1, Math.round(l.body.join(" ").split(" ").length / 200))} {d.minRead}</span>
            </div>
            <div className="keypoints">
              <span className="k">{d.keyPoints}</span>
              <ul>{l.keypoints.map((k, i) => <li key={i}>{k}</li>)}</ul>
            </div>
            <div className="prose">
              {l.body.map((p, i) => <p key={i}>{p}</p>)}
              {item.sample && <p style={{ color: "var(--muted)", fontSize: 14 }}>{d.sampleBody}</p>}
            </div>
            <div className="srcbox">
              <div>
                <div className="k">{lang === "nl" ? "Originele bron" : "Original source"}</div>
                <div className="t">{item.source_name}</div>
                <div className="s">
                  {item.also_covered.length > 0 && <>{d.alsoCovered} {item.also_covered.join(", ")}. </>}
                  {lang === "nl" ? "Dit bericht is door Negoshi geschreven op basis van de publicatie; de brontekst is niet overgenomen." : "This brief was written by Negoshi from the publication; it does not reproduce the source text."}
                </div>
              </div>
              <a className="btn" href={item.source_url} target="_blank" rel="noopener">{d.readOriginal} →</a>
            </div>
          </article>
          <aside className="side">
            <div className="box dark">
              <span className="k">{d.islands[item.island]} · {lang === "nl" ? "maandagbrief" : "Monday brief"}</span>
              <h2>{lang === "nl" ? "Elke maandag de vijf berichten die ertoe doen." : "Every Monday: the five stories that matter."}</h2>
              <form action="/api/subscribe" method="post" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <input type="hidden" name="lang" value={lang} />
                <input type="hidden" name="island" value={item.island} />
                <input type="email" name="email" required placeholder="you@company.aw" aria-label={d.workEmail} />
                <button type="submit">{d.subscribeShort}</button>
              </form>
            </div>
            <div className="box">
              <h2>{lang === "nl" ? "Gerelateerd" : "Related"}</h2>
              {related.map((r) => (
                <a key={r.id} href={`/${lang}/brief/${r.slug}`} style={{ display: "flex", flexDirection: "column", gap: 4, paddingBottom: 12, borderBottom: "1px solid var(--line)" }}>
                  <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--muted)" }}>{d.topics[r.topic]}</span>
                  <span style={{ fontSize: 14, lineHeight: 1.4, fontWeight: 500 }}>{loc(r, lang).title}</span>
                </a>
              ))}
            </div>
          </aside>
        </div>
      </main>
      <Footer lang={lang} />
    </>
  );
}
