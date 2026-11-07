import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Ticker, Masthead, Footer } from "@/components/Chrome";
import { fmtDate } from "@/lib/data";
import { analysisFor } from "@/lib/analysis";
import { isLang, extra, type Lang } from "@/lib/i18n";

export default async function AuthorPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  await connection();
  const { lang: raw, slug } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;
  const x = extra[lang];
  const list = (await analysisFor(lang)).filter((a) => a.author.slug === slug);
  if (!list.length) notFound();
  const au = list[0].author;
  return (
    <>
      <Ticker lang={lang} />
      <Masthead lang={lang} path={`/analysis/author/${slug}`} />
      <main className="wrap page">
        <nav className="crumbs" aria-label="Breadcrumb"><a href={`/${lang}`}>Home</a><span>/</span><a href={`/${lang}/analysis`}>{x.analysis}</a></nav>
        <header className="author-head">
          {au.photo && <img src={au.photo} alt="" className="avatar xl" />}
          <div>
            <h1>{au.name}</h1>
            {au.title && <p className="title">{au.title}</p>}
            {au.bio && <p className="bio">{au.bio}</p>}
          </div>
        </header>
        <section className="feed" style={{ maxWidth: 820 }}>
          {list.map((a) => (
            <article className="fitem" key={a.id}>
              <div className="kicker"><span className="tag-aruba">{x.guest}</span><span className="sep">/</span><span style={{ color: "var(--muted)" }}>{fmtDate(a.published_at, lang)}</span></div>
              <h3><a href={`/${lang}/analysis/${a.slug}`}>{a.title}</a></h3>
              <p>{a.standfirst}</p>
            </article>
          ))}
        </section>
      </main>
      <Footer lang={lang} />
    </>
  );
}
