import { connection } from "next/server";
import { requireUser } from "@/lib/studio/auth";
import { storageReady } from "@/lib/studio/store";
import { Shell, NotReady } from "@/components/studio/Shell";
import { ProfileForm } from "@/components/studio/Forms";

export default async function Profile({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  await connection();
  if (!storageReady) return <NotReady />;
  const me = await requireUser();
  const { welcome } = await searchParams;
  return (
    <Shell user={me} on="profile">
      <div className="st-head"><h1 className="st-h">Your profile</h1></div>
      {welcome && <div className="st-alert ok" style={{ marginBottom: 16 }}>Your account is active. Add a photo and a short bio; they appear with every article you publish.</div>}
      <div className="st-card" style={{ maxWidth: 860 }}>
        <ProfileForm u={{ name: me.name, email: me.email, title_en: me.title_en, title_nl: me.title_nl, bio_en: me.bio_en, bio_nl: me.bio_nl, photo: me.photo }} />
      </div>
    </Shell>
  );
}
