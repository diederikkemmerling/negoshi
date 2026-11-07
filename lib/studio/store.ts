/**
 * Studio storage. Production: Vercel Blob (public store). Local dev: files under /tmp.
 * JSON documents are written as immutable versions (key/<time>-<rand>.json) under a secret prefix
 * derived from the Blob token, so they are never cached stale and never guessable from image URLs.
 */
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { put, list, del } from "@vercel/blob";

const TOKEN = process.env.BLOB_READ_WRITE_TOKEN;
export const usingBlob = Boolean(TOKEN);
/** In production without a Blob store the studio cannot persist anything. */
export const storageReady = usingBlob || !process.env.VERCEL;
const LOCAL = process.env.STUDIO_LOCAL_DIR || "/tmp/negoshi-studio";

export function secretKey(): Buffer {
  const base = TOKEN || process.env.STUDIO_DEV_SECRET || "negoshi-local-dev";
  return crypto.createHash("sha256").update("negoshi-studio:" + base).digest();
}
const PRIV = "studio-" + crypto.createHmac("sha256", secretKey()).update("prefix").digest("hex").slice(0, 24);

const stamp = () => Date.now().toString(36).padStart(9, "0") + "-" + crypto.randomBytes(4).toString("hex");

type Entry = { key: string; name: string; url: string };

async function listAll(prefix: string): Promise<Entry[]> {
  const base = `${PRIV}/${prefix}`;
  if (!usingBlob) {
    const out: Entry[] = [];
    const root = path.join(LOCAL, PRIV);
    const walk = async (dir: string) => {
      let ents: import("node:fs").Dirent[] = [];
      try { ents = await fs.readdir(dir, { withFileTypes: true }); } catch { return; }
      for (const e of ents) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) await walk(full);
        else {
          const rel = path.relative(root, full).split(path.sep).join("/");
          if (rel.startsWith(prefix)) out.push({ key: rel.slice(0, rel.lastIndexOf("/")), name: e.name, url: full });
        }
      }
    };
    await walk(root);
    return out;
  }
  const out: Entry[] = [];
  let cursor: string | undefined;
  do {
    const r = await list({ prefix: base, cursor, limit: 1000, token: TOKEN });
    for (const b of r.blobs) {
      const rel = b.pathname.slice(PRIV.length + 1);
      out.push({ key: rel.slice(0, rel.lastIndexOf("/")), name: rel.slice(rel.lastIndexOf("/") + 1), url: b.url });
    }
    cursor = r.hasMore ? r.cursor : undefined;
  } while (cursor);
  return out;
}

async function fetchJson<T>(e: Entry): Promise<T | null> {
  try {
    if (!usingBlob) return JSON.parse(await fs.readFile(e.url, "utf8")) as T;
    const r = await fetch(e.url, { cache: "no-store" });
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch {
    return null;
  }
}

function newest(entries: Entry[]): Map<string, { latest: Entry; old: Entry[] }> {
  const m = new Map<string, { latest: Entry; old: Entry[] }>();
  for (const e of entries) {
    const cur = m.get(e.key);
    if (!cur) m.set(e.key, { latest: e, old: [] });
    else if (e.name > cur.latest.name) { cur.old.push(cur.latest); cur.latest = e; }
    else cur.old.push(e);
  }
  return m;
}

export async function readDoc<T>(key: string): Promise<T | null> {
  const m = newest((await listAll(key + "/")).filter((e) => e.key === key));
  const hit = m.get(key);
  return hit ? fetchJson<T>(hit.latest) : null;
}

/** Reads the latest version of every document under a folder, e.g. "articles". */
export async function readFolder<T>(folder: string): Promise<T[]> {
  const m = newest(await listAll(folder + "/"));
  const docs = await Promise.all([...m.values()].map((v) => fetchJson<T>(v.latest)));
  return docs.filter((d): d is Awaited<T> => d !== null) as T[];
}

export async function writeDoc(key: string, data: unknown): Promise<void> {
  const body = JSON.stringify(data);
  const name = `${stamp()}.json`;
  if (!usingBlob) {
    const dir = path.join(LOCAL, PRIV, key);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, name), body);
  } else {
    await put(`${PRIV}/${key}/${name}`, body, { access: "public", addRandomSuffix: false, contentType: "application/json", cacheControlMaxAge: 31536000, token: TOKEN });
  }
  // keep the newest two versions, drop the rest
  const all = (await listAll(key + "/")).filter((e) => e.key === key).sort((a, b) => (a.name < b.name ? 1 : -1));
  const drop = all.slice(2);
  if (!drop.length) return;
  if (!usingBlob) await Promise.all(drop.map((e) => fs.rm(e.url, { force: true })));
  else await del(drop.map((e) => e.url), { token: TOKEN });
}

export async function deleteDoc(key: string): Promise<void> {
  const all = (await listAll(key + "/")).filter((e) => e.key === key);
  if (!all.length) return;
  if (!usingBlob) await Promise.all(all.map((e) => fs.rm(e.url, { force: true })));
  else await del(all.map((e) => e.url), { token: TOKEN });
}

/** Stores an uploaded image and returns its public URL. */
export async function putImage(buf: Buffer, contentType: string, ext: string): Promise<string> {
  const name = `${Date.now().toString(36)}-${crypto.randomBytes(6).toString("hex")}.${ext}`;
  if (!usingBlob) {
    const dir = path.join(LOCAL, "img");
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, name), buf);
    return `/api/studio/file/${name}`;
  }
  const r = await put(`img/${name}`, buf, { access: "public", addRandomSuffix: false, contentType, cacheControlMaxAge: 31536000, token: TOKEN });
  return r.url;
}

export async function readLocalImage(name: string): Promise<Buffer | null> {
  if (usingBlob || !/^[a-z0-9-]+\.(webp|jpg|jpeg|png|gif)$/i.test(name)) return null;
  try { return await fs.readFile(path.join(LOCAL, "img", name)); } catch { return null; }
}
