import { EntityFilterMode, WineEntity, WineEntityType } from "@/types/wine";
import { APPELLATION_ENTITIES } from "./entities/appellations";
import { GRAPE_ENTITIES } from "./entities/grapes";
import { PRODUCER_ENTITIES } from "./entities/producers";
import { ADDITIONAL_WINE_ENTITIES } from "./entities/moreEntities";

export const ALL_WINE_ENTITIES: WineEntity[] = [
  ...APPELLATION_ENTITIES,
  ...GRAPE_ENTITIES,
  ...PRODUCER_ENTITIES,
  ...ADDITIONAL_WINE_ENTITIES,
];

export const WINE_ENTITY_BY_ID: Record<string, WineEntity> = Object.fromEntries(
  ALL_WINE_ENTITIES.map((entity) => [entity.id, entity])
);

export function getEntitiesByFilter(filter: EntityFilterMode): WineEntity[] {
  if (filter === "all") return ALL_WINE_ENTITIES;
  return ALL_WINE_ENTITIES.filter((e) => e.entityType === filter);
}

export function normalizeSearchText(text: string): string {
  const folded = text
    .toLowerCase()
    .replace(/ß/g, "ss")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/[’‘´`]/g, "'")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/·/g, "")
    .replace(/[-‐–—_.'’]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return folded.replace(/\bste\b/g, "sainte").replace(/\bst\b/g, "saint");
}

export interface WineEntitySearchOptions {
  /** Cell-level type constraint. Applied before ranking so the list cannot leak other types. */
  acceptedTypes?: WineEntityType[];
  /** Keep entities that match at least one of the cell's clues. Drops the clearly irrelevant ones. */
  matchesCell?: (entity: WineEntity) => boolean;
  limit?: number;
}

export function searchWineEntities(
  query: string,
  filter: EntityFilterMode = "all",
  excludeIds: Set<string> = new Set(),
  options: WineEntitySearchOptions = {}
): WineEntity[] {
  const accepted = options.acceptedTypes?.length
    ? new Set(options.acceptedTypes)
    : null;
  const pool = getEntitiesByFilter(filter).filter((entity) => {
    if (excludeIds.has(entity.id)) return false;
    if (accepted && !accepted.has(entity.entityType)) return false;
    if (options.matchesCell && !options.matchesCell(entity)) return false;
    return true;
  });
  const limit = options.limit ?? 40;
  const q = normalizeSearchText(query);
  if (!q) {
    return [...pool]
      .sort(
        (a, b) =>
          a.baseRarity - b.baseRarity || a.canonicalName.localeCompare(b.canonicalName)
      )
      .slice(0, limit);
  }

  const scored = pool
    .map((entity) => {
      const nameNorm = normalizeSearchText(entity.name);
      const canonNorm = normalizeSearchText(entity.canonicalName);
      const countryNorm = normalizeSearchText(entity.country);
      const regionNorm = normalizeSearchText(entity.macroRegion);
      const aliasNorms = entity.aliases.map(normalizeSearchText);
      const grapeNorms = entity.primaryGrapes.map(normalizeSearchText);
      const subRegionNorm = entity.subRegion ? normalizeSearchText(entity.subRegion) : "";

      let score = 0;
      if (canonNorm === q || nameNorm === q || aliasNorms.includes(q)) {
        score = 100;
      } else if (canonNorm.startsWith(q) || nameNorm.startsWith(q) || aliasNorms.some((a) => a.startsWith(q))) {
        score = 85;
      } else if (canonNorm.includes(q) || nameNorm.includes(q) || aliasNorms.some((a) => a.includes(q))) {
        score = 70;
      } else if (regionNorm.includes(q) || countryNorm.includes(q)) {
        score = 50;
      } else if (grapeNorms.some((g) => g.includes(q))) {
        score = 40;
      } else if (subRegionNorm.includes(q)) {
        score = 30;
      }

      return { entity, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.entity.baseRarity - b.entity.baseRarity);

  return scored.map((item) => item.entity).slice(0, limit);
}
