"use client";

import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { uploadImage } from "./upload";

function Btn({ on, label, title, onClick, disabled }: { on?: boolean; label: string; title: string; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" title={title} aria-label={title} className={`st-tool ${on ? "on" : ""}`} disabled={disabled}
      onMouseDown={(e) => e.preventDefault()} onClick={onClick}>{label}</button>
  );
}

export function RichEditor({ name, initial, readOnly, onWords }: { name: string; initial: string; readOnly?: boolean; onWords?: (n: number) => void }) {
  const [html, setHtml] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [, force] = useState(0);
  const file = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] }, code: false, codeBlock: false, link: { openOnClick: false, autolink: true } }),
      Image.configure({ inline: false }),
    ],
    content: initial || "<p></p>",
    editable: !readOnly,
    immediatelyRender: false,
    editorProps: { attributes: { class: "st-prose" } },
    onUpdate: ({ editor }) => { setHtml(editor.getHTML()); count(editor); },
    onSelectionUpdate: () => force((n) => n + 1),
    onCreate: ({ editor }) => count(editor),
  });

  function count(ed: Editor) {
    const t = ed.getText().trim();
    onWords?.(t ? t.split(/\s+/).length : 0);
  }

  useEffect(() => { editor?.setEditable(!readOnly); }, [editor, readOnly]);

  const e = editor;
  const setLink = () => {
    if (!e) return;
    const prev = e.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link (https://…). Leave empty to remove.", prev || "https://");
    if (url === null) return;
    if (!url || url === "https://") e.chain().focus().extendMarkRange("link").unsetLink().run();
    else e.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="st-editor">
      {!readOnly && (
        <div className="st-toolbar">
          <Btn label="H2" title="Heading" on={e?.isActive("heading", { level: 2 })} onClick={() => e?.chain().focus().toggleHeading({ level: 2 }).run()} />
          <Btn label="H3" title="Subheading" on={e?.isActive("heading", { level: 3 })} onClick={() => e?.chain().focus().toggleHeading({ level: 3 }).run()} />
          <span className="st-sep" />
          <Btn label="B" title="Bold" on={e?.isActive("bold")} onClick={() => e?.chain().focus().toggleBold().run()} />
          <Btn label="I" title="Italic" on={e?.isActive("italic")} onClick={() => e?.chain().focus().toggleItalic().run()} />
          <Btn label="🔗" title="Link" on={e?.isActive("link")} onClick={setLink} />
          <span className="st-sep" />
          <Btn label="• List" title="Bullet list" on={e?.isActive("bulletList")} onClick={() => e?.chain().focus().toggleBulletList().run()} />
          <Btn label="1. List" title="Numbered list" on={e?.isActive("orderedList")} onClick={() => e?.chain().focus().toggleOrderedList().run()} />
          <Btn label="❝ Quote" title="Quote" on={e?.isActive("blockquote")} onClick={() => e?.chain().focus().toggleBlockquote().run()} />
          <span className="st-sep" />
          <Btn label={busy ? "Uploading…" : "＋ Image"} title="Insert image" disabled={busy} onClick={() => file.current?.click()} />
          <span className="st-sep" />
          <Btn label="↶" title="Undo" onClick={() => e?.chain().focus().undo().run()} />
          <Btn label="↷" title="Redo" onClick={() => e?.chain().focus().redo().run()} />
        </div>
      )}
      {err && <div className="st-error" style={{ padding: "8px 14px" }}>{err}</div>}
      <EditorContent editor={editor} />
      <input type="hidden" name={name} value={html} />
      <input ref={file} type="file" accept="image/*" hidden onChange={async (ev) => {
        const f = ev.target.files?.[0]; ev.target.value = "";
        if (!f || !e) return;
        setBusy(true); setErr("");
        try {
          const url = await uploadImage(f);
          e.chain().focus().setImage({ src: url, alt: f.name.replace(/\.[^.]+$/, "") }).run();
        } catch (x) { setErr((x as Error).message); }
        setBusy(false);
      }} />
    </div>
  );
}
