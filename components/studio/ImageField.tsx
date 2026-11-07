"use client";

import { useRef, useState } from "react";
import { uploadImage } from "./upload";

export function ImageField({ name, initial, label, hint, round }: { name: string; initial?: string; label: string; hint?: string; round?: boolean }) {
  const [url, setUrl] = useState(initial || "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const input = useRef<HTMLInputElement>(null);
  return (
    <div className="st-field">
      <span className="st-label">{label}</span>
      <div className={`st-image ${round ? "round" : ""}`}>
        {url ? <img src={url} alt="" /> : <span className="st-empty">No image</span>}
        <div className="st-image-actions">
          <button type="button" className="st-btn ghost" disabled={busy} onClick={() => input.current?.click()}>{busy ? "Uploading…" : url ? "Replace" : "Upload image"}</button>
          {url && <button type="button" className="st-btn ghost" onClick={() => setUrl("")}>Remove</button>}
        </div>
      </div>
      {hint && <span className="st-hint">{hint}</span>}
      {err && <span className="st-error">{err}</span>}
      <input type="hidden" name={name} value={url} />
      <input ref={input} type="file" accept="image/*" hidden onChange={async (e) => {
        const f = e.target.files?.[0]; e.target.value = "";
        if (!f) return;
        setBusy(true); setErr("");
        try { setUrl(await uploadImage(f, round ? 800 : 2000)); } catch (x) { setErr((x as Error).message); }
        setBusy(false);
      }} />
    </div>
  );
}
