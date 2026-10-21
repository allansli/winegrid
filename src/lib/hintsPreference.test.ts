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
});
