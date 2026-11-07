import { Logo } from "./Logo";
import { MailArt } from "./Art";
import { ISLANDS, type Island, type Lang, t, extra } from "@/lib/i18n";
import { liveIndicators } from "@/lib/data";

export function Ticker({ lang }: { lang: Lang }) {
  const d = t(lang);
  const live = liveIndicators();
  const rows: [string, string, string][] = live.length
    ? live.map((i) => [i[lang], `${i.value}${i.unit && !i.unit.startsWith("%") && i.unit !== "" ? " " + i.unit : i.unit.startsWith("%") ? "%" : ""}`, (lang === "nl" ? i.note_nl : i.note_en) || i.period || ""])
    : [
        ["USD/EUR", "", ""],
      ];
  return (
    <div className="ticker">
      <div className="wrap">
        <span className="label">{d.ticker}</span>
        <div className="items">
          {rows.filter(([, v]) => v).map(([k, v, n]) => (
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

export function Masthead({ lang, island, path, geo }: { lang: Lang; island?: Island; path: string; geo?: { island: Island; scoped: boolean } }) {
  const d = t(lang);
  const x = extra[lang];
  const date = new Date().toLocaleDateString(lang === "nl" ? "nl-NL" : "en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  return (
    <header className="masthead">
      <div className="wrap top">
        <div className="brand">
          <Logo href={`/${lang}`} />
          <span className="tagline">{d.tagline}</span>
        </div>
        <div className="right">
          <span className="date">{date}</span>
          <div className="langs" aria-label="Language">
            <a href={`/en${path}`} className={lang === "en" ? "on" : ""}>EN</a>
            <a href={`/nl${path}`} className={lang === "nl" ? "on" : ""}>NL</a>
          </div>
          <a href={`/${lang}#subscribe`} className="btn sub"><span className="long">{d.subscribe}</span><span className="short">{d.subscribeShort}</span></a>
        </div>
      </div>
      <div className="wrap nav">
        <nav className="islandnav" aria-label="Islands">
          {/* On the homepage a visitor on an island toggles between "their island" and all islands. */}
          <a href={geo ? `/api/view?mode=all&lang=${lang}` : `/${lang}`} className={(!island && !geo) || (geo && !geo.scoped) ? "on" : ""}>{d.allIslands}</a>
          {ISLANDS.map((i) => (
            <a key={i} href={geo && geo.island === i ? `/api/view?mode=island&lang=${lang}` : `/${lang}/${i}`} data-i={i} className={island === i || (geo && geo.scoped && geo.island === i) ? "on" : ""}>{d.islands[i]}</a>
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
          <a href="/studio">{lang === "nl" ? "Auteurs login" : "Contributor login"}</a>
          <a href={`/${lang}/analysis#contribute`}>{x.contribute}</a>
          <a href="mailto:hello@negoshi.news">Contact</a>
        </div>
      </div>
      <div className="wrap legal">
        <span>© {new Date().getFullYear()} Negoshi · negoshi.news</span>
        <span>{lang === "nl" ? "Oranjestad · Willemstad · Kralendijk" : "Oranjestad · Willemstad · Kralendijk"}</span>
      </div>
    </footer>
  );
}

export function Newsletter({ lang }: { lang: Lang }) {
  const d = t(lang);
  return (
    <section className="nl" id="subscribe">
      <div className="nl-art"><MailArt /></div>
      <div className="nl-text">
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
