import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Ticker, Masthead, Footer, Newsletter } from "@/components/Chrome";
import { allSources } from "@/lib/data";
import { isLang, ISLANDS, t, type Lang } from "@/lib/i18n";

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  await connection();
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;
  const d = t(lang);
  const sources = allSources();
  return (
    <>
      <Ticker lang={lang} />
      <Masthead lang={lang} path="/about" />
      <main className="wrap page">
        <div className="rule-h"><h2>{d.aboutTitle}</h2></div>
        <div className="steps">
          {d.aboutSteps.map(([title, desc], i) => (
            <div className="step" key={title}>
              <span className="num">{i + 1}</span>
              <span className="t">{title}</span>
              <span className="d">{desc}</span>
            </div>
          ))}
        </div>
        <section className="band" id="sources">
          <div className="wrap inner">
            <h2>{d.sourcesMonitored}</h2>
            <div className="cols">
              {ISLANDS.map((i) => (
                <div className="col" key={i}>
                  <h3 className="label-h" style={{ color: `var(--${i})`, borderColor: `var(--${i})` }}>{d.islands[i]}</h3>
                  <div className="chips">{sources.filter((s) => s.island === i).map((s) => <span key={s.id}>{s.name}</span>)}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <Newsletter lang={lang} />
      </main>
      <Footer lang={lang} />
    </>
  );
}
