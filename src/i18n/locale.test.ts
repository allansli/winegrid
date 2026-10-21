import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CLUE_BY_ID, CLUE_CATALOG } from "../data/clueCatalog";
import { localizedClue, PT_CLUE_COPY } from "./clues";
import { detectLocale, resolveLocale } from "./locale";
import { translate } from "./messages";

describe("locale", () => {
  it("detects Portuguese and leaves other languages in English", () => {
    assert.equal(detectLocale("pt-BR"), "pt-BR");
    assert.equal(detectLocale("pt"), "pt-BR");
    assert.equal(detectLocale("en-US"), "en");
    assert.equal(detectLocale("fr"), "en");
    assert.equal(detectLocale(undefined), "en");
  });

  it("prefers a saved choice over the browser language", () => {
    assert.equal(resolveLocale("en", "pt-BR"), "en");
    assert.equal(resolveLocale(null, "pt-BR"), "pt-BR");
  });

  it("falls back to English when a key is missing", () => {
    assert.equal(translate("pt-BR", "mode.daily"), "Diário");
    assert.equal(translate("en", "mode.daily"), "Daily");
  });

  it("translates descriptive clues and keeps wine proper nouns", () => {
    const red = localizedClue(CLUE_BY_ID["style-dry-red"], "pt-BR");
    assert.equal(red.shortLabel, "Vinho tinto seco");
    const france = localizedClue(CLUE_BY_ID["geo-france"], "pt-BR");
    assert.equal(france.shortLabel, "França");
    const bordeaux = localizedClue(CLUE_BY_ID["reg-bordeaux"], "pt-BR");
    assert.equal(bordeaux.shortLabel, "Bordeaux");
    const drcName = "Domaine de la Romanée-Conti";
    assert.equal(drcName, "Domaine de la Romanée-Conti");
  });

  it("has Portuguese display copy for every clue without renaming proper nouns", () => {
    for (const clue of CLUE_CATALOG) {
      assert.ok(PT_CLUE_COPY[clue.id], clue.id);
      const copy = localizedClue(clue, "pt-BR");
      assert.equal(copy.predicate, clue.predicate);
      assert.notEqual(copy.shortLabel.trim(), "");
    }
    const bordeaux = localizedClue(CLUE_BY_ID["var-bordeaux-family"], "pt-BR");
    assert.match(bordeaux.shortLabel, /Bordeaux/);
    assert.doesNotMatch(bordeaux.tooltip, /Cabernet Sauvignon invented/);
  });
});
