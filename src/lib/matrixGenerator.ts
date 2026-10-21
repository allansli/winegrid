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
}): GeneratedBoard {
  const {
    seed,
    mode,
    difficulty = "wset3",
    entityFilter = "all",
    boardDate,
  } = options;

  const rand = createPrng(hashSeed(`${seed}:${difficulty}:${entityFilter}`));
  const entities: WineEntity[] = getEntitiesByFilter(entityFilter);

  // Filter clues appropriate for the selected entityFilter & difficulty
  const allowedDifficulties: Set<DifficultyLevel> =
    difficulty === "wset2"
      ? new Set(["wset2"])
      : difficulty === "wset3"
      ? new Set(["wset2", "wset3"])
      : new Set(["wset2", "wset3", "master_somm"]);

  const minPerCell =
    difficulty === "wset2" ? 3 : difficulty === "wset3" ? 2 : 1;

  // Precompute matching entity IDs for each clue
  const clueMatches = new Map<string, Set<string>>();
  const candidateClues = CLUE_CATALOG.filter((clue) => {
    if (!allowedDifficulties.has(clue.difficulty)) return false;
    // If single entity type filter is active, skip redundant entity_type clues
    if (entityFilter !== "all" && clue.category === "entity_type") return false;

    const matchedIds = new Set<string>();
    for (const entity of entities) {
      if (clue.predicate(entity)) {
        matchedIds.add(entity.id);
      }
    }
    // Clue must match enough entities to potentially fill 3 cells in a row/col
    if (matchedIds.size < Math.max(4, minPerCell * 2)) return false;
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
              // Require at least 5 distinct categories across the 6 axes for maximum wine-expert variety
              if (allSixCats.size < 5) continue;

              const cellValidIds: string[][] = [];
              for (let r = 0; r < 3; r++) {
                for (let colIdx = 0; colIdx < 3; colIdx++) {
                  cellValidIds.push(getIntersection(rows[r].id, cols[colIdx].id));
                }
              }

              const solution = findDistinctAssignment(cellValidIds);
              if (solution) {
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
