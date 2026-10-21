import { hashSeed } from "@/lib/matrixGenerator";

/**
 * Identity of a generated puzzle, ignoring picks and the miss budget.
 * The hash covers the six clue ids and the accepted entity ids under each
 * cell. A save from before a clue or answer-set change does not match.
 */
export interface ClueHashCell {
  index: number;
  rowClueId: string;
  colClueId: string;
  validEntityIds: readonly string[];
}

export interface ClueHashBoard {
  rowClues: readonly { id: string }[];
  colClues: readonly { id: string }[];
  cells: readonly ClueHashCell[];
}

export function boardClueHash(board: ClueHashBoard): string {
  const payload = [
    board.rowClues.map((clue) => clue.id).join(","),
    board.colClues.map((clue) => clue.id).join(","),
    ...board.cells.map(
      (cell) =>
        `${cell.index}:${cell.rowClueId}:${cell.colClueId}:${cell.validEntityIds.join("|")}`
    ),
  ].join("\n");
  return hashSeed(payload).toString(16);
}

export interface SavedClueBoard {
  clueHash?: unknown;
  cells?: unknown;
}

/**
 * Restore a saved game only when it was written for this exact clue layout.
 * Saves from before clue hashes existed are stale and are discarded.
 */
export interface ReconcileCell {
  rowClueId: string;
  colClueId: string;
  validEntityIds: readonly string[];
  pickedEntityId?: string | null;
  pickedRarityPct?: number | null;
  isLocked?: boolean;
}

/**
 * A hash mismatch is not enough to throw a game away. Clue ids that differ
 * are a different puzzle, so the save goes. Otherwise keep every placement
 * that still fits. A finished same-day daily whose clues did not change is
 * kept whole, including answers the new data would no longer accept.
 */
export function reconcileSavedBoard<T extends ReconcileCell>(
  saved: { cells?: unknown; isCompleted?: boolean } | null | undefined,
  generatedCells: readonly T[],
  options: { keepCompletedDaily: boolean }
):
  | { action: "discard" }
  | {
      action: "restore";
      cells: Array<T & { pickedEntityId: string | null; pickedRarityPct: number | null; isLocked: boolean }>;
      isCompleted: boolean;
    } {
  if (!saved || !Array.isArray(saved.cells) || saved.cells.length !== generatedCells.length) {
    return { action: "discard" };
  }
  const savedCells = saved.cells as Array<Record<string, unknown>>;
  for (let index = 0; index < generatedCells.length; index++) {
    if (
      savedCells[index]?.rowClueId !== generatedCells[index].rowClueId ||
      savedCells[index]?.colClueId !== generatedCells[index].colClueId
    ) {
      return { action: "discard" };
    }
  }

  const restorePick = (index: number) => {
    const raw = savedCells[index]?.pickedEntityId;
    const picked = typeof raw === "string" ? raw : null;
    const rarity = savedCells[index]?.pickedRarityPct;
    return { picked, rarity: typeof rarity === "number" ? rarity : null };
  };

  if (options.keepCompletedDaily && saved.isCompleted === true) {
    const cells = generatedCells.map((cell, index) => {
      const { picked, rarity } = restorePick(index);
      return {
        ...cell,
        pickedEntityId: picked,
        pickedRarityPct: rarity,
        isLocked: Boolean(picked),
      };
    });
    return { action: "restore", cells, isCompleted: true };
  }

  const used = new Set<string>();
  const cells = generatedCells.map((cell, index) => {
    const { picked, rarity } = restorePick(index);
    const keep = Boolean(picked && cell.validEntityIds.includes(picked) && !used.has(picked));
    if (keep && picked) used.add(picked);
    return {
      ...cell,
      pickedEntityId: keep ? picked : null,
      pickedRarityPct: keep ? rarity : null,
      isLocked: keep,
    };
  });
  return {
    action: "restore",
    cells,
    isCompleted: cells.every((cell) => Boolean(cell.pickedEntityId)),
  };
}

export function savedBoardMatchesClues(
  saved: SavedClueBoard | null | undefined,
  generated: ClueHashBoard
): boolean {
  if (!saved || typeof saved.clueHash !== "string") return false;
  if (saved.clueHash !== boardClueHash(generated)) return false;
  if (!Array.isArray(saved.cells) || saved.cells.length !== generated.cells.length) {
    return false;
  }
  return saved.cells.every((cell, index) => {
    if (!cell || typeof cell !== "object") return false;
    const rowClueId = (cell as { rowClueId?: unknown }).rowClueId;
    const colClueId = (cell as { colClueId?: unknown }).colClueId;
    const expected = generated.cells[index];
    return rowClueId === expected.rowClueId && colClueId === expected.colClueId;
  });
}
