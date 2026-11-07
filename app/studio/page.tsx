import { redirect } from "next/navigation";
import { connection } from "next/server";
import { requireUser } from "@/lib/studio/auth";
import { getArticles, getUsers, plainText, type Article } from "@/lib/studio/model";
import { storageReady } from "@/lib/studio/store";
import { newArticleAction } from "./actions";
import { Shell, NotReady } from "@/components/studio/Shell";

const fmt = (iso?: string) => (iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "America/Aruba" }) : "");
const ISL: Record<string, string> = { abc: "ABC", aruba: "Aruba", curacao: "Curaçao", bonaire: "Bonaire" };

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  await connection();
  if (!storageReady) return <NotReady />;
  if (!(await getUsers()).length) redirect("/studio/setup");
  const me = await requireUser();
  const { tab: rawTab } = await searchParams;
  const [all, users] = await Promise.all([getArticles(), getUsers()]);
  const names = new Map(users.map((u) => [u.id, u.name]));
  const isEditor = me.role === "editor";
  const mine = all.filter((a) => a.author_id === me.id);
  const review = all.filter((a) => a.status === "submitted");
  const tab = isEditor ? (rawTab === "mine" || rawTab === "all" ? rawTab : review.length ? "review" : "all") : "mine";
  const list: Article[] = tab === "review" ? review : tab === "all" ? all : mine;
  const published = mine.filter((a) => a.status === "published").length;

  return (
    <Shell user={me} on="home">
      <div className="st-head">
        <div>
          <h1 className="st-h">{isEditor ? "Articles" : "My articles"}</h1>
          {!isEditor && <p className="st-lead">{published} published · {mine.length - published} in progress</p>}
        </div>
        <form action={newArticleAction}><button className="st-btn primary">＋ New article</button></form>
      </div>
      {isEditor && (
        <nav className="st-tabs">
          <a href="/studio?tab=review" className={tab === "review" ? "on" : ""}>To review{review.length > 0 && <span className="n">{review.length}</span>}</a>
          <a href="/studio?tab=all" className={tab === "all" ? "on" : ""}>All articles</a>
          <a href="/studio?tab=mine" className={tab === "mine" ? "on" : ""}>Mine</a>
        </nav>
      )}
      {list.length === 0 ? (
        <div className="st-emptybox">
          <span>{tab === "review" ? "Nothing waiting for review." : "No articles yet."}</span>
          {tab !== "review" && <form action={newArticleAction}><button className="st-btn primary">Write your first article</button></form>}
        </div>
      ) : (
        <div className="st-list">
          {list.map((a) => (
            <a key={a.id} href={`/studio/edit/${a.id}`} className="st-item">
              <h3>{a.title || <span style={{ color: "var(--muted)" }}>Untitled draft</span>}</h3>
              <span className={`st-pill ${a.status}`}>{a.status === "submitted" ? "in review" : a.status}</span>
              <span className="m">
                {isEditor && a.author_id !== me.id ? `${names.get(a.author_id) || "Unknown"} · ` : ""}
                {ISL[a.island]} · {a.lang.toUpperCase()} · {a.status === "published" ? `published ${fmt(a.published_at)}` : `edited ${fmt(a.updated_at)}`}
                {a.editor_note && a.status === "draft" ? " · note from editor" : ""}
                {!a.title && a.html ? ` · ${plainText(a.html).slice(0, 60)}…` : ""}
              </span>
            </a>
          ))}
        </div>
      )}
    </Shell>
  );
}
