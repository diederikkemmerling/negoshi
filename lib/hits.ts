import { readDoc, writeDoc, storageReady } from "@/lib/studio/store";
import { allItems, type Item } from "@/lib/data";

/** Page-view counts per day: { "2026-11-17": { "<item id>": 12 } }. Kept for 8 days. */
type Hits = { days: Record<string, Record<string, number>> };
const KEY = "stats/hits";
const pending = new Map<string, number>();
let lastFlush = 0;
let cache: { at: number; data: Hits } | null = null;

const today = () => new Date().toISOString().slice(0, 10);

async function flush() {
  lastFlush = Date.now();
  if (!pending.size) return;
  const batch = new Map(pending);
  pending.clear();
  const cur = (await readDoc<Hits>(KEY)) || { days: {} };
  const day = today();
  const bucket = (cur.days[day] ||= {});
  for (const [id, n] of batch) bucket[id] = (bucket[id] || 0) + n;
  const keep = new Date(Date.now() - 8 * 864e5).toISOString().slice(0, 10);
  for (const d of Object.keys(cur.days)) if (d < keep) delete cur.days[d];
  await writeDoc(KEY, cur);
  cache = { at: Date.now(), data: cur };
}

/** Counts one view. Writes are batched: at most one storage write per minute per server instance. */
export async function recordHit(id: string) {
  if (!storageReady) return;
  pending.set(id, (pending.get(id) || 0) + 1);
  if (Date.now() - lastFlush > 60_000) await flush().catch(() => {});
}

/** Most-read briefs over the last `days` days, newest data cached for five minutes. */
export async function mostRead(n = 5, days = 7): Promise<Item[]> {
  if (!storageReady) return [];
  try {
    if (!cache || Date.now() - cache.at > 300_000) cache = { at: Date.now(), data: (await readDoc<Hits>(KEY)) || { days: {} } };
  } catch {
    return [];
  }
  const since = new Date(Date.now() - days * 864e5).toISOString().slice(0, 10);
  const total = new Map<string, number>();
  for (const [d, ids] of Object.entries(cache.data.days)) if (d >= since) for (const [id, c] of Object.entries(ids)) total.set(id, (total.get(id) || 0) + c);
  const byId = new Map(allItems().map((i) => [i.id, i]));
  return [...total.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => byId.get(id)).filter((i): i is Item => !!i).slice(0, n);
}
