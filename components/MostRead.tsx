import { mostRead } from "@/lib/hits";
import { loc } from "@/lib/data";
import { pick, t, type Lang } from "@/lib/i18n";

export async function MostRead({ lang, exclude }: { lang: Lang; exclude?: string }) {
  const list = (await mostRead(6)).filter((i) => i.id !== exclude).slice(0, 5);
  if (list.length < 3) return null;
  const d = t(lang);
  return (
    <div className="box mostread">
      <h2>{pick(lang, "Most read", "Meest gelezen", "Lo más leído")}</h2>
      <ol>
        {list.map((i) => (
          <li key={i.id}>
            <a href={`/${lang}/brief/${i.slug}`}>{loc(i, lang).title}</a>
            <span>{d.islands[i.island]}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
