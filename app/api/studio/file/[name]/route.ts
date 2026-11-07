import { readLocalImage } from "@/lib/studio/store";

/** Local development only: serves uploaded images from disk. In production images live on Vercel Blob. */
export async function GET(_: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const buf = await readLocalImage(name);
  if (!buf) return new Response("Not found", { status: 404 });
  const ext = name.split(".").pop()!.toLowerCase();
  const type = ext === "jpg" || ext === "jpeg" ? "image/jpeg" : `image/${ext}`;
  return new Response(new Uint8Array(buf), { headers: { "content-type": type, "cache-control": "public, max-age=31536000, immutable" } });
}
