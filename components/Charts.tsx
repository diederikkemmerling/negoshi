import { series, monthOf, type Series } from "@/lib/series";
import { pick, LOCALE, type Lang } from "@/lib/i18n";

const COLOR: Record<string, string> = { aruba: "#1F5FBF", curacao: "#D9562B", bonaire: "#0F8F7E", kingdom: "#141415" };
const NAME: Record<string, string> = { aruba: "Aruba", curacao: "Curaçao", bonaire: "Bonaire", kingdom: "Brent" };
const W = 560, H = 230, L = 40, R = 16, T = 14, B = 30;

function monthLabel(m: string, lang: Lang, withYear: boolean) {
  const [y, mo] = m.split("-").map(Number);
  const s = new Date(Date.UTC(y, mo - 1, 15)).toLocaleDateString(LOCALE[lang], { month: "short", timeZone: "UTC" }).replace(".", "");
  return withYear ? `${s} ${String(y).slice(2)}` : s;
}
const mIdx = (m: string) => { const [y, mo] = monthOf(m).split("-").map(Number); return y * 12 + mo; };
function niceTicks(min: number, max: number, n = 4) {
  const span = max - min || 1;
  const step = [1, 2, 2.5, 5, 10].map((f) => f * 10 ** Math.floor(Math.log10(span / n))).find((s) => span / s <= n) || span;
  const out: number[] = [];
  for (let v = Math.floor(min / step) * step; v <= max + 1e-9; v += step) out.push(Math.round(v * 100) / 100);
  return out;
}
const fmt = (v: number, lang: Lang, dec = 1) => v.toLocaleString(LOCALE[lang], { minimumFractionDigits: dec, maximumFractionDigits: dec });

function Frame({ title, sub, legend, children, table, lang }: { title: string; sub: string; legend: Series[]; children: React.ReactNode; table: React.ReactNode; lang: Lang }) {
  return (
    <figure className="chart">
      <figcaption>
        <b>{title}</b>
        <span>{sub}</span>
      </figcaption>
      {legend.length > 1 && (
        <div className="legend">
          {legend.map((s) => <span key={s.id}><i style={{ background: COLOR[s.island] }} />{NAME[s.island]}</span>)}
        </div>
      )}
      {children}
      <details><summary>{pick(lang, "Data", "Cijfers", "Datos")}</summary>{table}</details>
    </figure>
  );
}

function Table({ list, lang, dec }: { list: Series[]; lang: Lang; dec: number }) {
  const months = [...new Set(list.flatMap((s) => s.points.map((p) => monthOf(p[0]))))].sort();
  return (
    <table>
      <thead><tr><th />{list.map((s) => <th key={s.id}>{NAME[s.island]}</th>)}</tr></thead>
      <tbody>{months.map((m) => (
        <tr key={m}><td>{monthLabel(m, lang, true)}</td>{list.map((s) => { const p = s.points.find((x) => monthOf(x[0]) === m); return <td key={s.id}>{p ? fmt(p[1], lang, dec) : ""}</td>; })}</tr>
      ))}</tbody>
    </table>
  );
}

/** Line chart, one shared % axis; quarterly series are drawn on the quarter's last month. */
function LineChart({ list, lang, title, sub, unit, dec = 1 }: { list: Series[]; lang: Lang; title: string; sub: string; unit: string; dec?: number }) {
  const months = [...new Set(list.flatMap((s) => s.points.map((p) => monthOf(p[0]))))].sort();
  const vals = list.flatMap((s) => s.points.map((p) => p[1]));
  const ticks = niceTicks(Math.min(0, ...vals), Math.max(...vals));
  const lo = ticks[0], hi = ticks[ticks.length - 1];
  const x = (m: string) => L + (months.indexOf(m) / Math.max(1, months.length - 1)) * (W - L - R);
  const y = (v: number) => T + (1 - (v - lo) / (hi - lo || 1)) * (H - T - B);
  const every = Math.ceil(months.length / 7);
  return (
    <Frame lang={lang} title={title} sub={sub} legend={list} table={<Table list={list} lang={lang} dec={dec} />}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={title}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} className={t === 0 ? "zero" : "grid"} />
            <text x={L - 6} y={y(t) + 4} textAnchor="end" className="ax">{fmt(t, lang, Number.isInteger(t) ? 0 : 1)}{unit}</text>
          </g>
        ))}
        {months.map((m, i) => (i % every === 0 || i === months.length - 1) && (
          <text key={m} x={x(m)} y={H - 8} textAnchor="middle" className="ax">{monthLabel(m, lang, i === 0 || m.endsWith("-01"))}</text>
        ))}
        {list.map((s) => {
          const pts = s.points.map((p) => [x(monthOf(p[0])), y(p[1]), p] as const);
          // break the line where months are missing for a monthly series
          const segs: (typeof pts)[number][][] = [];
          pts.forEach((pt, i) => {
            const prev = s.points[i - 1];
            const gap = s.freq === "month" && prev && mIdx(pt[2][0]) - mIdx(prev[0]) > 1;
            if (!segs.length || gap) segs.push([]);
            segs[segs.length - 1].push(pt);
          });
          const last = pts[pts.length - 1];
          return (
            <g key={s.id}>
              {segs.map((g, k) => <polyline key={k} points={g.map((p) => `${p[0]},${p[1]}`).join(" ")} fill="none" stroke={COLOR[s.island]} strokeWidth="2" strokeLinejoin="round" />)}
              {pts.map((p) => (
                <g key={p[2][0]} className="pt">
                  <circle cx={p[0]} cy={p[1]} r="10" fill="transparent" />
                  <circle cx={p[0]} cy={p[1]} r={p === last ? 4 : 2.5} fill={COLOR[s.island]} stroke="var(--sand)" strokeWidth="1.5" />
                  <title>{`${NAME[s.island]}, ${s.freq === "quarter" ? p[2][0].replace("-", " ") : monthLabel(monthOf(p[2][0]), lang, true)}: ${fmt(p[2][1], lang, dec)}${unit}`}</title>
                </g>
              ))}
              {last && <text x={last[0] > W - 60 ? last[0] - 8 : last[0] + 7} y={last[1] + (last[0] > W - 60 ? 4 : -7)} textAnchor={last[0] > W - 60 ? "end" : "start"} className="val">{fmt(last[2][1], lang, dec)}{unit}</text>}
            </g>
          );
        })}
      </svg>
    </Frame>
  );
}

/** Grouped bars per month, shared count axis starting at zero. */
function BarChart({ list, lang, title, sub }: { list: Series[]; lang: Lang; title: string; sub: string }) {
  const months = [...new Set(list.flatMap((s) => s.points.map((p) => p[0])))].sort();
  const max = Math.max(...list.flatMap((s) => s.points.map((p) => p[1])));
  const ticks = niceTicks(0, max);
  const hi = ticks[ticks.length - 1];
  const slot = (W - L - R) / months.length;
  const bw = Math.min(16, (slot - 6) / list.length - 2);
  const y = (v: number) => T + (1 - v / hi) * (H - T - B);
  const k = (v: number) => `${fmt(v / 1000, lang, 0)}k`;
  return (
    <Frame lang={lang} title={title} sub={sub} legend={list} table={<Table list={list} lang={lang} dec={0} />}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={title}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={L} x2={W - R} y1={y(t)} y2={y(t)} className={t === 0 ? "zero" : "grid"} />
            <text x={L - 6} y={y(t) + 4} textAnchor="end" className="ax">{t === 0 ? "0" : k(t)}</text>
          </g>
        ))}
        {months.map((m, i) => {
          const cx = L + slot * i + slot / 2;
          const groupW = list.length * (bw + 2) - 2;
          return (
            <g key={m}>
              {list.map((s, j) => {
                const p = s.points.find((q) => q[0] === m);
                if (!p) return null;
                const bx = cx - groupW / 2 + j * (bw + 2);
                const top = y(p[1]), h = y(0) - top;
                return (
                  <g key={s.id} className="pt">
                    <path d={`M${bx},${y(0)} V${top + 3} Q${bx},${top} ${bx + 3},${top} H${bx + bw - 3} Q${bx + bw},${top} ${bx + bw},${top + 3} V${y(0)} Z`} fill={COLOR[s.island]} />
                    <rect x={bx - 1} y={T} width={bw + 2} height={h + (top - T)} fill="transparent" />
                    <title>{`${NAME[s.island]}, ${monthLabel(m, lang, true)}: ${p[1].toLocaleString(LOCALE[lang])}`}</title>
                  </g>
                );
              })}
              <text x={cx} y={H - 8} textAnchor="middle" className="ax">{monthLabel(m, lang, i === 0 || m.endsWith("-01"))}</text>
            </g>
          );
        })}
      </svg>
    </Frame>
  );
}

/** The charts block; `island` limits it to one island's series (island pages). */
export function Charts({ lang, island }: { lang: Lang; island?: string }) {
  const keep = (s: Series | undefined): s is Series => !!s && s.points.length >= 3 && (!island || s.island === island);
  const infl = [series("cpi-aw"), series("cpi-cw"), series("cpi-bq")].filter(keep);
  const arr = [series("arrivals-aw"), series("arrivals-cw")].filter(keep).map((s) => ({ ...s, points: s.points.filter((p) => p[0] >= "2026-01") }));
  const oil = island ? [] : [series("brent")].filter(keep);
  const fuel = [series("fuel-aw")].filter(keep);
  if (!infl.length && !arr.length && !oil.length && !fuel.length) return null;
  const srcs = (l: Series[]) => [...new Set(l.map((s) => s.source))].join(", ");
  return (
    <div className="charts">
      {infl.length > 0 && <LineChart list={infl} lang={lang} unit="%" title={pick(lang, "Inflation", "Inflatie", "Inflación")} sub={`${pick(lang, "% change on a year earlier", "% verandering t.o.v. een jaar eerder", "% de variación interanual")} · ${srcs(infl)}${infl.some((s) => s.freq === "quarter") ? pick(lang, " · Bonaire per quarter", " · Bonaire per kwartaal", " · Bonaire por trimestre") : ""}`} />}
      {arr.length > 0 && <BarChart list={arr} lang={lang} title={pick(lang, "Stay-over visitors", "Verblijfstoeristen", "Turistas con estadía")} sub={`${pick(lang, "Arrivals per month, 2026", "Aankomsten per maand, 2026", "Llegadas por mes, 2026")} · ${srcs(arr)}`} />}
      {fuel.length > 0 && <LineChart list={fuel} lang={lang} unit="" dec={3} title={pick(lang, "Gasoline price Aruba", "Benzineprijs Aruba", "Precio de gasolina Aruba")} sub={`AWG ${pick(lang, "per litre", "per liter", "por litro")} · ${srcs(fuel)}`} />}
      {oil.length > 0 && <LineChart list={oil} lang={lang} unit="" dec={0} title={pick(lang, "Oil price (Brent)", "Olieprijs (Brent)", "Precio del petróleo (Brent)")} sub={`${pick(lang, "US$ per barrel, monthly average", "US$ per vat, maandgemiddelde", "US$ por barril, promedio mensual")} · ${srcs(oil)}`} />}
    </div>
  );
}
