/**
 * One source note for every attribute tag the catalog can carry.
 * Country and region membership is separate: `country` is the flagship,
 * `originCountries` is the historical home, and `alsoCountries` / `alsoRegions`
 * are places where the entity is important enough to satisfy that clue.
 *
 * A grape gains `alsoCountries` when a Codex appellation in that country lists
 * it first in `primaryGrapes` (Shiraz counts as Syrah). The review's textbook
 * homes are included even when another grape is listed first: Syrah in
 * Australia, Sauvignon Blanc in New Zealand, Chenin Blanc in South Africa,
 * Tempranillo and Albariño in Portugal, Cabernet Sauvignon in the United
 * States. The same first-listed rule also adds Cabernet Sauvignon in Chile
 * and Australia, Pinot Noir in the United States and New Zealand, and Riesling
 * in Australia (Clare Valley). Chardonnay is not added for the USA or New
 * Zealand, Grenache is not added for Australia, and Sémillon is not added for
 * Australia: none is the first grape of a Codex appellation there, and Hunter
 * is not in the Codex.
 *
 * A grape's `latitudeBand` is the band of its flagship appellation, the place
 * named by the home-country appellation that lists it first. Corvina follows
 * Amarone, Viognier follows Condrieu, Syrah follows Côte-Rôtie, and Cabernet
 * Sauvignon follows Pauillac. Other regions do not average the band down.
 */
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
