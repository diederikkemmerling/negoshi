import { notFound } from "next/navigation";
import { connection } from "next/server";
import { cookies, headers } from "next/headers";
import { Ticker, Masthead, Footer, Newsletter } from "@/components/Chrome";
import { Story, SkylineArt, BarsArt, LineArt, ParliamentArt, DocumentArt, PenArt, IslandLine } from "@/components/Story";
import { allItems, allReports, bandIndicators, itemsByIsland, loc, relTime, sourcesByIsland } from "@/lib/data";
import { isLang, ISLANDS, t, extra, type Lang } from "@/lib/i18n";
import { analysisFor } from "@/lib/analysis";

const COUNTRY_ISLAND: Record<string, "aruba" | "curacao" | "bonaire"> = { AW: "aruba", CW: "curacao", BQ: "bonaire" };

export default async function Home({ params, searchParams }: { params: Promise<{ lang: string }>; searchParams: Promise<{ all?: string; geo?: string }> }) {
  await connection();
  const { lang: raw } = await params;
  if (!isLang(raw)) notFound();
  const lang: Lang = raw;
  const d = t(lang);
  const x = extra[lang];
  const items = allItems();
  // Visitors on Aruba, Curaçao or Bonaire only see their own island (Vercel geo header).
  // They can switch to all islands; that choice is kept in a cookie (set by /api/view).
  const sp = await searchParams;
  const country = (sp.geo || (await headers()).get("x-vercel-ip-country") || "").toUpperCase();
  const geoIsland = COUNTRY_ISLAND[country] ?? null;
  const wantsAll = sp.all === "1" || (await cookies()).get("ns_view")?.value === "all";
  const scoped = geoIsland ? items.filter((i) => i.island === geoIsland) : [];
  const home = geoIsland && !wantsAll && scoped.length >= 3 ? geoIsland : null;
  const feed = home ? scoped : items;
  const lead = feed[0];
  const brief = feed.slice(1, 6);
  const islandOrder = geoIsland ? [geoIsland, ...ISLANDS.filter((i) => i !== geoIsland)] : [...ISLANDS];
  const byTopic = (topic: string) => feed.filter((i) => i.topic === topic);
  const reports = allReports().slice(0, 4);
  const band = bandIndicators();
  const analysis = (await analysisFor(lang)).slice(0, 2);
  const hasSample = items.some((i) => i.sample);

  return (
    <>
      <Ticker lang={lang} />
      <Masthead lang={lang} path="" geo={geoIsland && scoped.length >= 3 ? { island: geoIsland, scoped: Boolean(home) } : undefined} />
      <main className="wrap page">
        {hasSample && <span className="sample">{d.sampleNotice}</span>}
        <section className="hero">
          <article className="lead">
            <div className="art">
              <SkylineArt island={lead.island} seed={lead.slug} />
              <div className="pill">
                <span className="pill-y">{d.leadStory}</span>
                <span className="pill-k">{d.islands[lead.island]} · {d.topics[lead.topic]}</span>
              </div>
            </div>
            <h1><a href={`/${lang}/brief/${lead.slug}`}>{loc(lead, lang).title}</a></h1>
            <p className="standfirst">{loc(lead, lang).standfirst}</p>
            <div className="meta">
              <b>{d.negoshiBrief}</b>
              <span>{relTime(lead.published_at, lang)}</span>
              <a className="link" href={`/${lang}/brief/${lead.slug}`}>{d.readBrief} →</a>
            </div>
          </article>
          <aside className="brief">
            <div className="h"><h2>{d.theBrief}</h2><span>{d.fiveToKnow}</span></div>
            {brief.map((it, i) => (
              <a key={it.id} className={`row c-${it.island}`} href={`/${lang}/brief/${it.slug}`}>
                <span className="n">{i + 1}</span>
                <span>
                  <span className="t">{loc(it, lang).title}</span>
                  <div className="s">{d.islands[it.island]} · {d.topics[it.topic]}</div>
                </span>
              </a>
            ))}
            <a className="more" href="#subscribe">{lang === "nl" ? "Elke maandag in je inbox →" : "Get this in your inbox every Monday →"}</a>
          </aside>
        </section>

        {!home && (
        <section>
          <div className="rule-h" style={{ marginBottom: 20 }}>
            <h2>{d.threeIslands}</h2>
            <span className="sub">{d.threeIslandsSub}</span>
          </div>
          <div className="trio">
            {islandOrder.map((i) => {
              const list = itemsByIsland(i);
              return (
                <div key={i} className={`icard c-${i}`}>
                  <div className="head">
                    <span className="k">{d.islands[i]}</span>
                    <IslandLine island={i} className="shape" />
                  </div>
                  {list[0] && <a className="h" href={`/${lang}/brief/${list[0].slug}`}>{loc(list[0], lang).title}</a>}
                  <ul>
                    {list.slice(1, 4).map((it) => (
                      <li key={it.id}><a href={`/${lang}/brief/${it.slug}`}>{loc(it, lang).title}</a></li>
                    ))}
                  </ul>
                  <div className="f">
                    <span><strong>{sourcesByIsland(i).length}</strong> {lang === "nl" ? "bronnen" : "sources"}</span>
                    <span><strong>{list.length}</strong> {lang === "nl" ? "berichten" : "briefs"}</span>
                    <a className="go" href={`/${lang}/${i}`}>{d.open} {d.islands[i]} →</a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
        )}

        <section className="cols">
          {(["business", "economy", "politics"] as const).map((topic) => {
            const list = byTopic(topic);
            const Art = topic === "business" ? BarsArt : topic === "economy" ? LineArt : ParliamentArt;
            return (
              <div className="col" key={topic} id={topic}>
                <h2 className="label-h">{d.topics[topic]}</h2>
                {list[0] && <Story item={list[0]} lang={lang} big art={<Art island={list[0].island} seed={list[0].slug} />} />}
                {list.slice(1, 5).map((it) => <Story key={it.id} item={it} lang={lang} />)}
              </div>
            );
          })}
        </section>

        <section className="band">
          <div className="wrap inner">
            <div className="rule-h">
              <h2>{x.analysis}</h2>
              <a className="link" href={`/${lang}/analysis`}>{x.analysisSub} →</a>
            </div>
            <div className="cols">
              {analysis.map((a) => (
                <article className="story big" key={a.id}>
                  <div className="art">{a.cover ? <img src={a.cover} alt="" className="cover" loading="lazy" /> : <PenArt seed={a.slug} />}</div>
                  <div className="kicker"><span className="tag-aruba">{x.guest}</span></div>
                  <h3><a href={`/${lang}/analysis/${a.slug}`}>{a.title}</a></h3>
                  <span className="m">{x.byAuthor} <b>{a.author.name}</b>{a.author.title ? `, ${a.author.title}` : ""}</span>
                </article>
              ))}
              <article className="story big" id="contribute">
                <h3>{x.contribute}</h3>
                <p style={{ margin: 0, fontSize: 14, color: "var(--text)" }}>{x.contributeSub}</p>
                <a className="btn ghost" href={`/${lang}/analysis#contribute`} style={{ alignSelf: "flex-start" }}>{x.contribute}</a>
              </article>
            </div>
          </div>
        </section>

        <section className="numbers">
          <div>
            <h2>{d.inNumbers}</h2>
            <div className="sub">{d.inNumbersSub}</div>
          </div>
          <div className="numgrid">
            {(band.length
              ? band.map((i) => [i[lang], `${i.value}${i.unit.startsWith("%") ? "%" : ""}`, `${i.unit.startsWith("%") ? i.unit.slice(1).trim() : i.unit}${i.period ? (i.unit.startsWith("%") ? ", " : " ") + i.period : ""} · ${i.source}`])
              : [
                  [lang === "nl" ? "Inflatie Aruba" : "Aruba inflation", "…", "CBS"],
                  [lang === "nl" ? "Inflatie Curaçao" : "Curaçao inflation", "…", "CBS"],
                  [lang === "nl" ? "Verblijfsgasten Aruba" : "Aruba stay-over arrivals", "…", "ATA"],
                  [lang === "nl" ? "Verblijfsgasten Curaçao" : "Curaçao stay-over arrivals", "…", "CTB"],
                  [lang === "nl" ? "Benzine Aruba" : "Aruba gasoline", "…", lang === "nl" ? "Overheid" : "Government"],
                ]
            ).map(([k, v, u]) => (
              <div className="num" key={k}><span className="k">{k}</span><span className="v">{v}</span><span className="u">{u}</span></div>
            ))}
          </div>
        </section>

        <section>
          <div className="label-h" style={{ marginBottom: 18 }}>
            <span>{d.reportsLibrary}</span>
            <a className="link" href={`/${lang}/reports`}>{d.allReports} →</a>
          </div>
          <div className="reports">
            {reports.map((r) => (
              <a key={r.id} href={r.url} target="_blank" rel="noopener" className={`rcard c-${r.island}`}>
                <div className="cover">
                  <DocumentArt island={r.island} seed={r.id} />
                </div>
                <span className="k">{d.islands[r.island]} · {r[lang].category}</span>
                <span className="t">{r[lang].title}</span>
                <span className="m">{r.publisher}{/imf\.org|cbs\.nl|ser\.cw/.test(r.url) ? "" : " · PDF"}</span>
              </a>
            ))}
          </div>
        </section>

        <Newsletter lang={lang} />
      </main>
      <Footer lang={lang} />
    </>
  );
}
