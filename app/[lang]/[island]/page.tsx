import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Ticker, Masthead, Footer } from "@/components/Chrome";
import { IslandShape } from "@/components/Logo";
import { FeedItem } from "@/components/Story";
import { itemsByIsland, sourcesByIsland } from "@/lib/data";
import { isIsland, isLang, ISLANDS, LANGS, ISLAND_COLOR, t, type Lang } from "@/lib/i18n";

export function generateStaticParams() {
  return LANGS.flatMap((lang) => ISLANDS.map((island) => ({ lang, island })));
}

export default async function IslandPage({ params }: { params: Promise<{ lang: string; island: string }> }) {
  await connection();
  const { lang: raw, island } = await params;
  if (!isLang(raw) || !isIsland(island)) notFound();
  const lang: Lang = raw;
  const d = t(lang);
  const items = itemsByIsland(island);
  const sources = sourcesByIsland(island);
  const now = new Date();
  const dayOf = (iso: string) => {
    const h = (now.getTime() - new Date(iso).getTime()) / 36e5;
    return h < 24 ? d.today : h < 48 ? d.yesterday : d.earlier;
  };
  const groups: Record<string, typeof items> = {};
  for (const it of items) (groups[dayOf(it.published_at)] ||= []).push(it);

  return (
    <>
      <Ticker lang={lang} />
      <Masthead lang={lang} island={island} path={`/${island}`} />
      <div className="ibanner" style={{ background: ISLAND_COLOR[island] }}>
        <div className="wrap in">
          <div>
            <span className="k">{d.islandSection}</span>
            <h1>{d.islands[island]}</h1>
            <div className="s">{d.sourcesLine(sources.length)}</div>
          </div>
          <IslandShape island={island} className="shape" />
          <a href={`/${lang}#subscribe`} className="btn">{d.subscribe}</a>
        </div>
      </div>
      <div className="wrap filters">
        <span className="chip on">{lang === "nl" ? "Alles" : "All"}</span>
        <span className="chip">{d.topics.business}</span>
        <span className="chip">{d.topics.economy}</span>
        <span className="chip">{d.topics.politics}</span>
        <span className="chip">{d.topics.reports}</span>
      </div>
      <main className="wrap page">
        <div className="feed-wrap">
          <section className="feed">
            {Object.entries(groups).map(([day, list]) => (
              <div key={day}>
                <div className="day">{day}</div>
                {list.map((it) => <FeedItem key={it.id} item={it} lang={lang} />)}
              </div>
            ))}
            {items.length === 0 && <p>{lang === "nl" ? "Nog geen berichten." : "No briefs yet."}</p>}
          </section>
          <aside className="side">
            <div className="box dark">
              <span className="k">{d.islands[island]} · {lang === "nl" ? "maandagbrief" : "Monday brief"}</span>
              <h2>{lang === "nl" ? `Elke maandag: de vijf berichten die ertoe doen voor ${d.islands[island]}.` : `Every Monday: the five stories that matter for business in ${d.islands[island]}.`}</h2>
              <form action="/api/subscribe" method="post" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <input type="hidden" name="lang" value={lang} />
                <input type="hidden" name="island" value={island} />
                <input type="email" name="email" required placeholder="you@company.aw" aria-label={d.workEmail} />
                <button type="submit">{d.subscribeShort}</button>
              </form>
            </div>
            <div className="box sand">
              <h2>{d.sourcesMonitored}</h2>
              <div className="chips">{sources.map((s) => <span key={s.id}>{s.name}</span>)}</div>
            </div>
            <div className="box">
              <h2>{lang === "nl" ? "Partner" : "Sponsored"}</h2>
              <div style={{ height: 120, border: "1px dashed #cfcbc0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "var(--muted)" }}>
                {lang === "nl" ? "Partnerplaatsing" : "Partner placement"}
              </div>
            </div>
          </aside>
        </div>
      </main>
      <Footer lang={lang} />
    </>
  );
}
