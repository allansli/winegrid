import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { REGION_LABELS, placeLabel } from "../i18n/places";
import { sourcedAlsoCountries } from "./clueCatalog";
import { ALL_WINE_ENTITIES, WINE_ENTITY_BY_ID, normalizeSearchText } from "./wineDatabase";
import { ALSO_COUNTRY_SOURCES, alsoCountryNote, alsoCountrySynonym } from "./tagSources";
import {
  alsoCountryGrantsRegionGroup,
  alsoTraditionalLine,
  alsoTraditionalPlaces,
  placesMentioned,
} from "./alsoTraditional";

function prose(note: string): string {
  return normalizeSearchText(note.replace(/https?:\/\/\S+/g, " ")).replace(/[^a-z0-9]+/g, " ");
}

describe("also-country benchmark line", () => {
  it("explains Malbec's Cahors home with the benchmark copy", () => {
    const malbec = WINE_ENTITY_BY_ID["grape-malbec"];
    assert.equal(alsoCountryGrantsRegionGroup(malbec, "France"), true);
    assert.equal(alsoTraditionalLine(malbec, "en"), "Also a benchmark in: France (Cahors)");
    assert.equal(alsoTraditionalLine(malbec, "pt-BR"), "Também é referência em: França (Cahors)");
    assert.deepEqual(placesMentioned(malbec, alsoCountryNote(ALSO_COUNTRY_SOURCES["grape-malbec"].France)), [
      "Cahors",
    ]);
  });

  it("names Zinfandel's Italian synonym from the source, as Puglia", () => {
    const zinfandel = WINE_ENTITY_BY_ID["grape-zinfandel"];
    const source = ALSO_COUNTRY_SOURCES["grape-zinfandel"].Italy;
    assert.equal(alsoCountrySynonym(source), "Primitivo");
    assert.ok(zinfandel.aliases.includes("Primitivo"));
    assert.deepEqual(placesMentioned(zinfandel, alsoCountryNote(source)), ["Manduria"]);
    assert.equal(alsoTraditionalLine(zinfandel, "en"), "Also a benchmark in: Italy (Puglia, as Primitivo)");
    assert.equal(
      alsoTraditionalLine(zinfandel, "pt-BR"),
      "Também é referência em: Itália (Puglia, como Primitivo)"
    );
    assert.equal(placeLabel("Puglia", "pt-BR", "region"), "Puglia");
  });

  it("shows every sourced also-country, including ones in the same region group", () => {
    const pinot = WINE_ENTITY_BY_ID["grape-pinot-noir"];
    assert.equal(alsoCountryGrantsRegionGroup(pinot, "Germany"), false);
    assert.equal(alsoCountrySynonym(ALSO_COUNTRY_SOURCES["grape-pinot-noir"].Germany), "Spätburgunder");
    assert.ok(pinot.aliases.includes("Spätburgunder"));
    assert.equal(
      alsoTraditionalLine(pinot, "en"),
      "Also a benchmark in: United States (Oregon, Willamette Valley), New Zealand (Central Otago), Germany (as Spätburgunder)"
    );
    assert.match(alsoTraditionalLine(pinot, "pt-BR") ?? "", /Alemanha \(como Spätburgunder\)/);

    assert.equal(
      alsoTraditionalLine(WINE_ENTITY_BY_ID["grape-riesling"], "en"),
      "Also a benchmark in: Australia (Clare Valley), France (Alsace)"
    );
    assert.equal(
      alsoTraditionalLine(WINE_ENTITY_BY_ID["grape-riesling"], "pt-BR"),
      "Também é referência em: Austrália (Clare Valley), França (Alsácia)"
    );
    assert.equal(
      alsoTraditionalLine(WINE_ENTITY_BY_ID["grape-grenache"], "en"),
      "Also a benchmark in: France (Châteauneuf-du-Pape), Australia (Barossa)"
    );
    assert.equal(
      alsoTraditionalLine(WINE_ENTITY_BY_ID["grape-mourvedre"], "en"),
      "Also a benchmark in: France (Bandol)"
    );
    assert.equal(
      alsoTraditionalLine(WINE_ENTITY_BY_ID["grape-tempranillo"], "en"),
      "Also a benchmark in: Portugal (Douro)"
    );
    assert.equal(
      alsoTraditionalLine(WINE_ENTITY_BY_ID["grape-albarino"], "en"),
      "Also a benchmark in: Portugal (Monção e Melgaço)"
    );
  });

  it("does not attach a synonym just because an alias appears in the note", () => {
    for (const id of ["grape-tempranillo", "grape-albarino", "grape-syrah", "grape-grenache"]) {
      for (const entry of alsoTraditionalPlaces(WINE_ENTITY_BY_ID[id])) {
        assert.equal(entry.synonym, undefined, `${id} ${entry.country}`);
      }
    }
  });

  it("localizes every benchmark place through places.ts", () => {
    const cabernet = alsoTraditionalLine(WINE_ENTITY_BY_ID["grape-cabernet-sauvignon"], "pt-BR") ?? "";
    assert.match(cabernet, /Califórnia/);
    assert.doesNotMatch(cabernet, /California/);
    const chardonnay = alsoTraditionalLine(WINE_ENTITY_BY_ID["grape-chardonnay"], "pt-BR") ?? "";
    assert.match(chardonnay, /Califórnia/);
    assert.match(chardonnay, /Condado de Sonoma/);
    assert.match(chardonnay, /Nova Zelândia/);
    assert.match(chardonnay, /Hawke's Bay/);
    assert.match(chardonnay, /Marlborough/);

    for (const entity of ALL_WINE_ENTITIES) {
      const sourced = sourcedAlsoCountries(entity);
      const entries = alsoTraditionalPlaces(entity);
      const line = alsoTraditionalLine(entity, "en");
      const pt = alsoTraditionalLine(entity, "pt-BR");
      assert.deepEqual(
        entries.map((entry) => entry.country),
        sourced,
        entity.id
      );
      if (sourced.length === 0) {
        assert.equal(line, null, entity.id);
        continue;
      }
      assert.ok(line?.startsWith("Also a benchmark in: "), entity.id);
      assert.ok(pt?.startsWith("Também é referência em: "), entity.id);
      for (const entry of entries) {
        const note = alsoCountryNote(ALSO_COUNTRY_SOURCES[entity.id][entry.country]);
        const text = prose(note);
        for (const place of placesMentioned(entity, note)) {
          assert.ok(text.includes(normalizeSearchText(place)), `${entity.id} ${entry.country} ${place}`);
        }
        for (const place of entry.places) {
          assert.ok(REGION_LABELS[place], `${entity.id} missing places.ts key ${place}`);
          assert.equal(placeLabel(place, "en", "region"), REGION_LABELS[place].en);
          assert.match(pt ?? "", new RegExp(placeLabel(place, "pt-BR", "region").replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
        }
        if (entry.synonym) {
          assert.ok(entity.aliases.includes(entry.synonym), `${entity.id} ${entry.synonym}`);
          assert.ok(text.includes(normalizeSearchText(entry.synonym)), `${entity.id} ${entry.synonym}`);
        }
        assert.match(line ?? "", new RegExp(entry.country.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
      }
    }
    assert.match(
      alsoTraditionalLine(WINE_ENTITY_BY_ID["grape-chardonnay"], "en") ?? "",
      /New Zealand \(Marlborough, Hawke's Bay\)/
    );
  });
});
