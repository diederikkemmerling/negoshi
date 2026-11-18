import { mostRead } from "@/lib/hits";
import { loc } from "@/lib/data";
import { pick, t, type Lang } from "@/lib/i18n";

/** Homepage strip with the five most-read briefs of the past week. Hidden until there is enough data. */
export async function MostReadStrip({ lang }: { lang: Lang }) {
  const list = await mostRead(5);
  if (list.length < 3) return null;
  const d = t(lang);
  return (
    <section className="mrstrip">
      <div className="label-h"><span>{pick(lang, "Most read this week", "Meest gelezen deze week", "Lo más leído de la semana")}</span></div>
      <ol>
        {list.map((i) => (
          <li key={i.id}>
            <span className={`tag-${i.island}`}>{d.islands[i.island]}</span>
            <a href={`/${lang}/brief/${i.slug}`}>{loc(i, lang).title}</a>
          </li>
        ))}
      </ol>
    </section>
  );
}
