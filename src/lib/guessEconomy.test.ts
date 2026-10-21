import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  MISS_BUDGET,
  applyPick,
  boardSwitchNeedsConfirm,
  freshGuessBudget,
  isMissBudgetExhausted,
  restoreGuessBudget,
} from "./guessEconomy";

describe("guess economy", () => {
  it("gives three free misses on top of nine correct cells", () => {
    assert.equal(MISS_BUDGET, 3);
  });

  it("does not spend a miss when the pick is correct", () => {
    const start = freshGuessBudget();
    const next = applyPick(start, "correct", "daily");
    assert.deepEqual(next, start);
    assert.equal(isMissBudgetExhausted(next, "daily"), false);
  });

  it("can fill every cell without spending the miss budget", () => {
    let budget = freshGuessBudget();
    for (let i = 0; i < 9; i++) budget = applyPick(budget, "correct", "unlimited");
    assert.equal(budget.missesRemaining, MISS_BUDGET);
    assert.equal(budget.missesUsed, 0);
  });

  it("spends one miss on a wrong pick and ends the board at zero", () => {
    let budget = freshGuessBudget();
    budget = applyPick(budget, "miss", "daily");
    assert.equal(budget.missesRemaining, 2);
    assert.equal(budget.missesUsed, 1);
    budget = applyPick(budget, "miss", "daily");
    budget = applyPick(budget, "miss", "daily");
    assert.equal(budget.missesRemaining, 0);
    assert.equal(isMissBudgetExhausted(budget, "daily"), true);
    const stayed = applyPick(budget, "miss", "daily");
    assert.equal(stayed.missesRemaining, 0);
    assert.equal(stayed.missesUsed, 4);
  });

  it("counts infinite misses without ending the board", () => {
    const next = applyPick(freshGuessBudget(), "miss", "infinite");
    assert.equal(next.missesUsed, 1);
    assert.equal(next.missesRemaining, MISS_BUDGET);
    assert.equal(isMissBudgetExhausted(next, "infinite"), false);
  });

  it("migrates a legacy save that charged a correct pick", () => {
    const restored = restoreGuessBudget(
      {
        guessesRemaining: 9,
        cells: [{ pickedEntityId: "app-champagne" }, { pickedEntityId: null }],
      },
      "daily"
    );
    assert.deepEqual(restored, { missesRemaining: 3, missesUsed: 0 });
  });

  it("migrates a legacy miss into the new budget", () => {
    const restored = restoreGuessBudget(
      {
        guessesRemaining: 9,
        cells: [{ pickedEntityId: null }, { pickedEntityId: null }],
      },
      "unlimited"
    );
    assert.deepEqual(restored, { missesRemaining: 2, missesUsed: 1 });
  });

  it("asks before leaving a board that already has a pick or a miss", () => {
    assert.equal(
      boardSwitchNeedsConfirm({ isCompleted: false, filledCells: 1, missesUsed: 0 }),
      true
    );
    assert.equal(
      boardSwitchNeedsConfirm({ isCompleted: false, filledCells: 0, missesUsed: 1 }),
      true
    );
    assert.equal(
      boardSwitchNeedsConfirm({ isCompleted: true, filledCells: 9, missesUsed: 0 }),
      false
    );
    assert.equal(
      boardSwitchNeedsConfirm({ isCompleted: false, filledCells: 0, missesUsed: 0 }),
      false
    );
  });
});
