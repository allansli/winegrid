import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ALL_WINE_ENTITIES } from "../data/wineDatabase";
import { displayEntityName } from "./entityName";

describe("entity card titles", () => {
  it("strips the English type suffix and leaves other parentheses alone", () => {
    assert.equal(displayEntityName("Chardonnay (Grape)", "grape"), "Chardonnay");
    assert.equal(displayEntityName("Torrontés Riojano (Grape)", "grape"), "Torrontés Riojano");
    assert.equal(displayEntityName("País / Listán Prieto (Grape)", "grape"), "País / Listán Prieto");
    assert.equal(displayEntityName("Pauillac (Region)", "appellation"), "Pauillac");
    assert.equal(displayEntityName("Pauillac (Appellation)", "appellation"), "Pauillac");
    assert.equal(displayEntityName("Example (Producer)", "producer"), "Example");
    assert.equal(displayEntityName("Example (Estate)", "producer"), "Example");
    assert.equal(
      displayEntityName("Domaine de la Romanée-Conti (DRC)", "producer"),
      "Domaine de la Romanée-Conti (DRC)"
    );
    assert.equal(displayEntityName("Miolo (Vale dos Vinhedos)", "producer"), "Miolo (Vale dos Vinhedos)");
  });

  it("strips the suffix on every catalog card, for both locales' badges to carry the type", () => {
    for (const entity of ALL_WINE_ENTITIES) {
      const shown = displayEntityName(entity.name, entity.entityType);
      assert.doesNotMatch(
        shown,
        / \((Grape|Appellation|Region|Producer|Estate)\)$/,
        entity.id
      );
    }
    const grapes = ALL_WINE_ENTITIES.filter((entity) => entity.entityType === "grape");
    const regions = ALL_WINE_ENTITIES.filter((entity) => entity.entityType === "appellation");
    const producers = ALL_WINE_ENTITIES.filter((entity) => entity.entityType === "producer");
    assert.ok(grapes.length > 0 && regions.length > 0 && producers.length > 0);
    assert.equal(displayEntityName(grapes[0].name, "grape").includes("(Grape)"), false);
    assert.equal(displayEntityName(regions[0].name, "appellation").includes("(Region)"), false);
    assert.equal(displayEntityName(producers[0].name, "producer").includes("(Producer)"), false);
  });
});