import { notFound } from "next/navigation";
import { connection } from "next/server";
import { requireUser } from "@/lib/studio/auth";
import { getArticle, userById } from "@/lib/studio/model";
import { storageReady } from "@/lib/studio/store";
import { Shell, NotReady } from "@/components/studio/Shell";
import { ArticleForm } from "@/components/studio/Forms";

export default async function Edit({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  if (!storageReady) return <NotReady />;
  const me = await requireUser();
  const { id } = await params;
  const a = await getArticle(id);
  const isEditor = me.role === "editor";
  if (!a || (!isEditor && a.author_id !== me.id)) notFound();
  const author = a.author_id === me.id ? null : await userById(a.author_id);
  return (
    <Shell user={me} on="home">
      <div className="st-head">
        <a href="/studio" className="st-hint" style={{ textDecoration: "none" }}>← All articles</a>
        {author && <span className="st-hint">by <b style={{ color: "var(--ink)" }}>{author.name}</b></span>}
      </div>
      <ArticleForm a={a} isEditor={isEditor} locked={!isEditor && a.status === "published"} />
    </Shell>
  );
}
