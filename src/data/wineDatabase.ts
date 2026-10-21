import { localizedNote } from "@/i18n/notesPt";
import { Locale } from "@/i18n/locale";
import { placeSearchLabels } from "@/i18n/places";
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
  const saint = folded.replace(/\bste\b/g, "sainte").replace(/\bst\b/g, "saint");
  // ü/ö/ä already expanded to ue/oe/ae. Fold those digraphs too, so
  // Spatburgunder matches Spätburgunder and Blaufrankisch matches Blaufränkisch.
  return saint.replace(/ae/g, "a").replace(/oe/g, "o").replace(/ue/g, "u");
}

/**
 * Query shared by the picker and the Codex.
 * "" keeps the default list. null matches nothing: the raw query was not
 * empty, but folding left fewer than two characters (so "ue", "oe", and
 * "ae" cannot match on the single letter they fold into).
 */
export function searchQuery(raw: string): string | null {
  if (!raw.trim()) return "";
  const q = normalizeSearchText(raw);
  return q.length >= 2 ? q : null;
}

/** True when `fields` match `rawQuery` under the same rule as the picker. */
export function fieldsMatchSearch(fields: readonly string[], rawQuery: string): boolean {
  const q = searchQuery(rawQuery);
  if (q === "") return true;
  if (q === null) return false;
  return fields.some((field) => normalizeSearchText(field).includes(q));
}

/** Fields the Codex and the picker both search, including aliases. */
export function entitySearchFields(entity: WineEntity, locale?: Locale): string[] {
  return [
    entity.name,
    entity.canonicalName,
    entity.country,
    entity.macroRegion,
    ...placeSearchLabels(entity.country, "country"),
    ...placeSearchLabels(entity.macroRegion, "region"),
    entity.subRegion ?? "",
    entity.sommelierNote,
    localizedNote(entity.id, entity.sommelierNote, locale ?? "en"),
    ...entity.aliases,
    ...entity.primaryGrapes,
  ];
}

/** The one normalized/alias match used by the Codex and the picker. */
export function entityMatchesSearch(entity: WineEntity, rawQuery: string, locale?: Locale): boolean {
  return fieldsMatchSearch(entitySearchFields(entity, locale), rawQuery);
}

export interface WineEntitySearchOptions {
  /** Cell-level type constraint. Applied before ranking so the list cannot leak other types. */
  acceptedTypes?: WineEntityType[];
  /** Keep entities that match at least one of the cell's clues. Drops the clearly irrelevant ones. */
  matchesCell?: (entity: WineEntity) => boolean;
  limit?: number;
  /** Same locale the Codex uses when it overlays a tasting note. */
  locale?: Locale;
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
  const q = searchQuery(query);
  if (q === null) return [];
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
      const placeNorms = [
        ...placeSearchLabels(entity.country, "country"),
        ...placeSearchLabels(entity.macroRegion, "region"),
      ].map(normalizeSearchText);
      const aliasNorms = entity.aliases.map(normalizeSearchText);
      const grapeNorms = entity.primaryGrapes.map(normalizeSearchText);
      const subRegionNorm = entity.subRegion ? normalizeSearchText(entity.subRegion) : "";
      const noteNorm = normalizeSearchText(
        `${entity.sommelierNote} ${localizedNote(entity.id, entity.sommelierNote, options.locale ?? "en")}`
      );

      let score = 0;
      if (canonNorm === q || nameNorm === q || aliasNorms.includes(q)) {
        score = 100;
      } else if (canonNorm.startsWith(q) || nameNorm.startsWith(q) || aliasNorms.some((a) => a.startsWith(q))) {
        score = 85;
      } else if (canonNorm.includes(q) || nameNorm.includes(q) || aliasNorms.some((a) => a.includes(q))) {
        score = 70;
      } else if (
        regionNorm.includes(q) ||
        countryNorm.includes(q) ||
        placeNorms.some((place) => place.includes(q))
      ) {
        score = 50;
      } else if (grapeNorms.some((g) => g.includes(q))) {
        score = 40;
      } else if (subRegionNorm.includes(q)) {
        score = 30;
      } else if (noteNorm.includes(q)) {
        score = 20;
      }
      if (score === 0 && entityMatchesSearch(entity, query, options.locale)) score = 10;

      return { entity, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.entity.baseRarity - b.entity.baseRarity);

  return scored.map((item) => item.entity).slice(0, limit);
}
