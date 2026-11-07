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
    nav: { data: "Data", agenda: "Agenda", about: "How Negoshi works" },
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
    threeIslandsSub: "Each with its own feed, sources and Monday brief",
    open: "Open",
    latest: "Latest",
    today: "Today",
    yesterday: "Yesterday",
    earlier: "Earlier",
    keyPoints: "Key points",
    whyItMatters: "Why it matters",
    reportsLibrary: "Reports library",
    reportsSub: "Official publications from the three islands, collected automatically.",
    allReports: "All reports",
    inNumbers: "The islands in numbers",
    inNumbersSub: "Updated automatically from CBS, CBA, CBCS, ATA and CTB. Refreshed every morning.",
    newsletterTitle: "The ABC business week, in one email, before your first meeting.",
    newsletterSub: "Pick Aruba, Curaçao, Bonaire or all three. Business, economy and politics only. Free.",
    workEmail: "Work email",
    sourcesMonitored: "Sources monitored",
    sampleNotice: "Sample content. Live briefs start once the pipeline is connected.",
    sampleBody: "This is a sample brief to show the format. In production every brief is written by the Negoshi pipeline from the original publication and links to it. No source text is copied.",
    footerAbout: "Automated monitoring of local sources, briefs written by Negoshi, every item linked to its original publisher.",
    minRead: "min read",
    published: "Published",
    islandSection: "Island section",
    sourcesLine: (n: number) => `${n} sources monitored. Weekly brief every Monday.`,
    aboutTitle: "How Negoshi works",
    aboutSteps: [
      ["Monitor", "Local newspapers, central banks, statistics offices, parliaments and ministries, checked every hour."],
      ["Filter", "Only business, economy and politics. Tagged by island and topic. Everything else is dropped."],
      ["Summarise", "A short brief per item in English and Dutch: what happened, what changed, who it affects. Link to the original."],
      ["Deliver", "On the site all week, in your inbox every Monday. One brief per island, or all three."],
    ],
  },
  nl: {
    tagline: "Zaken, economie en politiek van Aruba, Curaçao en Bonaire",
    allIslands: "Alle eilanden",
    islands: { aruba: "Aruba", curacao: "Curaçao", bonaire: "Bonaire", kingdom: "Koninkrijk" },
    topics: { business: "Zaken", economy: "Economie", politics: "Politiek", reports: "Rapporten" },
    nav: { data: "Cijfers", agenda: "Agenda", about: "Hoe Negoshi werkt" },
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
    reportsSub: "Officiële publicaties van de drie eilanden, automatisch verzameld.",
    allReports: "Alle rapporten",
    inNumbers: "De eilanden in cijfers",
    inNumbersSub: "Automatisch bijgewerkt vanuit CBS, CBA, CBCS, ATA en CTB. Elke ochtend ververst.",
    newsletterTitle: "De zakenweek van de ABC-eilanden, in één e-mail, vóór je eerste afspraak.",
    newsletterSub: "Kies Aruba, Curaçao, Bonaire of alle drie. Alleen zaken, economie en politiek. Gratis.",
    workEmail: "Zakelijk e-mailadres",
    sourcesMonitored: "Gevolgde bronnen",
    sampleNotice: "Voorbeeldinhoud. Live berichten starten zodra de pipeline is gekoppeld.",
    sampleBody: "Dit is een voorbeeldbericht om het format te tonen. In productie schrijft de Negoshi-pipeline elk bericht op basis van de originele publicatie en linkt ernaar. Er wordt geen brontekst gekopieerd.",
    footerAbout: "Automatische monitoring van lokale bronnen, berichten geschreven door Negoshi, elk item gelinkt aan de oorspronkelijke uitgever.",
    minRead: "min lezen",
    published: "Gepubliceerd",
    islandSection: "Eilandsectie",
    sourcesLine: (n: number) => `${n} bronnen gevolgd. Wekelijkse brief elke maandag.`,
    aboutTitle: "Hoe Negoshi werkt",
    aboutSteps: [
      ["Monitoren", "Lokale kranten, centrale banken, statistiekbureaus, parlementen en ministeries, elk uur gecontroleerd."],
      ["Filteren", "Alleen zaken, economie en politiek. Gelabeld per eiland en onderwerp. De rest valt af."],
      ["Samenvatten", "Een kort bericht per item in het Engels en Nederlands: wat er gebeurde, wat er veranderde, wie het raakt. Link naar het origineel."],
      ["Bezorgen", "De hele week op de site, elke maandag in je inbox. Eén brief per eiland, of alle drie."],
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
