import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CLUE_BY_ID } from "../data/clueCatalog";
import { DifficultyLevel, EntityFilterMode } from "../types/wine";
import {
  DAILY_DIFFICULTY,
  answerCountBounds,
  assignmentSurvivesAnyPick,
  dailySeedForDate,
  generateDailyBoard,
  generateWineGridBoard,
  maximumValidAnswers,
  minimumValidAnswers,
  pairIsRedundant,
} from "./matrixGenerator";

const DIFFICULTIES: DifficultyLevel[] = ["wset2", "wset3", "master_somm"];
const FILTERS: EntityFilterMode[] = ["all", "appellation", "grape", "producer"];

const BROAD_CLUE_IDS = [
  "geo-france",
  "geo-italy",
  "style-dry-red",
  "style-dry-white",
  "style-sparkling",
  "var-bordeaux-family",
  "var-multi-blend",
  "type-grape",
  "type-appellation",
  "clim-maritime",
  "clim-continental",
  "clim-mediterranean",
];

const TECHNICAL_CLUE_IDS = [
  "vin-no-mlf-unoaked",
  "vin-new-french-oak",
  "sens-high-tannin-acid",
  "sens-laser-acid",
  "sens-cellar-20yr",
  "sens-full-bodied",
  "soil-kimmeridgian-pure-chalk",
  "vin-flor-solera",
  "cls-aoc",
  "hydro-major-river",
  "bot-bordeaux",
];

function assertCellFloors(board: ReturnType<typeof generateWineGridBoard>) {
  const { min, max } = answerCountBounds(board.difficulty);
  for (const cell of board.cells) {
    assert.ok(
      cell.validEntityIds.length >= min && cell.validEntityIds.length <= max,
      `${board.boardId} cell ${cell.index} has ${cell.validEntityIds.length}, need ${min}–${max}`
    );
  }
  assert.equal(new Set(board.guaranteedSolution).size, 9);
  assert.equal(
    assignmentSurvivesAnyPick(board.cells.map((cell) => cell.validEntityIds)),
    true,
    board.boardId
  );
}

describe("board difficulty floors", () => {
  it("keeps the easy tier on broad clues and the technical clues off it", () => {
    assert.equal(DAILY_DIFFICULTY, "wset2");
    assert.equal(minimumValidAnswers("wset2"), 3);
    assert.equal(maximumValidAnswers("wset2"), 15);
    assert.equal(minimumValidAnswers("wset3"), 3);
    assert.equal(maximumValidAnswers("wset3"), 8);
    assert.equal(minimumValidAnswers("master_somm"), 2);
    assert.equal(maximumValidAnswers("master_somm"), 4);
    for (const id of BROAD_CLUE_IDS) {
      assert.equal(CLUE_BY_ID[id]?.difficulty, "wset2", id);
    }
    for (const id of TECHNICAL_CLUE_IDS) {
      assert.notEqual(CLUE_BY_ID[id]?.difficulty, "wset2", id);
    }
  });

  it("gives every generated cell the floor for that difficulty, across seeds and filters", () => {
    for (let i = 0; i < 12; i++) {
      for (const difficulty of DIFFICULTIES) {
        for (const entityFilter of FILTERS) {
          const board = generateWineGridBoard({
            seed: `rebalance-${i}`,
            mode: "unlimited",
            difficulty,
            entityFilter,
          });
          assert.equal(board.difficulty, difficulty);
          if (difficulty === "wset2") {
            for (const clue of [...board.rowClues, ...board.colClues]) {
              assert.equal(clue.difficulty, "wset2", clue.id);
            }
          }
          assertCellFloors(board);
        }
      }
    }
  });

  it("builds the daily board from the date seed on the easy tier", () => {
    for (let day = 1; day <= 28; day++) {
      const date = `2026-11-${String(day).padStart(2, "0")}`;
      assert.equal(dailySeedForDate(date), date);
      const board = generateDailyBoard(date);
      assert.equal(board.mode, "daily");
      assert.equal(board.difficulty, "wset2");
      assert.equal(board.boardDate, date);
      assert.equal(board.boardId, `daily-${date}-wset2-all`);
      for (const clue of [...board.rowClues, ...board.colClues]) {
        assert.equal(clue.difficulty, "wset2", `${date} ${clue.id}`);
      }
      assertCellFloors(board);
    }

    const again = generateDailyBoard("2026-11-04");
    const first = generateDailyBoard("2026-11-04");
    assert.deepEqual(
      first.rowClues.map((clue) => clue.id),
      again.rowClues.map((clue) => clue.id)
    );
    assert.deepEqual(
      first.colClues.map((clue) => clue.id),
      again.colClues.map((clue) => clue.id)
    );
  });

  it("treats a large contained clue as redundant and a small region clue as a real filter", () => {
    const piedmont = new Set(["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l"]);
    const dryRed = new Set([...piedmont, "m", "n"]);
    assert.equal(pairIsRedundant(piedmont, dryRed), true);
    const bordeauxGrapes = new Set(["cf", "sb", "merlot"]);
    assert.equal(pairIsRedundant(bordeauxGrapes, dryRed), false);
  });

  it("keeps the appellation category off most daily boards", () => {
    let appellationDays = 0;
    for (let day = 0; day < 365; day++) {
      const date = new Date(Date.UTC(2026, 0, 1 + day)).toISOString().slice(0, 10);
      const board = generateDailyBoard(date);
      const ids = [...board.rowClues, ...board.colClues].map((clue) => clue.id);
      if (ids.includes("type-appellation")) appellationDays++;
      assertCellFloors(board);
    }
    assert.ok(appellationDays < 80, `type-appellation on ${appellationDays}/365 days`);
  });
});
