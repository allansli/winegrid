import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { searchWineEntities } from "./wineDatabase";

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

  it("returns no producer when the cell only accepts grapes", () => {
    const results = searchWineEntities("Romanee-Conti", "all", new Set(), {
      acceptedTypes: ["grape"],
    });
    assert.equal(results.length, 0);
  });
});
