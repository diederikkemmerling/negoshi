/**
 * Negoshi illustration set. Monoline vector art in the house style:
 * ink strokes on sand, one signal-yellow fill, an optional island accent.
 */
const INK = "#141415";
const SAND = "#F3EEE2";
const SIGNAL = "#F5C518";

type ArtProps = { accent?: string; className?: string };

const base = { fill: "none", stroke: INK, strokeWidth: 2.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

/** Lead illustration: a different skyline per island. */
export function SkylineArt({ island = "aruba", accent = "#1F5FBF" }: { island?: string; accent?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 800 420" preserveAspectRatio="xMidYMid slice">
      <rect width="800" height="420" fill={SAND} />
      <circle cx="610" cy="120" r="64" fill={SIGNAL} />
      <g {...base} strokeWidth={2}>
        <path d="M40 332 H760" />
        <path d="M60 372 q22 -12 44 0 t44 0 t44 0 t44 0 t44 0 t44 0 t44 0 t44 0 t44 0 t44 0 t44 0 t44 0 t44 0 t44 0 t44 0" />
        <path d="M100 396 q22 -12 44 0 t44 0 t44 0 t44 0 t44 0 t44 0 t44 0 t44 0 t44 0 t44 0 t44 0 t44 0 t44 0" opacity=".5" />
      </g>
      {island === "aruba" && (
        <g {...base}>
          <path d="M90 332 V222 H170 V332" /><path d="M110 246 h40 M110 270 h40 M110 294 h40 M110 318 h40" />
          <path d="M200 332 V190 H250 V332" /><path d="M212 210 h26 M212 234 h26 M212 258 h26 M212 282 h26 M212 306 h26" />
          <path d="M290 332 V250 H400 V332" /><path d="M310 272 h70 M310 296 h70 M310 318 h70" />
          <path d="M440 332 V206 H490 V332" /><path d="M452 226 h26 M452 250 h26 M452 274 h26 M452 298 h26" />
          <path d="M530 332 V266 H600 V332" /><path d="M548 288 h34 M548 310 h34" />
          <path d="M660 332 V300 M660 300 c-30 -10 -50 -30 -52 -58 c20 8 40 26 52 58 c10 -30 30 -48 56 -56 c-4 30 -24 48 -56 56 c-6 -26 -2 -50 14 -68" />
          <path d="M700 332 V282 H740 V332" />
        </g>
      )}
      {island === "curacao" && (
        <g {...base}>
          <path d="M80 332 V250 l30 -40 l30 40 V332" /><path d="M96 276 h28 M96 300 h28" />
          <path d="M150 332 V240 l35 -48 l35 48 V332" /><path d="M170 266 h30 M170 290 h30 M170 312 h30" />
          <path d="M230 332 V258 l24 -30 l24 30 V332" /><path d="M244 282 h20 M244 306 h20" />
          <path d="M290 332 V236 l40 -40 l40 40 V332" /><path d="M310 256 h40 M310 280 h40 M310 304 h40" />
          <path d="M380 332 V262 l22 -28 l22 28 V332" />
          <path d="M440 332 c40 -90 180 -90 220 0" /><path d="M470 332 V290 M520 332 V268 M580 332 V268 M630 332 V290" />
          <path d="M690 332 V246 H750 V332" /><path d="M706 268 h28 M706 292 h28 M706 314 h28" />
        </g>
      )}
      {island === "bonaire" && (
        <g {...base}>
          <path d="M70 332 l60 -110 l60 110 Z" /><path d="M200 332 l50 -90 l50 90 Z" /><path d="M320 332 l40 -70 l40 70 Z" />
          <path d="M470 332 V236 H520 V332" /><path d="M482 236 l13 -26 l13 26" /><path d="M486 258 h18 M486 280 h18 M486 302 h18" />
          <path d="M560 332 V276 H640 V332" /><path d="M580 298 h40 M580 318 h40" />
          <path d="M680 332 V240" /><path d="M668 250 h24" /><path d="M670 240 a10 10 0 0 1 20 0" />
          <path d="M700 332 c20 -40 60 -40 80 0" />
        </g>
      )}
      <rect x="40" y="328" width="80" height="8" fill={accent} />
    </svg>
  );
}

export function BarsArt({ accent = "#1F5FBF" }: ArtProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 300 200" preserveAspectRatio="xMidYMid slice">
      <rect width="300" height="200" fill={SAND} />
      <g {...base}>
        <path d="M30 170 H270" />
        <rect x="52" y="104" width="36" height="66" />
        <rect x="104" y="80" width="36" height="90" />
        <rect x="156" y="118" width="36" height="52" />
        <rect x="208" y="48" width="36" height="122" fill={SIGNAL} />
        <path d="M58 92 L116 62 L170 98 L222 34" strokeDasharray="4 6" opacity=".6" />
        <path d="M212 34 h12 v12" />
      </g>
      <rect x="30" y="178" width="40" height="5" fill={accent} />
    </svg>
  );
}

export function LineArt({ accent = "#D9562B" }: ArtProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 300 200" preserveAspectRatio="xMidYMid slice">
      <rect width="300" height="200" fill={SAND} />
      <g stroke="#DDD5C2" strokeWidth="1.5"><path d="M30 50 H270 M30 90 H270 M30 130 H270 M30 170 H270" /></g>
      <g {...base}>
        <path d="M30 170 V40 M30 170 H270" />
        <path d="M40 160 C70 150 80 150 100 136 S140 112 160 110 S200 92 220 72 S250 52 262 46" strokeWidth={3} />
      </g>
      <circle cx="262" cy="46" r="9" fill={SIGNAL} stroke={INK} strokeWidth="2.5" />
      <circle cx="160" cy="110" r="4" fill={INK} />
      <rect x="30" y="178" width="40" height="5" fill={accent} />
    </svg>
  );
}

export function ParliamentArt({ accent = "#0F8F7E" }: ArtProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 300 200" preserveAspectRatio="xMidYMid slice">
      <rect width="300" height="200" fill={SAND} />
      <g {...base}>
        <path d="M40 170 H260" /><path d="M56 160 H244" /><path d="M64 150 V84 M104 150 V84 M144 150 V84 M184 150 V84 M224 150 V84" />
        <path d="M52 84 H248" />
        <path d="M44 84 L150 36 L256 84 Z" fill={SIGNAL} />
      </g>
      <rect x="30" y="178" width="40" height="5" fill={accent} />
    </svg>
  );
}

/** Report cover: a document with a stamp. */
export function DocumentArt({ accent = "#1F5FBF" }: ArtProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 300 220" preserveAspectRatio="xMidYMid slice">
      <rect width="300" height="220" fill={SAND} />
      <g {...base}>
        <path d="M96 30 H176 L212 66 V190 H96 Z" fill="#fff" />
        <path d="M176 30 V66 H212" />
        <path d="M116 90 h74 M116 110 h74 M116 130 h52 M116 150 h74" />
      </g>
      <circle cx="196" cy="162" r="20" fill={SIGNAL} stroke={INK} strokeWidth="2.5" />
      <path d="M187 162 l6 6 l12 -12" {...base} />
      <rect x="96" y="194" width="56" height="6" fill={accent} />
    </svg>
  );
}

export function PenArt({ accent = "#141415" }: ArtProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 500 200" preserveAspectRatio="xMidYMid slice">
      <rect width="500" height="200" fill={SAND} />
      <g {...base}>
        <path d="M70 150 L300 50 L320 94 L90 194" />
        <path d="M70 150 L36 184 L90 194" fill={SIGNAL} />
        <path d="M70 150 L82 174" />
        <path d="M280 60 L300 104" />
        <path d="M340 96 h120 M340 120 h90 M340 144 h110" opacity=".6" />
      </g>
      <rect x="30" y="178" width="40" height="5" fill={accent} />
    </svg>
  );
}

export function MailArt() {
  return (
    <svg aria-hidden="true" viewBox="0 0 240 200" preserveAspectRatio="xMidYMid meet">
      <g {...base} stroke={INK}>
        <rect x="30" y="50" width="180" height="120" fill="#fff" />
        <path d="M30 50 L120 120 L210 50" />
        <path d="M30 170 L96 104 M210 170 L144 104" />
      </g>
      <circle cx="196" cy="54" r="18" fill={SIGNAL} stroke={INK} strokeWidth="2.5" />
    </svg>
  );
}

/** Island outline, monoline, in the island colour. */
export function IslandLine({ island, className }: { island: string; className?: string }) {
  const d: Record<string, string> = {
    aruba: "M20 72 C14 58 30 40 50 32 C66 26 82 22 90 30 C94 38 80 50 64 58 C50 66 36 78 26 78 Z",
    curacao: "M8 62 C10 46 26 40 42 36 C58 32 72 24 86 16 C94 14 98 22 92 30 C80 42 70 46 60 54 C52 62 44 70 28 74 C16 76 8 70 8 62 Z",
    bonaire: "M42 8 C54 6 64 16 62 30 C60 46 54 60 66 76 C72 86 64 96 52 94 C40 92 32 76 30 60 C28 44 26 28 30 16 C32 10 36 9 42 8 Z",
  };
  return (
    <svg aria-hidden="true" viewBox="0 0 100 100" className={className}>
      <path d={d[island]} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      {island === "bonaire" && <circle cx="22" cy="58" r="5" fill="none" stroke="currentColor" strokeWidth="2.5" />}
      <path d="M22 86 q8 -6 16 0 t16 0 t16 0 t16 0" fill="none" stroke="currentColor" strokeWidth="2" opacity=".5" />
    </svg>
  );
}
