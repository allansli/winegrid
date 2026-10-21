import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CLUE_BY_ID } from "../data/clueCatalog";
import { DifficultyLevel, EntityFilterMode } from "../types/wine";
import {
  DAILY_DIFFICULTY,
  assignmentSurvivesAnyPick,
  assignmentSurvivesEverySequence,
  createPrng,
  dailySeedForDate,
  findDistinctAssignment,
  generateDailyBoard,
  generateWineGridBoard,
  guardedPlaythroughSucceeds,
  minimumValidAnswers,
  pickKeepsBoardSolvable,
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
  const min = minimumValidAnswers(board.difficulty);
  for (const cell of board.cells) {
    assert.ok(
      cell.validEntityIds.length >= min,
      `${board.boardId} cell ${cell.index} has ${cell.validEntityIds.length}, need at least ${min}`
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
    assert.equal(minimumValidAnswers("wset3"), 3);
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
          assert.equal(
            guardedPlaythroughSucceeds(
              board.cells.map((cell) => cell.validEntityIds),
              createPrng(i + 1)
            ),
            true,
            board.boardId
          );
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

  it("keeps the appellation category off most daily boards", () => {
    let appellationDays = 0;
    for (let day = 0; day < 365; day++) {
      const date = new Date(Date.UTC(2026, 0, 1 + day)).toISOString().slice(0, 10);
      const board = generateDailyBoard(date);
      const ids = [...board.rowClues, ...board.colClues].map((clue) => clue.id);
      if (ids.includes("type-appellation")) appellationDays++;
      assertCellFloors(board);
      assert.equal(
        guardedPlaythroughSucceeds(
          board.cells.map((cell) => cell.validEntityIds),
          createPrng(day + 1)
        ),
        true,
        date
      );
    }
    assert.ok(appellationDays < 80, `type-appellation on ${appellationDays}/365 days`);
  });

  it("blocks the 2026-10-23 Margaret River sequence before the board dies", () => {
    const cells = [
      ["app-champagne", "app-muscadet", "app-sonoma-coast", "app-willamette-valley", "app-margaret-river", "app-marlborough", "grape-pinot-noir", "grape-chardonnay", "prod-krug", "prod-selosse"],
      ["app-savennieres", "app-chinon", "app-muscadet", "app-rias-baixas", "app-sonoma-coast", "app-willamette-valley", "app-margaret-river", "app-marlborough", "grape-chardonnay", "grape-sauvignon-blanc", "grape-chenin-blanc", "grape-albarino", "grape-palomino-fino", "prod-chateau-margaux", "prod-chateau-dyquem", "app-vouvray", "app-vinho-verde", "grape-semillon", "prod-ridge"],
      ["app-pauillac", "app-pomerol", "app-saint-emilion", "app-margaux", "app-saint-julien", "app-saint-estephe", "app-chinon", "app-bolgheri", "app-sonoma-coast", "app-willamette-valley", "app-coonawarra", "app-margaret-river", "app-marlborough", "grape-cabernet-sauvignon", "grape-merlot", "grape-cabernet-franc", "grape-pinot-noir", "prod-chateau-lafite", "prod-chateau-margaux", "prod-chateau-petrus", "prod-sassicaia", "app-vinho-verde", "prod-ridge"],
      ["app-margaret-river", "app-marlborough", "app-central-otago"],
      ["app-clare-eden-valley", "app-margaret-river", "app-marlborough", "app-central-otago", "prod-penfolds", "prod-henschke"],
      ["app-barossa-valley", "app-coonawarra", "app-clare-eden-valley", "app-margaret-river", "app-marlborough", "app-central-otago", "prod-penfolds", "prod-henschke"],
      ["app-champagne", "app-chablis", "app-gevrey-chambertin", "app-meursault", "app-morgon", "grape-pinot-noir", "grape-chardonnay", "grape-gamay", "prod-drc", "prod-krug", "prod-selosse", "prod-raveneau"],
      ["app-chablis", "app-meursault", "grape-chardonnay", "prod-drc", "prod-raveneau"],
      ["app-gevrey-chambertin", "app-morgon", "grape-pinot-noir", "grape-gamay", "prod-drc"],
    ];
    assert.equal(assignmentSurvivesEverySequence(cells), false);
    const play = cells.map((ids) => ({ validEntityIds: ids, pickedEntityId: null as string | null }));
    assert.equal(pickKeepsBoardSolvable(play, 0, "app-margaret-river"), true);
    play[0].pickedEntityId = "app-margaret-river";
    assert.equal(pickKeepsBoardSolvable(play, 1, "app-marlborough"), true);
    play[1].pickedEntityId = "app-marlborough";
    assert.equal(pickKeepsBoardSolvable(play, 4, "app-central-otago"), false);
    assert.equal(pickKeepsBoardSolvable(play, 4, "app-clare-eden-valley"), true);
    const dead = cells.map((ids, index) => {
      if (index === 0) return ["app-margaret-river"];
      if (index === 1) return ["app-marlborough"];
      if (index === 4) return ["app-central-otago"];
      return ids.filter(
        (id) => id !== "app-margaret-river" && id !== "app-marlborough" && id !== "app-central-otago"
      );
    });
    assert.equal(findDistinctAssignment(dead), null);

    const live = generateDailyBoard("2026-10-23");
    assert.equal(
      guardedPlaythroughSucceeds(
        live.cells.map((cell) => cell.validEntityIds),
        createPrng(20261023)
      ),
      true
    );
  });
});
