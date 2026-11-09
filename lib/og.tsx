import { ImageResponse } from "next/og";
import { Illo, type IconKey } from "@/components/Art";

export const OG_SIZE = { width: 1200, height: 630 };

const INK = "#141415";
const SAND = "#F3EEE2";
const SIGNAL = "#F5C518";
const ISLAND: Record<string, { hex: string; name: string }> = {
  aruba: { hex: "#1F5FBF", name: "Aruba" },
  curacao: { hex: "#D9562B", name: "Curaçao" },
  bonaire: { hex: "#0F8F7E", name: "Bonaire" },
  kingdom: { hex: INK, name: "Kingdom" },
  abc: { hex: INK, name: "ABC islands" },
};

let fontCache: Promise<ArrayBuffer | null> | null = null;
/** Fraunces Bold as TTF (Satori cannot read woff2). Falls back to the default font if unreachable. */
function fraunces(): Promise<ArrayBuffer | null> {
  if (!fontCache) {
    fontCache = (async () => {
      try {
        const css = await (await fetch("https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@72,700", { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 6.1)" } })).text();
        const url = css.match(/src: url\((.+?)\) format\('(?:truetype|opentype)'\)/)?.[1];
        if (!url) return null;
        return await (await fetch(url)).arrayBuffer();
      } catch {
        return null;
      }
    })();
  }
  return fontCache;
}

const KEEP = new Set(["viewBox", "preserveAspectRatio", "gradientUnits", "gradientTransform", "patternUnits", "textLength", "lengthAdjust"]);
function attr(k: string) {
  if (k === "className") return "class";
  if (KEEP.has(k)) return k;
  return k.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());
}
function esc(v: unknown) {
  return String(v).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
/** Minimal static serializer for our plain SVG components (no hooks, no context). */
function toMarkup(node: unknown): string {
  if (node == null || node === false || node === true) return "";
  if (Array.isArray(node)) return node.map(toMarkup).join("");
  if (typeof node === "string" || typeof node === "number") return esc(node);
  const el = node as { type: unknown; props: Record<string, unknown> };
  if (typeof el.type === "function") return toMarkup((el.type as (p: unknown) => unknown)(el.props));
  if (typeof el.type === "symbol" || el.type === undefined) return toMarkup(el.props?.children);
  const { children, ...rest } = el.props || {};
  const attrs = Object.entries(rest)
    .filter(([k, v]) => v != null && v !== false && k !== "key" && !k.startsWith("aria") && k !== "style")
    .map(([k, v]) => ` ${attr(k)}="${esc(v)}"`)
    .join("");
  return `<${el.type as string}${attrs}>${toMarkup(children)}</${el.type as string}>`;
}

function svgUri(node: React.ReactElement) {
  let svg = toMarkup(node);
  if (!svg.includes("xmlns=")) svg = svg.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800"');
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

export async function shareCard({ title, island, kicker, icon, seed }: { title: string; island: string; kicker: string; icon: IconKey; seed: string }) {
  const isl = ISLAND[island] || ISLAND.abc;
  const font = await fraunces();
  const size = title.length > 110 ? 46 : title.length > 80 ? 52 : title.length > 55 ? 60 : 68;
  const art = svgUri(<Illo icon={icon} island={island} seed={seed} ratio="square" />);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: SAND }}>
        <div style={{ width: 12, height: "100%", background: island === "abc" ? SIGNAL : isl.hex, display: "flex" }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "52px 48px 48px 56px", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <svg width="48" height="48" viewBox="0 0 48 48">
              <rect x="4" y="28" width="11" height="16" rx="2.5" fill="#1F5FBF" />
              <rect x="18.5" y="17" width="11" height="27" rx="2.5" fill="#D9562B" />
              <rect x="33" y="4" width="11" height="40" rx="2.5" fill="#0F8F7E" />
            </svg>
            <div style={{ display: "flex", alignItems: "flex-end", fontSize: 40, fontWeight: 700, color: INK, fontFamily: font ? "Fraunces" : undefined }}>
              Negoshi
              <div style={{ width: 10, height: 10, background: SIGNAL, marginLeft: 4, marginBottom: 10, display: "flex" }} />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 24, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: isl.hex }}>
              <div style={{ width: 14, height: 14, borderRadius: 7, background: isl.hex, display: "flex" }} />
              {island === "abc" ? kicker : `${isl.name} · ${kicker}`}
            </div>
            <div style={{ display: "flex", fontSize: size, lineHeight: 1.12, fontWeight: 700, color: INK, fontFamily: font ? "Fraunces" : undefined, letterSpacing: -0.5 }}>
              {title}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 24, color: "#5b5a55" }}>
            <div style={{ width: 40, height: 4, background: SIGNAL, display: "flex" }} />
            negoshi.news
          </div>
        </div>
        <div style={{ width: 470, height: "100%", display: "flex", alignItems: "center", justifyContent: "center", paddingRight: 24 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={art} width={460} height={460} alt="" />
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: font ? [{ name: "Fraunces", data: font, weight: 700, style: "normal" }] : undefined, headers: { "Cache-Control": "public, max-age=86400, s-maxage=604800" } },
  );
}
