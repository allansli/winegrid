import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CLUE_BY_ID } from "../data/clueCatalog";
import { DifficultyLevel, EntityFilterMode } from "../types/wine";
import {
  DAILY_DIFFICULTY,
  dailySeedForDate,
  generateDailyBoard,
  generateWineGridBoard,
  minimumValidAnswers,
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
  const floor = minimumValidAnswers(board.difficulty);
  assert.ok(floor >= (board.difficulty === "wset2" ? 3 : 2));
  for (const cell of board.cells) {
    assert.ok(
      cell.validEntityIds.length >= floor,
      `${board.boardId} cell ${cell.index} has ${cell.validEntityIds.length}, need ${floor}`
    );
  }
  assert.equal(new Set(board.guaranteedSolution).size, 9);
}

describe("board difficulty floors", () => {
  it("keeps the easy tier on broad clues and the technical clues off it", () => {
    assert.equal(DAILY_DIFFICULTY, "wset2");
    assert.equal(minimumValidAnswers("wset2"), 3);
    assert.equal(minimumValidAnswers("wset3"), 2);
    assert.equal(minimumValidAnswers("master_somm"), 2);
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
});
