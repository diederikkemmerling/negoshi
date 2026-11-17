import { headers } from "next/headers";
import { redirect } from "next/navigation";

/** Sends a visitor to the site language their browser prefers (English, Dutch or Spanish). */
export default async function Root() {
  const accept = (await headers()).get("accept-language") || "";
  const first = accept.split(",").map((p) => p.trim().slice(0, 2).toLowerCase()).find((c) => c === "en" || c === "nl" || c === "es");
  redirect(`/${first || "en"}`);
}
