import { CLUE_CATALOG, COUNTRY_REGION_GROUP } from "@/data/clueCatalog";
import { ALSO_COUNTRY_SOURCES, AlsoCountrySource, alsoCountryNote, alsoCountrySynonym } from "@/data/tagSources";
import { normalizeSearchText } from "@/data/wineDatabase";
import { MINIMUM_ANSWERED_CLUES } from "@/lib/difficultyTuning";
import { PT_NOTES } from "@/i18n/notesPt";
import { COUNTRY_LABELS, REGION_LABELS } from "@/i18n/places";
import {
  BottleShape,
  ClassificationTier,
  ClimateFeature,
  ClueDefinition,
  HeritageTrait,
  SensoryAttribute,
  SoilType,
  VarietalTrait,
  VinificationMethod,
  WaterInfluence,
  WineEntity,
  WineEntityType,
  WineStyle,
} from "@/types/wine";

/**
 * Fields every new grape, region, or producer must fill in.
 * The markdown templates in docs/entities/ list the same names.
 * English sommelier notes stay the source of truth. pt-BR is an overlay
 * in notesPt.ts, and country and region names go through places.ts.
 */
export const ENTITY_FIELDS = [
  "id",
  "name",
  "canonicalName",
  "aliases",
  "entityType",
  "country",
  "countryCode",
  "macroRegion",
  "subRegion",
  "alsoCountries",
  "alsoRegions",
  "originCountries",
  "world",
  "hemisphere",
  "latitudeBand",
  "coastalOrIsland",
  "classifications",
  "soils",
  "climates",
  "waterBodies",
  "styles",
  "vinification",
  "sensory",
  "varietalTraits",
  "primaryGrapes",
  "bottleShapes",
  "heritage",
  "baseRarity",
  "sommelierNote",
  "pt-BR note",
] as const;

/** Tag groups that must contain at least one catalog value. */
export const REQUIRED_TAG_FIELDS = [
  "soils",
  "climates",
  "styles",
  "vinification",
  "sensory",
  "varietalTraits",
  "primaryGrapes",
  "bottleShapes",
] as const;

/** Tag groups that may be empty. Every value still has to be a known tag. */
export const OPTIONAL_TAG_FIELDS = ["classifications", "waterBodies", "heritage"] as const;

export const SOIL_TAGS: readonly SoilType[] = [
  "limestone_chalk",
  "kimmeridgian_marl",
  "volcanic_basalt",
  "slate_schist",
  "gravel_alluvial",
  "galets_roules",
  "granite",
  "clay_limestone",
  "albariza",
  "terra_rossa",
  "sand_phylloxera_free",
  "loess_silt",
  "tuffeau",
  "iron_clay",
];

export const CLIMATE_TAGS: readonly ClimateFeature[] = [
  "maritime",
  "continental",
  "mediterranean",
  "high_altitude",
  "steep_heroic_slopes",
  "cooling_fog_current",
  "rain_shadow",
  "diurnal_shift",
  "alpine_foothills",
];

export const WATER_TAGS: readonly WaterInfluence[] = [
  "gironde_estuary",
  "rhone_river",
  "loire_river",
  "mosel_rhine",
  "douro_river",
  "ebro_duero",
  "atlantic_ocean",
  "mediterranean_sea",
  "pacific_ocean",
  "major_river",
];

export const STYLE_TAGS: readonly WineStyle[] = [
  "dry_red",
  "dry_white",
  "sparkling_traditional",
  "fortified",
  "botrytis_sweet",
  "passito_appassimento",
  "rose_specialist",
  "oxidative_biological",
];

export const VINIFICATION_TAGS: readonly VinificationMethod[] = [
  "new_french_oak",
  "large_neutral_botte_foudre",
  "solera_system",
  "sur_lie_autolysis",
  "carbonic_whole_cluster",
  "no_malolactic",
  "extended_aging_36m",
  "flor_yeast",
  "co_fermentation",
  "amphora_concrete_unoaked",
];

export const SENSORY_TAGS: readonly SensoryAttribute[] = [
  "high_tannin_high_acid",
  "laser_high_acid",
  "low_tannin_delicate",
  "full_bodied_high_abv",
  "low_abv_delicate",
  "petrol_tdn",
  "violet_rose_floral",
  "saline_mineral",
  "rotundone_black_pepper",
  "earthy_truffle_tar",
  "honey_saffron_botrytis",
  "long_cellar_20yr",
];

export const VARIETAL_TAGS: readonly VarietalTrait[] = [
  "bordeaux_family",
  "burgundy_family",
  "rhone_family",
  "italian_indigenous",
  "iberian_indigenous",
  "aromatic_white",
  "single_varietal_strict",
  "multi_blend_tradition",
  "parent_cab_franc_sauv_blanc",
  "parent_pinot_gouais",
  "thick_skin_late_ripening",
  "thin_skin_early_ripening",
];

export const BOTTLE_TAGS: readonly BottleShape[] = [
  "bordeaux_shoulder",
  "burgundy_slope",
  "alsace_flute_schlegel",
  "champagne_heavy",
  "specialty_traditional",
];

export const HERITAGE_TAGS: readonly HeritageTrait[] = [
  "ungrafted_pre_phylloxera",
  "bush_vines",
  "unesco_landscape",
  "codified_pre_1855",
  "biodynamic_pioneer",
  "monastic_origin",
];

export const CLASSIFICATION_TAGS: readonly ClassificationTier[] = [
  "DOCG",
  "AOC",
  "DOCa",
  "Vino_de_Pago",
  "AVA",
  "Pradikatswein_VDP",
  "DAC",
  "GI",
  "PDO_DO",
  "Grand_Cru",
  "First_Growth_1855",
  "Classed_Growth_1855",
  "Super_Tuscan",
  "Noble_Grape",
  "Autochthonous_Grape",
];

const TAG_VALUES: Record<string, readonly string[]> = {
  soils: SOIL_TAGS,
  climates: CLIMATE_TAGS,
  waterBodies: WATER_TAGS,
  styles: STYLE_TAGS,
  vinification: VINIFICATION_TAGS,
  sensory: SENSORY_TAGS,
  varietalTraits: VARIETAL_TAGS,
  bottleShapes: BOTTLE_TAGS,
  heritage: HERITAGE_TAGS,
  classifications: CLASSIFICATION_TAGS,
};

const ID_PREFIX: Record<WineEntityType, string> = {
  grape: "grape-",
  appellation: "app-",
  producer: "prod-",
};

/**
 * Existing cards below MINIMUM_ANSWERED_CLUES. Do not lower the minimum
 * to clear a card. Add the id here, with a comment naming the shortfall,
 * and list it in the PR so the tags can be fixed.
 * Empty: the current catalog already answers at least three non-type clues.
 */
export const CLUE_MINIMUM_ALLOWLIST: readonly string[] = [];

/**
 * Required groups left empty because no enum value matches the sources.
 * A nearby tag would make the card a wrong answer. Do not add an id here
 * to skip a fact the sources do state, and remove the entry once a real
 * tag is filled in.
 */
export const EMPTY_REQUIRED_TAG_ALLOWLIST: Readonly<Record<string, readonly (typeof REQUIRED_TAG_FIELDS)[number][]>> = {
  // Rouge is about 10% new oak in 228 L barrels. That is not new-oak élevage, and it is not a foudre.
  "prod-chave": ["vinification"],
  // Fine lees and bâtonnage in 450–600 L barrels, not extended sur lie, and not a 1,000 L foudre.
  "prod-dagueneau": ["vinification"],
  // Six to eight months in oak, at most 5% new, with bâtonnage. Not sur lie and not new oak.
  "prod-coulee-de-serrant": ["vinification"],
};

export interface EntityValidationContext {
  entities: WineEntity[];
  ptNotes: Record<string, string>;
  sources: Record<string, Record<string, AlsoCountrySource>>;
  clueMinimumAllowlist?: readonly string[];
}

/** Distinct live clue ids this card answers, excluding entity-type clues. */
export function answeredClueIds(entity: WineEntity, clues: readonly ClueDefinition[] = CLUE_CATALOG): string[] {
  const ids: string[] = [];
  for (const clue of clues) {
    if (clue.category === "entity_type") continue;
    if (clue.predicate(entity)) ids.push(clue.id);
  }
  return ids;
}

function placePair(value: string, kind: "country" | "region"): { en: string; "pt-BR": string } | undefined {
  const map = kind === "country" ? COUNTRY_LABELS : REGION_LABELS;
  return map[value];
}

function requirePlace(
  issues: string[],
  value: string,
  kind: "country" | "region",
  role: string
) {
  const pair = placePair(value, kind);
  if (!pair) {
    issues.push(`broken parent region link: ${role} ${value} is not in places.ts`);
    return;
  }
  if (!pair.en.trim() || !pair["pt-BR"].trim()) {
    issues.push(`missing pt-BR place label for ${role} ${value}`);
  }
}

/**
 * Problems that should block a new entity. An empty list means the card
 * is safe to add. Issue strings name the failure the tests lock in.
 */
export function validateEntity(entity: WineEntity, context: EntityValidationContext): string[] {
  const issues: string[] = [];

  if (!entity.id || !entity.id.startsWith(ID_PREFIX[entity.entityType] ?? "missing-")) {
    issues.push(`id must start with ${ID_PREFIX[entity.entityType]}`);
  }
  if (!entity.canonicalName?.trim()) issues.push("missing canonical name");
  if (!entity.name?.trim()) issues.push("missing name");
  if (!Array.isArray(entity.aliases) || entity.aliases.length === 0) {
    issues.push("missing aliases");
  } else {
    const seen = new Set<string>();
    for (const alias of entity.aliases) {
      const key = alias.trim().toLowerCase();
      if (!key) {
        issues.push("missing aliases");
        continue;
      }
      if (seen.has(key)) issues.push(`duplicate alias: ${alias}`);
      seen.add(key);
    }
  }

  if (!entity.countryCode || entity.countryCode.length !== 2) issues.push("missing country code");
  requirePlace(issues, entity.country, "country", "country");
  requirePlace(issues, entity.macroRegion, "region", "macroRegion");
  if (!entity.subRegion?.trim()) issues.push("missing subRegion");
  for (const region of entity.alsoRegions ?? []) requirePlace(issues, region, "region", "alsoRegions");
  for (const country of entity.originCountries ?? []) requirePlace(issues, country, "country", "originCountries");

  const group = COUNTRY_REGION_GROUP[entity.country];
  if (!group || group.world !== entity.world || group.hemisphere !== entity.hemisphere) {
    issues.push(
      `broken parent region link: ${entity.country || "country"} world/hemisphere does not match the country table`
    );
  }

  for (const field of REQUIRED_TAG_FIELDS) {
    const values = entity[field] as string[] | undefined;
    const waived = EMPTY_REQUIRED_TAG_ALLOWLIST[entity.id]?.includes(field) && (!values || values.length === 0);
    if (waived) continue;
    if (!Array.isArray(values) || values.length === 0 || values.some((value) => !value.trim())) {
      issues.push(`missing tags: ${field}`);
      continue;
    }
    const allowed = TAG_VALUES[field];
    if (!allowed) continue;
    for (const value of values) {
      if (!allowed.includes(value)) issues.push(`missing tags: ${field} ${value}`);
    }
  }
  for (const field of OPTIONAL_TAG_FIELDS) {
    const values = entity[field] as string[] | undefined;
    if (!Array.isArray(values)) {
      issues.push(`missing tags: ${field}`);
      continue;
    }
    for (const value of values) {
      if (!TAG_VALUES[field].includes(value)) issues.push(`missing tags: ${field} ${value}`);
    }
  }
  if (typeof entity.baseRarity !== "number" || entity.baseRarity < 1 || entity.baseRarity > 100) {
    issues.push("baseRarity must be from 1 (most famous) to 100 (obscure)");
  }
  if (!entity.sommelierNote || entity.sommelierNote.trim().length < 40) {
    issues.push("missing English sommelier note");
  }
  const pt = context.ptNotes[entity.id];
  if (!pt || pt.trim().length < 40) issues.push("missing pt-BR note");

  const notes = context.sources[entity.id] ?? {};
  for (const country of entity.alsoCountries ?? []) {
    requirePlace(issues, country, "country", "alsoCountries");
    const source = notes[country];
    if (!alsoCountryNote(source)) issues.push(`unsourced alsoCountries: ${country}`);
    const synonym = alsoCountrySynonym(source);
    if (synonym && !entity.aliases.some((alias) => normalizeSearchText(alias) === normalizeSearchText(synonym))) {
      issues.push(`alsoCountries synonym ${synonym} is not an alias`);
    }
  }

  const allowlist = context.clueMinimumAllowlist ?? CLUE_MINIMUM_ALLOWLIST;
  if (!allowlist.includes(entity.id)) {
    const answered = answeredClueIds(entity);
    if (answered.length < MINIMUM_ANSWERED_CLUES) {
      issues.push(
        `answers ${answered.length} clues, need at least ${MINIMUM_ANSWERED_CLUES} (entity-type clues do not count)`
      );
    }
  }

  return issues;
}

export function validateCatalog(
  entities: WineEntity[],
  context: Omit<EntityValidationContext, "entities"> = { ptNotes: PT_NOTES, sources: ALSO_COUNTRY_SOURCES }
): string[] {
  const issues: string[] = [];
  const ids = new Set<string>();
  const full: EntityValidationContext = { entities, ...context };
  for (const entity of entities) {
    if (ids.has(entity.id)) issues.push(`duplicate id: ${entity.id}`);
    ids.add(entity.id);
    for (const issue of validateEntity(entity, full)) issues.push(`${entity.id}: ${issue}`);
  }
  return issues;
}
