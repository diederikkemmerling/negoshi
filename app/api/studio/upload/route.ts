import { NextResponse } from "next/server";
import { currentUser } from "@/lib/studio/auth";
import { putImage, storageReady } from "@/lib/studio/store";

const TYPES: Record<string, string> = { "image/webp": "webp", "image/jpeg": "jpg", "image/png": "png", "image/gif": "gif" };

export async function POST(req: Request) {
  if (!storageReady) return NextResponse.json({ error: "Storage is not connected yet." }, { status: 503 });
  const me = await currentUser();
  if (!me) return NextResponse.json({ error: "Please log in again." }, { status: 401 });
  const fd = await req.formData();
  const file = fd.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file." }, { status: 400 });
  const ext = TYPES[file.type];
  if (!ext) return NextResponse.json({ error: "Use a JPG, PNG, WebP or GIF image." }, { status: 400 });
  if (file.size > 4 * 1024 * 1024) return NextResponse.json({ error: "Image is larger than 4 MB." }, { status: 400 });
  const url = await putImage(Buffer.from(await file.arrayBuffer()), file.type, ext);
  return NextResponse.json({ url });
}
