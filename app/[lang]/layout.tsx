import { notFound } from "next/navigation";
import { connection } from "next/server";
import { isLang } from "@/lib/i18n";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return {};
  return { alternates: { types: { "application/rss+xml": [{ url: `/${lang}/rss.xml`, title: "Negoshi" }] } } };
}


export default async function LangLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  await connection();
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return <>{children}</>;
}
