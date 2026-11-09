import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Ticker, Masthead, Footer, Newsletter } from "@/components/Chrome";
import { isLang, t, type Lang } from "@/lib/i18n";

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  await connection();
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;
  const d = t(lang);
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
        <Newsletter lang={lang} />
      </main>
      <Footer lang={lang} />
    </>
  );
}
