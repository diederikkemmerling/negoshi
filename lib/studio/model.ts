import crypto from "node:crypto";
import sanitize from "sanitize-html";
import { readDoc, writeDoc, readFolder, deleteDoc } from "./store";

export type Role = "editor" | "author";
export type User = {
  id: string;
  email: string;
  name: string;
  slug: string;
  role: Role;
  title_en: string;
  title_nl: string;
  bio_en: string;
  bio_nl: string;
  photo?: string;
  pass?: string; // scrypt "salt:hash"
  invite?: { hash: string; expires: string };
  disabled?: boolean;
  created_at: string;
};
export type Status = "draft" | "submitted" | "published";
export type ArticleIsland = "aruba" | "curacao" | "bonaire" | "abc";
export type Article = {
  id: string;
  slug: string;
  author_id: string;
  status: Status;
  lang: "en" | "nl";
  island: ArticleIsland;
  title: string;
  standfirst: string;
  html: string;
  cover?: string;
  editor_note?: string;
  created_at: string;
  updated_at: string;
  submitted_at?: string;
  published_at?: string;
};

export const uid = (n = 8) => crypto.randomBytes(n).toString("hex");
export const slugify = (s: string) =>
  s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 70) || "article";

// ---------- passwords ----------
export function hashPassword(pw: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  return salt + ":" + crypto.scryptSync(pw, salt, 32).toString("hex");
}
export function checkPassword(pw: string, stored?: string): boolean {
  if (!stored) return false;
  const [salt, hash] = stored.split(":");
  const test = crypto.scryptSync(pw, salt, 32);
  const want = Buffer.from(hash, "hex");
  return want.length === test.length && crypto.timingSafeEqual(want, test);
}
export const hashToken = (t: string) => crypto.createHash("sha256").update(t).digest("hex");

// ---------- users ----------
export async function getUsers(): Promise<User[]> {
  return (await readDoc<User[]>("users")) ?? [];
}
export async function saveUsers(users: User[]): Promise<void> {
  await writeDoc("users", users);
}
export async function userById(id: string): Promise<User | undefined> {
  return (await getUsers()).find((u) => u.id === id);
}
export async function updateUser(id: string, patch: Partial<User>): Promise<User | undefined> {
  const users = await getUsers();
  const i = users.findIndex((u) => u.id === id);
  if (i < 0) return undefined;
  users[i] = { ...users[i], ...patch };
  await saveUsers(users);
  return users[i];
}
export function uniqueSlug(name: string, taken: string[]): string {
  const base = slugify(name);
  let s = base;
  for (let n = 2; taken.includes(s); n++) s = `${base}-${n}`;
  return s;
}
export const publicUser = (u: User) => ({ id: u.id, name: u.name, slug: u.slug, title_en: u.title_en, title_nl: u.title_nl, bio_en: u.bio_en, bio_nl: u.bio_nl, photo: u.photo });
export type PublicAuthor = ReturnType<typeof publicUser>;

// ---------- articles ----------
export async function getArticles(): Promise<Article[]> {
  const list = await readFolder<Article>("articles");
  return list.sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1));
}
export async function getArticle(id: string): Promise<Article | null> {
  if (!/^[a-f0-9]{16}$/.test(id)) return null;
  return readDoc<Article>(`articles/${id}`);
}
export async function saveArticle(a: Article): Promise<void> {
  await writeDoc(`articles/${a.id}`, a);
  publishedCache = null;
}
export async function removeArticle(id: string): Promise<void> {
  await deleteDoc(`articles/${id}`);
  publishedCache = null;
}

// ---------- public read (short in-memory cache per server instance) ----------
let publishedCache: { at: number; list: { article: Article; author: PublicAuthor }[] } | null = null;
export async function publishedArticles(): Promise<{ article: Article; author: PublicAuthor }[]> {
  if (publishedCache && Date.now() - publishedCache.at < 30_000) return publishedCache.list;
  try {
    const [arts, users] = await Promise.all([getArticles(), getUsers()]);
    const byId = new Map(users.map((u) => [u.id, u]));
    const list = arts
      .filter((a) => a.status === "published" && byId.has(a.author_id))
      .map((a) => ({ article: a, author: publicUser(byId.get(a.author_id)!) }))
      .sort((x, y) => ((x.article.published_at || "") < (y.article.published_at || "") ? 1 : -1));
    publishedCache = { at: Date.now(), list };
    return list;
  } catch {
    return publishedCache?.list ?? [];
  }
}

// ---------- html sanitizing ----------
export function cleanHtml(html: string): string {
  return sanitize(html, {
    allowedTags: ["p", "h2", "h3", "strong", "b", "em", "i", "u", "s", "a", "ul", "ol", "li", "blockquote", "img", "br", "hr", "figure", "figcaption"],
    allowedAttributes: { a: ["href", "target", "rel"], img: ["src", "alt"] },
    allowedSchemes: ["https", "http", "mailto"],
    allowedSchemesByTag: { img: ["https"] },
    allowProtocolRelative: false,
    transformTags: { a: sanitize.simpleTransform("a", { target: "_blank", rel: "noopener" }) },
    exclusiveFilter: (f) => f.tag === "img" && !/^(https:\/\/|\/api\/studio\/file\/)/.test(f.attribs.src || ""),
  });
}
export const plainText = (html: string) => html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
export const wordCount = (html: string) => (plainText(html) ? plainText(html).split(" ").length : 0);
