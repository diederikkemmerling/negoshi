import { notFound } from "next/navigation";
import { connection } from "next/server";
import { isLang } from "@/lib/i18n";


export default async function LangLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  await connection();
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return <>{children}</>;
}
