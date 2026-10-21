import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ALL_WINE_ENTITIES, WINE_ENTITY_BY_ID } from "./wineDatabase";
import { ALSO_COUNTRY_SOURCES } from "./tagSources";
import { normalizeSearchText } from "./wineDatabase";
import {
  alsoCountryGrantsRegionGroup,
  alsoTraditionalLine,
  alsoTraditionalPlaces,
  placesMentioned,
} from "./alsoTraditional";

describe("also-country tradition line", () => {
  it("explains Malbec's Old World home from the Cahors source", () => {
    const malbec = WINE_ENTITY_BY_ID["grape-malbec"];
    assert.equal(alsoCountryGrantsRegionGroup(malbec, "France"), true);
    assert.equal(alsoTraditionalLine(malbec, "en"), "Also traditional in: France (Cahors)");
    assert.equal(alsoTraditionalLine(malbec, "pt-BR"), "Também tradicional em: França (Cahors)");
    assert.deepEqual(placesMentioned(malbec, ALSO_COUNTRY_SOURCES["grape-malbec"].France), ["Cahors"]);
  });

  it("skips an also-country that does not add a region group", () => {
    assert.equal(alsoTraditionalLine(WINE_ENTITY_BY_ID["grape-tempranillo"], "en"), null);
    assert.equal(alsoTraditionalLine(WINE_ENTITY_BY_ID["grape-mourvedre"], "en"), null);
    assert.equal(alsoTraditionalLine(WINE_ENTITY_BY_ID["grape-albarino"], "en"), null);
    assert.equal(alsoCountryGrantsRegionGroup(WINE_ENTITY_BY_ID["grape-pinot-noir"], "Germany"), false);
  });

  it("builds every extra region-group line from the source note", () => {
    for (const entity of ALL_WINE_ENTITIES) {
      const entries = alsoTraditionalPlaces(entity);
      const line = alsoTraditionalLine(entity, "en");
      if (entries.length === 0) {
        assert.equal(line, null, entity.id);
        continue;
      }
      assert.ok(line?.startsWith("Also traditional in: "), entity.id);
      for (const entry of entries) {
        const prose = normalizeSearchText(
          ALSO_COUNTRY_SOURCES[entity.id][entry.country].replace(/https?:\/\/\S+/g, " ")
        );
        for (const place of entry.places) {
          assert.ok(prose.includes(normalizeSearchText(place)), `${entity.id} ${entry.country} ${place}`);
        }
        assert.match(line ?? "", new RegExp(entry.country.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
      }
    }
    const chardonnay = alsoTraditionalLine(WINE_ENTITY_BY_ID["grape-chardonnay"], "en");
    assert.match(chardonnay ?? "", /New Zealand \(Marlborough, Hawke's Bay\)/);
    assert.match(alsoTraditionalLine(WINE_ENTITY_BY_ID["grape-chardonnay"], "pt-BR") ?? "", /Nova Zelândia/);
  });
});
