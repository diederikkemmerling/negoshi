import { redirect } from "next/navigation";
import { connection } from "next/server";
import { currentUser } from "@/lib/studio/auth";
import { getUsers } from "@/lib/studio/model";
import { storageReady } from "@/lib/studio/store";
import { LoginForm } from "@/components/studio/Forms";
import { NotReady } from "@/components/studio/Shell";
import { Logo } from "@/components/Logo";

export default async function Login() {
  await connection();
  if (!storageReady) return <NotReady />;
  if (!(await getUsers()).length) redirect("/studio/setup");
  if (await currentUser()) redirect("/studio");
  return (
    <div className="st-narrow st-stack">
      <Logo href="/" size={32} />
      <div><h1>Contributor login</h1><p className="st-lead">Write and manage your Negoshi analysis pieces.</p></div>
      <LoginForm />
      <p className="st-hint">Forgot your password? Ask the editor for a new invite link.</p>
    </div>
  );
}
