import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Ticker, Masthead, Footer } from "@/components/Chrome";
import { allAnalysis, fmtDate } from "@/lib/data";
import { isLang, t, extra, type Lang } from "@/lib/i18n";

export default async function AnalysisPage({ params }: { params: Promise<{ lang: string }> }) {
  await connection();
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;
  const d = t(lang);
  const x = extra[lang];
  const list = allAnalysis();
  return (
    <>
      <Ticker lang={lang} />
      <Masthead lang={lang} path="/analysis" />
      <main className="wrap page">
        <div className="rule-h">
          <h2>{x.analysis}</h2>
          <span className="sub">{x.analysisSub}</span>
        </div>
        {list.some((a) => a.sample) && <span className="sample">{d.sampleNotice}</span>}
        <div className="feed-wrap">
          <section className="feed">
            {list.map((a) => (
              <article className="fitem" key={a.id}>
                <div className="kicker"><span className="tag-aruba">{x.guest}</span><span className="sep">/</span><span style={{ color: "var(--muted)" }}>{fmtDate(a.published_at, lang)}</span></div>
                <h3><a href={`/${lang}/analysis/${a.slug}`}>{a[lang].title}</a></h3>
                <p>{a[lang].standfirst}</p>
                <div className="meta"><span>{x.byAuthor} <b>{a.author.name}</b>, {lang === "nl" ? a.author.title_nl : a.author.title_en}</span></div>
              </article>
            ))}
          </section>
          <aside className="side">
            <div className="box sand" id="contribute">
              <h2>{x.contribute}</h2>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "var(--text)" }}>{x.contributeSub}</p>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.6, color: "var(--text)" }}>
                <li>{lang === "nl" ? "Eigen naam en functie, foto en korte bio." : "Own name and title, photo and short bio."}</li>
                <li>{lang === "nl" ? "600 tot 1.200 woorden, Engels of Nederlands; Negoshi vertaalt." : "600 to 1,200 words, English or Dutch; Negoshi translates."}</li>
                <li>{lang === "nl" ? "Redactie keurt goed vóór publicatie." : "Editor approves before publication."}</li>
              </ul>
              <a className="btn" href="mailto:editor@negoshi.news?subject=Contributor%20access" style={{ alignSelf: "flex-start" }}>{lang === "nl" ? "Vraag toegang aan" : "Request contributor access"}</a>
            </div>
          </aside>
        </div>
      </main>
      <Footer lang={lang} />
    </>
  );
}
