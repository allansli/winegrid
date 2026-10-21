import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { fieldsMatchSearch, normalizeSearchText, searchQuery, searchWineEntities } from "./wineDatabase";

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
    assert.equal(normalizeSearchText("Spätburgunder"), normalizeSearchText("Spatburgunder"));
    assert.equal(normalizeSearchText("Blaufränkisch"), normalizeSearchText("Blaufrankisch"));
    assert.equal(normalizeSearchText("Frühburgunder"), normalizeSearchText("Fruhburgunder"));
    assert.equal(normalizeSearchText("Rüdesheim"), normalizeSearchText("Rudesheim"));
    assert.equal(normalizeSearchText("Spätlese"), normalizeSearchText("Spatlese"));
    assert.ok(searchWineEntities("Spatburgunder").some((entity) => entity.id === "grape-pinot-noir"));
    assert.ok(searchWineEntities("Blaufrankisch").some((entity) => entity.id === "app-burgenland"));
    assert.ok(searchWineEntities("Fruhburgunder").some((entity) => entity.id === "app-ahr"));
    assert.ok(searchWineEntities("Borgonha").some((entity) => entity.macroRegion === "Burgundy"));
    assert.ok(searchWineEntities("Itália").some((entity) => entity.country === "Italy"));
    assert.ok(searchWineEntities("Alemanha").some((entity) => entity.country === "Germany"));
    assert.ok(searchWineEntities("Piemonte").some((entity) => entity.macroRegion === "Piedmont"));
    assert.ok(searchWineEntities("Galiza").some((entity) => entity.macroRegion === "Galicia"));
  });

  it("ignores queries that fold down to fewer than two characters", () => {
    for (const query of ["ue", "oe", "ae", "ü", "ö", "ä", "u", "a", "·"]) {
      assert.equal(searchQuery(query), null, query);
      assert.equal(searchWineEntities(query).length, 0, query);
      assert.equal(fieldsMatchSearch(["Pinot Noir", "Spätburgunder", "Blaufränkisch"], query), false, query);
    }
    assert.equal(searchQuery(""), "");
    assert.equal(searchQuery("   "), "");
    assert.ok(searchWineEntities("").length > 0);
    assert.equal(fieldsMatchSearch(["Pinot Noir"], ""), true);
    assert.equal(fieldsMatchSearch(["Spätburgunder"], "Spatburgunder"), true);
    assert.ok(searchWineEntities("Spatburgunder").some((entity) => entity.id === "grape-pinot-noir"));
    assert.ok(searchWineEntities("Blaufrankisch").some((entity) => entity.id === "app-burgenland"));
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
