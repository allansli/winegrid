import { COUNTRY_REGION_GROUP, sourcedAlsoCountries } from "@/data/clueCatalog";
import { ALL_WINE_ENTITIES, normalizeSearchText } from "@/data/wineDatabase";
import { ALSO_COUNTRY_SOURCES } from "@/data/tagSources";
import { Locale } from "@/i18n/locale";
import { translate } from "@/i18n/messages";
import { placeLabel } from "@/i18n/places";
import { WineEntity } from "@/types/wine";

const GENERIC = new Set([
  "wine",
  "wines",
  "valley",
  "coast",
  "river",
  "region",
  "county",
  "grape",
  "grand",
  "cru",
  "north",
  "south",
  "east",
  "west",
  "central",
  "upper",
  "lower",
  "new",
  "old",
  "high",
  "port",
  "saint",
  "black",
  "white",
  "red",
]);

const LEGAL_SUFFIX = /\s+(AOC|AOP|DOCG|DOCa|DOC|DOP|PDO|AVA|GI)$/i;
const PLACE_SUFFIX = /\s+(Valley|Coast|River|Region|County|Hills)$/i;

function tidyPlace(raw: string): string {
  return raw.replace(LEGAL_SUFFIX, "").trim();
}

let placeGazetteer: { label: string; norm: string }[] | null = null;

function addPlace(raw: string, into: Map<string, string>) {
  const label = tidyPlace(raw);
  const norm = normalizeSearchText(label);
  if (norm.length < 4 || GENERIC.has(norm)) return;
  const existing = into.get(norm);
  if (!existing || label.length < existing.length) into.set(norm, label);
  const stem = label.match(PLACE_SUFFIX);
  if (stem) addPlace(stem[1], into);
}

function gazetteer(): { label: string; norm: string }[] {
  if (placeGazetteer) return placeGazetteer;
  const into = new Map<string, string>();
  for (const entity of ALL_WINE_ENTITIES) {
    addPlace(entity.macroRegion, into);
    for (const region of entity.alsoRegions ?? []) addPlace(region, into);
    for (const part of (entity.subRegion ?? "").split(/[/&|,()]/)) addPlace(part, into);
    if (entity.entityType === "appellation") {
      addPlace(entity.canonicalName, into);
      addPlace(entity.name, into);
      for (const alias of entity.aliases) addPlace(alias, into);
    }
  }
  placeGazetteer = [...into.entries()]
    .map(([norm, label]) => ({ norm, label }))
    .sort((a, b) => b.norm.length - a.norm.length);
  return placeGazetteer;
}

function sourceProse(note: string): string {
  return note.replace(/https?:\/\/\S+/g, " ");
}

/** Index of `phrase` in padded `text`, or -1. A following possessive still counts. */
function phraseIndex(text: string, phrase: string): number {
  const padded = ` ${text} `;
  const needle = ` ${phrase}`;
  let from = 0;
  while (from < padded.length) {
    const index = padded.indexOf(needle, from);
    if (index < 0) return -1;
    const after = padded.charAt(index + needle.length);
    if (after === " " || after === "") return index;
    from = index + 1;
  }
  return -1;
}

/**
 * Place names in a source note, longest match first when they overlap.
 * The entity's own name and flagship country/region are not places here.
 */
export function placesMentioned(entity: WineEntity, note: string): string[] {
  const text = normalizeSearchText(sourceProse(note))
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const skip = new Set(
    [
      entity.country,
      entity.macroRegion,
      entity.canonicalName,
      entity.name,
      ...entity.aliases,
      ...entity.primaryGrapes,
    ].map((value) => normalizeSearchText(value))
  );
  const hits: { label: string; norm: string; index: number }[] = [];
  for (const place of gazetteer()) {
    if (skip.has(place.norm)) continue;
    const index = phraseIndex(text, place.norm);
    if (index >= 0) hits.push({ ...place, index });
  }
  hits.sort((a, b) => a.index - b.index || b.norm.length - a.norm.length);
  const kept: { label: string; norm: string; index: number }[] = [];
  for (const hit of hits) {
    const end = hit.index + hit.norm.length;
    const overlaps = kept.some((prior) => hit.index < prior.index + prior.norm.length && end > prior.index);
    if (!overlaps) kept.push(hit);
  }
  return kept.map((hit) => hit.label);
}

/** True when this sourced country makes a region-group clue true on its own. */
export function alsoCountryGrantsRegionGroup(entity: WineEntity, country: string): boolean {
  const group = COUNTRY_REGION_GROUP[country];
  if (!group) return false;
  if (!sourcedAlsoCountries(entity).includes(country)) return false;
  if (group.world !== entity.world) return true;
  return group.hemisphere === "Southern" && entity.hemisphere !== "Southern";
}

/**
 * Countries that add an Old World, New World, or Southern Hemisphere clue
 * the flagship origin does not already give, with places taken from the source.
 */
export function alsoTraditionalPlaces(entity: WineEntity): { country: string; places: string[] }[] {
  const notes = ALSO_COUNTRY_SOURCES[entity.id] ?? {};
  const entries: { country: string; places: string[] }[] = [];
  for (const country of sourcedAlsoCountries(entity)) {
    if (!alsoCountryGrantsRegionGroup(entity, country)) continue;
    const note = notes[country]?.trim();
    if (!note) continue;
    entries.push({ country, places: placesMentioned(entity, note) });
  }
  return entries;
}

/** One generated line, or null when no also-country adds a region group. */
export function alsoTraditionalLine(entity: WineEntity, locale: Locale): string | null {
  const entries = alsoTraditionalPlaces(entity);
  if (entries.length === 0) return null;
  const places = entries
    .map(({ country, places: named }) => {
      const label = placeLabel(country, locale, "country");
      return named.length > 0 ? `${label} (${named.join(", ")})` : label;
    })
    .join(", ");
  return translate(locale, "card.alsoTraditional", { places });
}
