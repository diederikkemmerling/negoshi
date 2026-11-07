import items from "@/data/items.json";
import reports from "@/data/reports.json";
import sources from "@/data/sources.json";
import indicators from "@/data/indicators.json";
import type { Island, Lang, Topic } from "./i18n";

export type Localized = {
  title: string;
  standfirst: string;
  keypoints: string[];
  body: string[];
};

export type Item = {
  id: string;
  slug: string;
  sample?: boolean;
  island: Island;
  topic: Topic;
  published_at: string;
  source_id: string;
  source_name: string;
  source_url: string;
  also_covered: string[];
  en: Localized;
  nl: Localized;
};

export type Report = {
  id: string;
  sample?: boolean;
  island: Island | "kingdom";
  publisher: string;
  url: string;
  published_at: string;
  en: { title: string; category: string };
  nl: { title: string; category: string };
};

export type Source = {
  id: string;
  name: string;
  island: Island;
  type: string;
  url: string;
  feed: string | null;
  lang: string;
};

const ALL: Item[] = (items as Item[]).slice().sort((a, b) => (a.published_at < b.published_at ? 1 : -1));

export function allItems(): Item[] {
  return ALL;
}
export function itemsByIsland(island: Island): Item[] {
  return ALL.filter((i) => i.island === island);
}
export function itemBySlug(slug: string): Item | undefined {
  return ALL.find((i) => i.slug === slug);
}
export function allReports(): Report[] {
  return (reports as Report[]).slice().sort((a, b) => (a.published_at < b.published_at ? 1 : -1));
}
export function allSources(): Source[] {
  return sources as Source[];
}
export function sourcesByIsland(island: Island): Source[] {
  return allSources().filter((s) => s.island === island);
}
export function loc(item: Item, lang: Lang): Localized {
  return item[lang];
}

export function relTime(iso: string, lang: Lang, now = new Date()): string {
  const d = new Date(iso);
  const h = Math.max(0, Math.round((now.getTime() - d.getTime()) / 36e5));
  if (h < 1) return lang === "nl" ? "zojuist" : "just now";
  if (h < 24) return `${h}${lang === "nl" ? "u" : "h"}`;
  const days = Math.round(h / 24);
  return `${days}${lang === "nl" ? "d" : "d"}`;
}

export function fmtDate(iso: string, lang: Lang): string {
  return new Date(iso).toLocaleDateString(lang === "nl" ? "nl-NL" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

import analysis from "@/data/analysis.json";
export type Analysis = {
  id: string;
  slug: string;
  sample?: boolean;
  status: "draft" | "published";
  island: Island | "abc";
  published_at: string;
  author: { id: string; name: string; title_en: string; title_nl: string; bio_en: string; bio_nl: string };
  en: { title: string; standfirst: string; body: string[] };
  nl: { title: string; standfirst: string; body: string[] };
};
export function allAnalysis(): Analysis[] {
  return (analysis as Analysis[]).filter((a) => a.status === "published").sort((a, b) => (a.published_at < b.published_at ? 1 : -1));
}
export function analysisBySlug(slug: string): Analysis | undefined {
  return allAnalysis().find((a) => a.slug === slug);
}

export type Indicator = {
  id: string;
  en: string;
  nl: string;
  unit: string;
  band: boolean;
  source: string;
  url: string;
  note_en: string | null;
  note_nl: string | null;
  value: string | null;
  period?: string | null;
  change?: string | null;
  updated_at: string | null;
};
/** Live indicators with a value (ticker). */
export function liveIndicators(): Indicator[] {
  return ((indicators as { items: Indicator[] }).items || []).filter((i) => i.value);
}
/** Indicators for the homepage numbers band (band: true), with a value. */
export function bandIndicators(): Indicator[] {
  return liveIndicators().filter((i) => i.band).slice(0, 5);
}
