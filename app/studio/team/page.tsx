import { connection } from "next/server";
import { requireEditor } from "@/lib/studio/auth";
import { getArticles, getUsers } from "@/lib/studio/model";
import { storageReady } from "@/lib/studio/store";
import { toggleUserAction } from "../actions";
import { Shell, NotReady } from "@/components/studio/Shell";
import { InviteForm, ReinviteButton } from "@/components/studio/Forms";

export default async function Team() {
  await connection();
  if (!storageReady) return <NotReady />;
  const me = await requireEditor();
  const [users, arts] = await Promise.all([getUsers(), getArticles()]);
  const count = (id: string) => arts.filter((a) => a.author_id === id && a.status === "published").length;
  return (
    <Shell user={me} on="team">
      <div className="st-head"><h1 className="st-h">Team</h1></div>
      <table className="st-team">
        <thead><tr><th>Name</th><th>Role</th><th>Published</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.photo ? <img className="st-avatar" src={u.photo} alt="" /> : <span className="st-avatar" />}<b>{u.name}</b><div className="st-hint" style={{ marginLeft: 46 }}>{u.email}{u.title_en ? ` · ${u.title_en}` : ""}</div></td>
              <td>{u.role}</td>
              <td>{count(u.id)}</td>
              <td>{u.disabled ? "disabled" : u.pass ? "active" : "invited"}</td>
              <td style={{ textAlign: "right" }}>
                {u.id !== me.id && (
                  <div className="st-inline">
                    <ReinviteButton id={u.id} />
                    <form action={toggleUserAction}><input type="hidden" name="id" value={u.id} /><button className="st-btn ghost small">{u.disabled ? "Enable" : "Disable"}</button></form>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <section className="st-section">
        <h2>Invite a contributor</h2>
        <div className="st-card" style={{ maxWidth: 860 }}><InviteForm /></div>
        <p className="st-hint" style={{ marginTop: 10 }}>You get a personal link to send by email or WhatsApp. The contributor sets their own password; nobody else ever sees it.</p>
      </section>
    </Shell>
  );
}
