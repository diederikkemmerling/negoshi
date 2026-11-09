export const LANGS = ["en", "nl"] as const;
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
    footerAbout: "Business, economy and politics of Aruba, Curaçao and Bonaire, in English and Dutch.",
    minRead: "min read",
    published: "Published",
    islandSection: "Island section",
    sourcesLine: (_n: number) => `Weekly brief every Monday.`,
    aboutTitle: "About Negoshi",
    aboutSteps: [
      ["Focus", "Business, economy and politics of Aruba, Curaçao and Bonaire. Nothing else."],
      ["Per island", "Each island has its own section and its own Monday brief. Pick one or all three."],
      ["Two languages", "Every story in English and Dutch."],
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
    threeIslandsSub: "Elk met een eigen feed, eigen bronnen en een eigen maandagbrief",
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
    footerAbout: "Zaken, economie en politiek van Aruba, Curaçao en Bonaire, in het Engels en Nederlands.",
    minRead: "min lezen",
    published: "Gepubliceerd",
    islandSection: "Eilandsectie",
    sourcesLine: (_n: number) => `Wekelijkse brief elke maandag.`,
    aboutTitle: "Over Negoshi",
    aboutSteps: [
      ["Focus", "Zaken, economie en politiek van Aruba, Curaçao en Bonaire. Verder niets."],
      ["Per eiland", "Elk eiland heeft een eigen sectie en een eigen maandagbrief. Kies er één of alle drie."],
      ["Twee talen", "Elk bericht in het Engels en Nederlands."],
      ["Elke maandag", "Het zakennieuws van de week in je inbox, voor je eerste afspraak."],
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
} as const;
