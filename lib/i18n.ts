export const LANGS = ["en", "nl", "es"] as const;
export type Lang = (typeof LANGS)[number];
export const ISLANDS = ["aruba", "curacao", "bonaire"] as const;
export type Island = (typeof ISLANDS)[number];
export const TOPICS = ["business", "economy", "politics", "reports"] as const;
export type Topic = (typeof TOPICS)[number];

export const ISLAND_COLOR: Record<Island | "kingdom", string> = {
  aruba: "#1F5FBF",
  curacao: "#D9562B",
  bonaire: "#0F8F7E",
  kingdom: "#141415",
};

const dict = {
  en: {
    tagline: "Business, economy and politics of Aruba, Curaçao and Bonaire",
    allIslands: "All islands",
    islands: { aruba: "Aruba", curacao: "Curaçao", bonaire: "Bonaire", kingdom: "Kingdom" },
    topics: { business: "Business", economy: "Economy", politics: "Politics", reports: "Reports" },
    nav: { data: "Data", agenda: "Agenda", about: "About Negoshi" },
    subscribe: "Subscribe to the Monday brief",
    subscribeShort: "Subscribe",
    ticker: "Markets & data",
    leadStory: "Lead story",
    theBrief: "The Brief",
    fiveToKnow: "Five to know",
    readBrief: "Read the brief",
    readOriginal: "Read the original",
    negoshiBrief: "Negoshi brief",
    source: "Source",
    alsoCovered: "Also covered by",
    threeIslands: "Three islands, three economies",
    threeIslandsSub: "Each with its own feed and Monday brief",
    open: "Open",
    latest: "Latest",
    today: "Today",
    yesterday: "Yesterday",
    earlier: "Earlier",
    keyPoints: "Key points",
    whyItMatters: "Why it matters",
    reportsLibrary: "Reports library",
    reportsSub: "Official publications from the three islands in one place.",
    allReports: "All reports",
    inNumbers: "The islands in numbers",
    inNumbersSub: "Figures from CBS, CBA, CBCS, ATA and CTB. Refreshed every morning.",
    newsletterTitle: "The ABC business week, in one email, before your first meeting.",
    newsletterSub: "Pick Aruba, Curaçao, Bonaire or all three. Business, economy and politics only. Free.",
    workEmail: "Work email",
    sourcesMonitored: "Sources monitored",
    sampleNotice: "Sample content.",
    sampleBody: "This is a sample brief to show the format.",
    footerAbout: "Business, economy and politics of Aruba, Curaçao and Bonaire, in English, Dutch and Spanish.",
    minRead: "min read",
    published: "Published",
    islandSection: "Island section",
    sourcesLine: (_n: number) => `Weekly brief every Monday.`,
    aboutTitle: "About Negoshi",
    aboutSteps: [
      ["Focus", "Business, economy and politics of Aruba, Curaçao and Bonaire. Nothing else."],
      ["Per island", "Each island has its own section and its own Monday brief. Pick one or all three."],
      ["Three languages", "Every story in English, Dutch and Spanish."],
      ["Every Monday", "The week's business news in your inbox before your first meeting."],
    ],
  },
  nl: {
    tagline: "Zaken, economie en politiek van Aruba, Curaçao en Bonaire",
    allIslands: "Alle eilanden",
    islands: { aruba: "Aruba", curacao: "Curaçao", bonaire: "Bonaire", kingdom: "Koninkrijk" },
    topics: { business: "Zaken", economy: "Economie", politics: "Politiek", reports: "Rapporten" },
    nav: { data: "Cijfers", agenda: "Agenda", about: "Over Negoshi" },
    subscribe: "Abonneer op de maandagbrief",
    subscribeShort: "Abonneer",
    ticker: "Markten & cijfers",
    leadStory: "Hoofdbericht",
    theBrief: "De Brief",
    fiveToKnow: "Vijf om te weten",
    readBrief: "Lees het bericht",
    readOriginal: "Lees het origineel",
    negoshiBrief: "Negoshi-bericht",
    source: "Bron",
    alsoCovered: "Ook gemeld door",
    threeIslands: "Drie eilanden, drie economieën",
    threeIslandsSub: "Elk met een eigen feed en een eigen maandagbrief",
    open: "Open",
    latest: "Laatste",
    today: "Vandaag",
    yesterday: "Gisteren",
    earlier: "Eerder",
    keyPoints: "Kernpunten",
    whyItMatters: "Waarom dit telt",
    reportsLibrary: "Rapportenbibliotheek",
    reportsSub: "Officiële publicaties van de drie eilanden op één plek.",
    allReports: "Alle rapporten",
    inNumbers: "De eilanden in cijfers",
    inNumbersSub: "Cijfers van CBS, CBA, CBCS, ATA en CTB. Elke ochtend ververst.",
    newsletterTitle: "De zakenweek van de ABC-eilanden, in één e-mail, vóór je eerste afspraak.",
    newsletterSub: "Kies Aruba, Curaçao, Bonaire of alle drie. Alleen zaken, economie en politiek. Gratis.",
    workEmail: "Zakelijk e-mailadres",
    sourcesMonitored: "Gevolgde bronnen",
    sampleNotice: "Voorbeeldinhoud.",
    sampleBody: "Dit is een voorbeeldbericht om het format te tonen.",
    footerAbout: "Zaken, economie en politiek van Aruba, Curaçao en Bonaire, in het Engels, Nederlands en Spaans.",
    minRead: "min lezen",
    published: "Gepubliceerd",
    islandSection: "Eilandsectie",
    sourcesLine: (_n: number) => `Wekelijkse brief elke maandag.`,
    aboutTitle: "Over Negoshi",
    aboutSteps: [
      ["Focus", "Zaken, economie en politiek van Aruba, Curaçao en Bonaire. Verder niets."],
      ["Per eiland", "Elk eiland heeft een eigen sectie en een eigen maandagbrief. Kies er één of alle drie."],
      ["Drie talen", "Elk bericht in het Engels, Nederlands en Spaans."],
      ["Elke maandag", "Het zakennieuws van de week in je inbox, voor je eerste afspraak."],
    ],
  },
  es: {
    tagline: "Negocios, economía y política de Aruba, Curaçao y Bonaire",
    allIslands: "Todas las islas",
    islands: { aruba: "Aruba", curacao: "Curaçao", bonaire: "Bonaire", kingdom: "Reino" },
    topics: { business: "Negocios", economy: "Economía", politics: "Política", reports: "Informes" },
    nav: { data: "Datos", agenda: "Agenda", about: "Sobre Negoshi" },
    subscribe: "Suscríbete al resumen del lunes",
    subscribeShort: "Suscribirse",
    ticker: "Mercados y datos",
    leadStory: "Noticia principal",
    theBrief: "El Resumen",
    fiveToKnow: "Cinco claves",
    readBrief: "Leer la nota",
    readOriginal: "Leer el original",
    negoshiBrief: "Nota de Negoshi",
    source: "Fuente",
    alsoCovered: "También publicado por",
    threeIslands: "Tres islas, tres economías",
    threeIslandsSub: "Cada una con su propio feed y su resumen del lunes",
    open: "Abrir",
    latest: "Lo último",
    today: "Hoy",
    yesterday: "Ayer",
    earlier: "Antes",
    keyPoints: "Puntos clave",
    whyItMatters: "Por qué importa",
    reportsLibrary: "Biblioteca de informes",
    reportsSub: "Publicaciones oficiales de las tres islas en un solo lugar.",
    allReports: "Todos los informes",
    inNumbers: "Las islas en cifras",
    inNumbersSub: "Cifras de CBS, CBA, CBCS, ATA y CTB. Actualizadas cada mañana.",
    newsletterTitle: "La semana de negocios de las islas ABC, en un solo correo, antes de tu primera reunión.",
    newsletterSub: "Elige Aruba, Curaçao, Bonaire o las tres. Solo negocios, economía y política. Gratis.",
    workEmail: "Correo de trabajo",
    sourcesMonitored: "Fuentes",
    sampleNotice: "Contenido de muestra.",
    sampleBody: "Esta es una nota de muestra para mostrar el formato.",
    footerAbout: "Negocios, economía y política de Aruba, Curaçao y Bonaire, en inglés, neerlandés y español.",
    minRead: "min de lectura",
    published: "Publicado",
    islandSection: "Sección de la isla",
    sourcesLine: (_n: number) => `Resumen semanal cada lunes.`,
    aboutTitle: "Sobre Negoshi",
    aboutSteps: [
      ["Enfoque", "Negocios, economía y política de Aruba, Curaçao y Bonaire. Nada más."],
      ["Por isla", "Cada isla tiene su propia sección y su propio resumen del lunes. Elige una o las tres."],
      ["Tres idiomas", "Cada noticia en inglés, neerlandés y español."],
      ["Cada lunes", "Las noticias de negocios de la semana en tu correo, antes de tu primera reunión."],
    ],
  },
} as const;

export type Dict = (typeof dict)["en"];
export function t(lang: Lang): Dict {
  return dict[lang] as Dict;
}
export function isLang(x: string): x is Lang {
  return (LANGS as readonly string[]).includes(x);
}
export function isIsland(x: string): x is Island {
  return (ISLANDS as readonly string[]).includes(x);
}

export const extra = {
  en: { analysis: "Analysis", analysisSub: "Guest analysis by economists, professors and practitioners from the islands", byAuthor: "By", contribute: "Write for Negoshi", contributeSub: "Economists, professors and practitioners: submit an analysis or a report through the contributor backoffice.", guest: "Guest analysis" },
  nl: { analysis: "Analyse", analysisSub: "Gastanalyses van economen, hoogleraren en praktijkmensen van de eilanden", byAuthor: "Door", contribute: "Schrijf voor Negoshi", contributeSub: "Economen, hoogleraren en praktijkmensen: dien een analyse of rapport in via de backoffice voor auteurs.", guest: "Gastanalyse" },
  es: { analysis: "Análisis", analysisSub: "Análisis de economistas, profesores y profesionales de las islas", byAuthor: "Por", contribute: "Escribe para Negoshi", contributeSub: "Economistas, profesores y profesionales: envía un análisis o un informe a través del portal de autores.", guest: "Análisis invitado" },
} as const;

/** Picks the string for the site language. */
export function pick<T>(lang: Lang, en: T, nl: T, es: T): T {
  return lang === "nl" ? nl : lang === "es" ? es : en;
}
export const LOCALE: Record<Lang, string> = { en: "en-GB", nl: "nl-NL", es: "es-419" };
export const OG_LOCALE: Record<Lang, string> = { en: "en_US", nl: "nl_NL", es: "es_LA" };
export const LANG_NAME: Record<Lang, string> = { en: "EN", nl: "NL", es: "ES" };

/** Spanish labels for indicators and report categories (the data files carry English and Dutch). */
export const INDICATOR_ES: Record<string, string> = {
  "cpi-aw": "Inflación Aruba", "cpi-cw": "Inflación Curaçao", "cpi-bq": "Inflación Bonaire",
  "arrivals-aw": "Turistas con estadía, Aruba", "arrivals-cw": "Turistas con estadía, Curaçao", "fuel-aw": "Gasolina Aruba",
};
export const CATEGORY_ES: Record<string, string> = {
  Monetary: "Monetario", Statistics: "Estadísticas", Tourism: "Turismo", Supervision: "Supervisión",
  "Public finance": "Finanzas públicas", "Annual report": "Informe anual", Outlook: "Perspectivas", Policy: "Política pública",
};
