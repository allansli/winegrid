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
