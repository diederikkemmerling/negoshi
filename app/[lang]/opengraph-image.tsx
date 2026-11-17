import { shareCard, OG_SIZE } from "@/lib/og";
import { isLang, t, pick } from "@/lib/i18n";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Negoshi";

export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const p = await params;
  const lang = isLang(p.lang) ? p.lang : "en";
  const d = t(lang);
  return shareCard({ title: d.tagline, island: "abc", kicker: pick(lang, "ABC islands business news", "Zakennieuws van de ABC-eilanden", "Noticias de negocios de las islas ABC"), icon: "handshake", seed: "home" });
}
