import { type Item, loc, relTime } from "@/lib/data";
import { t, type Lang } from "@/lib/i18n";

export function Kicker({ item, lang }: { item: Item; lang: Lang }) {
  const d = t(lang);
  return (
    <div className="kicker">
      <span className={`tag-${item.island}`}>{d.islands[item.island]}</span>
      <span className="sep">/</span>
      <span style={{ color: "var(--muted)" }}>{d.topics[item.topic]}</span>
    </div>
  );
}

export function Story({ item, lang, big, art }: { item: Item; lang: Lang; big?: boolean; art?: React.ReactNode }) {
  const d = t(lang);
  const l = loc(item, lang);
  return (
    <article className={`story${big ? " big" : ""}`}>
      {art && <div className="art">{art}</div>}
      {big && <Kicker item={item} lang={lang} />}
      <h3><a href={`/${lang}/brief/${item.slug}`}>{l.title}</a></h3>
      <span className="m">
        <b className={`tag-${item.island}`}>{d.islands[item.island]}</b> · {relTime(item.published_at, lang)}
      </span>
    </article>
  );
}

export function FeedItem({ item, lang }: { item: Item; lang: Lang }) {
  const d = t(lang);
  const l = loc(item, lang);
  return (
    <article className="fitem">
      <div className="kicker">
        <span style={{ color: "var(--muted)" }}>{d.topics[item.topic]} · {relTime(item.published_at, lang)}</span>
      </div>
      <h3><a href={`/${lang}/brief/${item.slug}`}>{l.title}</a></h3>
      <p>{l.standfirst}</p>
      <div className="meta">
        <a className="link" href={`/${lang}/brief/${item.slug}`}>{d.readBrief} →</a>
      </div>
    </article>
  );
}

export { SkylineArt, BarsArt, LineArt, ParliamentArt, DocumentArt, PenArt, MailArt, IslandLine } from "./Art";
