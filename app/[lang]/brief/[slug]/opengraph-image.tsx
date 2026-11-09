import { shareCard, OG_SIZE } from "@/lib/og";
import { topicIcon } from "@/components/Art";
import { itemBySlug, loc } from "@/lib/data";
import { isLang, t } from "@/lib/i18n";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Negoshi";

export default async function Image({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  const item = itemBySlug(slug);
  const l = isLang(lang) ? lang : "en";
  if (!item) return shareCard({ title: t(l).tagline, island: "abc", kicker: "Negoshi", icon: "handshake", seed: "home" });
  return shareCard({ title: loc(item, l).title, island: item.island, kicker: t(l).topics[item.topic], icon: topicIcon(item.topic), seed: item.slug });
}
