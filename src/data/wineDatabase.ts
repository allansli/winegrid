import { localizedNote } from "@/i18n/notesPt";
import { Locale } from "@/i18n/locale";
import { placeSearchLabels } from "@/i18n/places";
import { CLUE_CATALOG } from "@/data/clueCatalog";
import { EntityFilterMode, WineEntity, WineEntityType } from "@/types/wine";
import { APPELLATION_ENTITIES } from "./entities/appellations";
import { GRAPE_ENTITIES } from "./entities/grapes";
import { PRODUCER_ENTITIES } from "./entities/producers";
import { ADDITIONAL_WINE_ENTITIES } from "./entities/moreEntities";
import { SOUTH_AMERICA_ENTITIES } from "./entities/southAmerica";
import { GLOBAL_PRODUCER_ENTITIES } from "./entities/globalProducers";

export const ALL_WINE_ENTITIES: WineEntity[] = [
  ...APPELLATION_ENTITIES,
  ...GRAPE_ENTITIES,
  ...PRODUCER_ENTITIES,
  ...ADDITIONAL_WINE_ENTITIES,
  ...SOUTH_AMERICA_ENTITIES,
  ...GLOBAL_PRODUCER_ENTITIES,
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

/**
 * `identity` is the hints-off picker: name, aliases, and place
 * (country, region, subregion, and localized exonyms).
 * `full` is the hints-on picker: those fields plus the English note,
 * the note for the active locale, and the primary grapes.
 * The Codex does not use either scope. It matches names and aliases only.
 */
export type EntitySearchScope = "full" | "identity";

function placeFields(entity: WineEntity): string[] {
  return [
    entity.country,
    entity.macroRegion,
    ...placeSearchLabels(entity.country, "country"),
    ...placeSearchLabels(entity.macroRegion, "region"),
    entity.subRegion ?? "",
  ];
}

/** Fields for one scope of the shared search. */
export function entitySearchFields(
  entity: WineEntity,
  locale?: Locale,
  scope: EntitySearchScope = "full"
): string[] {
  const identity = [entity.name, entity.canonicalName, ...entity.aliases, ...placeFields(entity)];
  if (scope === "identity") return identity;
  return [
    ...identity,
    entity.sommelierNote,
    localizedNote(entity.id, entity.sommelierNote, locale ?? "en"),
    ...entity.primaryGrapes,
  ];
}

/**
 * Rank for one entity. Exact and prefix hits on the name or an alias come
 * first, then any other name or alias hit, then place (country, region,
 * subregion), then grapes, then the tasting note. 0 means no match.
 */
export function entitySearchScore(
  entity: WineEntity,
  rawQuery: string,
  locale?: Locale,
  scope: EntitySearchScope = "full"
): number {
  const q = searchQuery(rawQuery);
  if (!q) return 0;
  const nameNorm = normalizeSearchText(entity.name);
  const canonNorm = normalizeSearchText(entity.canonicalName);
  const aliasNorms = entity.aliases.map(normalizeSearchText);
  const placeNorms = [
    normalizeSearchText(entity.country),
    normalizeSearchText(entity.macroRegion),
    entity.subRegion ? normalizeSearchText(entity.subRegion) : "",
    ...placeSearchLabels(entity.country, "country").map(normalizeSearchText),
    ...placeSearchLabels(entity.macroRegion, "region").map(normalizeSearchText),
  ];
  const nameHit = [canonNorm, nameNorm, ...aliasNorms];
  if (nameHit.some((field) => field === q)) return 100;
  if (nameHit.some((field) => field.startsWith(q))) return 85;
  if (nameHit.some((field) => field.includes(q))) return 70;
  if (placeNorms.some((place) => place.includes(q))) return 50;
  if (scope === "full" && entity.primaryGrapes.some((grape) => normalizeSearchText(grape).includes(q))) {
    return 40;
  }
  if (
    scope === "full" &&
    normalizeSearchText(
      `${entity.sommelierNote} ${localizedNote(entity.id, entity.sommelierNote, locale ?? "en")}`
    ).includes(q)
  ) {
    return 20;
  }
  if (entityMatchesSearch(entity, rawQuery, locale, scope)) return 10;
  return 0;
}

/**
 * Codex criteria dropdown. `"all"` clears the filter. Any other id is the
 * clue whose predicate the catalog array is filtered with. There is no
 * separate index.
 */
export function codexClueMatcher(clueId: string): ((entity: WineEntity) => boolean) | undefined {
  if (!clueId || clueId === "all") return undefined;
  const clue = CLUE_CATALOG.find((item) => item.id === clueId);
  if (!clue) return undefined;
  return (entity) => clue.predicate(entity);
}

function codexNameTokens(value: string): string[] {
  return normalizeSearchText(value).split(/[^a-z0-9]+/).filter(Boolean);
}

/**
 * Codex search reads the card name, the canonical name, and aliases.
 * A query matches a whole field, the start of a field, or a word in the
 * card's own name. A later word inside a longer alias does not match, so
 * "País" does not hit the Tempranillo alias "Tinta del País". Notes, place,
 * and grape lists are not searched.
 */
export function entityMatchesCodexQuery(entity: WineEntity, rawQuery: string): boolean {
  const q = searchQuery(rawQuery);
  if (q === "") return true;
  if (q === null) return false;
  const named = [entity.name, entity.canonicalName].some((field) =>
    codexNameTokens(field).some((token) => token === q || token.startsWith(q))
  );
  if (named) return true;
  return entity.aliases.some((alias) => {
    const norm = normalizeSearchText(alias);
    return norm === q || norm.startsWith(`${q} `);
  });
}

/** Codex list: name and alias matches, then the optional criteria predicate. */
export function filterCodexEntities(
  entities: readonly WineEntity[],
  input: {
    query: string;
    locale?: Locale;
    type?: EntityFilterMode;
    matchesClue?: (entity: WineEntity) => boolean;
  }
): WineEntity[] {
  const matched = entities.filter((entity) => {
    if (input.type && input.type !== "all" && entity.entityType !== input.type) return false;
    if (input.matchesClue && !input.matchesClue(entity)) return false;
    return entityMatchesCodexQuery(entity, input.query);
  });
  const q = searchQuery(input.query);
  if (!q) return matched;
  return [...matched].sort((a, b) => {
    const delta =
      entitySearchScore(b, input.query, input.locale, "identity") -
      entitySearchScore(a, input.query, input.locale, "identity");
    if (delta !== 0) return delta;
    return a.baseRarity - b.baseRarity || a.canonicalName.localeCompare(b.canonicalName);
  });
}

/** The one normalized/alias match used by the Codex and the picker. */
export function entityMatchesSearch(
  entity: WineEntity,
  rawQuery: string,
  locale?: Locale,
  scope: EntitySearchScope = "full"
): boolean {
  return fieldsMatchSearch(entitySearchFields(entity, locale, scope), rawQuery);
}

export interface WineEntitySearchOptions {
  /** Cell-level type constraint. Applied before ranking so the list cannot leak other types. */
  acceptedTypes?: WineEntityType[];
  /** Keep entities that match at least one of the cell's clues. Drops the clearly irrelevant ones. */
  matchesCell?: (entity: WineEntity) => boolean;
  limit?: number;
  /** Same locale the Codex uses when it overlays a tasting note. */
  locale?: Locale;
  /**
   * `full` searches notes and grapes. `identity` does not, so a hints-off
   * picker cannot be led by clue words that only appear in the copy.
   */
  scope?: EntitySearchScope;
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
  const scope = options.scope ?? "full";
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
    .map((entity) => ({ entity, score: entitySearchScore(entity, query, options.locale, scope) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.entity.baseRarity - b.entity.baseRarity);

  return scored.map((item) => item.entity).slice(0, limit);
}
