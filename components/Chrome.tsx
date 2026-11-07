import { Logo } from "./Logo";
import { ISLANDS, type Island, type Lang, t, extra } from "@/lib/i18n";

export function Ticker({ lang }: { lang: Lang }) {
  const d = t(lang);
  const rows: [string, string, string][] = [
    ["AWG/USD", "1.79", lang === "nl" ? "vast" : "fixed"],
    ["ANG/USD", "1.79", lang === "nl" ? "vast" : "fixed"],
    ["USD/EUR", "[live]", ""],
    [lang === "nl" ? "CPI Aruba" : "Aruba CPI", "[CBS]", ""],
    [lang === "nl" ? "CPI Curaçao" : "Curaçao CPI", "[CBS]", ""],
    [lang === "nl" ? "Aankomsten Aruba" : "Aruba arrivals", "[ATA]", ""],
    [lang === "nl" ? "Aankomsten Curaçao" : "Curaçao arrivals", "[CTB]", ""],
    ["Brent", "[live]", ""],
    [lang === "nl" ? "Brandstof Aruba" : "Aruba fuel", "[gov]", ""],
  ];
  return (
    <div className="ticker">
      <div className="wrap">
        <span className="label">{d.ticker}</span>
        <div className="items">
          {rows.map(([k, v, n]) => (
            <span key={k}>
              <span className="k">{k}</span>
              <span className="v">{v}</span>
              {n && <span className="n">{n}</span>}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Masthead({ lang, island, path }: { lang: Lang; island?: Island; path: string }) {
  const d = t(lang);
  const x = extra[lang];
  const other = lang === "en" ? "nl" : "en";
  const date = new Date().toLocaleDateString(lang === "nl" ? "nl-NL" : "en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  return (
    <header className="masthead">
      <div className="wrap top">
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span className="date">{date}</span>
          <Logo href={`/${lang}`} />
          <span className="tagline">{d.tagline}</span>
        </div>
        <div className="right">
          <div className="langs">
            <a href={`/en${path}`} className={lang === "en" ? "on" : ""}>EN</a>
            <a href={`/nl${path}`} className={lang === "nl" ? "on" : ""}>NL</a>
          </div>
          <a href={`/${lang}#subscribe`} className="btn">{d.subscribe}</a>
        </div>
      </div>
      <div className="wrap nav">
        <nav className="islandnav" aria-label="Islands">
          <a href={`/${lang}`} className={!island ? "on" : ""}>{d.allIslands}</a>
          {ISLANDS.map((i) => (
            <a key={i} href={`/${lang}/${i}`} data-i={i} className={island === i ? "on" : ""}>{d.islands[i]}</a>
          ))}
        </nav>
        <nav className="sections" aria-label="Sections">
          <a href={`/${lang}#business`}>{d.topics.business}</a>
          <a href={`/${lang}#economy`}>{d.topics.economy}</a>
          <a href={`/${lang}#politics`}>{d.topics.politics}</a>
          <a href={`/${lang}/analysis`}>{x.analysis}</a>
          <a href={`/${lang}/reports`}>{d.topics.reports}</a>
          <a href={`/${lang}/about`}>{d.nav.about}</a>
        </nav>
      </div>
    </header>
  );
}

export function Footer({ lang }: { lang: Lang }) {
  const d = t(lang);
  const x = extra[lang];
  return (
    <footer className="foot">
      <div className="wrap in">
        <div className="col">
          <Logo href={`/${lang}`} size={28} />
          <p style={{ margin: 0, lineHeight: 1.5, maxWidth: 420 }}>{d.footerAbout} Oranjestad · Willemstad · Kralendijk.</p>
        </div>
        <div className="col">
          <b>{d.allIslands}</b>
          {ISLANDS.map((i) => <a key={i} href={`/${lang}/${i}`}>{d.islands[i]}</a>)}
        </div>
        <div className="col">
          <b>{lang === "nl" ? "Secties" : "Sections"}</b>
          <a href={`/${lang}#business`}>{d.topics.business}</a>
          <a href={`/${lang}#economy`}>{d.topics.economy}</a>
          <a href={`/${lang}#politics`}>{d.topics.politics}</a>
          <a href={`/${lang}/analysis`}>{x.analysis}</a>
          <a href={`/${lang}/reports`}>{d.topics.reports}</a>
        </div>
        <div className="col">
          <b>{lang === "nl" ? "Over" : "About"}</b>
          <a href={`/${lang}/about`}>{d.nav.about}</a>
          <a href={`/${lang}/about#sources`}>{d.sourcesMonitored}</a>
          <a href={`/${lang}/analysis#contribute`}>{x.contribute}</a>
          <a href="mailto:hello@negoshi.news">Contact</a>
        </div>
      </div>
    </footer>
  );
}

export function Newsletter({ lang }: { lang: Lang }) {
  const d = t(lang);
  return (
    <section className="nl" id="subscribe">
      <div>
        <span className="k">{lang === "nl" ? "De maandagbrief" : "The Monday brief"}</span>
        <h2>{d.newsletterTitle}</h2>
        <p>{d.newsletterSub}</p>
      </div>
      <form action="/api/subscribe" method="post">
        <input type="hidden" name="lang" value={lang} />
        <label>
          {d.workEmail}
          <input type="email" name="email" required placeholder="you@company.aw" />
        </label>
        <button type="submit" className="btn">{d.subscribeShort}</button>
      </form>
    </section>
  );
}
