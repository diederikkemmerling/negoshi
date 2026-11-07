/**
 * Negoshi illustration set, flat-vector house style (same formula as The Lab's blog visuals):
 * sand background, one large soft pastel circle, one flat icon centred in it
 * (main shape in the island colour or ink, one signal-yellow accent, white interior details,
 * a soft shadow ellipse), and brand "confetti" scattered around the circle.
 * Everything is deterministic from a seed so the same story always gets the same picture.
 */
const INK = "#141415";
const SAND = "#F3EEE2";
const SIGNAL = "#F5C518";
const WHITE = "#FFFFFF";
const SHADOW = "rgba(20,20,21,.10)";

export const ISLAND_HEX: Record<string, string> = { aruba: "#1F5FBF", curacao: "#D9562B", bonaire: "#0F8F7E", kingdom: INK, abc: INK };
const TINT: Record<string, string> = { aruba: "#DCE6F7", curacao: "#F9E2D7", bonaire: "#D5EDE8", kingdom: "#E9E4D6", abc: "#FBEFC4" };
const DARK: Record<string, string> = { aruba: "#174A96", curacao: "#B5431F", bonaire: "#0B6E61", kingdom: "#000000", abc: "#000000" };

export type IconKey = "bars" | "line" | "parliament" | "document" | "pen" | "mail" | "hotel" | "house" | "flamingo" | "ship" | "coins" | "handshake";

function rng(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
  return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 10000) / 10000; };
}

/** Confetti around the circle: dots, rings, plus signs, triangles, squiggles, zigzags. */
function Confetti({ seed, cx, cy, r, w, h, main }: { seed: string; cx: number; cy: number; r: number; w: number; h: number; main: string }) {
  const rand = rng(seed);
  const palette = [main, SIGNAL, INK, "#B8B3A6", main];
  const items: React.ReactNode[] = [];
  const n = 22;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + rand() * 0.5;
    const d = r + 40 + rand() * Math.min(w, h) * 0.22;
    const x = cx + Math.cos(a) * d * (w / h > 1.2 ? 1.25 : 1);
    const y = cy + Math.sin(a) * d * 0.85;
    if (x < 16 || x > w - 16 || y < 16 || y > h - 16) continue;
    const c = palette[Math.floor(rand() * palette.length)];
    const k = Math.floor(rand() * 6);
    const s = 5 + rand() * 7;
    const key = `c${i}`;
    if (k === 0) items.push(<circle key={key} cx={x} cy={y} r={s * 0.7} fill={c} />);
    else if (k === 1) items.push(<circle key={key} cx={x} cy={y} r={s} fill="none" stroke={c} strokeWidth="3" />);
    else if (k === 2) items.push(<path key={key} d={`M${x - s} ${y}h${s * 2}M${x} ${y - s}v${s * 2}`} stroke={c} strokeWidth="3.5" strokeLinecap="round" />);
    else if (k === 3) items.push(<path key={key} d={`M${x} ${y - s}L${x + s} ${y + s * 0.8}L${x - s} ${y + s * 0.8}Z`} fill={c} />);
    else if (k === 4) items.push(<path key={key} d={`M${x - s * 1.4} ${y}q${s * 0.7} -${s} ${s * 1.4} 0t${s * 1.4} 0`} fill="none" stroke={c} strokeWidth="3.5" strokeLinecap="round" />);
    else items.push(<path key={key} d={`M${x - s * 1.5} ${y + s * 0.5}l${s * 0.75} -${s}l${s * 0.75} ${s}l${s * 0.75} -${s}l${s * 0.75} ${s}`} fill="none" stroke={c} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />);
  }
  return <g>{items}</g>;
}

const Shadow = ({ cx, cy, rx = 120 }: { cx: number; cy: number; rx?: number }) => <ellipse cx={cx} cy={cy} rx={rx} ry={rx * 0.14} fill={SHADOW} />;
const Sparkle = ({ x, y, s = 26 }: { x: number; y: number; s?: number }) => (
  <path d={`M${x} ${y - s}Q${x} ${y} ${x + s} ${y}Q${x} ${y} ${x} ${y + s}Q${x} ${y} ${x - s} ${y}Q${x} ${y} ${x} ${y - s}Z`} fill={SIGNAL} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
);
const Badge = ({ x, y, r = 30, children }: { x: number; y: number; r?: number; children?: React.ReactNode }) => (
  <g><circle cx={x} cy={y} r={r} fill={SIGNAL} stroke={INK} strokeWidth="3" />{children}</g>
);

/** The icon library. Each is drawn in a 400x400 box centred at (0,0). */
function Icon({ icon, main, dark }: { icon: IconKey; main: string; dark: string }) {
  const S = { stroke: INK, strokeWidth: 3, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  switch (icon) {
    case "bars":
      return (
        <g>
          <Shadow cx={0} cy={150} />
          <rect x="-150" y="20" width="60" height="120" rx="6" fill={main} {...S} />
          <rect x="-70" y="-30" width="60" height="170" rx="6" fill={main} {...S} />
          <rect x="10" y="30" width="60" height="110" rx="6" fill={main} {...S} />
          <rect x="90" y="-90" width="60" height="230" rx="6" fill={dark} {...S} />
          <path d="M-120 -10 L-40 -70 L40 -20 L120 -130" fill="none" stroke={WHITE} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          <Badge x={120} y={-130} r={28}><path d="M108 -130 h24 M120 -142 v24" stroke={INK} strokeWidth="3.5" strokeLinecap="round" /></Badge>
        </g>
      );
    case "line":
      return (
        <g>
          <Shadow cx={0} cy={150} />
          <rect x="-160" y="-120" width="320" height="250" rx="14" fill={WHITE} {...S} />
          <path d="M-130 20 h260 M-130 -40 h260 M-130 80 h260" stroke="#E6E2D8" strokeWidth="3" />
          <path d="M-130 90 C-80 70 -60 60 -20 30 S40 -10 70 -30 S110 -70 130 -90" fill="none" stroke={main} strokeWidth="9" strokeLinecap="round" />
          <circle cx="-20" cy="30" r="8" fill={dark} stroke={WHITE} strokeWidth="3" />
          <Badge x={130} y={-90} r={26}><path d="M120 -86 l8 8 l14 -16" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" /></Badge>
        </g>
      );
    case "parliament":
      return (
        <g>
          <Shadow cx={0} cy={160} rx={160} />
          <rect x="-170" y="110" width="340" height="30" rx="4" fill={dark} {...S} />
          <rect x="-150" y="90" width="300" height="22" fill={main} {...S} />
          {[-120, -60, 0, 60, 120].map((x) => <rect key={x} x={x - 14} y="-20" width="28" height="110" rx="3" fill={WHITE} {...S} />)}
          <rect x="-160" y="-50" width="320" height="30" rx="4" fill={main} {...S} />
          <path d="M-170 -50 L0 -140 L170 -50 Z" fill={main} {...S} />
          <circle cx="0" cy="-80" r="14" fill={WHITE} stroke={INK} strokeWidth="3" />
          <Badge x={0} y={-150} r={26}><path d="M-9 -152 h18 M0 -161 v18" stroke={INK} strokeWidth="3.5" strokeLinecap="round" /></Badge>
        </g>
      );
    case "document":
      return (
        <g>
          <Shadow cx={0} cy={165} rx={110} />
          <path d="M-110 -150 H60 L120 -90 V150 H-110 Z" fill={WHITE} {...S} />
          <path d="M60 -150 V-90 H120" fill={main} {...S} />
          <rect x="-80" y="-60" width="150" height="14" rx="7" fill={main} />
          <rect x="-80" y="-24" width="150" height="14" rx="7" fill="#DDD7C8" />
          <rect x="-80" y="12" width="110" height="14" rx="7" fill="#DDD7C8" />
          <rect x="-80" y="48" width="150" height="14" rx="7" fill="#DDD7C8" />
          <Badge x={80} y={110} r={34}><path d="M64 112 l10 10 l22 -24" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></Badge>
        </g>
      );
    case "pen":
      return (
        <g>
          <Shadow cx={0} cy={160} rx={130} />
          <rect x="-150" y="-110" width="300" height="230" rx="14" fill={WHITE} {...S} />
          <rect x="-110" y="-60" width="110" height="14" rx="7" fill={main} />
          <rect x="-110" y="-24" width="180" height="14" rx="7" fill="#DDD7C8" />
          <rect x="-110" y="12" width="150" height="14" rx="7" fill="#DDD7C8" />
          <rect x="-110" y="48" width="100" height="14" rx="7" fill="#DDD7C8" />
          <g transform="rotate(-40 90 20)">
            <rect x="70" y="-150" width="40" height="230" rx="8" fill={main} {...S} />
            <rect x="70" y="-150" width="40" height="40" rx="8" fill={dark} {...S} />
            <path d="M70 80 L90 130 L110 80 Z" fill={WHITE} {...S} />
            <circle cx="90" cy="112" r="5" fill={INK} />
          </g>
          <Sparkle x={-120} y={-130} s={22} />
        </g>
      );
    case "mail":
      return (
        <g>
          <Shadow cx={0} cy={150} rx={150} />
          <rect x="-170" y="-100" width="340" height="230" rx="16" fill={main} {...S} />
          <path d="M-170 -84 L0 40 L170 -84" fill="none" stroke={WHITE} strokeWidth="8" strokeLinejoin="round" strokeLinecap="round" />
          <path d="M-170 130 L-40 10 M170 130 L40 10" fill="none" stroke={dark} strokeWidth="5" strokeLinecap="round" />
          <Badge x={150} y={-100} r={34}><path d="M150 -84 c-6 -6 -28 -16 -22 -30 c5 -10 18 -8 22 0 c4 -8 17 -10 22 0 c6 14 -16 24 -22 30z" fill={INK} /></Badge>
        </g>
      );
    case "hotel":
      return (
        <g>
          <Shadow cx={0} cy={165} rx={160} />
          <rect x="-150" y="-110" width="200" height="270" rx="8" fill={main} {...S} />
          <rect x="50" y="-40" width="110" height="200" rx="8" fill={dark} {...S} />
          {[0, 1, 2, 3].map((r) => [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={-130 + c * 60} y={-85 + r * 55} width="34" height="34" rx="4" fill={WHITE} opacity={0.92} />))}
          {[0, 1, 2].map((r) => <rect key={r} x="75" y={-15 + r * 55} width="60" height="30" rx="4" fill={WHITE} opacity=".9" />)}
          <path d="M-20 160 V110 H-80 V160" fill={INK} />
          <path d="M-170 160 H190" stroke={INK} strokeWidth="3" strokeLinecap="round" />
          <circle cx="135" cy="-120" r="42" fill={SIGNAL} stroke={INK} strokeWidth="3" />
          <path d="M100 160 c0 -40 30 -60 60 -60 c-10 20 -20 40 -60 60z" fill={dark} />
        </g>
      );
    case "house":
      return (
        <g>
          <Shadow cx={0} cy={165} rx={160} />
          <path d="M-170 160 V0 L-110 -60 L-50 0 V160 Z" fill={dark} {...S} />
          <path d="M-50 160 V-40 L30 -130 L110 -40 V160 Z" fill={main} {...S} />
          <path d="M110 160 V20 L150 -30 L190 20 V160 Z" fill={dark} {...S} />
          <rect x="-130" y="30" width="36" height="40" rx="4" fill={WHITE} /><rect x="-130" y="95" width="36" height="40" rx="4" fill={WHITE} />
          <rect x="-15" y="-30" width="40" height="46" rx="4" fill={WHITE} /><rect x="-15" y="40" width="40" height="46" rx="4" fill={WHITE} /><rect x="-15" y="110" width="40" height="50" rx="4" fill={INK} />
          <rect x="132" y="50" width="30" height="36" rx="4" fill={WHITE} /><rect x="132" y="110" width="30" height="36" rx="4" fill={WHITE} />
          <path d="M-190 160 H200" stroke={INK} strokeWidth="3" strokeLinecap="round" />
          <Sparkle x={150} y={-110} s={24} />
        </g>
      );
    case "flamingo":
      return (
        <g>
          <Shadow cx={0} cy={165} rx={110} />
          <path d="M-40 160 V40" stroke={INK} strokeWidth="5" strokeLinecap="round" />
          <path d="M10 160 V40" stroke={INK} strokeWidth="5" strokeLinecap="round" />
          <ellipse cx="-10" cy="0" rx="110" ry="70" fill={main} {...S} />
          <path d="M60 -30 C110 -60 130 -120 90 -150 C60 -170 30 -150 40 -120 C50 -100 80 -100 90 -110" fill="none" stroke={main} strokeWidth="26" strokeLinecap="round" />
          <circle cx="92" cy="-146" r="26" fill={main} {...S} />
          <path d="M112 -140 L150 -120 L112 -118 Z" fill={INK} />
          <circle cx="96" cy="-152" r="4" fill={WHITE} />
          <path d="M-80 -10 c20 -30 60 -30 80 -10" fill="none" stroke={WHITE} strokeWidth="6" strokeLinecap="round" />
          <Badge x={-120} y={-120} r={28}><circle cx="-120" cy="-120" r="10" fill={INK} /></Badge>
        </g>
      );
    case "ship":
      return (
        <g>
          <Shadow cx={0} cy={165} rx={170} />
          <path d="M-180 60 H180 L140 140 H-140 Z" fill={dark} {...S} />
          <rect x="-120" y="0" width="240" height="60" rx="6" fill={main} {...S} />
          <rect x="-70" y="-60" width="140" height="60" rx="6" fill={WHITE} {...S} />
          {[-90, -40, 10, 60].map((x) => <circle key={x} cx={x + 20} cy="30" r="10" fill={WHITE} />)}
          <rect x="20" y="-110" width="24" height="50" rx="4" fill={INK} />
          <path d="M-190 160 q20 -14 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0" fill="none" stroke={INK} strokeWidth="4" strokeLinecap="round" />
          <Sparkle x={130} y={-100} s={24} />
        </g>
      );
    case "coins":
      return (
        <g>
          <Shadow cx={0} cy={160} rx={140} />
          {[100, 70, 40].map((y, i) => <g key={i}><rect x="-120" y={y - 30} width="200" height="40" rx="20" fill={i === 1 ? dark : main} {...S} /><ellipse cx="-20" cy={y - 30} rx="100" ry="20" fill={i === 1 ? main : dark} {...S} /></g>)}
          <ellipse cx="-20" cy="10" rx="100" ry="20" fill={WHITE} {...S} />
          <circle cx="110" cy="-60" r="60" fill={SIGNAL} {...S} />
          <circle cx="110" cy="-60" r="40" fill="none" stroke={INK} strokeWidth="3" />
          <path d="M110 -84 v48 M98 -70 h24 M98 -50 h24" stroke={INK} strokeWidth="4" strokeLinecap="round" />
        </g>
      );
    case "handshake":
    default:
      return (
        <g>
          <Shadow cx={0} cy={150} rx={150} />
          <path d="M-180 -20 L-100 -80 L-10 10 L-60 60 Z" fill={main} {...S} />
          <path d="M180 -20 L100 -80 L10 10 L60 60 Z" fill={dark} {...S} />
          <rect x="-70" y="-10" width="140" height="90" rx="20" fill={WHITE} {...S} />
          <path d="M-40 20 h80 M-40 45 h80" stroke={INK} strokeWidth="3" strokeLinecap="round" />
          <Sparkle x={0} y={-110} s={26} />
        </g>
      );
  }
}

/**
 * Generic illustration. `ratio` picks the canvas: "wide" 2:1 (lead/article), "card" 3:2 (story cards),
 * "cover" 4:3 (reports), "banner" 5:2 (analysis band).
 */
export function Illo({ icon, island = "abc", seed, ratio = "card", tint }: { icon: IconKey; island?: string; seed?: string; ratio?: "wide" | "card" | "cover" | "banner" | "square"; tint?: string }) {
  const dims = { wide: [1200, 600], card: [900, 600], cover: [800, 600], banner: [1500, 600], square: [800, 800] }[ratio];
  const [w, h] = dims;
  const main = ISLAND_HEX[island] || INK;
  const dark = DARK[island] || "#000";
  const circle = tint || TINT[island] || TINT.abc;
  const cx = w / 2, cy = h / 2 + (ratio === "square" ? -10 : 0);
  const r = Math.min(w, h) * 0.38;
  const scale = r / 230;
  return (
    <svg aria-hidden="true" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid slice">
      <rect width={w} height={h} fill={SAND} />
      <Confetti seed={`${seed || icon}-${island}`} cx={cx} cy={cy} r={r} w={w} h={h} main={main} />
      <circle cx={cx} cy={cy} r={r} fill={circle} />
      <g transform={`translate(${cx} ${cy}) scale(${scale})`}>
        <Icon icon={icon} main={main} dark={dark} />
      </g>
    </svg>
  );
}

/** Topic -> icon, with island flavour for the lead. */
export function topicIcon(topic: string): IconKey {
  return topic === "business" ? "bars" : topic === "economy" ? "line" : topic === "politics" ? "parliament" : "document";
}
export function islandIcon(island: string): IconKey {
  return island === "aruba" ? "hotel" : island === "curacao" ? "house" : island === "bonaire" ? "flamingo" : "handshake";
}

/* Thin wrappers kept for existing call sites */
export const SkylineArt = ({ island = "aruba", seed }: { island?: string; accent?: string; seed?: string }) => <Illo icon={islandIcon(island)} island={island} seed={seed} ratio="wide" />;
export const BarsArt = ({ island = "aruba", seed }: { island?: string; accent?: string; seed?: string }) => <Illo icon="bars" island={island} seed={seed} />;
export const LineArt = ({ island = "curacao", seed }: { island?: string; accent?: string; seed?: string }) => <Illo icon="line" island={island} seed={seed} />;
export const ParliamentArt = ({ island = "bonaire", seed }: { island?: string; accent?: string; seed?: string }) => <Illo icon="parliament" island={island} seed={seed} />;
export const DocumentArt = ({ island = "aruba", seed }: { island?: string; accent?: string; seed?: string }) => <Illo icon="document" island={island} seed={seed} ratio="cover" />;
export const PenArt = ({ seed }: { accent?: string; seed?: string }) => <Illo icon="pen" island="abc" seed={seed} ratio="banner" />;
export const MailArt = () => (
  <svg aria-hidden="true" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid meet">
    <g transform="translate(200 200) scale(0.8)"><Icon icon="mail" main={INK} dark="#000" /></g>
  </svg>
);

/** Island outline in the island colour (used in island cards and banners). */
export function IslandLine({ island, className }: { island: string; className?: string }) {
  const d: Record<string, string> = {
    aruba: "M20 72 C14 58 30 40 50 32 C66 26 82 22 90 30 C94 38 80 50 64 58 C50 66 36 78 26 78 Z",
    curacao: "M8 62 C10 46 26 40 42 36 C58 32 72 24 86 16 C94 14 98 22 92 30 C80 42 70 46 60 54 C52 62 44 70 28 74 C16 76 8 70 8 62 Z",
    bonaire: "M42 8 C54 6 64 16 62 30 C60 46 54 60 66 76 C72 86 64 96 52 94 C40 92 32 76 30 60 C28 44 26 28 30 16 C32 10 36 9 42 8 Z",
  };
  return (
    <svg aria-hidden="true" viewBox="0 0 100 100" className={className}>
      <path d={d[island]} fill="currentColor" opacity=".18" />
      <path d={d[island]} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      {island === "bonaire" && <circle cx="22" cy="58" r="5" fill="currentColor" opacity=".5" />}
    </svg>
  );
}
