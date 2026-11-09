import { shareCard, OG_SIZE } from "@/lib/og";
import { isLang, t } from "@/lib/i18n";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Negoshi";

export default async function Image({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const d = t(isLang(lang) ? lang : "en");
  return shareCard({ title: d.tagline, island: "abc", kicker: lang === "nl" ? "Zakennieuws van de ABC-eilanden" : "ABC islands business news", icon: "handshake", seed: "home" });
}
