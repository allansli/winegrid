import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { normalizeSearchText, searchWineEntities } from "./wineDatabase";

describe("cell-scoped entity search", () => {
  it("does not list other types when a cell only accepts producers", () => {
    const results = searchWineEntities("", "all", new Set(), {
      acceptedTypes: ["producer"],
      limit: 200,
    });
    assert.ok(results.length > 0);
    assert.ok(results.every((entity) => entity.entityType === "producer"));
    assert.ok(results.some((entity) => entity.id === "prod-drc"));
    assert.equal(results.some((entity) => entity.entityType === "grape"), false);
    assert.equal(results.some((entity) => entity.entityType === "appellation"), false);
  });

  it("keeps grapes out of a region-only cell even when the query matches a grape", () => {
    const results = searchWineEntities("cabernet", "all", new Set(), {
      acceptedTypes: ["appellation"],
    });
    assert.equal(
      results.some((entity) => entity.id === "grape-cabernet-sauvignon"),
      false
    );
  });

  it("ranks Romanée-Conti first for a producer cell when the query is complete", () => {
    const results = searchWineEntities("Romanee-Conti", "all", new Set(), {
      acceptedTypes: ["producer"],
    });
    assert.equal(results[0]?.id, "prod-drc");
  });

  it("folds accents, hyphens, umlauts, and aliases", () => {
    assert.equal(normalizeSearchText("Côte-Rôtie"), normalizeSearchText("Cote Rotie"));
    assert.equal(normalizeSearchText("Grüner Veltliner"), normalizeSearchText("Gruener Veltliner"));
    assert.equal(normalizeSearchText("Gewürztraminer"), normalizeSearchText("Gewuerztraminer"));
    assert.equal(normalizeSearchText("Müller"), normalizeSearchText("Mueller"));
    assert.equal(normalizeSearchText("Château d’Yquem"), normalizeSearchText("Chateau d'Yquem"));
    assert.equal(normalizeSearchText("Xarel·lo"), normalizeSearchText("Xarello"));
    assert.ok(searchWineEntities("Cote Rotie").some((entity) => entity.id === "app-cote-rotie"));
    assert.ok(searchWineEntities("Chateauneuf du Pape").some((entity) => entity.id === "app-chateauneuf-du-pape"));
    assert.ok(searchWineEntities("Saint Emilion").some((entity) => entity.id === "app-saint-emilion"));
    assert.ok(searchWineEntities("St Emilion").some((entity) => entity.id === "app-saint-emilion"));
    assert.ok(searchWineEntities("Mueller").some((entity) => entity.id === "prod-egon-muller"));
    assert.ok(searchWineEntities("Gruener Veltliner").some((entity) => entity.id === "grape-gruner-veltliner"));
    assert.ok(searchWineEntities("Gewuerztraminer").some((entity) => entity.id === "grape-gewurztraminer"));
    assert.ok(searchWineEntities("Château d’Yquem").some((entity) => entity.id === "prod-chateau-dyquem"));
    assert.ok(searchWineEntities("Xarello").some((entity) => entity.id === "app-cava"));
  });

  it("drops an entity that matches neither clue", () => {
    const results = searchWineEntities("cava", "all", new Set(), {
      matchesCell: (entity) =>
        entity.macroRegion === "Rhône Valley" || entity.alsoRegions?.includes("Rhône Valley") === true,
    });
    assert.equal(results.some((entity) => entity.id === "app-cava"), false);
  });

  it("returns no producer when the cell only accepts grapes", () => {
    const results = searchWineEntities("Romanee-Conti", "all", new Set(), {
      acceptedTypes: ["grape"],
    });
    assert.equal(results.length, 0);
  });
});
