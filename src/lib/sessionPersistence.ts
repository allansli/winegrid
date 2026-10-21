import { DifficultyLevel, EntityFilterMode, GameMode } from "@/types/wine";

export const MODE_STORAGE_KEY = "winegrid_mode_v1";
export const INFINITE_RUN_KEY = "winegrid_infinite_run_v1";
export const UNLIMITED_BOARD_KEY = "winegrid_unlimited_v1";
export const RESUME_STORAGE_PREFIX = "winegrid_resume_v1:";

export interface InfiniteRunState {
  runId: string;
  boardsCleared: number;
  failed: boolean;
  seed: string;
  difficulty: DifficultyLevel;
  entityFilter: EntityFilterMode;
}

export interface UnlimitedBoardState {
  seed: string;
  difficulty: DifficultyLevel;
  entityFilter: EntityFilterMode;
}

export interface ResumeSnapshot {
  seed: string;
  difficulty: DifficultyLevel;
  entityFilter: EntityFilterMode;
  sessionId: string;
  cells: unknown[];
  guessesRemaining: number;
  missesUsed: number;
  economyVersion: number;
  isRevealed: boolean;
  /** Puzzle identity. Absent on saves written before clue hashing. */
  clueHash?: string;
  run?: InfiniteRunState;
}

const DIFFICULTIES: DifficultyLevel[] = ["wset2", "wset3", "master_somm"];
const FILTERS: EntityFilterMode[] = ["all", "appellation", "grape", "producer"];

function isDifficulty(value: unknown): value is DifficultyLevel {
  return typeof value === "string" && DIFFICULTIES.includes(value as DifficultyLevel);
}

function isFilter(value: unknown): value is EntityFilterMode {
  return typeof value === "string" && FILTERS.includes(value as EntityFilterMode);
}

export function readStoredMode(storage: Pick<Storage, "getItem">): GameMode {
  const raw = storage.getItem(MODE_STORAGE_KEY);
  if (raw === "daily" || raw === "unlimited" || raw === "infinite") return raw;
  return "daily";
}

export function writeStoredMode(storage: Pick<Storage, "setItem">, mode: GameMode): void {
  storage.setItem(MODE_STORAGE_KEY, mode);
}

export function freshInfiniteRun(
  difficulty: DifficultyLevel,
  entityFilter: EntityFilterMode,
  runId = crypto.randomUUID()
): InfiniteRunState {
  return {
    runId,
    boardsCleared: 0,
    failed: false,
    seed: `infinite-${runId}-0`,
    difficulty,
    entityFilter,
  };
}

export function advanceInfiniteRun(run: InfiniteRunState): InfiniteRunState {
  const boardsCleared = run.boardsCleared + 1;
  return {
    ...run,
    boardsCleared,
    failed: false,
    seed: `infinite-${run.runId}-${boardsCleared}`,
  };
}

function parseRun(raw: string | null): InfiniteRunState | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as InfiniteRunState;
    if (!value || typeof value.runId !== "string" || typeof value.seed !== "string") return null;
    if (!value.seed.startsWith("infinite-")) return null;
    if (!isDifficulty(value.difficulty) || !isFilter(value.entityFilter)) return null;
    if (typeof value.boardsCleared !== "number") return null;
    return {
      runId: value.runId,
      boardsCleared: value.boardsCleared,
      failed: Boolean(value.failed),
      seed: value.seed,
      difficulty: value.difficulty,
      entityFilter: value.entityFilter,
    };
  } catch {
    return null;
  }
}

export function readInfiniteRun(storage: Pick<Storage, "getItem">): InfiniteRunState | null {
  return parseRun(storage.getItem(INFINITE_RUN_KEY));
}

export function writeInfiniteRun(storage: Pick<Storage, "setItem">, run: InfiniteRunState): void {
  storage.setItem(INFINITE_RUN_KEY, JSON.stringify(run));
}

export function readUnlimitedBoard(storage: Pick<Storage, "getItem">): UnlimitedBoardState | null {
  const raw = storage.getItem(UNLIMITED_BOARD_KEY);
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as UnlimitedBoardState;
    if (!value || typeof value.seed !== "string") return null;
    if (!isDifficulty(value.difficulty) || !isFilter(value.entityFilter)) return null;
    return value;
  } catch {
    return null;
  }
}

export function writeUnlimitedBoard(
  storage: Pick<Storage, "setItem">,
  board: UnlimitedBoardState
): void {
  storage.setItem(UNLIMITED_BOARD_KEY, JSON.stringify(board));
}

export function readResumeSnapshot(
  storage: Pick<Storage, "getItem">,
  mode: "unlimited" | "infinite"
): ResumeSnapshot | null {
  const raw = storage.getItem(`${RESUME_STORAGE_PREFIX}${mode}`);
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as ResumeSnapshot;
    if (!value || typeof value.seed !== "string" || !Array.isArray(value.cells)) return null;
    if (value.cells.length !== 9) return null;
    if (!isDifficulty(value.difficulty) || !isFilter(value.entityFilter)) return null;
    return value;
  } catch {
    return null;
  }
}

export function writeResumeSnapshot(
  storage: Pick<Storage, "setItem">,
  mode: "unlimited" | "infinite",
  snapshot: ResumeSnapshot
): void {
  storage.setItem(`${RESUME_STORAGE_PREFIX}${mode}`, JSON.stringify(snapshot));
}

export function clearResumeSnapshot(
  storage: Pick<Storage, "removeItem">,
  mode: "unlimited" | "infinite"
): void {
  storage.removeItem(`${RESUME_STORAGE_PREFIX}${mode}`);
}
