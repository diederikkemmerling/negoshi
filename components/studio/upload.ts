"use client";

/** Resizes large photos in the browser (max 2000px, WebP) and uploads them. Returns the public URL. */
export async function uploadImage(file: File, maxSide = 2000): Promise<string> {
  let blob: Blob = file;
  if (file.type !== "image/gif") {
    try {
      const bmp = await createImageBitmap(file);
      const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
      const w = Math.round(bmp.width * scale), h = Math.round(bmp.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d")!.drawImage(bmp, 0, 0, w, h);
      const out = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/webp", 0.85));
      if (out && out.type === "image/webp") blob = out;
      else {
        const jpg = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", 0.85));
        if (jpg) blob = jpg;
      }
    } catch { /* keep the original */ }
  }
  const ext = blob.type === "image/webp" ? "webp" : blob.type === "image/png" ? "png" : blob.type === "image/gif" ? "gif" : "jpg";
  const fd = new FormData();
  fd.append("file", new File([blob], `upload.${ext}`, { type: blob.type }));
  const r = await fetch("/api/studio/upload", { method: "POST", body: fd });
  const j = await r.json().catch(() => ({ error: "Upload failed." }));
  if (!r.ok || !j.url) throw new Error(j.error || "Upload failed.");
  return j.url as string;
}
