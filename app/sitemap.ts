import type { MetadataRoute } from "next";
import { allItems } from "@/lib/data";
import { ISLANDS, LANGS } from "@/lib/i18n";

const SITE = "https://negoshi.news";
const alt = (path: string) => ({ languages: Object.fromEntries(LANGS.map((l) => [l, `${SITE}/${l}${path}`])) });

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", ...ISLANDS.map((i) => `/${i}`), "/reports", "/analysis", "/about"];
  const now = new Date();
  return [
    ...pages.flatMap((p) => LANGS.map((l) => ({ url: `${SITE}/${l}${p}`, lastModified: now, changeFrequency: "hourly" as const, priority: p === "" ? 1 : 0.7, alternates: alt(p) }))),
    ...allItems().filter((i) => !i.sample).flatMap((i) => LANGS.map((l) => ({ url: `${SITE}/${l}/brief/${i.slug}`, lastModified: new Date(i.published_at), changeFrequency: "weekly" as const, priority: 0.6, alternates: alt(`/brief/${i.slug}`) }))),
  ];
}
