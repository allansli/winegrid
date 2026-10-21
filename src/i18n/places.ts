import { Locale } from "./locale";

/**
 * Administrative countries and regions use the established exonym for each
 * locale. The canonical value stored on an entity stays the English exonym
 * (Aragon, not Aragón). Wine proper names are not translated here.
 */
export const COUNTRY_LABELS: Record<string, Record<Locale, string>> = {
  France: { en: "France", "pt-BR": "França" },
  Italy: { en: "Italy", "pt-BR": "Itália" },
  Spain: { en: "Spain", "pt-BR": "Espanha" },
  Portugal: { en: "Portugal", "pt-BR": "Portugal" },
  Germany: { en: "Germany", "pt-BR": "Alemanha" },
  Austria: { en: "Austria", "pt-BR": "Áustria" },
  Hungary: { en: "Hungary", "pt-BR": "Hungria" },
  "United States": { en: "United States", "pt-BR": "Estados Unidos" },
  Australia: { en: "Australia", "pt-BR": "Austrália" },
  "New Zealand": { en: "New Zealand", "pt-BR": "Nova Zelândia" },
  "South Africa": { en: "South Africa", "pt-BR": "África do Sul" },
  Argentina: { en: "Argentina", "pt-BR": "Argentina" },
  Chile: { en: "Chile", "pt-BR": "Chile" },
  Greece: { en: "Greece", "pt-BR": "Grécia" },
  Lebanon: { en: "Lebanon", "pt-BR": "Líbano" },
};

export const REGION_LABELS: Record<string, Record<Locale, string>> = {
  Burgundy: { en: "Burgundy", "pt-BR": "Borgonha" },
  Champagne: { en: "Champagne", "pt-BR": "Champagne" },
  Piedmont: { en: "Piedmont", "pt-BR": "Piemonte" },
  Tuscany: { en: "Tuscany", "pt-BR": "Toscana" },
  "Loire Valley": { en: "Loire Valley", "pt-BR": "Vale do Loire" },
  "Rhône Valley": { en: "Rhône Valley", "pt-BR": "Vale do Rhône" },
  Provence: { en: "Provence", "pt-BR": "Provença" },
  Bordeaux: { en: "Bordeaux", "pt-BR": "Bordeaux" },
  Alsace: { en: "Alsace", "pt-BR": "Alsácia" },
  Jura: { en: "Jura", "pt-BR": "Jura" },
  Veneto: { en: "Veneto", "pt-BR": "Vêneto" },
  Sicily: { en: "Sicily", "pt-BR": "Sicília" },
  California: { en: "California", "pt-BR": "Califórnia" },
  Oregon: { en: "Oregon", "pt-BR": "Oregon" },
  "Aegean Islands": { en: "Aegean Islands", "pt-BR": "Ilhas do Egeu" },
  "Ahr Valley": { en: "Ahr Valley", "pt-BR": "Vale do Ahr" },
  Andalusia: { en: "Andalusia", "pt-BR": "Andaluzia" },
  Aragon: { en: "Aragon", "pt-BR": "Aragão" },
  Valencia: { en: "Valencia", "pt-BR": "Valência" },
  "Murcia (Jumilla)": { en: "Murcia (Jumilla)", "pt-BR": "Múrcia (Jumilla)" },
  Bekaa: { en: "Bekaa", "pt-BR": "Vale do Bekaa" },
  Campania: { en: "Campania", "pt-BR": "Campânia" },
  "Campania & Basilicata": { en: "Campania & Basilicata", "pt-BR": "Campânia e Basilicata" },
  Catalonia: { en: "Catalonia", "pt-BR": "Catalunha" },
  "Castilla y León": { en: "Castilla y León", "pt-BR": "Castela e Leão" },
  "Central Valley": { en: "Central Valley", "pt-BR": "Vale Central" },
  "Coastal Region": { en: "Coastal Region", "pt-BR": "Região Costeira" },
  Cuyo: { en: "Cuyo", "pt-BR": "Cuyo" },
  Douro: { en: "Douro", "pt-BR": "Douro" },
  "Ebro Valley": { en: "Ebro Valley", "pt-BR": "Vale do Ebro" },
  Galicia: { en: "Galicia", "pt-BR": "Galícia" },
  Lombardy: { en: "Lombardy", "pt-BR": "Lombardia" },
  Macedonia: { en: "Macedonia", "pt-BR": "Macedônia" },
  "Madeira Island": { en: "Madeira Island", "pt-BR": "Ilha da Madeira" },
  Minho: { en: "Minho", "pt-BR": "Minho" },
  Mosel: { en: "Mosel", "pt-BR": "Mosel" },
  "Niederösterreich (Lower Austria)": {
    en: "Niederösterreich (Lower Austria)",
    "pt-BR": "Baixa Áustria",
  },
  "North Argentina": { en: "North Argentina", "pt-BR": "Norte da Argentina" },
  Rheingau: { en: "Rheingau", "pt-BR": "Rheingau" },
  Roussillon: { en: "Roussillon", "pt-BR": "Roussillon" },
  "South Australia": { en: "South Australia", "pt-BR": "Austrália Meridional" },
  "South Island": { en: "South Island", "pt-BR": "Ilha Sul" },
  "Tokaj-Hegyalja": { en: "Tokaj-Hegyalja", "pt-BR": "Tokaj-Hegyalja" },
  "Western Australia": { en: "Western Australia", "pt-BR": "Austrália Ocidental" },
  Burgenland: { en: "Burgenland", "pt-BR": "Burgenland" },
};

const REGION_SEARCH_ALIASES: Record<string, string[]> = {
  Galicia: ["Galiza"],
};

export function placeLabel(value: string, locale: Locale, kind: "country" | "region"): string {
  const map = kind === "country" ? COUNTRY_LABELS : REGION_LABELS;
  return map[value]?.[locale] ?? value;
}

export function originLine(
  country: string,
  region: string,
  locale: Locale,
  separator = " • "
): string {
  return `${placeLabel(country, locale, "country")}${separator}${placeLabel(region, locale, "region")}`;
}

/** English name, the pt-BR label, and extra spellings a player might type. */
export function placeSearchLabels(value: string, kind: "country" | "region"): string[] {
  const labels = [value, placeLabel(value, "pt-BR", kind)];
  if (kind === "region") labels.push(...(REGION_SEARCH_ALIASES[value] ?? []));
  return [...new Set(labels)];
}
