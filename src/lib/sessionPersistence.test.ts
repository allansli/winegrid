import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  advanceInfiniteRun,
  freshInfiniteRun,
  readInfiniteRun,
  readResumeSnapshot,
  readStoredMode,
  writeInfiniteRun,
  writeResumeSnapshot,
  writeStoredMode,
} from "./sessionPersistence";

function memoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value);
    },
    removeItem: (key) => {
      map.delete(key);
    },
    clear: () => map.clear(),
    key: (index) => [...map.keys()][index] ?? null,
    get length() {
      return map.size;
    },
  };
}

describe("session persistence", () => {
  it("keeps an unknown mode on Daily", () => {
    const storage = memoryStorage();
    assert.equal(readStoredMode(storage), "daily");
    storage.setItem("winegrid_mode_v1", "weekly");
    assert.equal(readStoredMode(storage), "daily");
    writeStoredMode(storage, "infinite");
    assert.equal(readStoredMode(storage), "infinite");
  });

  it("gives Infinite a seed that Unlimited cannot collide with", () => {
    const run = freshInfiniteRun("wset3", "all", "run-1");
    assert.equal(run.seed, "infinite-run-1-0");
    assert.equal(run.boardsCleared, 0);
    const next = advanceInfiniteRun(run);
    assert.equal(next.boardsCleared, 1);
    assert.equal(next.seed, "infinite-run-1-1");
    assert.notEqual(next.seed, `unlimited-${run.runId}`);
  });

  it("round-trips a run and a resume snapshot", () => {
    const storage = memoryStorage();
    const run = freshInfiniteRun("wset2", "grape", "run-2");
    writeInfiniteRun(storage, run);
    assert.deepEqual(readInfiniteRun(storage), run);

    const cells = Array.from({ length: 9 }, (_, index) => ({ index }));
    writeResumeSnapshot(storage, "infinite", {
      seed: run.seed,
      difficulty: "wset2",
      entityFilter: "grape",
      sessionId: "s1",
      cells,
      guessesRemaining: 2,
      missesUsed: 1,
      economyVersion: 2,
      isRevealed: false,
      clueHash: "abc123",
      run,
    });
    const loaded = readResumeSnapshot(storage, "infinite");
    assert.equal(loaded?.missesUsed, 1);
    assert.equal(loaded?.cells.length, 9);
    assert.equal(loaded?.clueHash, "abc123");
    assert.equal(loaded?.run?.seed, run.seed);
  });
});
