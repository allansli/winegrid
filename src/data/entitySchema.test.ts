import assert from "node:assert/strict";
import fs from "node:fs";
import { describe, it } from "node:test";
import { ALSO_COUNTRY_SOURCES } from "./tagSources";
import { ALL_WINE_ENTITIES, WINE_ENTITY_BY_ID } from "./wineDatabase";
import { PT_NOTES } from "../i18n/notesPt";
import { ENTITY_FIELDS, validateCatalog, validateEntity } from "./entitySchema";
import { WineEntity } from "../types/wine";

function contextFor(entity: WineEntity, patch: Partial<{ ptNotes: Record<string, string> }> = {}) {
  return {
    entities: [entity],
    ptNotes: patch.ptNotes ?? PT_NOTES,
    sources: ALSO_COUNTRY_SOURCES,
  };
}

describe("entity schema", () => {
  it("accepts the current catalog", () => {
    assert.deepEqual(validateCatalog(ALL_WINE_ENTITIES), []);
  });

  it("fails on missing tags, missing pt-BR, unsourced alsoCountries, duplicate aliases, or a broken parent region", () => {
    const entity = structuredClone(WINE_ENTITY_BY_ID["grape-cabernet-sauvignon"]);
    const clean = validateEntity(entity, contextFor(entity));
    assert.deepEqual(clean, []);

    const untagged = structuredClone(entity);
    untagged.soils = [];
    assert.match(validateEntity(untagged, contextFor(untagged)).join("\n"), /missing tags: soils/);

    const untranslated = structuredClone(entity);
    assert.match(
      validateEntity(untranslated, contextFor(untranslated, { ptNotes: {} })).join("\n"),
      /missing pt-BR note/
    );

    const unsourced = structuredClone(entity);
    unsourced.alsoCountries = ["Spain"];
    assert.match(validateEntity(unsourced, contextFor(unsourced)).join("\n"), /unsourced alsoCountries: Spain/);

    const duplicated = structuredClone(entity);
    duplicated.aliases = [...entity.aliases, entity.aliases[0]];
    assert.match(validateEntity(duplicated, contextFor(duplicated)).join("\n"), /duplicate alias:/);

    const unlinked = structuredClone(entity);
    unlinked.macroRegion = "Lost Valley";
    assert.match(
      validateEntity(unlinked, contextFor(unlinked)).join("\n"),
      /broken parent region link: macroRegion Lost Valley/
    );
  });

  it("documents every required field on each entity template", () => {
    for (const type of ["grape", "region", "producer"]) {
      const doc = fs.readFileSync(new URL(`../../docs/entities/${type}.md`, import.meta.url), "utf8");
      for (const field of ENTITY_FIELDS) {
        assert.ok(doc.includes(field), `${type} template is missing ${field}`);
      }
    }
  });
});
