import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CLUE_CATALOG } from "./clueCatalog";
import { WINE_ENTITY_BY_ID } from "./wineDatabase";
import { entityOriginLine, entityRegionLabel } from "../i18n/places";
import { WineEntity } from "../types/wine";

function clueIds(entity: WineEntity): string[] {
  return CLUE_CATALOG.filter((clue) => clue.predicate(entity))
    .map((clue) => clue.id)
    .sort();
}

describe("display regions that are not membership clues", () => {
  it("prints the same region label in both locales and keeps the clue sets", () => {
    const cases = [
      {
        id: "prod-foillard",
        macroRegion: "Burgundy",
        label: "Beaujolais (Morgon)",
        countryEn: "France • Beaujolais (Morgon)",
        countryPt: "França • Beaujolais (Morgon)",
        clues: [
          "bot-burgundy",
          "clim-continental",
          "cls-aoc",
          "geo-cool-latitude",
          "geo-france",
          "geo-old-world",
          "reg-burgundy-champagne",
          "sens-saline-mineral",
          "soil-granite",
          "soil-slate-schist",
          "style-dry-red",
          "type-producer",
          "var-burgundy-family",
          "var-single-varietal",
          "var-thin-skin-early",
          "vin-whole-cluster-coferment",
        ],
      },
      {
        id: "prod-lapierre",
        macroRegion: "Burgundy",
        label: "Beaujolais (Morgon)",
        countryEn: "France • Beaujolais (Morgon)",
        countryPt: "França • Beaujolais (Morgon)",
        clues: [
          "bot-burgundy",
          "clim-continental",
          "cls-aoc",
          "geo-cool-latitude",
          "geo-france",
          "geo-old-world",
          "reg-burgundy-champagne",
          "sens-saline-mineral",
          "soil-granite",
          "style-dry-red",
          "type-producer",
          "var-burgundy-family",
          "var-single-varietal",
          "var-thin-skin-early",
          "vin-whole-cluster-coferment",
        ],
      },
      {
        id: "prod-fx-pichler",
        macroRegion: "Niederösterreich (Lower Austria)",
        label: "Wachau",
        countryEn: "Austria • Wachau",
        countryPt: "Áustria • Wachau",
        clues: [
          "bot-flute-specialty",
          "clim-heroic-slopes",
          "geo-cool-latitude",
          "geo-germanic",
          "geo-old-world",
          "her-unesco-monastic",
          "hydro-major-river",
          "sens-saline-mineral",
          "soil-granite",
          "style-dry-white",
          "type-producer",
          "var-single-varietal",
          "vin-no-mlf-unoaked",
          "vin-sur-lie",
        ],
      },
      {
        id: "prod-prager",
        macroRegion: "Niederösterreich (Lower Austria)",
        label: "Wachau",
        countryEn: "Austria • Wachau",
        countryPt: "Áustria • Wachau",
        clues: [
          "bot-flute-specialty",
          "clim-diurnal-rainshadow",
          "clim-heroic-slopes",
          "geo-cool-latitude",
          "geo-germanic",
          "geo-old-world",
          "sens-saline-mineral",
          "soil-slate-schist",
          "style-dry-white",
          "type-producer",
          "var-single-varietal",
          "vin-no-mlf-unoaked",
        ],
      },
      {
        id: "prod-felton-road",
        macroRegion: "South Island",
        label: "Central Otago",
        countryEn: "New Zealand • Central Otago",
        countryPt: "Nova Zelândia • Central Otago",
        clues: [
          "bot-burgundy",
          "clim-continental",
          "geo-cool-latitude",
          "geo-new-world",
          "geo-oceania",
          "geo-southern-hemisphere",
          "sens-violet-floral",
          "style-dry-red",
          "type-producer",
          "var-burgundy-family",
          "var-single-varietal",
          "var-thin-skin-early",
          "vin-new-french-oak",
        ],
      },
    ];

    for (const item of cases) {
      const entity = WINE_ENTITY_BY_ID[item.id];
      assert.equal(entity.macroRegion, item.macroRegion, item.id);
      assert.equal(entity.displayRegion, item.label, item.id);
      assert.equal(entityRegionLabel(entity, "en"), item.label, item.id);
      assert.equal(entityRegionLabel(entity, "pt-BR"), item.label, item.id);
      assert.equal(entityOriginLine(entity, "en"), item.countryEn, item.id);
      assert.equal(entityOriginLine(entity, "pt-BR"), item.countryPt, item.id);
      assert.deepEqual(clueIds(entity), item.clues, item.id);
    }
  });
});
