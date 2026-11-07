"use client";

import { createContext, useActionState, useContext, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import {
  acceptInviteAction, inviteAction, loginAction, profileAction, reinviteAction, saveArticleAction, setupAction, type FormState,
} from "@/app/studio/actions";
import { ImageField } from "./ImageField";
import { RichEditor } from "./RichEditor";

function Msg({ s }: { s: FormState }) {
  if (!s) return null;
  return (
    <>
      {s.error && <div className="st-alert err">{s.error}</div>}
      {s.ok && (
        <div className="st-alert ok">
          {s.ok}
          {s.link && <CopyLink link={s.link} />}
        </div>
      )}
    </>
  );
}

function CopyLink({ link }: { link: string }) {
  const [done, setDone] = useState(false);
  return (
    <div className="st-copy">
      <input readOnly value={link} onFocus={(e) => e.currentTarget.select()} />
      <button type="button" className="st-btn" onClick={() => { navigator.clipboard?.writeText(link); setDone(true); }}>{done ? "Copied" : "Copy"}</button>
    </div>
  );
}

const Busy = createContext(false);
/** Submits without React's automatic form reset, so field values stay as typed. */
function useNoResetSubmit(act: (fd: FormData) => void) {
  const [pending, start] = useTransition();
  const onSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const submitter = (ev.nativeEvent as SubmitEvent).submitter as HTMLElement | null;
    const fd = new FormData(ev.currentTarget, submitter);
    start(() => act(fd));
  };
  return { pending, onSubmit };
}

function Submit({ children, name, value, kind = "", disabled }: { children: React.ReactNode; name?: string; value?: string; kind?: string; disabled?: boolean }) {
  const status = useFormStatus();
  const busy = useContext(Busy);
  const pending = status.pending || busy;
  return <button className={`st-btn ${kind}`} name={name} value={value} disabled={pending || disabled}>{children}</button>;
}

const Field = ({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) => (
  <label className="st-field"><span className="st-label">{label}</span>{children}{hint && <span className="st-hint">{hint}</span>}</label>
);

export function SetupForm() {
  const [s, act] = useActionState(setupAction, undefined);
  return (
    <form action={act} className="st-stack">
      <Msg s={s} />
      <Field label="Your name"><input name="name" required autoComplete="name" /></Field>
      <Field label="Email"><input name="email" type="email" required autoComplete="email" /></Field>
      <Field label="Password" hint="At least 10 characters."><input name="password" type="password" required minLength={10} autoComplete="new-password" /></Field>
      <Submit kind="primary">Create editor account</Submit>
    </form>
  );
}

export function LoginForm() {
  const [s, act] = useActionState(loginAction, undefined);
  return (
    <form action={act} className="st-stack">
      <Msg s={s} />
      <Field label="Email"><input name="email" type="email" required autoComplete="email" /></Field>
      <Field label="Password"><input name="password" type="password" required autoComplete="current-password" /></Field>
      <Submit kind="primary">Log in</Submit>
    </form>
  );
}

export function AcceptInviteForm({ token, name }: { token: string; name: string }) {
  const [s, act] = useActionState(acceptInviteAction, undefined);
  return (
    <form action={act} className="st-stack">
      <p className="st-lead">Welcome, {name}. Choose a password to activate your account.</p>
      <Msg s={s} />
      <input type="hidden" name="token" value={token} />
      <Field label="Password" hint="At least 10 characters."><input name="password" type="password" required minLength={10} autoComplete="new-password" /></Field>
      <Field label="Repeat password"><input name="password2" type="password" required minLength={10} autoComplete="new-password" /></Field>
      <Submit kind="primary">Activate account</Submit>
    </form>
  );
}

export function InviteForm() {
  const [s, act] = useActionState(inviteAction, undefined);
  return (
    <form action={act} className="st-stack">
      <Msg s={s} />
      <div className="st-grid2">
        <Field label="Name"><input name="name" required /></Field>
        <Field label="Email"><input name="email" type="email" required /></Field>
        <Field label="Title (English)" hint="e.g. Professor of Economics, University of Aruba"><input name="title_en" /></Field>
        <Field label="Title (Dutch)"><input name="title_nl" /></Field>
      </div>
      <Field label="Role">
        <select name="role" defaultValue="author"><option value="author">Author: writes, sends to editor</option><option value="editor">Editor: approves and publishes</option></select>
      </Field>
      <div><Submit kind="primary">Create invite link</Submit></div>
    </form>
  );
}

export function ReinviteButton({ id }: { id: string }) {
  const [s, act] = useActionState(reinviteAction, undefined);
  return (
    <form action={act} className="st-inline">
      <input type="hidden" name="id" value={id} />
      <Submit kind="ghost small">New invite link</Submit>
      <Msg s={s} />
    </form>
  );
}

type ProfileUser = { name: string; email: string; title_en: string; title_nl: string; bio_en: string; bio_nl: string; photo?: string };
export function ProfileForm({ u }: { u: ProfileUser }) {
  const [s, act] = useActionState(profileAction, undefined);
  const [v, setV] = useState({ name: u.name, title_en: u.title_en, title_nl: u.title_nl, bio_en: u.bio_en, bio_nl: u.bio_nl });
  const { pending, onSubmit } = useNoResetSubmit(act);
  const bind = (k: keyof typeof v) => ({ name: k, value: v[k], onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setV({ ...v, [k]: e.target.value }) });
  return (
    <Busy.Provider value={pending}>
    <form onSubmit={onSubmit} className="st-stack">
      <Msg s={s} />
      <div className="st-profile">
        <ImageField name="photo" initial={u.photo} label="Photo" hint="Square headshot works best." round />
        <div className="st-stack" style={{ flex: 1 }}>
          <Field label="Name"><input {...bind("name")} required /></Field>
          <Field label="Email"><input value={u.email} disabled /></Field>
        </div>
      </div>
      <div className="st-grid2">
        <Field label="Title (English)"><input {...bind("title_en")} /></Field>
        <Field label="Title (Dutch)"><input {...bind("title_nl")} /></Field>
        <Field label="Short bio (English)" hint="2 to 3 sentences, shown under your articles."><textarea {...bind("bio_en")} rows={4} /></Field>
        <Field label="Short bio (Dutch)"><textarea {...bind("bio_nl")} rows={4} /></Field>
      </div>
      <details className="st-details">
        <summary>Change password</summary>
        <div className="st-grid2" style={{ marginTop: 12 }}>
          <Field label="Current password"><input name="current_password" type="password" autoComplete="current-password" /></Field>
          <Field label="New password" hint="At least 10 characters."><input name="new_password" type="password" autoComplete="new-password" /></Field>
        </div>
      </details>
      <div><Submit kind="primary">Save profile</Submit></div>
    </form>
    </Busy.Provider>
  );
}

type EditArticle = { id: string; status: string; lang: string; island: string; title: string; standfirst: string; html: string; cover?: string; editor_note?: string; slug: string };
export function ArticleForm({ a, isEditor, locked }: { a: EditArticle; isEditor: boolean; locked: boolean }) {
  const [s, act] = useActionState(saveArticleAction, undefined);
  const [words, setWords] = useState(0);
  const [title, setTitle] = useState(a.title);
  const [standfirst, setStandfirst] = useState(a.standfirst);
  const [lang, setLang] = useState(a.lang);
  const [island, setIsland] = useState(a.island);
  const { pending, onSubmit } = useNoResetSubmit(act);
  return (
    <Busy.Provider value={pending}>
    <form onSubmit={onSubmit} className="st-article">
      <input type="hidden" name="id" value={a.id} />
      <div className="st-main">
        <Msg s={s} />
        {a.editor_note && a.status === "draft" && <div className="st-alert note"><b>Note from the editor:</b> {a.editor_note}</div>}
        {locked && <div className="st-alert note">This article is live. Ask the editor if something needs to change.</div>}
        <textarea name="title" className="st-title" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} rows={2} maxLength={160} readOnly={locked} />
        <textarea name="standfirst" className="st-standfirst" placeholder="Standfirst: one or two sentences that sum up your argument" value={standfirst} onChange={(e) => setStandfirst(e.target.value)} rows={2} maxLength={400} readOnly={locked} />
        <RichEditor name="html" initial={a.html} readOnly={locked} onWords={setWords} />
      </div>
      <aside className="st-side">
        <div className="st-card">
          <div className="st-row"><span className="st-label">Status</span><span className={`st-pill ${a.status}`}>{a.status}</span></div>
          <div className="st-row"><span className="st-label">Words</span><span>{words}{words > 0 && words < 600 ? " (aim for 600 to 1,200)" : ""}</span></div>
          <Field label="Language">
            <select name="lang" value={lang} onChange={(e) => setLang(e.target.value)} disabled={locked}><option value="nl">Nederlands</option><option value="en">English</option></select>
          </Field>
          <Field label="Island">
            <select name="island" value={island} onChange={(e) => setIsland(e.target.value)} disabled={locked}>
              <option value="abc">All three islands</option><option value="aruba">Aruba</option><option value="curacao">Curaçao</option><option value="bonaire">Bonaire</option>
            </select>
          </Field>
          {locked ? null : <ImageField name="cover" initial={a.cover} label="Cover image (optional)" hint="Without one, Negoshi adds an illustration." />}
          {locked && <input type="hidden" name="cover" value={a.cover || ""} />}
        </div>
        <div className="st-card st-actions">
          {!locked && <Submit name="intent" value="save" kind="ghost">Save draft</Submit>}
          {!isEditor && a.status === "draft" && <Submit name="intent" value="submit" kind="primary">Send to editor</Submit>}
          {!isEditor && a.status === "submitted" && <span className="st-hint">Waiting for the editor. You can still make changes.</span>}
          {isEditor && a.status !== "published" && <Submit name="intent" value="publish" kind="primary">Publish</Submit>}
          {isEditor && a.status === "published" && <Submit name="intent" value="publish" kind="primary">Update live article</Submit>}
          {isEditor && a.status === "published" && <Submit name="intent" value="unpublish" kind="ghost">Take offline</Submit>}
          {a.status === "published" && a.slug && <a className="st-btn ghost" href={`/${a.lang}/analysis/${a.slug}`} target="_blank">View live ↗</a>}
          {isEditor && a.status === "submitted" && (
            <details className="st-details">
              <summary>Return to author with a note</summary>
              <textarea name="editor_note" rows={3} placeholder="What should change?" style={{ marginTop: 8 }} />
              <Submit name="intent" value="return" kind="ghost">Return to author</Submit>
            </details>
          )}
          {(!locked || isEditor) && (
            <button className="st-btn danger" name="intent" value="delete" onClick={(e) => { if (!window.confirm("Delete this article?")) e.preventDefault(); }}>Delete</button>
          )}
        </div>
      </aside>
    </form>
    </Busy.Provider>
  );
}
