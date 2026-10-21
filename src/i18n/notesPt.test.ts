import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ALL_WINE_ENTITIES } from "../data/wineDatabase";
import { localizedNote, PT_NOTES } from "./notesPt";

describe("Portuguese tasting notes", () => {
  it("covers every entity and keeps the audited facts", () => {
    for (const entity of ALL_WINE_ENTITIES) {
      const note = PT_NOTES[entity.id];
      assert.equal(typeof note, "string", entity.id);
      assert.ok(note && note.length > 40, entity.id);
      assert.notEqual(note, entity.sommelierNote, entity.id);
      assert.doesNotMatch(note, /\bcasta\b/i, entity.id);
    }
    assert.match(PT_NOTES["app-chateauneuf-du-pape"], /1936/);
    assert.match(PT_NOTES["grape-riesling"], /Rüsselsheim/);
    assert.match(PT_NOTES["grape-riesling"], /1435/);
    assert.match(PT_NOTES["prod-biondi-santi"], /1978/);
    assert.match(PT_NOTES["grape-viognier"], /8 ha/);
    assert.match(PT_NOTES["grape-savagnin"], /não aromática/);
    assert.match(PT_NOTES["prod-vega-sicilia"], /1864/);
    assert.match(PT_NOTES["app-pauillac"], /günziano/i);
    assert.equal(localizedNote("app-pauillac", "English", "en"), "English");
    assert.match(localizedNote("app-pauillac", "English", "pt-BR"), /günziano/i);
  });
});
