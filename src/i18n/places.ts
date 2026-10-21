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
};

export function placeLabel(value: string, locale: Locale, kind: "country" | "region"): string {
  if (locale !== "pt-BR") return value;
  const map = kind === "country" ? COUNTRY_PT : REGION_PT;
  return map[value] ?? value;
}
