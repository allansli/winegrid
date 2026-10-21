export type Locale = "en" | "pt-BR";

export const LOCALE_STORAGE_KEY = "winegrid_locale_v1";

export function detectLocale(language: string | undefined | null): Locale {
  if (!language) return "en";
  return language.toLowerCase().startsWith("pt") ? "pt-BR" : "en";
}

export function resolveLocale(
  saved: string | null | undefined,
  navigatorLanguage: string | undefined | null
): Locale {
  if (saved === "en" || saved === "pt-BR") return saved;
  return detectLocale(navigatorLanguage);
}

export function htmlLang(locale: Locale): string {
  return locale === "pt-BR" ? "pt-BR" : "en";
}
