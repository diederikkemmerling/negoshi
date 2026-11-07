import { notFound } from "next/navigation";
import { connection } from "next/server";
import type { Metadata } from "next";
import { Ticker, Masthead, Footer } from "@/components/Chrome";
import { PenArt } from "@/components/Art";
import { fmtDate } from "@/lib/data";
import { analysisBySlugFor, ORIGINAL_NOTE } from "@/lib/analysis";
import { isLang, t, extra, type Lang } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLang(lang)) return {};
  const a = await analysisBySlugFor(lang, slug);
  if (!a) return {};
  return { title: `${a.title} | Negoshi`, description: a.standfirst, openGraph: { title: a.title, description: a.standfirst, images: a.cover ? [a.cover] : undefined } };
}

export default async function AnalysisArticle({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  await connection();
  const { lang: raw, slug } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;
  const a = await analysisBySlugFor(lang, slug);
  if (!a) notFound();
  const d = t(lang);
  const x = extra[lang];
  const note = a.lang !== lang ? ORIGINAL_NOTE[lang][a.lang] : "";
  return (
    <>
      <Ticker lang={lang} />
      <Masthead lang={lang} path={`/analysis/${a.slug}`} />
      <main className="wrap page">
        <div className="article">
          <article className="art-body">
            <nav className="crumbs" aria-label="Breadcrumb"><a href={`/${lang}`}>Home</a><span>/</span><a href={`/${lang}/analysis`}>{x.analysis}</a></nav>
            {a.sample && <span className="sample">{d.sampleNotice}</span>}
            <div className="kicker"><span className="tag-aruba">{x.guest}</span></div>
            <h1 lang={a.lang}>{a.title}</h1>
            <p className="standfirst" lang={a.lang}>{a.standfirst}</p>
            <div className="byline">
              {a.author.photo && <img src={a.author.photo} alt="" className="avatar" />}
              <span>{a.author.slug ? <a href={`/${lang}/analysis/author/${a.author.slug}`}><b style={{ color: "var(--ink)" }}>{a.author.name}</b></a> : <b style={{ color: "var(--ink)" }}>{a.author.name}</b>}{a.author.title ? `, ${a.author.title}` : ""}</span>
              <span>{d.published} {fmtDate(a.published_at, lang)}</span>
              {note && <span>{note}</span>}
            </div>
            {a.cover ? <div className="art photo"><img src={a.cover} alt="" /></div> : <div className="art"><PenArt seed={a.slug} /></div>}
            {a.html
              ? <div className="prose rich" lang={a.lang} dangerouslySetInnerHTML={{ __html: a.html }} />
              : <div className="prose">{(a.paragraphs || []).map((p, i) => <p key={i}>{p}</p>)}</div>}
            {(a.author.bio || a.author.photo) && (
              <div className="keypoints author-box">
                {a.author.photo && <img src={a.author.photo} alt="" className="avatar lg" />}
                <div>
                  <span className="k">{lang === "nl" ? "Over de auteur" : "About the author"}</span>
                  <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6 }}>{a.author.bio}</p>
                  {a.author.slug && <a href={`/${lang}/analysis/author/${a.author.slug}`} style={{ fontSize: 14 }}>{lang === "nl" ? "Meer van deze auteur →" : "More from this author →"}</a>}
                </div>
              </div>
            )}
          </article>
          <aside className="side">
            <div className="box sand">
              <h2>{x.contribute}</h2>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55 }}>{x.contributeSub}</p>
              <a className="btn" href={`/${lang}/analysis#contribute`} style={{ alignSelf: "flex-start" }}>{x.contribute}</a>
            </div>
          </aside>
        </div>
      </main>
      <Footer lang={lang} />
    </>
  );
}
