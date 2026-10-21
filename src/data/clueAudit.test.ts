import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CLUE_BY_ID } from "./clueCatalog";
import { ALSO_COUNTRY_SOURCES, TAG_SOURCES } from "./tagSources";
import { ALL_WINE_ENTITIES, WINE_ENTITY_BY_ID } from "./wineDatabase";

const TAG_FIELDS = [
  "classifications",
  "soils",
  "climates",
  "waterBodies",
  "styles",
  "vinification",
  "sensory",
  "varietalTraits",
  "bottleShapes",
  "heritage",
] as const;

function accepts(clueId: string, entityId: string): boolean {
  const clue = CLUE_BY_ID[clueId];
  const entity = WINE_ENTITY_BY_ID[entityId];
  assert.ok(clue, clueId);
  assert.ok(entity, entityId);
  return clue.predicate(entity);
}

describe("attribute tag sources", () => {
  it("gives every tag used on an entity a source note", () => {
    const missing = new Set<string>();
    for (const entity of ALL_WINE_ENTITIES) {
      for (const field of TAG_FIELDS) {
        for (const tag of entity[field]) {
          if (!TAG_SOURCES[tag]) missing.add(tag);
        }
      }
    }
    assert.deepEqual([...missing], []);
  });

  it("gives every curated alsoCountries entry its own source note", () => {
    const missing: string[] = [];
    const seen = new Set<string>();
    for (const entity of ALL_WINE_ENTITIES) {
      for (const country of entity.alsoCountries ?? []) {
        const note = ALSO_COUNTRY_SOURCES[entity.id]?.[country]?.trim();
        if (!note) missing.push(`${entity.id} ${country}`);
        seen.add(`${entity.id}|${country}`);
      }
    }
    const extras: string[] = [];
    for (const [id, countries] of Object.entries(ALSO_COUNTRY_SOURCES)) {
      for (const country of Object.keys(countries)) {
        if (!seen.has(`${id}|${country}`)) extras.push(`${id} ${country}`);
      }
    }
    assert.deepEqual(missing, []);
    assert.deepEqual(extras, []);
  });
});

describe("audit clue accept and reject cases", () => {
  const cases: Array<[string, string, boolean]> = [
    // A1 Iberian DO / DOC
    ["cls-doca-pdo", "app-rioja", true],
    ["cls-doca-pdo", "app-porto", true],
    ["cls-doca-pdo", "app-bolgheri", false],
    ["cls-doca-pdo", "app-soave-classico", false],
    ["cls-doca-pdo", "app-mosel", false],
    ["cls-doca-pdo", "app-santorini", false],
    ["cls-doca-pdo", "grape-tempranillo", false],
    // A2 New World AVA / GI
    ["cls-new-world-ava-gi", "app-napa-valley", true],
    ["cls-new-world-ava-gi", "app-barossa-valley", true],
    ["cls-new-world-ava-gi", "app-bekaa-valley", false],
    ["cls-new-world-ava-gi", "prod-chateau-musar", false],
    ["cls-new-world-ava-gi", "grape-cabernet-sauvignon", false],
    // A3 Italian / Iberian native
    ["var-indigenous-med", "grape-nebbiolo", true],
    ["var-indigenous-med", "grape-tempranillo", true],
    ["var-indigenous-med", "grape-cabernet-franc", false],
    ["var-indigenous-med", "grape-chenin-blanc", false],
    ["var-indigenous-med", "grape-assyrtiko", false],
    ["var-indigenous-med", "grape-savagnin", false],
    ["var-indigenous-med", "app-banyuls", false],
    // A4 altitude, foothills do not count
    ["clim-high-altitude", "grape-malbec", true],
    ["clim-high-altitude", "app-barolo", false],
    ["clim-high-altitude", "grape-savagnin", false],
    ["clim-high-altitude", "app-chateau-chalon", false],
    // A5 above 45°
    ["geo-cool-latitude", "app-pauillac", true],
    ["geo-cool-latitude", "prod-chateau-lafite", true],
    ["geo-cool-latitude", "prod-chateau-margaux", true],
    ["geo-cool-latitude", "app-cote-rotie", true],
    ["geo-cool-latitude", "prod-guigal", true],
    ["geo-cool-latitude", "app-condrieu", true],
    ["geo-cool-latitude", "app-hermitage", true],
    ["geo-cool-latitude", "app-amarone", true],
    ["geo-cool-latitude", "app-soave-classico", true],
    ["geo-cool-latitude", "prod-quintarelli", true],
    // A6 and 1855 appellations
    ["cls-1855", "grape-cabernet-sauvignon", false],
    ["cls-1855", "grape-merlot", false],
    ["cls-1855", "grape-semillon", false],
    ["cls-1855", "app-pauillac", true],
    ["cls-1855", "app-margaux", true],
    ["cls-1855", "app-saint-julien", true],
    ["cls-1855", "app-saint-estephe", true],
    ["cls-1855", "app-sauternes", true],
    ["cls-1855", "app-pomerol", false],
    ["cls-grand-cru", "grape-cabernet-franc", false],
    // Classic blend is not a single grape. Barossa's GSM and Shiraz-Cab count.
    ["var-multi-blend", "grape-tempranillo", false],
    ["var-multi-blend", "grape-grenache", false],
    ["var-multi-blend", "grape-malbec", false],
    ["var-multi-blend", "app-barossa-valley", true],
    ["var-multi-blend", "app-pauillac", true],
    ["var-multi-blend", "app-champagne", true],
    // B many-to-many origin and region
    ["geo-france", "grape-malbec", true],
    ["reg-bordeaux", "grape-malbec", true],
    ["geo-france", "grape-carmenere", true],
    ["reg-bordeaux", "grape-carmenere", true],
    ["reg-bordeaux", "grape-cabernet-franc", true],
    ["reg-bordeaux", "grape-sauvignon-blanc", true],
    ["reg-loire", "grape-cabernet-franc", true],
    ["geo-france", "grape-grenache", true],
    ["geo-spain", "grape-grenache", true],
    ["reg-rhone-provence", "grape-grenache", true],
    ["reg-rhone-provence", "grape-mourvedre", true],
    ["geo-france", "grape-mourvedre", true],
    ["geo-spain", "grape-mourvedre", true],
    ["geo-italy", "grape-zinfandel", true],
    ["geo-usa", "grape-zinfandel", true],
    // C pre-1855, solera, UNESCO, sand, unoaked
    ["her-pre-1855", "prod-vega-sicilia", false],
    ["her-pre-1855", "prod-henschke", false],
    ["her-pre-1855", "app-pauillac", true],
    ["vin-flor-solera", "prod-vega-sicilia", false],
    ["vin-flor-solera", "app-chateau-chalon", true],
    ["her-unesco-monastic", "prod-raveneau", false],
    ["her-unesco-monastic", "app-chablis", true],
    ["soil-sand-phylloxera", "app-barolo", false],
    ["soil-sand-phylloxera", "app-sonoma-coast", false],
    ["soil-sand-phylloxera", "app-stellenbosch", false],
    ["soil-sand-phylloxera", "app-swartland-constantia", false],
    ["vin-no-mlf-unoaked", "prod-chateau-petrus", false],
    ["vin-no-mlf-unoaked", "prod-chateau-musar", false],
    ["vin-no-mlf-unoaked", "app-bekaa-valley", false],
    ["her-bush-vines", "app-soave-classico", false],
    // Secondary countries and flagship latitude
    ["geo-oceania", "grape-syrah", true],
    ["geo-oceania", "grape-sauvignon-blanc", true],
    ["geo-oceania", "grape-pinot-noir", true],
    ["geo-oceania", "grape-riesling", true],
    ["geo-oceania", "grape-cabernet-sauvignon", true],
    ["geo-usa", "grape-chardonnay", true],
    ["geo-oceania", "grape-chardonnay", true],
    ["geo-oceania", "grape-grenache", true],
    ["geo-oceania", "grape-semillon", true],
    ["geo-usa", "grape-cabernet-sauvignon", true],
    ["geo-usa", "grape-pinot-noir", true],
    ["geo-south-america", "grape-cabernet-sauvignon", true],
    ["geo-cool-latitude", "grape-corvina", true],
    ["geo-cool-latitude", "grape-viognier", true],
    ["geo-cool-latitude", "grape-syrah", true],
    ["geo-cool-latitude", "grape-cabernet-sauvignon", true],
    ["her-unesco-monastic", "app-pauillac", false],
    ["clim-high-altitude", "app-naoussa", false],
    ["clim-high-altitude", "app-napa-valley", false],
    ["clim-high-altitude", "prod-ridge", true],
    ["cls-new-world-ava-gi", "app-maipo-colchagua", true],
  ];

  for (const [clueId, entityId, expected] of cases) {
    it(`${clueId} ${expected ? "accepts" : "rejects"} ${entityId}`, () => {
      assert.equal(accepts(clueId, entityId), expected);
    });
  }

  it("keeps the corrected aliases off the wrong entities", () => {
    assert.equal(WINE_ENTITY_BY_ID["prod-screaming-eagle"].aliases.includes("Opus One"), false);
    assert.equal(WINE_ENTITY_BY_ID["prod-screaming-eagle"].aliases.includes("Harlan Estate"), false);
    assert.equal(WINE_ENTITY_BY_ID["app-condrieu"].aliases.includes("Château-Grillet"), false);
    assert.equal(WINE_ENTITY_BY_ID["app-alsace-grand-cru"].aliases.includes("Alsace AOC"), false);
    assert.equal(WINE_ENTITY_BY_ID["app-porto"].aliases.includes("Douro DOC"), false);
    assert.equal(WINE_ENTITY_BY_ID["app-cava"].aliases.includes("Corpinnat"), false);
    assert.equal(WINE_ENTITY_BY_ID["app-chablis"].heritage.includes("unesco_landscape"), false);
    assert.equal(WINE_ENTITY_BY_ID["prod-raveneau"].heritage.includes("unesco_landscape"), false);
  });
});
