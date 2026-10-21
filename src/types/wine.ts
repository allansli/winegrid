export type WineEntityType = "appellation" | "grape" | "producer";

export type ClueCategory =
  | "geography"
  | "region"
  | "classification"
  | "soil"
  | "climate"
  | "hydrology"
  | "style"
  | "vinification"
  | "sensory"
  | "varietal"
  | "bottle"
  | "heritage"
  | "entity_type";

export type SoilType =
  | "limestone_chalk"
  | "kimmeridgian_marl"
  | "volcanic_basalt"
  | "slate_schist"
  | "gravel_alluvial"
  | "galets_roules"
  | "granite"
  | "clay_limestone"
  | "albariza"
  | "terra_rossa"
  | "sand_phylloxera_free"
  | "loess_silt"
  | "tuffeau"
  | "iron_clay";

export type ClimateFeature =
  | "maritime"
  | "continental"
  | "mediterranean"
  | "high_altitude"
  | "steep_heroic_slopes"
  | "cooling_fog_current"
  | "rain_shadow"
  | "diurnal_shift"
  | "alpine_foothills";

export type WaterInfluence =
  | "gironde_estuary"
  | "rhone_river"
  | "loire_river"
  | "mosel_rhine"
  | "douro_river"
  | "ebro_duero"
  | "atlantic_ocean"
  | "mediterranean_sea"
  | "pacific_ocean"
  | "major_river";

export type WineStyle =
  | "dry_red"
  | "dry_white"
  | "sparkling_traditional"
  | "fortified"
  | "botrytis_sweet"
  | "passito_appassimento"
  | "rose_specialist"
  | "oxidative_biological";

export type VinificationMethod =
  | "new_french_oak"
  | "large_neutral_botte_foudre"
  | "solera_system"
  | "sur_lie_autolysis"
  | "carbonic_whole_cluster"
  | "no_malolactic"
  | "extended_aging_36m"
  | "flor_yeast"
  | "co_fermentation"
  | "amphora_concrete_unoaked";

export type SensoryAttribute =
  | "high_tannin_high_acid"
  | "laser_high_acid"
  | "low_tannin_delicate"
  | "full_bodied_high_abv"
  | "low_abv_delicate"
  | "petrol_tdn"
  | "violet_rose_floral"
  | "saline_mineral"
  | "rotundone_black_pepper"
  | "earthy_truffle_tar"
  | "honey_saffron_botrytis"
  | "long_cellar_20yr";

export type VarietalTrait =
  | "bordeaux_family"
  | "burgundy_family"
  | "rhone_family"
  | "italian_indigenous"
  | "iberian_indigenous"
  | "aromatic_white"
  | "single_varietal_strict"
  | "multi_blend_tradition"
  | "parent_cab_franc_sauv_blanc"
  | "parent_pinot_gouais"
  | "thick_skin_late_ripening"
  | "thin_skin_early_ripening";

export type BottleShape =
  | "bordeaux_shoulder"
  | "burgundy_slope"
  | "alsace_flute_schlegel"
  | "champagne_heavy"
  | "specialty_traditional";

export type HeritageTrait =
  | "ungrafted_pre_phylloxera"
  | "bush_vines"
  | "unesco_landscape"
  | "codified_pre_1855"
  | "biodynamic_pioneer"
  | "monastic_origin";

export type ClassificationTier =
  | "DOCG"
  | "AOC"
  | "DOCa"
  | "Vino_de_Pago"
  | "AVA"
  | "Pradikatswein_VDP"
  | "DAC"
  | "GI"
  | "PDO_DO"
  | "Grand_Cru"
  | "First_Growth_1855"
  | "Classed_Growth_1855"
  | "Super_Tuscan"
  | "Noble_Grape"
  | "Autochthonous_Grape";

export interface WineEntity {
  id: string;
  name: string;
  canonicalName: string;
  entityType: WineEntityType;
  country: string;
  countryCode: string; // ISO-2 for flag display
  macroRegion: string;
  /**
   * Historical origin when it is not the flagship country printed on the card.
   * Country clues match the flagship, this list, and `alsoCountries`.
   */
  originCountries?: string[];
  /**
   * Hand-curated countries where the entity is defining enough to satisfy a
   * country clue. Each entry has a note in ALSO_COUNTRY_SOURCES.
   */
  alsoCountries?: string[];
  /** Other macro-regions where the entity is important enough to satisfy a region clue. */
  alsoRegions?: string[];
  subRegion?: string;
  world: "Old World" | "New World";
  hemisphere: "Northern" | "Southern";
  latitudeBand: "cool_north" | "temperate_mid" | "warm_subtropical";
  coastalOrIsland: boolean;
  aliases: string[];
  classifications: ClassificationTier[];
  soils: SoilType[];
  climates: ClimateFeature[];
  waterBodies: WaterInfluence[];
  styles: WineStyle[];
  vinification: VinificationMethod[];
  sensory: SensoryAttribute[];
  varietalTraits: VarietalTrait[];
  primaryGrapes: string[];
  bottleShapes: BottleShape[];
  heritage: HeritageTrait[];
  baseRarity: number; // 1 (most famous) to 100 (obscure sommelier gem)
  sommelierNote: string; // Educational note shown when revealed or in Codex
}

export interface ClueDefinition {
  id: string;
  label: string;
  shortLabel: string;
  category: ClueCategory;
  difficulty: "wset2" | "wset3" | "master_somm";
  tooltip: string;
  iconName: string;
  predicate: (entity: WineEntity) => boolean;
}

export type DifficultyLevel = "wset2" | "wset3" | "master_somm";
export type EntityFilterMode = "all" | "appellation" | "grape" | "producer";

export interface MatrixCell {
  index: number; // 0..8
  row: number; // 0..2
  col: number; // 0..2
  rowClueId: string;
  colClueId: string;
  validEntityIds: string[];
  pickedEntityId: string | null;
  pickedRarityPct: number | null; // 0.1 to 100.0
  isLocked: boolean;
}

export type GameMode = "daily" | "unlimited" | "infinite";

export interface GeneratedBoard {
  boardId: string;
  boardDate?: string;
  mode: GameMode;
  difficulty: DifficultyLevel;
  entityFilter: EntityFilterMode;
  rowClues: ClueDefinition[];
  colClues: ClueDefinition[];
  cells: MatrixCell[];
  guaranteedSolution: string[]; // 9 distinct entity IDs proving solvability
}
