import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Ticker, Masthead, Footer } from "@/components/Chrome";
import { allReports, fmtDate } from "@/lib/data";
import { isLang, ISLAND_COLOR, t, type Lang } from "@/lib/i18n";

export default async function ReportsPage({ params }: { params: Promise<{ lang: string }> }) {
  await connection();
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;
  const d = t(lang);
  const reports = allReports();
  return (
    <>
      <Ticker lang={lang} />
      <Masthead lang={lang} path="/reports" />
      <main className="wrap page">
        <div className="rule-h">
          <h2>{d.reportsLibrary}</h2>
          <span className="sub">{d.reportsSub}</span>
        </div>
        {reports.some((r) => r.sample) && <span className="sample">{d.sampleNotice}</span>}
        <div className="reports">
          {reports.map((r) => (
            <a key={r.id} href={r.url} target="_blank" rel="noopener" className="rcard">
              <div className="cover" style={{ background: ISLAND_COLOR[r.island] }}>
                <span className="k">{d.islands[r.island]} · {r[lang].category}</span>
                <span className="t">{r[lang].title}</span>
              </div>
              <span className="m">{r.publisher} · {fmtDate(r.published_at, lang)} · PDF</span>
            </a>
          ))}
        </div>
      </main>
      <Footer lang={lang} />
    </>
  );
}
