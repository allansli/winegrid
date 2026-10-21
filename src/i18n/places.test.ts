import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ALL_WINE_ENTITIES } from "../data/wineDatabase";
import { accentFoldedWineNames } from "../data/wineNames";
import { COUNTRY_LABELS, REGION_LABELS, originLine, placeLabel } from "./places";

describe("administrative places and wine-name accents", () => {
  it("sends every country and macro region through places.ts", () => {
    for (const entity of ALL_WINE_ENTITIES) {
      const country = COUNTRY_LABELS[entity.country];
      const region = REGION_LABELS[entity.macroRegion];
      assert.ok(country, `${entity.id} country ${entity.country}`);
      assert.ok(region, `${entity.id} region ${entity.macroRegion}`);
      assert.equal(placeLabel(entity.country, "en", "country"), country.en);
      assert.equal(placeLabel(entity.country, "pt-BR", "country"), country["pt-BR"]);
      assert.equal(placeLabel(entity.macroRegion, "en", "region"), region.en);
      assert.equal(placeLabel(entity.macroRegion, "pt-BR", "region"), region["pt-BR"]);
      assert.equal(
        originLine(entity.country, entity.macroRegion, "en"),
        `${country.en} • ${region.en}`
      );
    }
  });

  it("keeps English exonyms and does not rewrite them to the endonym", () => {
    assert.equal(placeLabel("Aragon", "en", "region"), "Aragon");
    assert.notEqual(placeLabel("Aragon", "en", "region"), "Aragón");
    assert.equal(placeLabel("Aragon", "pt-BR", "region"), "Aragão");
    assert.equal(placeLabel("Catalonia", "en", "region"), "Catalonia");
    assert.equal(placeLabel("Catalonia", "pt-BR", "region"), "Catalunha");
    assert.equal(placeLabel("Castilla y León", "en", "region"), "Castilla y León");
    assert.equal(placeLabel("Castilla y León", "pt-BR", "region"), "Castela e Leão");
    assert.equal(originLine("Spain", "Aragon", "en"), "Spain • Aragon");
    assert.equal(originLine("Spain", "Aragon", "pt-BR"), "Espanha • Aragão");
  });

  it("flags a wine proper name that dropped its accent and keeps the real cards", () => {
    const folded = accentFoldedWineNames([
      {
        id: "example",
        name: "Cote-Rotie AOC",
        canonicalName: "Cote-Rotie",
        subRegion: "Rhone Valley",
        aliases: ["Côte-Rôtie"],
        primaryGrapes: ["Syrah"],
        alsoRegions: ["Rhône Valley"],
      },
    ]);
    assert.ok(folded.some((line) => line.includes("Cote-Rotie")));
    assert.ok(folded.some((line) => line.includes("Rhone Valley")));
    assert.deepEqual(accentFoldedWineNames(ALL_WINE_ENTITIES), []);
  });
});
