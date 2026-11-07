"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { currentUser, endSession, requireEditor, requireUser, startSession } from "@/lib/studio/auth";
import {
  checkPassword, cleanHtml, getArticle, getUsers, hashPassword, hashToken, removeArticle, saveArticle, saveUsers, slugify,
  uid, uniqueSlug, updateUser, type Article, type ArticleIsland, type Role, type User,
} from "@/lib/studio/model";

export type FormState = { error?: string; ok?: string; link?: string } | undefined;

const str = (fd: FormData, k: string, max = 400) => String(fd.get(k) ?? "").trim().slice(0, max);
const now = () => new Date().toISOString();
const validEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

async function siteOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "negoshi.news";
  const proto = h.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

// ---------- first editor ----------
export async function setupAction(_: FormState, fd: FormData): Promise<FormState> {
  const users = await getUsers();
  if (users.length) return { error: "Setup is already done. Log in instead." };
  const name = str(fd, "name", 80), email = str(fd, "email", 120).toLowerCase(), pw = String(fd.get("password") ?? "");
  if (!name || !validEmail(email)) return { error: "Fill in your name and a valid email." };
  if (pw.length < 10) return { error: "Password needs at least 10 characters." };
  const user: User = { id: uid(), email, name, slug: uniqueSlug(name, []), role: "editor", title_en: "Editor", title_nl: "Redacteur", bio_en: "", bio_nl: "", pass: hashPassword(pw), created_at: now() };
  await saveUsers([user]);
  await startSession(user);
  redirect("/studio");
}

// ---------- login / logout ----------
export async function loginAction(_: FormState, fd: FormData): Promise<FormState> {
  const email = str(fd, "email", 120).toLowerCase(), pw = String(fd.get("password") ?? "");
  const user = (await getUsers()).find((u) => u.email === email && !u.disabled);
  if (!user || !checkPassword(pw, user.pass)) {
    await new Promise((r) => setTimeout(r, 600));
    return { error: "Email or password is not correct." };
  }
  await startSession(user);
  redirect("/studio");
}

export async function logoutAction() {
  await endSession();
  redirect("/studio/login");
}

// ---------- invites ----------
export async function inviteAction(_: FormState, fd: FormData): Promise<FormState> {
  await requireEditor();
  const name = str(fd, "name", 80), email = str(fd, "email", 120).toLowerCase();
  const role: Role = fd.get("role") === "editor" ? "editor" : "author";
  if (!name || !validEmail(email)) return { error: "Fill in a name and a valid email." };
  const users = await getUsers();
  if (users.some((u) => u.email === email)) return { error: "That email already has an account. Use 'New invite link' in the list." };
  const token = uid(24);
  users.push({
    id: uid(), email, name, slug: uniqueSlug(name, users.map((u) => u.slug)), role,
    title_en: str(fd, "title_en", 120), title_nl: str(fd, "title_nl", 120) || str(fd, "title_en", 120), bio_en: "", bio_nl: "",
    invite: { hash: hashToken(token), expires: new Date(Date.now() + 14 * 864e5).toISOString() }, created_at: now(),
  });
  await saveUsers(users);
  return { ok: `Invite created for ${name}. Send them this link (valid 14 days):`, link: `${await siteOrigin()}/studio/invite/${token}` };
}

export async function reinviteAction(_: FormState, fd: FormData): Promise<FormState> {
  await requireEditor();
  const id = str(fd, "id", 40);
  const token = uid(24);
  const u = await updateUser(id, { invite: { hash: hashToken(token), expires: new Date(Date.now() + 14 * 864e5).toISOString() } });
  if (!u) return { error: "User not found." };
  return { ok: `New link for ${u.name} (valid 14 days, also works as a password reset):`, link: `${await siteOrigin()}/studio/invite/${token}` };
}

export async function toggleUserAction(fd: FormData) {
  const me = await requireEditor();
  const id = str(fd, "id", 40);
  if (id === me.id) return;
  const u = (await getUsers()).find((x) => x.id === id);
  if (u) await updateUser(id, { disabled: !u.disabled });
  redirect("/studio/team");
}

export async function acceptInviteAction(_: FormState, fd: FormData): Promise<FormState> {
  const token = str(fd, "token", 100), pw = String(fd.get("password") ?? ""), pw2 = String(fd.get("password2") ?? "");
  if (pw.length < 10) return { error: "Password needs at least 10 characters." };
  if (pw !== pw2) return { error: "The two passwords do not match." };
  const users = await getUsers();
  const u = users.find((x) => x.invite && x.invite.hash === hashToken(token) && x.invite.expires > now());
  if (!u) return { error: "This link is invalid or expired. Ask the editor for a new one." };
  u.pass = hashPassword(pw);
  delete u.invite;
  u.disabled = false;
  await saveUsers(users);
  await startSession(u);
  redirect("/studio/profile?welcome=1");
}

// ---------- profile ----------
export async function profileAction(_: FormState, fd: FormData): Promise<FormState> {
  const me = await requireUser();
  const name = str(fd, "name", 80);
  if (!name) return { error: "Name is required." };
  const patch: Partial<User> = {
    name, title_en: str(fd, "title_en", 120), title_nl: str(fd, "title_nl", 120), bio_en: str(fd, "bio_en", 1200), bio_nl: str(fd, "bio_nl", 1200),
    photo: str(fd, "photo", 400) || undefined,
  };
  const newPw = String(fd.get("new_password") ?? "");
  if (newPw) {
    if (!checkPassword(String(fd.get("current_password") ?? ""), me.pass)) return { error: "Current password is not correct." };
    if (newPw.length < 10) return { error: "New password needs at least 10 characters." };
    patch.pass = hashPassword(newPw);
  }
  const updated = await updateUser(me.id, patch);
  if (updated && patch.pass) await startSession(updated);
  revalidatePath("/studio/profile");
  return { ok: "Profile saved." };
}

// ---------- articles ----------
export async function newArticleAction() {
  const me = await requireUser();
  const a: Article = { id: uid(), slug: "", author_id: me.id, status: "draft", lang: "nl", island: "abc", title: "", standfirst: "", html: "", created_at: now(), updated_at: now() };
  await saveArticle(a);
  redirect(`/studio/edit/${a.id}`);
}

const ISLANDS: ArticleIsland[] = ["aruba", "curacao", "bonaire", "abc"];

export async function saveArticleAction(_: FormState, fd: FormData): Promise<FormState> {
  const me = await requireUser();
  const a = await getArticle(str(fd, "id", 40));
  if (!a) return { error: "Article not found." };
  const isEditor = me.role === "editor";
  if (!isEditor && a.author_id !== me.id) return { error: "Not your article." };
  const intent = str(fd, "intent", 20);

  if (intent === "delete") {
    if (!isEditor && a.status === "published") return { error: "Published articles can only be removed by the editor." };
    await removeArticle(a.id);
    redirect("/studio");
  }
  if (!isEditor && a.status === "published") return { error: "This article is live. Ask the editor to make changes." };

  a.title = str(fd, "title", 160);
  a.standfirst = str(fd, "standfirst", 400);
  a.lang = fd.get("lang") === "en" ? "en" : "nl";
  const isl = str(fd, "island", 20) as ArticleIsland;
  a.island = ISLANDS.includes(isl) ? isl : "abc";
  a.cover = str(fd, "cover", 400) || undefined;
  a.html = cleanHtml(String(fd.get("html") ?? "").slice(0, 200_000));
  a.updated_at = now();

  const needsContent = () => (!a.title || !a.html.replace(/<[^>]+>/g, "").trim() ? "Add a title and some text first." : null);

  let msg = "Saved.";
  if (intent === "submit") {
    const err = needsContent(); if (err) return { error: err };
    a.status = "submitted"; a.submitted_at = now(); a.editor_note = undefined;
    msg = "Sent to the editor for review.";
  } else if (intent === "publish" && isEditor) {
    const err = needsContent(); if (err) return { error: err };
    if (!a.slug) {
      const users = await getUsers();
      const author = users.find((u) => u.id === a.author_id);
      a.slug = `${slugify(a.title)}-${a.id.slice(0, 4)}`;
      if (!author) return { error: "Author account is missing." };
    }
    a.status = "published"; a.published_at = a.published_at || now(); a.editor_note = undefined;
    msg = "Published. It is live on the Analysis page.";
  } else if (intent === "unpublish" && isEditor) {
    a.status = "draft"; msg = "Taken offline and moved back to draft.";
  } else if (intent === "return" && isEditor) {
    a.status = "draft"; a.editor_note = str(fd, "editor_note", 1000) || "Please revise and resubmit."; msg = "Returned to the author with your note.";
  }
  await saveArticle(a);
  revalidatePath(`/studio/edit/${a.id}`);
  return { ok: msg };
}

export async function whoAmI() {
  const u = await currentUser();
  return u ? { name: u.name, role: u.role } : null;
}
