/**
 * One source note for every attribute tag the catalog can carry.
 * Country and region membership is separate: `country` is the flagship,
 * `originCountries` is the historical home, and `alsoCountries` / `alsoRegions`
 * are places where the entity is important enough to satisfy that clue.
 *
 * `alsoCountries` is hand-curated. Every country on an entity has a sentence
 * in `ALSO_COUNTRY_SOURCES`, and that sentence cites an external source.
 * A note may also name a local synonym. That synonym has to be one of the
 * entity's aliases; the card does not invent one.
 * Region-group clues read only those sourced entries, looked up in an explicit
 * country table. They do not infer a group from the clue text, from
 * `originCountries`, or from a country that has no note.
 * The order of `primaryGrapes` on an appellation is not a reason to add one.
 *
 * A grape's `latitudeBand` is the band of its flagship appellation. Corvina
 * follows Amarone, Viognier follows Condrieu, Syrah follows Côte-Rôtie, and
 * Cabernet Sauvignon follows Pauillac. Other regions do not average the band down.
 */

/** A cited sentence, optionally with the local synonym used in that country. */
export type AlsoCountrySource = string | { note: string; synonym?: string };

export function alsoCountryNote(source: AlsoCountrySource | undefined): string {
  if (!source) return "";
  return (typeof source === "string" ? source : source.note).trim();
}

/** Local synonym stored next to a note, if the curator set one. */
export function alsoCountrySynonym(source: AlsoCountrySource | undefined): string | undefined {
  if (!source || typeof source === "string") return undefined;
  const synonym = source.synonym?.trim();
  return synonym || undefined;
}

/**
 * Why each curated `alsoCountries` entry is on the card.
 * Keys are entity id, then country name, matching `WineEntity.alsoCountries`.
 */
export const ALSO_COUNTRY_SOURCES: Record<string, Record<string, AlsoCountrySource>> = {
  "grape-cabernet-sauvignon": {
    "United States":
      "Wine Institute: Cabernet Sauvignon is California's most widely planted red wine grape, with the most acreage in Napa County. https://wineinstitute.org/our-industry/statistics/wine-fact-sheets/cabernet-sauvignon/",
    Chile:
      "Wines of Chile: Cabernet Sauvignon is the main variety planted in the Maipo Valley. https://www.winesofchile.org/wine-regions-map/",
    Australia:
      "Wine Australia: Cabernet Sauvignon leads Coonawarra and is one of Margaret River's main varieties. https://www.wineaustralia.com/market-insights/regions-and-varieties/south-australia-wines/coonawarra",
  },
  "grape-pinot-noir": {
    "United States":
      "Oregon Wine Board: Pinot noir is the Willamette Valley's flagship grape and Oregon's flagship variety. https://www.oregonwine.org/regions/willamette-valley/",
    "New Zealand":
      "New Zealand Wine: Pinot Noir is Central Otago's flagship variety. https://www.nzwine.com/en/regions/centralotago/",
    Germany: {
      note: "Wines of Germany (Deutsches Weininstitut): Spätburgunder is Germany's most planted red grape. https://www.winesofgermany.com/our-wine/grape-varieties/grape-variety/94/sp%C3%A4tburgunder-pinot-noir",
      synonym: "Spätburgunder",
    },
  },
  "grape-chardonnay": {
    "United States":
      "Wine Institute: Chardonnay is California's most planted white wine grape, and Sonoma County leads the acreage. https://wineinstitute.org/our-industry/statistics/wine-fact-sheets/chardonnay/",
    "New Zealand":
      "New Zealand Wine: Marlborough produces zesty Chardonnay, and Hawke's Bay is known for concentrated Chardonnay. https://www.nzwine.com/en/winestyles/chardonnay/",
    Australia:
      "Wine Australia: Chardonnay is one of Margaret River's main varieties. https://www.wineaustralia.com/market-insights/regions-and-varieties/western-australia-wines/margaret-river",
  },
  "grape-sauvignon-blanc": {
    "New Zealand":
      "New Zealand Wine: Sauvignon Blanc put Marlborough on the map and is New Zealand's most widely planted variety. https://www.nzwine.com/en/winestyles/sauvignonblanc/",
    Australia:
      "Wine Australia: Sauvignon Blanc is one of Margaret River's main varieties. https://www.wineaustralia.com/market-insights/regions-and-varieties/western-australia-wines/margaret-river",
  },
  "grape-riesling": {
    Australia:
      "Wine Australia: Riesling is synonymous with the Clare Valley. https://www.wineaustralia.com/market-insights/regions-and-varieties/south-australia-wines/clare-valley",
    France:
      "Vins d'Alsace (CIVA): Riesling d'Alsace is a noble Alsace grape, and AOC Alsace may name Riesling when the wine is 100% Riesling. https://www.vinsalsace.com/en/gouts-et-couleurs/cepages/riesling-dalsace/riesling-dalsace/",
  },
  "grape-syrah": {
    Australia:
      "Wine Australia: Shiraz is the Barossa's main variety, about half of plantings, with vines back to the 1840s. https://www.wineaustralia.com/market-insights/regions-and-varieties/south-australia-wines/barossa",
  },
  "grape-tempranillo": {
    Portugal:
      "IVDP: Tinta Roriz (Aragonez, Tempranillo) is a recommended Douro variety and the region's second-most planted red. https://www.ivdp.pt/pt/vinha/castas/",
  },
  "grape-grenache": {
    France:
      "Vins Rhône: Grenache noir is the dominant grape of Châteauneuf-du-Pape. https://www.vins-rhone.com/en/cotes-du-rhone-cru-aoc-chateauneuf-du-pape",
    Australia:
      "Wine Australia: Grenache is one of the Barossa's main varieties, often in GSM blends. https://www.wineaustralia.com/market-insights/regions-and-varieties/south-australia-wines/barossa",
  },
  "grape-chenin-blanc": {
    "South Africa":
      "WOSA / SAWIS: Chenin Blanc is South Africa's most planted wine grape, 15,949 ha as of 31 December 2025. https://www.wosa.co.za/wosadocs/32026/SAWIS_Status_of_wine_grapes_2025_FA.pdf",
  },
  "grape-albarino": {
    Portugal:
      "Comissão de Viticultura da Região dos Vinhos Verdes: Alvarinho is the reference variety of the Monção e Melgaço sub-region. https://www.vinhoverde.pt/fotos/documentacao/moncyayo_e_melgacyo_press_kit_en_930971045686e9255567ad.pdf",
  },
  "grape-mourvedre": {
    France:
      "Vins de Bandol: Mourvèdre is the appellation's emblematic grape and 50–95% of Bandol red. https://vinsdebandol.com/vins-vignobles-cepages",
  },
  "grape-zinfandel": {
    Italy: {
      note: "Consorzio di Tutela del Primitivo di Manduria: the DOC is at least 85% Primitivo (https://www.consorziotutelaprimitivo.com/disciplinare-doc/). Primitivo and Zinfandel are the same variety (Vitis 44, 2005, https://doi.org/10.5073/vitis.2005.44.147-148).",
      synonym: "Primitivo",
    },
  },
  "grape-malbec": {
    France:
      "Vins de Cahors: the Cahors AOC is reserved for red wines made from Malbec, which must be at least 70% of the blend, and Cahors is the cradle of the grape. https://vindecahors.fr/en/cahors-vineyard/",
  },
  "grape-semillon": {
    Australia:
      "Wine Australia: Hunter Valley Semillon is the region's stellar white, and Sémillon is one of Margaret River's main varieties. https://www.wineaustralia.com/market-insights/regions-and-varieties/new-south-wales-wines/hunter-valley",
  },
};

export const TAG_SOURCES: Record<string, string> = {
  DOCG: "Italian Denominazione di Origine Controllata e Garantita, the top DOC tier.",
  AOC: "French Appellation d'Origine Contrôlée / AOP.",
  DOCa: "Spanish Denominación de Origen Calificada (Rioja, Priorat).",
  Vino_de_Pago: "Spanish single-estate Vino de Pago.",
  AVA: "American Viticultural Area, a US appellation.",
  Pradikatswein_VDP: "German Prädikatswein ripeness ladder, often alongside VDP site rank.",
  DAC: "Austrian Districtus Austriae Controllatus.",
  GI: "New World geographical indication (Australia GI, New Zealand GI, South African Wine of Origin).",
  PDO_DO: "European protected designation, used here for DO / DOC laws outside the French AOC and Italian DOCG tags.",
  Grand_Cru: "An official Grand Cru, or a named cru at the top of its region's hierarchy.",
  First_Growth_1855: "An 1855 Premier Cru (Médoc first growth or Sauternes premier cru).",
  Classed_Growth_1855: "A château or communal appellation in the 1855 Médoc or Sauternes classification, including growths below first.",
  Super_Tuscan: "Tuscan wine that made its name outside the traditional Sangiovese DOC rules.",
  Noble_Grape: "A classic international variety used as a teaching category, not an appellation law.",
  Autochthonous_Grape: "A variety treated as native to its historical home. Classification clues do not read this tag.",

  limestone_chalk: "Calcium-carbonate limestone or chalk.",
  kimmeridgian_marl: "Kimmeridgian (Upper Jurassic) limestone marl, as in Chablis and Sancerre.",
  volcanic_basalt: "Basalt, lava, pumice, or other volcanic parent rock.",
  slate_schist: "Slate or schist, including Mosel slate and Priorat llicorella.",
  gravel_alluvial: "Gravel or alluvial stones, as on the Médoc croupes.",
  galets_roules: "Rounded quartzite galets of the southern Rhône.",
  granite: "Granite bedrock, as in Beaujolais, the northern Rhône, and parts of Alsace.",
  clay_limestone: "Clay with limestone, including galestro and much of the Right Bank.",
  albariza: "The white chalky albariza of Jerez.",
  terra_rossa: "Iron-rich red terra rossa over limestone, as in Coonawarra.",
  sand_phylloxera_free: "Sandy soils where own-rooted vines are a documented local story. Not a general 'sandy loam' tag.",
  loess_silt: "Wind-blown loess or silt.",
  tuffeau: "Turonian tuffeau chalk of the middle Loire.",
  iron_clay: "Iron-rich clay, including Pomerol's crasse de fer.",

  maritime: "Ocean-moderated climate.",
  continental: "Inland climate with a wide seasonal range.",
  mediterranean: "Warm, dry-summer climate.",
  high_altitude: "Vineyards at or above about 450 m. Alpine foothills are a different tag and do not count.",
  steep_heroic_slopes: "Viticulture on slopes steep enough to need terraces or special training.",
  cooling_fog_current: "Fog or a cold current that slows ripening.",
  rain_shadow: "A range that leaves the vineyard in a rain shadow.",
  diurnal_shift: "A large day-to-night temperature swing.",
  alpine_foothills: "Foothill sites. Not used by the ≥450 m clue.",

  gironde_estuary: "The Gironde estuary itself, not the Dordogne or Garonne upstream of it.",
  rhone_river: "The Rhône river.",
  loire_river: "The Loire river.",
  mosel_rhine: "The Mosel or the Rhine.",
  douro_river: "The Douro / Duero.",
  ebro_duero: "The Ebro or the Duero basin.",
  atlantic_ocean: "An Atlantic-facing coast.",
  mediterranean_sea: "A Mediterranean coast.",
  pacific_ocean: "A Pacific-facing coast.",
  major_river: "A major river influence that is not one of the named bodies above.",

  dry_red: "A benchmark dry red wine, or a grape used for one.",
  dry_white: "A benchmark dry white wine, or a grape used for one.",
  sparkling_traditional: "Traditional-method sparkling wine.",
  fortified: "A fortified wine.",
  botrytis_sweet: "Sweet wine from noble rot.",
  passito_appassimento: "Dried-grape wine, including Amarone and Vin Santo.",
  rose_specialist: "A place or grape with a classic rosé style.",
  oxidative_biological: "Oxidative or biologically aged wine, including Vin Jaune and Sherry.",

  new_french_oak: "Aging in barriques, often with a share of new French oak.",
  large_neutral_botte_foudre: "Large, older casks (botti, foudres, Stück) rather than new barriques.",
  solera_system: "Fractional solera blending. A multi-vintage blend without a solera does not count.",
  sur_lie_autolysis: "Lees aging, including Muscadet sur lie and Champagne autolysis.",
  carbonic_whole_cluster: "Carbonic or whole-cluster fermentation.",
  no_malolactic: "Malolactic fermentation is routinely blocked.",
  extended_aging_36m: "The benchmark cuvée is aged about three years or more before release.",
  flor_yeast: "Aged under flor or voile.",
  co_fermentation: "Red and white grapes fermented together, as in Côte-Rôtie.",
  amphora_concrete_unoaked: "Fermented and raised without oak, in stainless steel, concrete, or amphora.",

  high_tannin_high_acid: "Both tannin and acidity are high.",
  laser_high_acid: "A low-pH, high-acid benchmark. Moderate acidity plus sugar does not qualify.",
  low_tannin_delicate: "Low tannin and a delicate frame.",
  full_bodied_high_abv: "Full body, often with elevated alcohol.",
  low_abv_delicate: "Low alcohol and a light frame.",
  petrol_tdn: "TDN / petrol, the aged-Riesling marker.",
  violet_rose_floral: "Violet or rose aromas.",
  saline_mineral: "Saline or stony mineral character.",
  rotundone_black_pepper: "Rotundone, tasted as black pepper.",
  earthy_truffle_tar: "Earthy, truffle, or tar notes.",
  honey_saffron_botrytis: "Honey, saffron, or botrytis character.",
  long_cellar_20yr: "A track record of aging for decades.",

  bordeaux_family: "Cabernet, Merlot, Sauvignon Blanc, Sémillon, Malbec, or Carménère, or a wine built on them.",
  burgundy_family: "Pinot, Chardonnay, Gamay, or Melon, or a wine built on them.",
  rhone_family: "Syrah, Grenache, Mourvèdre, Viognier, or their close Rhône partners.",
  italian_indigenous: "A grape native to Italy, on an Italian entity.",
  iberian_indigenous: "A grape native to Spain or Portugal, on an Iberian entity.",
  aromatic_white: "An aromatic white variety.",
  single_varietal_strict: "Classically bottled as one variety.",
  multi_blend_tradition: "A region or estate whose classic wine is a multi-grape blend. Not applied as a reason to accept a single grape.",
  parent_cab_franc_sauv_blanc: "Parentage Cabernet Franc × Sauvignon Blanc.",
  parent_pinot_gouais: "Parentage in the Pinot × Gouais family.",
  thick_skin_late_ripening: "Thick skins and a late harvest. Early ripeners and thin-skinned grapes stay off this tag.",
  thin_skin_early_ripening: "Thin skins. The clue does not also require early ripening.",

  bordeaux_shoulder: "High-shouldered Bordeaux bottle.",
  burgundy_slope: "Sloped-shoulder Burgundy or Rhône bottle.",
  alsace_flute_schlegel: "Tall Alsace flute or Schlegel bottle.",
  champagne_heavy: "Heavy sparkling-wine bottle.",
  specialty_traditional: "A historic specialty bottle, such as the Clavelin.",

  ungrafted_pre_phylloxera: "Own-rooted vines with a documented pre-phylloxera or phylloxera-free story.",
  bush_vines: "Untrellised bush vines (gobelet, en vaso, alberello). Pergola training does not count.",
  unesco_landscape: "Inside a UNESCO vineyard landscape. The Burgundy Climats site is the Côte d'Or, not Chablis.",
  codified_pre_1855: "The law or the estate dates from 1855 or earlier. A later founding date does not count.",
  biodynamic_pioneer: "An early or emblematic biodynamic estate or region.",
  monastic_origin: "Mapped or founded by medieval monastic orders.",
};
