import assert from "node:assert/strict";
import fs from "node:fs";
import { describe, it } from "node:test";
import { ALSO_COUNTRY_SOURCES } from "./tagSources";
import { ALL_WINE_ENTITIES, WINE_ENTITY_BY_ID } from "./wineDatabase";
import { PT_NOTES } from "../i18n/notesPt";
import { MINIMUM_ANSWERED_CLUES } from "../lib/difficultyTuning";
import {
  CLUE_MINIMUM_ALLOWLIST,
  EMPTY_REQUIRED_TAG_ALLOWLIST,
  ENTITY_FIELDS,
  answeredClueIds,
  validateCatalog,
  validateEntity,
} from "./entitySchema";
import { WineEntity } from "../types/wine";

function contextFor(
  entity: WineEntity,
  patch: Partial<{ ptNotes: Record<string, string>; clueMinimumAllowlist: readonly string[] }> = {}
) {
  return {
    entities: [entity],
    ptNotes: patch.ptNotes ?? PT_NOTES,
    sources: ALSO_COUNTRY_SOURCES,
    clueMinimumAllowlist: patch.clueMinimumAllowlist,
  };
}

function thinCard(): WineEntity {
  const entity = structuredClone(WINE_ENTITY_BY_ID["app-bekaa-valley"]);
  entity.latitudeBand = "temperate_mid";
  entity.coastalOrIsland = false;
  entity.alsoCountries = [];
  entity.alsoRegions = [];
  entity.classifications = [];
  entity.soils = [];
  entity.climates = [];
  entity.waterBodies = [];
  entity.styles = [];
  entity.vinification = [];
  entity.sensory = [];
  entity.varietalTraits = [];
  entity.primaryGrapes = [];
  entity.bottleShapes = [];
  entity.heritage = [];
  return entity;
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

  it("requires three live clues and grandfathers only an explicit allowlist", () => {
    assert.equal(MINIMUM_ANSWERED_CLUES, 3);
    for (const id of CLUE_MINIMUM_ALLOWLIST) {
      const entity = WINE_ENTITY_BY_ID[id];
      assert.ok(entity, id);
      assert.ok(
        answeredClueIds(entity).length < MINIMUM_ANSWERED_CLUES,
        `${id} now clears the minimum; remove it from CLUE_MINIMUM_ALLOWLIST`
      );
    }

    const thin = thinCard();
    assert.ok(answeredClueIds(thin).length < MINIMUM_ANSWERED_CLUES);
    const issues = validateEntity(thin, contextFor(thin)).join("\n");
    assert.match(issues, /need at least 3/);
    const allowed = validateEntity(thin, contextFor(thin, { clueMinimumAllowlist: [thin.id] })).join("\n");
    assert.doesNotMatch(allowed, /need at least 3/);
    assert.match(allowed, /missing tags: soils/);
  });

  it("leaves a required group empty only when no sourced tag fits, and still clears three clues", () => {
    for (const [id, fields] of Object.entries(EMPTY_REQUIRED_TAG_ALLOWLIST)) {
      const entity = WINE_ENTITY_BY_ID[id];
      assert.ok(entity, id);
      for (const field of fields) {
        assert.deepEqual(entity[field], [], `${id} ${field} is filled; drop the allowlist entry`);
      }
      assert.ok(answeredClueIds(entity).length >= MINIMUM_ANSWERED_CLUES, id);
    }
  });

  it("documents every required field on each entity template", () => {
    for (const type of ["grape", "region", "producer"]) {
      const doc = fs.readFileSync(new URL(`../../docs/entities/${type}.md`, import.meta.url), "utf8");
      for (const field of ENTITY_FIELDS) {
        assert.ok(doc.includes(field), `${type} template is missing ${field}`);
      }
      assert.match(doc, /MINIMUM_ANSWERED_CLUES/);
      assert.match(doc, /CLUE_MINIMUM_ALLOWLIST/);
    }
  });
});
