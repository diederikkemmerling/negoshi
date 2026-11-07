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
        <b className={`tag-${item.island}`}>{d.islands[item.island]}</b> · {item.source_name} · {relTime(item.published_at, lang)}
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
        <b>{item.source_name}</b>
        <a className="link" href={item.source_url} target="_blank" rel="noopener">{d.readOriginal} →</a>
        {item.also_covered.length > 0 && <span>{d.alsoCovered} {item.also_covered.join(", ")}</span>}
      </div>
    </article>
  );
}

export function SkylineArt({ color = "#1F5FBF", accent = "#F5C518" }: { color?: string; accent?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#141415" /><stop offset="1" stopColor={color} /></linearGradient>
        <pattern id="p1" width="14" height="14" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.6" fill="#fff" opacity=".18" /></pattern>
      </defs>
      <rect width="800" height="400" fill="url(#g1)" />
      <rect width="800" height="400" fill="url(#p1)" />
      <circle cx="650" cy="110" r="90" fill={accent} />
      <path d="M0 300 C120 280 180 250 280 262 C380 274 430 240 520 236 C610 232 700 262 800 250 L800 400 L0 400 Z" fill="#0A0A0A" opacity=".55" />
      <path d="M0 330 C140 318 220 300 330 310 C440 320 520 286 620 292 C700 296 760 316 800 310 L800 400 L0 400 Z" fill="#0A0A0A" opacity=".75" />
      <g fill="#fff" opacity=".9">
        <rect x="80" y="262" width="34" height="64" /><rect x="124" y="240" width="22" height="86" /><rect x="156" y="276" width="46" height="50" /><rect x="230" y="250" width="28" height="76" /><rect x="268" y="268" width="60" height="58" /><rect x="350" y="232" width="24" height="94" /><rect x="384" y="256" width="40" height="70" /><rect x="470" y="246" width="30" height="80" /><rect x="510" y="270" width="54" height="56" /><rect x="600" y="258" width="26" height="68" /><rect x="636" y="238" width="18" height="88" /><rect x="664" y="272" width="48" height="54" />
      </g>
    </svg>
  );
}

export function BarsArt() {
  return (
    <svg aria-hidden="true" viewBox="0 0 300 200" preserveAspectRatio="xMidYMid slice">
      <rect width="300" height="200" fill="#F3EEE2" />
      <rect x="30" y="80" width="60" height="120" fill="#1F5FBF" /><rect x="100" y="50" width="40" height="150" fill="#141415" /><rect x="150" y="100" width="80" height="100" fill="#1F5FBF" opacity=".7" /><rect x="240" y="70" width="30" height="130" fill="#141415" opacity=".8" /><circle cx="250" cy="40" r="22" fill="#F5C518" />
    </svg>
  );
}
export function LineArt() {
  return (
    <svg aria-hidden="true" viewBox="0 0 300 200" preserveAspectRatio="xMidYMid slice">
      <rect width="300" height="200" fill="#F3EEE2" />
      <g stroke="#E0D8C3" strokeWidth="1"><path d="M0 60H300M0 110H300M0 160H300" /></g>
      <polyline points="20,170 50,160 80,162 110,140 140,128 170,104 200,110 230,80 260,70 290,52" fill="none" stroke="#141415" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx="290" cy="52" r="6" fill="#141415" />
    </svg>
  );
}
export function ParliamentArt() {
  return (
    <svg aria-hidden="true" viewBox="0 0 300 200" preserveAspectRatio="xMidYMid slice">
      <rect width="300" height="200" fill="#141415" />
      <rect x="40" y="150" width="220" height="14" fill="#fff" />
      <rect x="56" y="80" width="14" height="70" fill="#fff" /><rect x="96" y="80" width="14" height="70" fill="#fff" /><rect x="136" y="80" width="14" height="70" fill="#fff" /><rect x="176" y="80" width="14" height="70" fill="#fff" /><rect x="216" y="80" width="14" height="70" fill="#fff" />
      <path d="M40 80 L150 40 L260 80 Z" fill="#F5C518" />
    </svg>
  );
}
