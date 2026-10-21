import { ClueDefinition, WineEntity } from "@/types/wine";
import { ALSO_COUNTRY_SOURCES, alsoCountryNote } from "./tagSources";

/**
 * Explicit country → world and hemisphere for region-group clues.
 * A country that is not in this map does not grant a group.
 */
export const COUNTRY_REGION_GROUP: Record<
  string,
  { world: "Old World" | "New World"; hemisphere: "Northern" | "Southern" }
> = {
  France: { world: "Old World", hemisphere: "Northern" },
  Italy: { world: "Old World", hemisphere: "Northern" },
  Spain: { world: "Old World", hemisphere: "Northern" },
  Portugal: { world: "Old World", hemisphere: "Northern" },
  Germany: { world: "Old World", hemisphere: "Northern" },
  Austria: { world: "Old World", hemisphere: "Northern" },
  Hungary: { world: "Old World", hemisphere: "Northern" },
  Greece: { world: "Old World", hemisphere: "Northern" },
  Lebanon: { world: "Old World", hemisphere: "Northern" },
  Croatia: { world: "Old World", hemisphere: "Northern" },
  "United States": { world: "New World", hemisphere: "Northern" },
  Chile: { world: "New World", hemisphere: "Southern" },
  Argentina: { world: "New World", hemisphere: "Southern" },
  Australia: { world: "New World", hemisphere: "Southern" },
  "New Zealand": { world: "New World", hemisphere: "Southern" },
  "South Africa": { world: "New World", hemisphere: "Southern" },
};

/**
 * Curated `alsoCountries` that also have a non-empty note in
 * `ALSO_COUNTRY_SOURCES`. An entry with no source does not count.
 */
export function sourcedAlsoCountries(entity: WineEntity): string[] {
  const notes = ALSO_COUNTRY_SOURCES[entity.id];
  if (!notes) return [];
  return (entity.alsoCountries ?? []).filter((country) => Boolean(alsoCountryNote(notes[country])));
}

/**
 * Flagship country, historical origin, and sourced `alsoCountries`.
 * Region-group clues do not use `originCountries`; named country clues do.
 */
export function entityCountries(entity: WineEntity): string[] {
  return [entity.country, ...(entity.originCountries ?? []), ...sourcedAlsoCountries(entity)];
}

function sourcedAlsoCountryMatches(
  entity: WineEntity,
  match: (group: { world: "Old World" | "New World"; hemisphere: "Northern" | "Southern" }) => boolean
): boolean {
  return sourcedAlsoCountries(entity).some((country) => {
    const group = COUNTRY_REGION_GROUP[country];
    return group ? match(group) : false;
  });
}

/** Flagship region plus other regions where the entity is important. */
export function entityRegions(entity: WineEntity): string[] {
  return [entity.macroRegion, ...(entity.alsoRegions ?? [])];
}

function inCountry(entity: WineEntity, ...names: string[]): boolean {
  const countries = entityCountries(entity);
  return names.some((name) => countries.includes(name));
}

function inRegion(entity: WineEntity, ...names: string[]): boolean {
  const regions = entityRegions(entity);
  return names.some((name) => regions.includes(name));
}

/** Appellation law and cru rank belong to places and estates, not to a grape. */
function isClassifiedPlace(entity: WineEntity): boolean {
  return entity.entityType !== "grape";
}

export const CLUE_CATALOG: ClueDefinition[] = [
  // ==========================================================================
  // 1. GEOGRAPHY & MACRO-ORIGIN
  // ==========================================================================
  {
    id: "geo-france",
    label: "Origin: France",
    shortLabel: "France",
    category: "geography",
    difficulty: "wset2",
    tooltip: "Flagship country, historical origin, or a defining home in France.",
    iconName: "Globe",
    predicate: (e) => inCountry(e, "France"),
  },
  {
    id: "geo-italy",
    label: "Origin: Italy",
    shortLabel: "Italy",
    category: "geography",
    difficulty: "wset2",
    tooltip: "Appellations, grape varieties, or estates rooted in Italy.",
    iconName: "Globe",
    predicate: (e) => inCountry(e, "Italy"),
  },
  {
    id: "geo-spain",
    label: "Origin: Spain",
    shortLabel: "Spain",
    category: "geography",
    difficulty: "wset2",
    tooltip: "Appellations, grape varieties, or estates rooted in Spain.",
    iconName: "Globe",
    predicate: (e) => inCountry(e, "Spain"),
  },
  {
    id: "geo-iberia",
    label: "Iberian Peninsula (Spain or Portugal)",
    shortLabel: "Iberian Peninsula",
    category: "geography",
    difficulty: "wset2",
    tooltip: "Located in or native to Spain or Portugal (including Portuguese islands).",
    iconName: "Compass",
    predicate: (e) => inCountry(e, "Spain", "Portugal"),
  },
  {
    id: "geo-germanic",
    label: "Germanic & Alpine Europe (Germany, Austria, Hungary)",
    shortLabel: "Central Europe",
    category: "geography",
    difficulty: "wset2",
    tooltip: "Rooted in Germany, Austria, or Hungary.",
    iconName: "Mountain",
    predicate: (e) => inCountry(e, "Germany", "Austria", "Hungary"),
  },
  {
    id: "geo-usa",
    label: "Origin: United States (California & Oregon)",
    shortLabel: "United States",
    category: "geography",
    difficulty: "wset2",
    tooltip: "American AVAs, benchmark estates, or flagship varieties.",
    iconName: "Flag",
    predicate: (e) => inCountry(e, "United States"),
  },
  {
    id: "geo-oceania",
    label: "Oceania (Australia or New Zealand)",
    shortLabel: "Australia / NZ",
    category: "geography",
    difficulty: "wset2",
    tooltip: "Located in Australia or New Zealand.",
    iconName: "Sun",
    predicate: (e) => inCountry(e, "Australia", "New Zealand"),
  },
  {
    id: "geo-south-america",
    label: "Andean South America (Argentina or Chile)",
    shortLabel: "Argentina / Chile",
    category: "geography",
    difficulty: "wset2",
    tooltip: "Located in or signature to Argentina or Chile.",
    iconName: "Mountain",
    predicate: (e) => inCountry(e, "Argentina", "Chile"),
  },
  {
    id: "geo-old-world",
    label: "Old World Wine Tradition",
    shortLabel: "Old World",
    category: "geography",
    difficulty: "wset2",
    tooltip: "European or Near Eastern classical viticultural origin.",
    iconName: "Landmark",
    predicate: (e) =>
      e.world === "Old World" ||
      sourcedAlsoCountryMatches(e, (group) => group.world === "Old World"),
  },
  {
    id: "geo-new-world",
    label: "New World Wine Tradition",
    shortLabel: "New World",
    category: "geography",
    difficulty: "wset2",
    tooltip: "Americas, South Africa, Australia, or New Zealand.",
    iconName: "Compass",
    predicate: (e) =>
      e.world === "New World" ||
      sourcedAlsoCountryMatches(e, (group) => group.world === "New World"),
  },
  {
    id: "geo-southern-hemisphere",
    label: "Southern Hemisphere",
    shortLabel: "Southern Hemisphere",
    category: "geography",
    difficulty: "wset2",
    tooltip: "Located south of the Equator (Argentina, Chile, South Africa, Australia, New Zealand).",
    iconName: "Globe",
    predicate: (e) =>
      e.hemisphere === "Southern" ||
      sourcedAlsoCountryMatches(e, (group) => group.hemisphere === "Southern"),
  },
  {
    id: "geo-cool-latitude",
    label: "High Latitude (>45° N or S) / Cool-Margin Zone",
    shortLabel: ">45° Latitude",
    category: "geography",
    difficulty: "wset3",
    tooltip: "Marginal high-latitude regions such as Champagne, Chablis, Mosel, Loire, Alsace, Willamette, or Central Otago.",
    iconName: "Snowflake",
    predicate: (e) => e.latitudeBand === "cool_north",
  },
  {
    id: "geo-coastal-island",
    label: "Coastal or Island Terroir",
    shortLabel: "Coastal / Island",
    category: "geography",
    difficulty: "wset3",
    tooltip: "Directly bordering an ocean/sea coast or situated on a volcanic/maritime island.",
    iconName: "Waves",
    predicate: (e) => e.coastalOrIsland,
  },

  // ==========================================================================
  // 2. MACRO-REGIONS
  // ==========================================================================
  {
    id: "reg-bordeaux",
    label: "Bordeaux & Southwest France Sphere",
    shortLabel: "Bordeaux",
    category: "region",
    difficulty: "wset2",
    tooltip: "Left Bank, Right Bank, Graves/Sauternes, or a grape that is important in Bordeaux.",
    iconName: "Castle",
    predicate: (e) => inRegion(e, "Bordeaux"),
  },
  {
    id: "reg-burgundy-champagne",
    label: "Greater Burgundy & Champagne Sphere",
    shortLabel: "Burgundy / Champagne",
    category: "region",
    difficulty: "wset2",
    tooltip: "Côte d'Or, Chablis, Beaujolais, or Champagne.",
    iconName: "Wine",
    predicate: (e) => inRegion(e, "Burgundy", "Champagne"),
  },
  {
    id: "reg-rhone-provence",
    label: "Rhône Valley & Mediterranean France",
    shortLabel: "Rhône / Provence",
    category: "region",
    difficulty: "wset2",
    tooltip: "Northern Rhône, Southern Rhône, Provence, or Roussillon.",
    iconName: "Sun",
    predicate: (e) => inRegion(e, "Rhône Valley", "Provence", "Roussillon"),
  },
  {
    id: "reg-loire",
    label: "Loire Valley ('Garden of France')",
    shortLabel: "Loire Valley",
    category: "region",
    difficulty: "wset3",
    tooltip: "Pays Nantais, Anjou-Saumur, Touraine, or Central Vineyards.",
    iconName: "Waves",
    predicate: (e) => inRegion(e, "Loire Valley"),
  },
  {
    id: "reg-piedmont-tuscany",
    label: "Piedmont or Tuscany Benchmark",
    shortLabel: "Piedmont / Tuscany",
    category: "region",
    difficulty: "wset2",
    tooltip: "Italy's two most celebrated fine-wine regions.",
    iconName: "Award",
    predicate: (e) => inRegion(e, "Piedmont", "Tuscany"),
  },

  // ==========================================================================
  // 3. CLASSIFICATIONS & WINE LAW
  // ==========================================================================
  {
    id: "cls-aoc",
    label: "French AOC / AOP Classification",
    shortLabel: "French AOC",
    category: "classification",
    difficulty: "wset3",
    tooltip: "Regulated under France's Appellation d'Origine Contrôlée system.",
    iconName: "ShieldCheck",
    predicate: (e) => isClassifiedPlace(e) && e.classifications.includes("AOC"),
  },
  {
    id: "cls-docg",
    label: "Italian DOCG (Denominazione di Origine Controllata e Garantita)",
    shortLabel: "Italian DOCG",
    category: "classification",
    difficulty: "wset3",
    tooltip: "Italy's highest legal wine classification tier requiring ministry tasting and numbered neck bands.",
    iconName: "Award",
    predicate: (e) => isClassifiedPlace(e) && e.classifications.includes("DOCG"),
  },
  {
    id: "cls-grand-cru",
    label: "Grand Cru / First Growth / Top Cru Tier",
    shortLabel: "Grand Cru / 1er Cru",
    category: "classification",
    difficulty: "wset3",
    tooltip: "Features an official Grand Cru, 1855 First Growth, or Gran Vinya Classificada status.",
    iconName: "Crown",
    predicate: (e) =>
      isClassifiedPlace(e) &&
      (e.classifications.includes("Grand_Cru") || e.classifications.includes("First_Growth_1855")),
  },
  {
    id: "cls-1855",
    label: "1855 Bordeaux Classification Heritage",
    shortLabel: "1855 Classification",
    category: "classification",
    difficulty: "wset3",
    tooltip: "An 1855 classed growth, or a Médoc or Sauternes appellation that contains one (Margaux, Saint-Julien, Pauillac, Saint-Estèphe, Sauternes).",
    iconName: "Crown",
    predicate: (e) =>
      isClassifiedPlace(e) &&
      (e.classifications.includes("First_Growth_1855") ||
        e.classifications.includes("Classed_Growth_1855")),
  },
  {
    id: "cls-doca-pdo",
    label: "Spanish DOCa / DO or Portuguese DOC",
    shortLabel: "DOCa / DO / DOC",
    category: "classification",
    difficulty: "wset3",
    tooltip: "Spanish DOCa or DO, or Portuguese DOC. Other countries' PDO laws do not count.",
    iconName: "ShieldCheck",
    predicate: (e) =>
      isClassifiedPlace(e) &&
      inCountry(e, "Spain", "Portugal") &&
      (e.classifications.includes("DOCa") || e.classifications.includes("PDO_DO")),
  },
  {
    id: "cls-new-world-ava-gi",
    label: "American AVA or New World GI / WO",
    shortLabel: "AVA / GI / WO",
    category: "classification",
    difficulty: "wset3",
    tooltip: "American Viticultural Area (AVA) or Geographical Indication (GI / Wine of Origin).",
    iconName: "MapPin",
    predicate: (e) =>
      isClassifiedPlace(e) &&
      e.world === "New World" &&
      (e.classifications.includes("AVA") || e.classifications.includes("GI")),
  },

  // ==========================================================================
  // 4. TERROIR: SOIL & GEOLOGY
  // ==========================================================================
  {
    id: "soil-limestone-chalk",
    label: "Limestone, Chalk, or Calcareous Marl Soil",
    shortLabel: "Limestone / Chalk",
    category: "soil",
    difficulty: "wset3",
    tooltip: "High-pH calcium carbonate soils (Belemnite chalk, Kimmeridgian marl, Tuffeau, Albariza, Galestro, Tortonian marl).",
    iconName: "Layers",
    predicate: (e) =>
      e.soils.includes("limestone_chalk") ||
      e.soils.includes("kimmeridgian_marl") ||
      e.soils.includes("clay_limestone") ||
      e.soils.includes("tuffeau") ||
      e.soils.includes("albariza"),
  },
  {
    id: "soil-kimmeridgian-pure-chalk",
    label: "Pure Chalk, Kimmeridgian Oyster Marl, Tuffeau, or Albariza",
    shortLabel: "Marine Chalk / Marl",
    category: "soil",
    difficulty: "master_somm",
    tooltip: "Fossilized marine chalk or marl (Champagne, Chablis, Sancerre, Vouvray, Chinon, Jerez, Jura).",
    iconName: "Shell",
    predicate: (e) =>
      e.soils.includes("kimmeridgian_marl") ||
      e.soils.includes("tuffeau") ||
      e.soils.includes("albariza") ||
      (e.soils.includes("limestone_chalk") && inRegion(e, "Champagne", "Burgundy", "Loire Valley")),
  },
  {
    id: "soil-volcanic",
    label: "Volcanic Terroir (Basalt, Lava, Pumice, or Rhyolite Tuff)",
    shortLabel: "Volcanic Soil",
    category: "soil",
    difficulty: "wset3",
    tooltip: "Igneous volcanic soils such as Mount Etna, Santorini, Soave, Taurasi, Tokaj, Madeira, Willamette Jory, or Napa.",
    iconName: "Flame",
    predicate: (e) => e.soils.includes("volcanic_basalt"),
  },
  {
    id: "soil-slate-schist",
    label: "Slate or Crystalline Schist ('Schiefer' / 'Llicorella')",
    shortLabel: "Slate / Schist",
    category: "soil",
    difficulty: "wset3",
    tooltip: "Heat-retaining metamorphic rock found in Mosel, Priorat, Côte-Rôtie, Douro, Savennières, Ahr, Central Otago.",
    iconName: "Mountain",
    predicate: (e) => e.soils.includes("slate_schist"),
  },
  {
    id: "soil-gravel-galets",
    label: "Alluvial Gravel or Quartzite Pebbles ('Galets Roulés')",
    shortLabel: "Gravel / Galets",
    category: "soil",
    difficulty: "wset3",
    tooltip: "Free-draining river gravel or boulder beds (Left Bank Bordeaux, Châteauneuf-du-Pape, Marlborough, Mendoza, Napa).",
    iconName: "Layers",
    predicate: (e) => e.soils.includes("gravel_alluvial") || e.soils.includes("galets_roules"),
  },
  {
    id: "soil-granite",
    label: "Decomposed Granite Bedrock",
    shortLabel: "Granite Terroir",
    category: "soil",
    difficulty: "wset3",
    tooltip: "Acidic, crystalline igneous bedrock (Northern Rhône, Beaujolais Crus, Rías Baixas, Vinho Verde, Alsace, Stellenbosch).",
    iconName: "Mountain",
    predicate: (e) => e.soils.includes("granite"),
  },
  {
    id: "soil-sand-phylloxera",
    label: "Sandy Soil / Phylloxera-Resistant Terroir",
    shortLabel: "Sandy / Ungrafted Soil",
    category: "soil",
    difficulty: "master_somm",
    tooltip: "High-sand soils where the phylloxera louse cannot construct tunnels (e.g., Château Rayas, Santorini, Barossa, Colares/Etna).",
    iconName: "Sparkles",
    predicate: (e) => e.soils.includes("sand_phylloxera_free"),
  },

  // ==========================================================================
  // 5. CLIMATE & TOPOGRAPHY
  // ==========================================================================
  {
    id: "clim-maritime",
    label: "Maritime Climate Influence",
    shortLabel: "Maritime Climate",
    category: "climate",
    difficulty: "wset2",
    tooltip: "Moderated by proximity to large oceans or estuaries with mild winters and rainfall spread through the year.",
    iconName: "CloudRain",
    predicate: (e) => e.climates.includes("maritime"),
  },
  {
    id: "clim-continental",
    label: "Continental Climate",
    shortLabel: "Continental Climate",
    category: "climate",
    difficulty: "wset2",
    tooltip: "Inland climate with pronounced seasonal swings, cold winters, and rapid autumn cooling.",
    iconName: "Thermometer",
    predicate: (e) => e.climates.includes("continental"),
  },
  {
    id: "clim-mediterranean",
    label: "Mediterranean Climate",
    shortLabel: "Mediterranean Climate",
    category: "climate",
    difficulty: "wset2",
    tooltip: "Warm, dry, sunny summers and mild winters (Southern Rhône, Tuscany, Priorat, Napa, Barossa, Stellenbosch).",
    iconName: "Sun",
    predicate: (e) => e.climates.includes("mediterranean"),
  },
  {
    id: "clim-high-altitude",
    label: "High-Altitude Viticulture (≥ 450m–3,000m)",
    shortLabel: "High Altitude",
    category: "climate",
    difficulty: "wset3",
    tooltip: "Elevated mountain or plateau vineyards with intense UV light and cool nights (Mendoza, Salta, Ribera del Duero, Etna, Priorat).",
    iconName: "Mountain",
    predicate: (e) => e.climates.includes("high_altitude"),
  },
  {
    id: "clim-heroic-slopes",
    label: "Heroic Viticulture / Steep Terraced Slopes (>30°)",
    shortLabel: "Heroic Steep Slopes",
    category: "climate",
    difficulty: "wset3",
    tooltip: "Hand-harvested vertical slopes or dry-stone terraces (Mosel, Côte-Rôtie, Hermitage, Douro, Priorat, Wachau, Etna).",
    iconName: "TrendingUp",
    predicate: (e) => e.climates.includes("steep_heroic_slopes"),
  },
  {
    id: "clim-fog-current",
    label: "Moderated by Morning Mist, Autumn Fog, or Cold Ocean Current",
    shortLabel: "Fog / Cold Current",
    category: "climate",
    difficulty: "wset3",
    tooltip: "Crucial fog/mist for Nebbiolo ('nebbia'), Botrytis (Sauternes/Tokaj), or Pacific/Benguela/Humboldt cooling.",
    iconName: "CloudFog",
    predicate: (e) => e.climates.includes("cooling_fog_current"),
  },
  {
    id: "clim-diurnal-rainshadow",
    label: "Extreme Diurnal Temp Shift or Mountain Rain Shadow",
    shortLabel: "Diurnal / Rain Shadow",
    category: "climate",
    difficulty: "wset3",
    tooltip: "Protected by a mountain barrier or experiencing dramatic day-to-night temperature drops that preserve malic acid.",
    iconName: "SunMoon",
    predicate: (e) => e.climates.includes("diurnal_shift") || e.climates.includes("rain_shadow"),
  },

  // ==========================================================================
  // 6. HYDROLOGY & RIVERS
  // ==========================================================================
  {
    id: "hydro-major-river",
    label: "Shaped by a Major Wine River or Estuary",
    shortLabel: "Major River Valley",
    category: "hydrology",
    difficulty: "wset3",
    tooltip: "Bordering iconic viticultural rivers: Gironde, Rhône, Loire, Mosel, Rhine, Douro, Ebro, Danube, etc.",
    iconName: "Waves",
    predicate: (e) => e.waterBodies.includes("major_river") || e.waterBodies.includes("gironde_estuary"),
  },
  {
    id: "hydro-atlantic-gironde",
    label: "Atlantic Ocean or Gironde Estuary Influence",
    shortLabel: "Atlantic / Gironde",
    category: "hydrology",
    difficulty: "wset3",
    tooltip: "Influenced by the Atlantic Ocean or Gironde/Loire/Douro Atlantic watersheds.",
    iconName: "Waves",
    predicate: (e) => e.waterBodies.includes("atlantic_ocean") || e.waterBodies.includes("gironde_estuary"),
  },

  // ==========================================================================
  // 7. WINE STYLE & COLOR
  // ==========================================================================
  {
    id: "style-dry-red",
    label: "Produces Benchmark Dry Red Wine",
    shortLabel: "Dry Red Wine",
    category: "style",
    difficulty: "wset2",
    tooltip: "Known for world-class dry red wines.",
    iconName: "Wine",
    predicate: (e) => e.styles.includes("dry_red"),
  },
  {
    id: "style-dry-white",
    label: "Produces Benchmark Dry White Wine",
    shortLabel: "Dry White Wine",
    category: "style",
    difficulty: "wset2",
    tooltip: "Known for world-class dry white wines.",
    iconName: "GlassWater",
    predicate: (e) => e.styles.includes("dry_white"),
  },
  {
    id: "style-sparkling",
    label: "Traditional Method Sparkling Wine ('Méthode Traditionnelle')",
    shortLabel: "Sparkling Wine",
    category: "style",
    difficulty: "wset2",
    tooltip: "Secondary fermentation in bottle (Champagne, Franciacorta, Cava, Vouvray, Classic Grapes).",
    iconName: "Sparkles",
    predicate: (e) => e.styles.includes("sparkling_traditional"),
  },
  {
    id: "style-fortified-oxidative",
    label: "Fortified or Biologically/Oxidatively Aged Wine",
    shortLabel: "Fortified / Oxidative",
    category: "style",
    difficulty: "wset3",
    tooltip: "Port, Sherry, Madeira, Vin Doux Naturel (Banyuls), or Jura Vin Jaune ('sous voile').",
    iconName: "Flame",
    predicate: (e) => e.styles.includes("fortified") || e.styles.includes("oxidative_biological"),
  },
  {
    id: "style-sweet-botrytis-passito",
    label: "Noble Rot (Botrytis) or Appassimento Dried-Grape Wine",
    shortLabel: "Botrytis / Passito",
    category: "style",
    difficulty: "wset3",
    tooltip: "Crafted from botrytized berries (Sauternes, Tokaj, Mosel, Alsace) or dried grapes (Amarone, Recioto, Vinsanto).",
    iconName: "Droplets",
    predicate: (e) => e.styles.includes("botrytis_sweet") || e.styles.includes("passito_appassimento"),
  },

  // ==========================================================================
  // 8. VINIFICATION & CELLAR TECHNIQUE
  // ==========================================================================
  {
    id: "vin-new-french-oak",
    label: "Matured in New French Oak Barriques (225L / Pièce)",
    shortLabel: "New French Oak",
    category: "vinification",
    difficulty: "wset3",
    tooltip: "Classic small-barrel maturation imparting toast, cedar, vanilla, and micro-oxygenation.",
    iconName: "Cylinder",
    predicate: (e) => e.vinification.includes("new_french_oak"),
  },
  {
    id: "vin-large-botte-foudre",
    label: "Aged in Large Slavonian Oak Botti or Neutral Foudres",
    shortLabel: "Large Botte / Foudre",
    category: "vinification",
    difficulty: "wset3",
    tooltip: "Traditional large-format casks (1,000L–10,000L) allowing gentle oxidative evolution without heavy oak lactones.",
    iconName: "Cylinder",
    predicate: (e) => e.vinification.includes("large_neutral_botte_foudre"),
  },
  {
    id: "vin-extended-aging-36m",
    label: "Extended Cellar Maturation (≥ 36 Months Before Release)",
    shortLabel: "36+ Months Aging",
    category: "vinification",
    difficulty: "wset3",
    tooltip: "Requires or practices 3 to 10+ years of cask/bottle aging prior to release (Barolo, Brunello, Rioja Gran Reserva, Vintage Champagne, Vega Sicilia).",
    iconName: "Clock",
    predicate: (e) => e.vinification.includes("extended_aging_36m"),
  },
  {
    id: "vin-sur-lie",
    label: "Extended Lees Aging ('Sur Lie' / Yeast Mannoproteins & Autolysis)",
    shortLabel: "Sur Lie / Lees Aging",
    category: "vinification",
    difficulty: "wset3",
    tooltip: "Aged on dead yeast cells for brioche, creaminess, and antioxidant protection (Champagne, Muscadet, Chablis, Meursault, Albariño).",
    iconName: "Sparkles",
    predicate: (e) => e.vinification.includes("sur_lie_autolysis"),
  },
  {
    id: "vin-whole-cluster-coferment",
    label: "Whole-Cluster / Carbonic Maceration or Red-White Co-Fermentation",
    shortLabel: "Whole-Cluster / Co-Ferment",
    category: "vinification",
    difficulty: "master_somm",
    tooltip: "Uses whole uncrushed bunches (Beaujolais, Burgundy, Rhône) or co-ferments red and white grapes (Côte-Rôtie, Hermitage).",
    iconName: "Grape",
    predicate: (e) =>
      e.vinification.includes("carbonic_whole_cluster") || e.vinification.includes("co_fermentation"),
  },
  {
    id: "vin-no-mlf-unoaked",
    label: "Malolactic Avoided or Pure Stainless / Concrete / Amphora",
    shortLabel: "Unoaked / No MLF",
    category: "vinification",
    difficulty: "wset3",
    tooltip: "Preserves crisp primary malic acidity or pure mineral tension without oak masking.",
    iconName: "Shield",
    predicate: (e) =>
      e.vinification.includes("no_malolactic") || e.vinification.includes("amphora_concrete_unoaked"),
  },
  {
    id: "vin-flor-solera",
    label: "Solera Fractional Blending or Biological 'Flor' / 'Voile' Yeast",
    shortLabel: "Solera / Flor Yeast",
    category: "vinification",
    difficulty: "master_somm",
    tooltip: "Aged under a living film of yeast (Jerez, Château-Chalon) or via a multi-tier Solera system (Sherry, Selosse).",
    iconName: "Infinity",
    predicate: (e) => e.vinification.includes("solera_system") || e.vinification.includes("flor_yeast"),
  },

  // ==========================================================================
  // 9. SENSORY & STRUCTURAL PROFILE (WSET / CMS DEDUCTIVE GRID)
  // ==========================================================================
  {
    id: "sens-high-tannin-acid",
    label: "High Tannin & High Acidity Structural Powerhouse",
    shortLabel: "High Tannin + Acid",
    category: "sensory",
    difficulty: "wset3",
    tooltip: "Classic blind-tasting signature of Nebbiolo, Sangiovese, Aglianico, Xinomavro, Left Bank Cabernet, and Northern Rhône Syrah.",
    iconName: "Activity",
    predicate: (e) => e.sensory.includes("high_tannin_high_acid"),
  },
  {
    id: "sens-laser-acid",
    label: "Laser-Sharp Natural Acidity (Low pH Benchmark)",
    shortLabel: "Laser-Sharp Acidity",
    category: "sensory",
    difficulty: "wset3",
    tooltip: "Mouthwatering, electric acidity (Riesling, Chenin Blanc, Assyrtiko, Champagne, Chablis, Sauvignon Blanc, Barbera).",
    iconName: "Zap",
    predicate: (e) => e.sensory.includes("laser_high_acid"),
  },
  {
    id: "sens-delicate-low-tannin",
    label: "Delicate / Translucent Red or Low-Alcohol Finesse",
    shortLabel: "Delicate / Low Tannin",
    category: "sensory",
    difficulty: "wset3",
    tooltip: "Low-tannin, pale-ruby reds (Pinot Noir, Gamay, Rayas Grenache) or delicate low-ABV whites (Mosel Kabinett, Muscadet, Vinho Verde).",
    iconName: "Feather",
    predicate: (e) => e.sensory.includes("low_tannin_delicate") || e.sensory.includes("low_abv_delicate"),
  },
  {
    id: "sens-full-bodied",
    label: "Full-Bodied & High Alcohol Generosity (≥ 14% ABV Typical)",
    shortLabel: "Full-Bodied (≥14%)",
    category: "sensory",
    difficulty: "wset3",
    tooltip: "Rich, powerful extract and elevated alcohol (Amarone, Châteauneuf-du-Pape, Priorat, Barossa, Napa, Fortifieds).",
    iconName: "Flame",
    predicate: (e) => e.sensory.includes("full_bodied_high_abv"),
  },
  {
    id: "sens-violet-floral",
    label: "Signature Floral Nose (Violet, Rose Petal, or Lychee/Blossom)",
    shortLabel: "Violet / Rose Floral",
    category: "sensory",
    difficulty: "wset3",
    tooltip: "Pronounced terpene or norisoprenoid floral aromatics (Nebbiolo, Syrah/Viognier, Pinot Noir, Malbec, Touriga Nacional, Gewürztraminer).",
    iconName: "Flower2",
    predicate: (e) => e.sensory.includes("violet_rose_floral"),
  },
  {
    id: "sens-saline-mineral",
    label: "Saline, Oyster-Shell, or Wet-Stone Minerality",
    shortLabel: "Saline / Mineral",
    category: "sensory",
    difficulty: "wset3",
    tooltip: "Savory, chalky, or sea-salt finish driven by limestone, slate, volcanic ash, or Atlantic spray.",
    iconName: "Sparkles",
    predicate: (e) => e.sensory.includes("saline_mineral"),
  },
  {
    id: "sens-truffle-tar-pepper",
    label: "Savory Tertiary: Truffle, Tar, Sous-Bois, or Black Pepper (Rotundone)",
    shortLabel: "Truffle / Tar / Pepper",
    category: "sensory",
    difficulty: "wset3",
    tooltip: "Earthy forest floor, tar, leather, or spicy rotundone peppercorn notes.",
    iconName: "Compass",
    predicate: (e) =>
      e.sensory.includes("earthy_truffle_tar") || e.sensory.includes("rotundone_black_pepper"),
  },
  {
    id: "sens-petrol-botrytis",
    label: "Signature TDN (Petrol/Kerosene) or Botrytis Saffron-Honey Note",
    shortLabel: "Petrol or Saffron-Honey",
    category: "sensory",
    difficulty: "master_somm",
    tooltip: "Classic aged Riesling TDN kerosene note or noble rot marmalade/saffron/beeswax bouquet.",
    iconName: "Droplets",
    predicate: (e) =>
      e.sensory.includes("petrol_tdn") || e.sensory.includes("honey_saffron_botrytis"),
  },
  {
    id: "sens-cellar-20yr",
    label: "20–50+ Year Cellar Longevity Benchmark",
    shortLabel: "20+ Year Longevity",
    category: "sensory",
    difficulty: "wset3",
    tooltip: "Renowned at auction and in top cellars for multi-decade aging potential.",
    iconName: "Hourglass",
    predicate: (e) => e.sensory.includes("long_cellar_20yr"),
  },

  // ==========================================================================
  // 10. VARIETAL FAMILY & AMPELOGRAPHY
  // ==========================================================================
  {
    id: "var-bordeaux-family",
    label: "Bordeaux Varietal Family (Cabernet, Merlot, Sauvignon, Sémillon, Malbec)",
    shortLabel: "Bordeaux Varietals",
    category: "varietal",
    difficulty: "wset2",
    tooltip: "Uses or belongs to the Cabernet Franc / Sauvignon Blanc / Merlot / Malbec / Carménère genetic family.",
    iconName: "Grape",
    predicate: (e) => e.varietalTraits.includes("bordeaux_family"),
  },
  {
    id: "var-burgundy-family",
    label: "Burgundian Varietal Family (Pinot, Chardonnay, Gamay, Melon)",
    shortLabel: "Burgundian Varietals",
    category: "varietal",
    difficulty: "wset2",
    tooltip: "Uses or belongs to the Pinot Noir × Gouais Blanc genetic dynasty.",
    iconName: "Grape",
    predicate: (e) => e.varietalTraits.includes("burgundy_family"),
  },
  {
    id: "var-rhone-family",
    label: "Rhône / Mediterranean Varietal Family (Syrah, Grenache, Mourvèdre, Viognier)",
    shortLabel: "Rhône Varietals",
    category: "varietal",
    difficulty: "wset2",
    tooltip: "Features Syrah/Shiraz, Grenache/Garnacha, Mourvèdre/Monastrell, Viognier, Marsanne, or Roussanne.",
    iconName: "Grape",
    predicate: (e) => e.varietalTraits.includes("rhone_family"),
  },
  {
    id: "var-indigenous-med",
    label: "Indigenous / Autochthonous Italian or Iberian Varietal Tradition",
    shortLabel: "Italian / Iberian Native",
    category: "varietal",
    difficulty: "wset3",
    tooltip: "Rooted in native Italian (Nebbiolo, Sangiovese, Corvina, Nerello, Aglianico) or Iberian (Tempranillo, Albariño, Touriga, Palomino) grapes.",
    iconName: "Sprout",
    predicate: (e) =>
      inCountry(e, "Italy", "Spain", "Portugal") &&
      (e.varietalTraits.includes("italian_indigenous") ||
        e.varietalTraits.includes("iberian_indigenous")),
  },
  {
    id: "var-single-varietal",
    label: "100% Single-Varietal Purist Tradition",
    shortLabel: "Single-Varietal Purist",
    category: "varietal",
    difficulty: "wset3",
    tooltip: "Legally mandates or classically bottled as a 100% monovarietal wine (e.g., Barolo, Brunello, Chablis, Sancerre, Mosel).",
    iconName: "CheckCircle2",
    predicate: (e) => e.varietalTraits.includes("single_varietal_strict"),
  },
  {
    id: "var-multi-blend",
    label: "Multi-Varietal Assemblage / Blending Tradition",
    shortLabel: "Classic Blend",
    category: "varietal",
    difficulty: "wset2",
    tooltip: "A region or estate celebrated for multi-grape blends (Bordeaux, Champagne, Châteauneuf-du-Pape, Rioja, Amarone, Port). A single grape does not qualify.",
    iconName: "GitMerge",
    predicate: (e) => e.entityType !== "grape" && e.varietalTraits.includes("multi_blend_tradition"),
  },
  {
    id: "var-thick-skin-late",
    label: "Thick-Skinned, Late-Ripening Grape Architecture",
    shortLabel: "Thick-Skin Late Ripener",
    category: "varietal",
    difficulty: "master_somm",
    tooltip: "High skin-to-juice ratio requiring a long growing season (Cabernet Sauvignon, Nebbiolo, Syrah, Mourvèdre, Aglianico, Touriga).",
    iconName: "Shield",
    predicate: (e) => e.varietalTraits.includes("thick_skin_late_ripening"),
  },
  {
    id: "var-thin-skin-early",
    label: "Thin-Skinned Grape Architecture",
    shortLabel: "Thin-Skinned Grape",
    category: "varietal",
    difficulty: "master_somm",
    tooltip: "Delicate cuticles susceptible to rot or botrytis (Pinot Noir, Gamay, Merlot, Sémillon, Chenin Blanc, Furmint, Grenache).",
    iconName: "Feather",
    predicate: (e) => e.varietalTraits.includes("thin_skin_early_ripening"),
  },

  // ==========================================================================
  // 11. BOTTLE SHAPE & PACKAGING
  // ==========================================================================
  {
    id: "bot-bordeaux",
    label: "High-Shouldered Bordeaux Bottle Tradition",
    shortLabel: "Bordeaux Bottle",
    category: "bottle",
    difficulty: "wset3",
    tooltip: "Straight-sided, high-shouldered bottle designed to catch sediment when decanting.",
    iconName: "Wine",
    predicate: (e) => e.bottleShapes.includes("bordeaux_shoulder"),
  },
  {
    id: "bot-burgundy",
    label: "Sloped-Shoulder Burgundy / Rhône Bottle Tradition",
    shortLabel: "Burgundy / Rhône Bottle",
    category: "bottle",
    difficulty: "wset3",
    tooltip: "Gently sloping shoulders classic to Burgundy, Rhône, Loire, Piedmont (Albeisa), and New World Pinot/Chardonnay/Syrah.",
    iconName: "Wine",
    predicate: (e) => e.bottleShapes.includes("burgundy_slope"),
  },
  {
    id: "bot-flute-specialty",
    label: "Flûte d'Alsace / Schlegel, Heavy Champagne, or Historic Specialty Bottle",
    shortLabel: "Flûte / Champagne / Specialty",
    category: "bottle",
    difficulty: "wset3",
    tooltip: "Tall slender Riesling/Alsace flute, thick-walled sparkling bottle, Jura Clavelin, Tokaji 500ml, or embossed Châteauneuf bottle.",
    iconName: "Sparkles",
    predicate: (e) =>
      e.bottleShapes.includes("alsace_flute_schlegel") ||
      e.bottleShapes.includes("champagne_heavy") ||
      e.bottleShapes.includes("specialty_traditional"),
  },

  // ==========================================================================
  // 12. VITICULTURAL & HISTORICAL HERITAGE
  // ==========================================================================
  {
    id: "her-ungrafted",
    label: "Ungrafted / Pre-Phylloxera Vines ('Franc de Pied') Heritage",
    shortLabel: "Ungrafted Vines",
    category: "heritage",
    difficulty: "wset3",
    tooltip: "Famous for own-rooted vines surviving phylloxera in volcanic ash, sand, slate, or isolated continents (Santorini, Barossa, Chile, Mosel, Etna).",
    iconName: "Sprout",
    predicate: (e) => e.heritage.includes("ungrafted_pre_phylloxera"),
  },
  {
    id: "her-bush-vines",
    label: "Untrellised Bush Vines ('Gobelet' / 'Alberello' / 'En Vaso' / 'Kouloura')",
    shortLabel: "Bush Vines (Gobelet)",
    category: "heritage",
    difficulty: "wset3",
    tooltip: "Free-standing ancient head-trained vines (Châteauneuf-du-Pape, Priorat, Etna, Santorini, Barossa, Rioja, Swartland, Beaujolais).",
    iconName: "Trees",
    predicate: (e) => e.heritage.includes("bush_vines"),
  },
  {
    id: "her-unesco-monastic",
    label: "UNESCO World Heritage Landscape or Monastic Cistercian/Benedictine Origin",
    shortLabel: "UNESCO / Monastic",
    category: "heritage",
    difficulty: "wset3",
    tooltip: "UNESCO landscape (Côte d'Or Climats, Champagne, Saint-Émilion, Langhe, Douro, Tokaj, Wachau — not Chablis) or a monastic Cistercian/Benedictine origin.",
    iconName: "Landmark",
    predicate: (e) => e.heritage.includes("unesco_landscape") || e.heritage.includes("monastic_origin"),
  },
  {
    id: "her-pre-1855",
    label: "Codified or Founded On or Before 1855",
    shortLabel: "Pre-1855 Heritage",
    category: "heritage",
    difficulty: "wset3",
    tooltip: "Demarcated by law (Chianti 1716, Tokaj 1737, Douro 1756, Bordeaux 1855) or founded prior to 1855.",
    iconName: "Scroll",
    predicate: (e) => e.heritage.includes("codified_pre_1855"),
  },

  // ==========================================================================
  // 13. ENTITY TYPE CLUES (ALLOWS MIXED-ENTITY MATRICES!)
  // ==========================================================================
  {
    id: "type-appellation",
    label: "Category: Wine Appellation / Denomination Region",
    shortLabel: "Wine Appellation",
    category: "entity_type",
    difficulty: "wset2",
    tooltip: "Must be a geographic wine region / appellation (AOC, DOCG, DO, AVA, GI, PDO).",
    iconName: "Map",
    predicate: (e) => e.entityType === "appellation",
  },
  {
    id: "type-grape",
    label: "Category: Grape Variety (Cultivar)",
    shortLabel: "Grape Variety",
    category: "entity_type",
    difficulty: "wset2",
    tooltip: "Must be a Vitis vinifera grape variety.",
    iconName: "Grape",
    predicate: (e) => e.entityType === "grape",
  },
  {
    id: "type-producer",
    label: "Category: Iconic Wine Producer / Benchmark Estate",
    shortLabel: "Iconic Producer",
    category: "entity_type",
    difficulty: "wset3",
    tooltip: "Must be a legendary winery, château, domaine, or bodega.",
    iconName: "Castle",
    predicate: (e) => e.entityType === "producer",
  },
];

export const CLUE_BY_ID: Record<string, ClueDefinition> = Object.fromEntries(
  CLUE_CATALOG.map((clue) => [clue.id, clue])
);
