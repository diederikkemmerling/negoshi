import { allAnalysis } from "./data";
import { publishedArticles } from "./studio/model";
import type { Lang } from "./i18n";

export type PubAuthor = { name: string; slug?: string; title: string; bio: string; photo?: string };
export type PubAnalysis = {
  id: string;
  slug: string;
  sample?: boolean;
  island: string;
  published_at: string;
  lang: Lang; // language the piece is written in
  title: string;
  standfirst: string;
  html?: string;
  paragraphs?: string[];
  cover?: string;
  author: PubAuthor;
};

/** Published analysis for a site language: studio articles first; bundled samples only while there are none. */
export async function analysisFor(lang: Lang): Promise<PubAnalysis[]> {
  const live = (await publishedArticles()).map(({ article: a, author: u }): PubAnalysis => ({
    id: a.id, slug: a.slug, island: a.island, published_at: a.published_at || a.updated_at, lang: a.lang,
    title: a.title, standfirst: a.standfirst, html: a.html, cover: a.cover,
    author: { name: u.name, slug: u.slug, title: (lang === "nl" ? u.title_nl : u.title_en) || u.title_en || u.title_nl, bio: (lang === "nl" ? u.bio_nl : u.bio_en) || u.bio_en || u.bio_nl, photo: u.photo },
  }));
  if (live.length) return live;
  return allAnalysis().map((a) => ({
    id: a.id, slug: a.slug, sample: a.sample, island: a.island, published_at: a.published_at, lang,
    title: a[lang].title, standfirst: a[lang].standfirst, paragraphs: a[lang].body,
    author: { name: a.author.name, title: lang === "nl" ? a.author.title_nl : a.author.title_en, bio: lang === "nl" ? a.author.bio_nl : a.author.bio_en },
  }));
}

export async function analysisBySlugFor(lang: Lang, slug: string) {
  return (await analysisFor(lang)).find((a) => a.slug === slug);
}

export const ORIGINAL_NOTE = {
  en: { nl: "Written in Dutch by the author.", en: "" },
  nl: { en: "Door de auteur in het Engels geschreven.", nl: "" },
} as const;
