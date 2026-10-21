import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { localizedEntityName } from "./entityName";

describe("localized entity names", () => {
  it("replaces the English type suffix for every entity type", () => {
    assert.equal(localizedEntityName("Chardonnay (Grape)", "grape", "Uva"), "Chardonnay (Uva)");
    assert.equal(localizedEntityName("Pauillac (Region)", "appellation", "Região"), "Pauillac (Região)");
    assert.equal(
      localizedEntityName("Example (Producer)", "producer", "Produtor"),
      "Example (Produtor)"
    );
    assert.equal(
      localizedEntityName("Domaine de la Romanée-Conti (DRC)", "producer", "Produtor"),
      "Domaine de la Romanée-Conti (DRC)"
    );
  });
});