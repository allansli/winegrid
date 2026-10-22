import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CLUE_BY_ID } from "./clueCatalog";
import { WINE_ENTITY_BY_ID } from "./wineDatabase";

/** Village cards on the Côte d'Or, including the two that were already tagged. */
const COTE_DOR_VILLAGES = [
  "app-gevrey-chambertin",
  "app-chambolle-musigny",
  "app-vosne-romanee",
  "app-nuits-saint-georges",
  "app-corton",
  "app-beaune",
  "app-pommard",
  "app-volnay",
  "app-meursault",
  "app-puligny-montrachet",
  "app-chassagne-montrachet",
] as const;

describe("Côte d'Or climate and colour", () => {
  it("gives every Côte d'Or village continental climate and a dry colour", () => {
    for (const id of COTE_DOR_VILLAGES) {
      const entity = WINE_ENTITY_BY_ID[id];
      assert.ok(entity, id);
      assert.equal(entity.climates.includes("continental"), true, id);
      assert.equal(
        entity.styles.includes("dry_red") || entity.styles.includes("dry_white"),
        true,
        id
      );
    }
  });

  it("accepts Pommard for Continental × Dry Red", () => {
    const pommard = WINE_ENTITY_BY_ID["app-pommard"];
    assert.equal(CLUE_BY_ID["clim-continental"].predicate(pommard), true);
    assert.equal(CLUE_BY_ID["style-dry-red"].predicate(pommard), true);
  });

  it("keeps the Sommelier climate rule and the passito removal", () => {
    assert.equal(WINE_ENTITY_BY_ID["grape-pinot-gris"].climates.includes("continental"), true);
    assert.equal(WINE_ENTITY_BY_ID["grape-pinot-gris"].styles.includes("dry_white"), false);
    assert.equal(WINE_ENTITY_BY_ID["grape-marsanne"].styles.includes("passito_appassimento"), false);
    assert.equal(WINE_ENTITY_BY_ID["grape-marsanne"].styles.includes("dry_white"), true);
    assert.equal(WINE_ENTITY_BY_ID["grape-roussanne"].styles.includes("passito_appassimento"), false);
    assert.equal(WINE_ENTITY_BY_ID["grape-roussanne"].styles.includes("dry_white"), true);
    assert.equal(WINE_ENTITY_BY_ID["app-pouilly-fuisse"].climates.includes("continental"), true);
    assert.equal(WINE_ENTITY_BY_ID["app-pouilly-fuisse"].styles.includes("dry_white"), true);
    assert.equal(WINE_ENTITY_BY_ID["app-pouilly-fume"].climates.includes("continental"), false);
  });
});
