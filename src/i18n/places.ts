import { Locale } from "./locale";

const COUNTRY_PT: Record<string, string> = {
  France: "França",
  Italy: "Itália",
  Spain: "Espanha",
  Portugal: "Portugal",
  Germany: "Alemanha",
  Austria: "Áustria",
  Hungary: "Hungria",
  "United States": "Estados Unidos",
  Australia: "Austrália",
  "New Zealand": "Nova Zelândia",
  "South Africa": "África do Sul",
  Argentina: "Argentina",
  Chile: "Chile",
  Greece: "Grécia",
  Lebanon: "Líbano",
};

const REGION_PT: Record<string, string> = {
  Burgundy: "Borgonha",
  Champagne: "Champagne",
  Piedmont: "Piemonte",
  Tuscany: "Toscana",
  "Loire Valley": "Vale do Loire",
  "Rhône Valley": "Vale do Rhône",
  Provence: "Provença",
  Bordeaux: "Bordeaux",
  Alsace: "Alsácia",
  Jura: "Jura",
  Veneto: "Vêneto",
  Sicily: "Sicília",
  California: "Califórnia",
  Oregon: "Oregon",
  "Aegean Islands": "Ilhas do Egeu",
  "Ahr Valley": "Vale do Ahr",
  Andalusia: "Andaluzia",
  Bekaa: "Vale do Bekaa",
  Campania: "Campânia",
  "Campania & Basilicata": "Campânia e Basilicata",
  Catalonia: "Catalunha",
  "Central Valley": "Vale Central",
  "Coastal Region": "Região Costeira",
  "Ebro Valley": "Vale do Ebro",
  Galicia: "Galícia",
  Lombardy: "Lombardia",
  Macedonia: "Macedônia",
  "Madeira Island": "Ilha da Madeira",
  "Niederösterreich (Lower Austria)": "Baixa Áustria",
  "North Argentina": "Norte da Argentina",
  "South Australia": "Austrália Meridional",
  "South Island": "Ilha Sul",
  "Western Australia": "Austrália Ocidental",
};

const REGION_SEARCH_ALIASES: Record<string, string[]> = {
  Galicia: ["Galiza"],
};

export function placeLabel(value: string, locale: Locale, kind: "country" | "region"): string {
  if (locale !== "pt-BR") return value;
  const map = kind === "country" ? COUNTRY_PT : REGION_PT;
  return map[value] ?? value;
}

/** English name, the pt-BR label, and extra spellings a player might type. */
export function placeSearchLabels(value: string, kind: "country" | "region"): string[] {
  const labels = [value, placeLabel(value, "pt-BR", kind)];
  if (kind === "region") labels.push(...(REGION_SEARCH_ALIASES[value] ?? []));
  return [...new Set(labels)];
}
