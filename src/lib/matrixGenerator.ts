import {
  ClueDefinition,
  DifficultyLevel,
  EntityFilterMode,
  GameMode,
  GeneratedBoard,
  MatrixCell,
  WineEntity,
} from "@/types/wine";
import { CLUE_CATALOG } from "@/data/clueCatalog";
import { getEntitiesByFilter } from "@/data/wineDatabase";
import { allowedClueDifficulties, clueSupportFloor, minimumValidAnswers } from "@/lib/difficultyTuning";

export { clueSupportFloor, minimumValidAnswers };

// Deterministic string hash -> 32-bit integer seed
export function hashSeed(seedStr: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Mulberry32 deterministic PRNG
export function createPrng(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffleWithPrng<T>(items: T[], rand: () => number): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Verifies that 9 distinct entities can be assigned to the 9 cells (one per cell).
 * Orders cells by most constrained first (MRV heuristic) for instant solving.
 */
export function findDistinctAssignment(cellValidIds: string[][]): string[] | null {
  const order = [0, 1, 2, 3, 4, 5, 6, 7, 8].sort(
    (a, b) => cellValidIds[a].length - cellValidIds[b].length
  );
  const assignment = new Array<string>(9).fill("");
  const used = new Set<string>();

  function backtrack(step: number): boolean {
    if (step === 9) return true;
    const cellIdx = order[step];
    const candidates = cellValidIds[cellIdx];
    for (let i = 0; i < candidates.length; i++) {
      const entityId = candidates[i];
      if (!used.has(entityId)) {
        used.add(entityId);
        assignment[cellIdx] = entityId;
        if (backtrack(step + 1)) return true;
        used.delete(entityId);
      }
    }
    return false;
  }

  return backtrack(0) ? assignment : null;
}

export function generateWineGridBoard(options: {
  seed: string;
  mode: GameMode;
  difficulty?: DifficultyLevel;
  entityFilter?: EntityFilterMode;
  boardDate?: string;
  /** Daily boards rotate these out so one family cannot dominate the year. */
  excludeCategories?: ReadonlySet<string>;
}): GeneratedBoard {
  const {
    seed,
    mode,
    difficulty = "wset3",
    entityFilter = "all",
    boardDate,
    excludeCategories,
  } = options;

  const rand = createPrng(hashSeed(`${seed}:${difficulty}:${entityFilter}`));
  const entities: WineEntity[] = getEntitiesByFilter(entityFilter);

  // Floors and which clue tiers are dealt come from difficultyTuning.ts.
  const allowedDifficulties = allowedClueDifficulties(difficulty);
  const minPerCell = minimumValidAnswers(difficulty);
  const supportFloor = clueSupportFloor(difficulty);

  // Precompute matching entity IDs for each clue
  const clueMatches = new Map<string, Set<string>>();
  const candidateClues = CLUE_CATALOG.filter((clue) => {
    if (!allowedDifficulties.has(clue.difficulty)) return false;
    if (excludeCategories?.has(clue.category)) return false;
    // If single entity type filter is active, skip redundant entity_type clues
    if (entityFilter !== "all" && clue.category === "entity_type") return false;

    const matchedIds = new Set<string>();
    for (const entity of entities) {
      if (clue.predicate(entity)) {
        matchedIds.add(entity.id);
      }
    }
    if (matchedIds.size < supportFloor) return false;
    clueMatches.set(clue.id, matchedIds);
    return true;
  });

  // Precompute pairwise intersection lists for fast 3x3 search
  const pairIntersection = new Map<string, string[]>();
  const getIntersection = (idA: string, idB: string): string[] => {
    const key = idA < idB ? `${idA}|${idB}` : `${idB}|${idA}`;
    let cached = pairIntersection.get(key);
    if (cached !== undefined) return cached;
    const setA = clueMatches.get(idA)!;
    const setB = clueMatches.get(idB)!;
    const res: string[] = [];
    for (const item of setA) {
      if (setB.has(item)) res.push(item);
    }
    pairIntersection.set(key, res);
    return res;
  };

  const shuffledClues = shuffleWithPrng(candidateClues, rand);
  const n = shuffledClues.length;

  // Search for a rich, diverse 3x3 matrix with category diversity and a guaranteed 9-entity solution
  for (let r0 = 0; r0 < n; r0++) {
    const cR0 = shuffledClues[r0];
    for (let r1 = r0 + 1; r1 < n; r1++) {
      const cR1 = shuffledClues[r1];
      for (let r2 = r1 + 1; r2 < n; r2++) {
        const cR2 = shuffledClues[r2];

        // Require 3 distinct categories among the 3 rows
        const rowCats = new Set([cR0.category, cR1.category, cR2.category]);
        if (rowCats.size < 3) continue;

        const rows = [cR0, cR1, cR2];

        // Find all valid column clues compatible with all 3 chosen rows
        const validCols: ClueDefinition[] = [];
        for (let c = 0; c < n; c++) {
          const candCol = shuffledClues[c];
          if (
            candCol.id === cR0.id ||
            candCol.id === cR1.id ||
            candCol.id === cR2.id
          ) {
            continue;
          }
          // Ensure column categories don't duplicate row categories so all 6 clues represent distinct facets of wine knowledge
          if (rowCats.has(candCol.category)) {
            continue;
          }

          const i0 = getIntersection(cR0.id, candCol.id);
          if (i0.length < minPerCell) continue;
          const i1 = getIntersection(cR1.id, candCol.id);
          if (i1.length < minPerCell) continue;
          const i2 = getIntersection(cR2.id, candCol.id);
          if (i2.length < minPerCell) continue;

          validCols.push(candCol);
        }

        if (validCols.length < 3) continue;

        // Try combinations of 3 columns from validCols
        const m = Math.min(validCols.length, 18);
        for (let c0 = 0; c0 < m; c0++) {
          for (let c1 = c0 + 1; c1 < m; c1++) {
            for (let c2 = c1 + 1; c2 < m; c2++) {
              const cols = [validCols[c0], validCols[c1], validCols[c2]];
              const allSixCats = new Set([
                ...rows.map((r) => r.category),
                ...cols.map((c) => c.category),
              ]);
              // At least 5 clue families, including on Standard. Basic climate stays
              // in that tier so a Regions/Grapes/Estates filter still has five families
              // after the entity-type clues drop out.
              if (allSixCats.size < 5) continue;

              const cellValidIds: string[][] = [];
              for (let r = 0; r < 3; r++) {
                for (let colIdx = 0; colIdx < 3; colIdx++) {
                  cellValidIds.push(getIntersection(rows[r].id, cols[colIdx].id));
                }
              }

              const solution = findDistinctAssignment(cellValidIds);
              if (solution && assignmentSurvivesAnyPick(cellValidIds)) {
                const cells: MatrixCell[] = cellValidIds.map((validIds, idx) => ({
                  index: idx,
                  row: Math.floor(idx / 3),
                  col: idx % 3,
                  rowClueId: rows[Math.floor(idx / 3)].id,
                  colClueId: cols[idx % 3].id,
                  validEntityIds: validIds,
                  pickedEntityId: null,
                  pickedRarityPct: null,
                  isLocked: false,
                }));

                return {
                  boardId: `${mode}-${seed}-${difficulty}-${entityFilter}`,
                  boardDate,
                  mode,
                  difficulty,
                  entityFilter,
                  rowClues: rows,
                  colClues: cols,
                  cells,
                  guaranteedSolution: solution,
                };
              }
            }
          }
        }
      }
    }
  }

  throw new Error("Could not generate a valid 3x3 WineGrid matrix for given constraints.");
}

/**
 * After any one legal pick, the other eight cells must still have a
 * distinct solution. A valid guess cannot paint the board into a corner.
 */
export function assignmentSurvivesAnyPick(cellValidIds: string[][]): boolean {
  for (let cell = 0; cell < cellValidIds.length; cell++) {
    for (const pick of cellValidIds[cell]) {
      const narrowed = cellValidIds.map((ids, index) => {
        if (index === cell) return [pick];
        return ids.filter((id) => id !== pick);
      });
      if (!findDistinctAssignment(narrowed)) return false;
    }
  }
  return true;
}

/**
 * Plays one random filling of the board. The player may open any cell and
 * take any still-unused accepted answer. Returns false when a cell runs dry.
 */
export function playthroughSucceeds(cellValidIds: string[][], rand: () => number): boolean {
  const open = cellValidIds.map((_, index) => index);
  const used = new Set<string>();
  while (open.length > 0) {
    const slot = Math.floor(rand() * open.length);
    const cell = open[slot];
    open.splice(slot, 1);
    const choices: string[] = [];
    for (const id of cellValidIds[cell]) {
      if (!used.has(id)) choices.push(id);
    }
    if (choices.length === 0) return false;
    used.add(choices[Math.floor(rand() * choices.length)]);
  }
  return true;
}

export interface SolvableCell {
  validEntityIds: readonly string[];
  pickedEntityId?: string | null;
}

function projectSolvableBoard(
  cells: readonly SolvableCell[],
  force?: { index: number; entityId: string }
): string[][] {
  const used = new Set<string>();
  if (force) used.add(force.entityId);
  for (let index = 0; index < cells.length; index++) {
    if (force && index === force.index) continue;
    const picked = cells[index].pickedEntityId;
    if (picked) used.add(picked);
  }
  return cells.map((cell, index) => {
    if (force && index === force.index) return [force.entityId];
    if (cell.pickedEntityId) return [cell.pickedEntityId];
    return cell.validEntityIds.filter((id) => !used.has(id));
  });
}

/**
 * A clue-valid pick is refused when it would leave no full solution.
 * If the board is already dead, the pick is allowed so the player is not stuck.
 */
export function pickKeepsBoardSolvable(
  cells: readonly SolvableCell[],
  cellIndex: number,
  entityId: string
): boolean {
  if (findDistinctAssignment(projectSolvableBoard(cells, { index: cellIndex, entityId }))) {
    return true;
  }
  return findDistinctAssignment(projectSolvableBoard(cells)) === null;
}

/** True when the picks already on the board can still be finished. */
export function boardStillSolvable(cells: readonly SolvableCell[]): boolean {
  return findDistinctAssignment(projectSolvableBoard(cells)) !== null;
}

/** Fills every cell, skipping answers that would dead-end the board. */
export function guardedPlaythroughSucceeds(
  cellValidIds: string[][],
  rand: () => number
): boolean {
  const cells: SolvableCell[] = cellValidIds.map((ids) => ({
    validEntityIds: ids,
    pickedEntityId: null,
  }));
  const open = cells.map((_, index) => index);
  while (open.length > 0) {
    const slot = Math.floor(rand() * open.length);
    const cellIndex = open[slot];
    const choices = cells[cellIndex].validEntityIds.filter(
      (id) =>
        cells.every((cell) => cell.pickedEntityId !== id) &&
        pickKeepsBoardSolvable(cells, cellIndex, id)
    );
    if (choices.length === 0) return false;
    cells[cellIndex].pickedEntityId = choices[Math.floor(rand() * choices.length)];
    open.splice(slot, 1);
  }
  return true;
}

function hasEntityMatching(lists: number[][]): boolean {
  const order = lists.map((_, index) => index).sort((a, b) => lists[a].length - lists[b].length);
  const used = new Set<number>();
  function backtrack(step: number): boolean {
    if (step === order.length) return true;
    const candidates = lists[order[step]];
    for (let i = 0; i < candidates.length; i++) {
      const entity = candidates[i];
      if (used.has(entity)) continue;
      used.add(entity);
      if (backtrack(step + 1)) return true;
      used.delete(entity);
    }
    return false;
  }
  return backtrack(0);
}

/**
 * Every reachable sequence of valid picks still has a full distinct solution.
 * Cells may be filled in any order. A valid pick is any accepted entity that
 * has not already been used. This is stricter than a single-pick check:
 * later picks can still exhaust a cell that looked fine after the first one.
 */
export function assignmentSurvivesEverySequence(cellValidIds: string[][]): boolean {
  const n = cellValidIds.length;
  if (n === 0) return true;
  const idIndex = new Map<string, number>();
  const options: number[][] = cellValidIds.map((ids) => {
    const row: number[] = [];
    for (const id of ids) {
      let idx = idIndex.get(id);
      if (idx === undefined) {
        idx = idIndex.size;
        idIndex.set(id, idx);
      }
      row.push(idx);
    }
    return row;
  });

  const memo = new Map<string, boolean>();
  // A broad Standard cell can have millions of partial fillings. Past this
  // many states the layout is treated as unproven and rejected, so generation
  // never builds an unbounded memo table.
  const stateBudget = 20000;
  let states = 0;

  function remaining(cell: number, used: bigint): number[] {
    const row: number[] = [];
    const list = options[cell];
    for (let i = 0; i < list.length; i++) {
      const entity = list[i];
      if ((used & (1n << BigInt(entity))) === 0n) row.push(entity);
    }
    return row;
  }

  function prove(mask: number, used: bigint): boolean {
    if (mask === 0) return true;
    if (++states > stateBudget) return false;
    const key = `${mask.toString(16)}:${used.toString(16)}`;
    const cached = memo.get(key);
    if (cached !== undefined) return cached;

    const open: number[] = [];
    for (let cell = 0; cell < n; cell++) {
      if (mask & (1 << cell)) open.push(cell);
    }
    const lists = open.map((cell) => remaining(cell, used));
    for (let i = 0; i < lists.length; i++) {
      if (lists[i].length === 0) {
        memo.set(key, false);
        return false;
      }
    }

    const parent = open.map((_, index) => index);
    const find = (index: number): number => {
      let root = index;
      while (parent[root] !== root) root = parent[root];
      while (parent[index] !== root) {
        const next = parent[index];
        parent[index] = root;
        index = next;
      }
      return root;
    };
    const unite = (a: number, b: number) => {
      const ra = find(a);
      const rb = find(b);
      if (ra !== rb) parent[rb] = ra;
    };
    const owner = new Map<number, number>();
    for (let i = 0; i < open.length; i++) {
      const list = lists[i];
      for (let j = 0; j < list.length; j++) {
        const entity = list[j];
        const prev = owner.get(entity);
        if (prev === undefined) owner.set(entity, i);
        else unite(prev, i);
      }
    }

    const groups = new Map<number, number>();
    for (let i = 0; i < open.length; i++) {
      const root = find(i);
      groups.set(root, (groups.get(root) ?? 0) | (1 << open[i]));
    }
    if (groups.size > 1) {
      for (const sub of groups.values()) {
        if (!prove(sub, used)) {
          memo.set(key, false);
          return false;
        }
      }
      memo.set(key, true);
      return true;
    }

    const freq = new Map<number, number>();
    for (const list of lists) {
      for (const entity of list) freq.set(entity, (freq.get(entity) ?? 0) + 1);
    }
    let allPrivate = true;
    for (const list of lists) {
      let privateEntity = false;
      for (const entity of list) {
        if (freq.get(entity) === 1) {
          privateEntity = true;
          break;
        }
      }
      if (!privateEntity) {
        allPrivate = false;
        break;
      }
    }
    if (allPrivate) {
      memo.set(key, true);
      return true;
    }

    if (!hasEntityMatching(lists)) {
      memo.set(key, false);
      return false;
    }

    for (let i = 0; i < open.length; i++) {
      const cell = open[i];
      const list = lists[i];
      for (let j = 0; j < list.length; j++) {
        const nextUsed = used | (1n << BigInt(list[j]));
        if (!prove(mask ^ (1 << cell), nextUsed)) {
          memo.set(key, false);
          return false;
        }
      }
    }
    memo.set(key, true);
    return true;
  }

  return prove((1 << n) - 1, 0n);
}

export const DAILY_DIFFICULTY: DifficultyLevel = "wset2";
export const DAILY_ENTITY_FILTER: EntityFilterMode = "all";

/** The daily puzzle is keyed only by the calendar date, in the player's local YYYY-MM-DD. */
export function dailySeedForDate(date: string): string {
  return date;
}

const DAILY_CATEGORY_ROTATION = [
  "geography",
  "region",
  "classification",
  "soil",
  "climate",
  "hydrology",
  "style",
  "vinification",
  "sensory",
  "varietal",
  "bottle",
  "heritage",
  "entity_type",
];

/**
 * Two families sit out each day on a fixed rotation, and the entity-type
 * family (appellation / grape / producer) sits out four days in five.
 * That stops "Wine Appellation" from landing on most dailies.
 */
export function dailyExcludedCategories(date: string): Set<string> {
  const day = Math.floor(Date.parse(`${date}T00:00:00Z`) / 86_400_000);
  const excluded = new Set<string>();
  excluded.add(DAILY_CATEGORY_ROTATION[Math.abs(day) % DAILY_CATEGORY_ROTATION.length]);
  excluded.add(DAILY_CATEGORY_ROTATION[Math.abs(day + 6) % DAILY_CATEGORY_ROTATION.length]);
  if (Math.abs(day) % 5 !== 0) excluded.add("entity_type");
  return excluded;
}

export function generateDailyBoard(date: string): GeneratedBoard {
  const attempts: Array<Set<string> | undefined> = [
    dailyExcludedCategories(date),
    new Set(["entity_type"]),
    undefined,
  ];
  let lastError: unknown;
  for (const excludeCategories of attempts) {
    try {
      return generateWineGridBoard({
        seed: dailySeedForDate(date),
        mode: "daily",
        difficulty: DAILY_DIFFICULTY,
        entityFilter: DAILY_ENTITY_FILTER,
        boardDate: date,
        excludeCategories,
      });
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}
