import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getUsers } from "@/lib/studio/model";
import { storageReady } from "@/lib/studio/store";
import { SetupForm } from "@/components/studio/Forms";
import { NotReady } from "@/components/studio/Shell";

export default async function Setup() {
  await connection();
  if (!storageReady) return <NotReady />;
  if ((await getUsers()).length) redirect("/studio/login");
  return (
    <div className="st-narrow st-stack">
      <div><h1>Set up Negoshi Studio</h1><p className="st-lead">Create the first editor account. This page only works once.</p></div>
      <SetupForm />
    </div>
  );
}
