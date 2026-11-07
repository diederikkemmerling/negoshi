import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Ticker, Masthead, Footer } from "@/components/Chrome";
import { allAnalysis, analysisBySlug, fmtDate } from "@/lib/data";
import { isLang, LANGS, t, extra, type Lang } from "@/lib/i18n";

export function generateStaticParams() {
  return LANGS.flatMap((lang) => allAnalysis().map((a) => ({ lang, slug: a.slug })));
}

export default async function AnalysisArticle({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  await connection();
  const { lang: raw, slug } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;
  const a = analysisBySlug(slug);
  if (!a) notFound();
  const d = t(lang);
  const x = extra[lang];
  const l = a[lang];
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
            <h1>{l.title}</h1>
            <p className="standfirst">{l.standfirst}</p>
            <div className="byline">
              <span><b style={{ color: "var(--ink)" }}>{a.author.name}</b>, {lang === "nl" ? a.author.title_nl : a.author.title_en}</span>
              <span>{d.published} {fmtDate(a.published_at, lang)}</span>
            </div>
            <div className="prose">{l.body.map((p, i) => <p key={i}>{p}</p>)}</div>
            <div className="keypoints">
              <span className="k">{lang === "nl" ? "Over de auteur" : "About the author"}</span>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6 }}>{lang === "nl" ? a.author.bio_nl : a.author.bio_en}</p>
            </div>
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
