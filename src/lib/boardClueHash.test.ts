import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { generateDailyBoard } from "./matrixGenerator";
import { boardClueHash, reconcileSavedBoard, savedBoardMatchesClues } from "./boardClueHash";

function cell(index: number, rowClueId: string, colClueId: string, validEntityIds: string[]) {
  return { index, rowClueId, colClueId, validEntityIds };
}

const sample = {
  rowClues: [{ id: "geo-france" }, { id: "clim-maritime" }, { id: "style-dry-red" }],
  colClues: [{ id: "var-burgundy-family" }, { id: "style-dry-white" }, { id: "geo-oceania" }],
  cells: [
    cell(0, "geo-france", "var-burgundy-family", ["a", "b", "c"]),
    cell(1, "geo-france", "style-dry-white", ["d", "e", "f"]),
    cell(2, "geo-france", "geo-oceania", ["g"]),
    cell(3, "clim-maritime", "var-burgundy-family", ["app-margaret-river", "a"]),
    cell(4, "clim-maritime", "style-dry-white", ["app-marlborough", "d"]),
    cell(5, "clim-maritime", "geo-oceania", ["app-central-otago"]),
    cell(6, "style-dry-red", "var-burgundy-family", ["h"]),
    cell(7, "style-dry-red", "style-dry-white", ["i"]),
    cell(8, "style-dry-red", "geo-oceania", ["j"]),
  ],
};

describe("board clue hash", () => {
  it("changes when a clue or an accepted answer changes, and ignores picks", () => {
    const original = boardClueHash(sample);
    const differentClue = boardClueHash({
      ...sample,
      rowClues: [{ id: "geo-italy" }, sample.rowClues[1], sample.rowClues[2]],
    });
    const differentAnswers = boardClueHash({
      ...sample,
      cells: sample.cells.map((entry, index) =>
        index === 3 ? { ...entry, validEntityIds: [...entry.validEntityIds, "extra"] } : entry
      ),
    });
    assert.notEqual(differentClue, original);
    assert.notEqual(differentAnswers, original);
    assert.equal(boardClueHash(sample), original);
  });

  it("discards a save with no hash or with another puzzle's cells", () => {
    const hash = boardClueHash(sample);
    assert.equal(savedBoardMatchesClues(null, sample), false);
    assert.equal(savedBoardMatchesClues({ cells: sample.cells }, sample), false);
    assert.equal(
      savedBoardMatchesClues({ clueHash: "ffff", cells: sample.cells }, sample),
      false
    );
    const swapped = sample.cells.map((entry, index) =>
      index === 3 ? { ...entry, rowClueId: "geo-usa", colClueId: "style-sparkling" } : entry
    );
    assert.equal(savedBoardMatchesClues({ clueHash: hash, cells: swapped }, sample), false);
    assert.equal(savedBoardMatchesClues({ clueHash: hash, cells: sample.cells }, sample), true);
  });

  it("is stable for the same daily and distinct for a different day", () => {
    const today = generateDailyBoard("2026-10-23");
    const again = generateDailyBoard("2026-10-23");
    const other = generateDailyBoard("2026-10-24");
    assert.equal(boardClueHash(today), boardClueHash(again));
    assert.notEqual(boardClueHash(today), boardClueHash(other));
    assert.equal(
      savedBoardMatchesClues(
        { clueHash: boardClueHash(today), cells: today.cells },
        again
      ),
      true
    );
    assert.equal(
      savedBoardMatchesClues(
        { clueHash: boardClueHash(other), cells: other.cells },
        today
      ),
      false
    );
  });

  it("keeps a finished daily when the answer hash changes and the clues do not", () => {
    const generated = sample.cells.map((entry, index) =>
      index === 0 ? { ...entry, validEntityIds: ["b", "c"] } : entry
    );
    const finished = sample.cells.map((entry) => ({
      ...entry,
      pickedEntityId: entry.validEntityIds[0],
      pickedRarityPct: 12.5,
      isLocked: true,
    }));
    const restored = reconcileSavedBoard(
      { isCompleted: true, cells: finished },
      generated,
      { keepCompletedDaily: true }
    );
    assert.equal(restored.action, "restore");
    if (restored.action !== "restore") return;
    assert.equal(restored.isCompleted, true);
    assert.equal(restored.cells[0].pickedEntityId, "a");
    assert.equal(restored.cells.filter((cell) => cell.pickedEntityId).length, 9);
  });

  it("drops only placements that no longer fit when the daily is still in progress", () => {
    const generated = sample.cells;
    const savedCells = generated.map((entry, index) => ({
      ...entry,
      pickedEntityId: index === 0 ? "not-in-the-cell" : index === 1 ? "d" : null,
    }));
    const restored = reconcileSavedBoard(
      { isCompleted: false, cells: savedCells },
      generated,
      { keepCompletedDaily: false }
    );
    assert.equal(restored.action, "restore");
    if (restored.action !== "restore") return;
    assert.equal(restored.cells[0].pickedEntityId, null);
    assert.equal(restored.cells[1].pickedEntityId, "d");
    assert.equal(restored.isCompleted, false);
  });

  it("discards the save only when the clue ids themselves changed", () => {
    const swapped = sample.cells.map((entry, index) =>
      index === 3 ? { ...entry, rowClueId: "geo-usa", colClueId: "style-sparkling" } : entry
    );
    assert.equal(
      reconcileSavedBoard({ isCompleted: true, cells: swapped }, sample.cells, {
        keepCompletedDaily: true,
      }).action,
      "discard"
    );
    assert.equal(reconcileSavedBoard(null, sample.cells, { keepCompletedDaily: true }).action, "discard");
    const sameClues = reconcileSavedBoard(
      { cells: sample.cells.map((entry) => ({ ...entry, pickedEntityId: null })) },
      sample.cells,
      { keepCompletedDaily: false }
    );
    assert.equal(sameClues.action, "restore");
  });
});
