import { GameMode } from "@/types/wine";

/**
 * Wrong answers a scored board will absorb.
 * Correct picks are free, so a player can fill all 9 cells and still miss
 * a few times. 3 misses + 9 free correct picks is a 12-attempt economy.
 */
export const MISS_BUDGET = 3;

/** Legacy cap, when every pick including correct ones cost a guess. */
export const LEGACY_GUESS_BUDGET = 10;

export const ECONOMY_VERSION = 2;

export interface GuessBudget {
  missesRemaining: number;
  missesUsed: number;
}

export function freshGuessBudget(): GuessBudget {
  return { missesRemaining: MISS_BUDGET, missesUsed: 0 };
}

/**
 * A correct pick never spends the budget. A miss does, except in Infinite
 * where misses are counted but the board does not end.
 */
export function applyPick(
  budget: GuessBudget,
  outcome: "correct" | "miss",
  mode: GameMode
): GuessBudget {
  if (outcome === "correct") return budget;
  if (mode === "infinite") {
    return { missesRemaining: budget.missesRemaining, missesUsed: budget.missesUsed + 1 };
  }
  return {
    missesRemaining: Math.max(0, budget.missesRemaining - 1),
    missesUsed: budget.missesUsed + 1,
  };
}

export function isMissBudgetExhausted(budget: GuessBudget, mode: GameMode): boolean {
  return mode !== "infinite" && budget.missesRemaining <= 0;
}

export interface LegacyBoardSnapshot {
  economyVersion?: number;
  missesRemaining?: number;
  missesUsed?: number;
  guessesRemaining?: number;
  cells?: { pickedEntityId: string | null }[];
}

/**
 * Restores a saved board. Version 2 stores misses directly.
 * Older saves counted correct picks as guesses, so misses are recovered as
 * attempts minus filled cells, then clamped to the current miss budget.
 */
export function restoreGuessBudget(
  saved: LegacyBoardSnapshot | null,
  mode: GameMode
): GuessBudget | null {
  if (!saved) return null;
  if (
    saved.economyVersion === ECONOMY_VERSION &&
    typeof saved.missesRemaining === "number" &&
    typeof saved.missesUsed === "number"
  ) {
    return {
      missesRemaining: saved.missesRemaining,
      missesUsed: saved.missesUsed,
    };
  }
  if (typeof saved.guessesRemaining !== "number" || !saved.cells) return null;
  const filled = saved.cells.filter((cell) => Boolean(cell.pickedEntityId)).length;
  const attempts = Math.max(0, LEGACY_GUESS_BUDGET - saved.guessesRemaining);
  const missesUsed = Math.max(0, attempts - filled);
  if (mode === "infinite") {
    return { missesRemaining: MISS_BUDGET, missesUsed };
  }
  const clamped = Math.min(missesUsed, MISS_BUDGET);
  return {
    missesUsed: clamped,
    missesRemaining: Math.max(0, MISS_BUDGET - clamped),
  };
}

export function boardSwitchNeedsConfirm(input: {
  isCompleted: boolean;
  filledCells: number;
  missesUsed: number;
}): boolean {
  if (input.isCompleted) return false;
  return input.filledCells > 0 || input.missesUsed > 0;
}
