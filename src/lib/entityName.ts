import { WineEntityType } from "@/types/wine";

const SUFFIX: Record<WineEntityType, RegExp> = {
  grape: /\s\((?:Grape)\)$/,
  appellation: /\s\((?:Appellation|Region)\)$/,
  producer: /\s\((?:Producer|Estate)\)$/,
};

/** Replaces an English type suffix with the active locale's word. */
export function localizedEntityName(
  name: string,
  entityType: WineEntityType,
  typeLabel: string
): string {
  const pattern = SUFFIX[entityType];
  if (!pattern.test(name)) return name;
  return name.replace(pattern, ` (${typeLabel})`);
}
