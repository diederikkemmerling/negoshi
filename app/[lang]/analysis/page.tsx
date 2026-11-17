import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Ticker, Masthead, Footer } from "@/components/Chrome";
import { fmtDate } from "@/lib/data";
import { analysisFor } from "@/lib/analysis";
import { isLang, t, extra, type Lang, pick } from "@/lib/i18n";

export default async function AnalysisPage({ params }: { params: Promise<{ lang: string }> }) {
  await connection();
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;
  const d = t(lang);
  const x = extra[lang];
  const list = await analysisFor(lang);
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
              <article className={`fitem ${a.cover ? "with-cover" : ""}`} key={a.id}>
                {a.cover && <a href={`/${lang}/analysis/${a.slug}`} className="fcover"><img src={a.cover} alt="" loading="lazy" /></a>}
                <div>
                  <div className="kicker"><span className="tag-aruba">{x.guest}</span><span className="sep">/</span><span style={{ color: "var(--muted)" }}>{fmtDate(a.published_at, lang)}{a.lang !== lang ? ` · ${a.lang.toUpperCase()}` : ""}</span></div>
                  <h3><a href={`/${lang}/analysis/${a.slug}`}>{a.title}</a></h3>
                  <p>{a.standfirst}</p>
                  <div className="meta author-meta">
                    {a.author.photo && <img src={a.author.photo} alt="" className="avatar" />}
                    <span>{x.byAuthor} {a.author.slug ? <a href={`/${lang}/analysis/author/${a.author.slug}`}><b>{a.author.name}</b></a> : <b>{a.author.name}</b>}{a.author.title ? `, ${a.author.title}` : ""}</span>
                  </div>
                </div>
              </article>
            ))}
          </section>
          <aside className="side">
            <div className="box sand" id="contribute">
              <h2>{x.contribute}</h2>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "var(--text)" }}>{x.contributeSub}</p>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.6, color: "var(--text)" }}>
                <li>{pick(lang, "Own name and title, photo and short bio.", "Eigen naam en functie, foto en korte bio.", "Nombre y cargo propios, foto y biografía breve.")}</li>
                <li>{pick(lang, "600 to 1,200 words, English or Dutch.", "600 tot 1.200 woorden, Engels of Nederlands.", "De 600 a 1.200 palabras, en inglés o neerlandés.")}</li>
                <li>{pick(lang, "Editor approves before publication.", "Redactie keurt goed vóór publicatie.", "El editor aprueba antes de publicar.")}</li>
              </ul>
              <a className="btn" href="mailto:editor@negoshi.news?subject=Contributor%20access" style={{ alignSelf: "flex-start" }}>{pick(lang, "Request contributor access", "Vraag toegang aan", "Solicitar acceso como autor")}</a>
              <a href="/studio" style={{ fontSize: 13, color: "var(--muted)" }}>{pick(lang, "Already a contributor? Log in →", "Al auteur? Log in →", "¿Ya eres autor? Inicia sesión →")}</a>
            </div>
          </aside>
        </div>
      </main>
      <Footer lang={lang} />
    </>
  );
}
