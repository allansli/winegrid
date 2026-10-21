import { WineEntityType } from "@/types/wine";

const SUFFIX: Record<WineEntityType, RegExp> = {
  grape: /\s\((?:Grape)\)$/,
  appellation: /\s\((?:Appellation|Region)\)$/,
  producer: /\s\((?:Producer|Estate)\)$/,
};

/**
 * Card titles drop the English type suffix. The type badge already says
 * Region, Grape, or Producer in the active locale, so the title does not
 * repeat "(Grape)" or a translated "(Uva)".
 */
export function displayEntityName(name: string, entityType: WineEntityType): string {
  return name.replace(SUFFIX[entityType], "");
}
