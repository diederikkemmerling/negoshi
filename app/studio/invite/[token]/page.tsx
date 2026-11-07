import { connection } from "next/server";
import { getUsers, hashToken } from "@/lib/studio/model";
import { storageReady } from "@/lib/studio/store";
import { AcceptInviteForm } from "@/components/studio/Forms";
import { NotReady } from "@/components/studio/Shell";
import { Logo } from "@/components/Logo";

export default async function Invite({ params }: { params: Promise<{ token: string }> }) {
  await connection();
  if (!storageReady) return <NotReady />;
  const { token } = await params;
  const u = (await getUsers()).find((x) => x.invite && x.invite.hash === hashToken(token) && x.invite.expires > new Date().toISOString());
  return (
    <div className="st-narrow st-stack">
      <Logo href="/" size={32} />
      <h1>Negoshi Studio</h1>
      {u ? <AcceptInviteForm token={token} name={u.name} /> : <p className="st-lead">This link is invalid or has expired. Ask the editor for a new one.</p>}
    </div>
  );
}
