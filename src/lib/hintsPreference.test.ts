import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { HINTS_STORAGE_KEY, readHintsOn, writeHintsOn } from "./hintsPreference";

describe("hints preference", () => {
  it("persists across a fresh read", () => {
    const saved = new Map<string, string>();
    const storage = {
      getItem: (key: string) => saved.get(key) ?? null,
      setItem: (key: string, value: string) => {
        saved.set(key, value);
      },
    };
    assert.equal(readHintsOn(storage), false);
    writeHintsOn(storage, true);
    assert.equal(saved.get(HINTS_STORAGE_KEY), "1");
    assert.equal(readHintsOn(storage), true);
    writeHintsOn(storage, false);
    assert.equal(readHintsOn(storage), false);
  });

  it("stays on when the locale key changes", () => {
    const saved = new Map<string, string>();
    const storage = {
      getItem: (key: string) => saved.get(key) ?? null,
      setItem: (key: string, value: string) => {
        saved.set(key, value);
      },
    };
    writeHintsOn(storage, true);
    storage.setItem("winegrid_locale_v1", "pt-BR");
    assert.equal(readHintsOn(storage), true);
    storage.setItem("winegrid_locale_v1", "en");
    assert.equal(readHintsOn(storage), true);
  });
});
