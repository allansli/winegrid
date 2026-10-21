"use client";

import { WINE_ENTITY_BY_ID } from "@/data/wineDatabase";
import { DifficultyLevel, EntityFilterMode, GameMode } from "@/types/wine";
import { getOrCreateAnonId, trackEvent } from "./observability";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "./supabase/client";

export interface CellPickSummary {
  cellIndex: number;
  entityId: string | null;
  entityName: string | null;
  rarityPct: number | null;
}

export interface GameHistoryEntry {
  sessionId: string;
  boardId: string;
  boardDate: string;
  mode: GameMode;
  difficulty: DifficultyLevel;
  entityFilter: EntityFilterMode;
  rowClueLabels: string[];
  colClueLabels: string[];
  correctCells: number;
  guessesUsed: number;
  rarityScore: number; // GeoGrid style: sum of rarity % (lower is rarer/better; unguessed cells count as 100)
  isCompleted: boolean;
  isWon: boolean;
  cells: CellPickSummary[];
  completedAt: string;
  syncedToSupabase: boolean;
  userId: string | null;
}

export interface PlayerStatsSummary {
  gamesPlayed: number;
  gamesWon: number;
  perfectGrids: number;
  currentStreak: number;
  maxStreak: number;
  bestRarityScore: number | null;
  avgRarityScore: number | null;
  sommelierRank: string;
  nextRank: string;
  rankProgressPct: number;
}

const HISTORY_STORAGE_KEY = "winegrid_history_v1";
const ACTIVE_BOARD_STORAGE_PREFIX = "winegrid_active_board_v1:";

export function computeSommelierRank(perfectGrids: number, gamesWon: number): {
  sommelierRank: string;
  nextRank: string;
  rankProgressPct: number;
} {
  const xp = perfectGrids * 25 + gamesWon * 10;
  if (xp >= 250) {
    return {
      sommelierRank: "Grand Master Sommelier (CMS IV)",
      nextRank: "Max Rank Achieved",
      rankProgressPct: 100,
    };
  }
  if (xp >= 120) {
    return {
      sommelierRank: "Master of Wine (MW)",
      nextRank: "Grand Master Sommelier",
      rankProgressPct: Math.min(99, Math.round(((xp - 120) / 130) * 100)),
    };
  }
  if (xp >= 60) {
    return {
      sommelierRank: "WSET Level 4 Diploma",
      nextRank: "Master of Wine (MW)",
      rankProgressPct: Math.min(99, Math.round(((xp - 60) / 60) * 100)),
    };
  }
  if (xp >= 20) {
    return {
      sommelierRank: "Certified Sommelier",
      nextRank: "WSET Level 4 Diploma",
      rankProgressPct: Math.min(99, Math.round(((xp - 20) / 40) * 100)),
    };
  }
  return {
    sommelierRank: "Cellar Apprentice",
    nextRank: "Certified Sommelier",
    rankProgressPct: Math.min(99, Math.round((xp / 20) * 100)),
  };
}

export function getLocalHistory(): GameHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as GameHistoryEntry[];
  } catch {
    return [];
  }
}

export function saveLocalHistory(entries: GameHistoryEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Ignore storage quota
  }
}

export function computePlayerStats(history: GameHistoryEntry[]): PlayerStatsSummary {
  const completed = history.filter((h) => h.isCompleted);
  const won = completed.filter((h) => h.isWon);
  const perfect = completed.filter((h) => h.correctCells === 9);

  // Calculate streak from chronological completed games
  const sortedChron = [...completed].sort(
    (a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
  );

  let currentStreak = 0;
  let maxStreak = 0;
  for (const game of sortedChron) {
    if (game.isWon) {
      currentStreak += 1;
      if (currentStreak > maxStreak) maxStreak = currentStreak;
    } else {
      currentStreak = 0;
    }
  }

  const rarityScores = won.map((w) => w.rarityScore);
  const bestRarityScore =
    rarityScores.length > 0 ? Math.min(...rarityScores) : null;
  const avgRarityScore =
    rarityScores.length > 0
      ? Number(
          (
            rarityScores.reduce((acc, v) => acc + v, 0) / rarityScores.length
          ).toFixed(1)
        )
      : null;

  const rankInfo = computeSommelierRank(perfect.length, won.length);

  return {
    gamesPlayed: completed.length,
    gamesWon: won.length,
    perfectGrids: perfect.length,
    currentStreak,
    maxStreak,
    bestRarityScore,
    avgRarityScore,
    ...rankInfo,
  };
}

/**
 * Calculates the global pick rarity % for a valid answer in a cell.
 * Uses Supabase RPC `record_cell_pick` when connected, with a realistic
 * sommelier rarity model based on `baseRarity` and pool size when offline/initial.
 */
export async function recordAndCalculateCellRarity(
  rowClueId: string,
  colClueId: string,
  entityId: string,
  validEntityIds: string[]
): Promise<number> {
  const entity = WINE_ENTITY_BY_ID[entityId];
  const validEntities = validEntityIds
    .map((id) => WINE_ENTITY_BY_ID[id])
    .filter(Boolean);

  // Compute baseline sommelier popularity weight (inverse of baseRarity)
  const weights = validEntities.map((e) => Math.max(5, 110 - e.baseRarity));
  const totalWeight = weights.reduce((a, b) => a + b, 0) || 1;
  const thisWeight = entity ? Math.max(5, 110 - entity.baseRarity) : 20;
  const baselinePct = Number(
    Math.max(0.8, Math.min(92.0, (thisWeight / totalWeight) * 100)).toFixed(1)
  );

  const supabase = getSupabaseBrowserClient();
  if (supabase && isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.rpc("record_cell_pick", {
        p_row_clue_id: rowClueId,
        p_col_clue_id: colClueId,
        p_entity_id: entityId,
      });
      if (!error && data && typeof data.percentage === "number") {
        // Blend live community picks with baseline if total_picks < 10 so early players see nuanced rarity
        const totalPicks = Number(data.total_picks || 1);
        const livePct = Number(data.percentage);
        if (totalPicks >= 10) return livePct;
        const alpha = totalPicks / 10;
        return Number((livePct * alpha + baselinePct * (1 - alpha)).toFixed(1));
      }
    } catch {
      // Fallback to baseline
    }
  }

  return baselinePct;
}

/**
 * Saves a completed or updated game session to LocalStorage AND Supabase (if configured).
 * Works seamlessly for both Anonymous and Signed-In players.
 */
export async function saveGameSession(entry: GameHistoryEntry): Promise<GameHistoryEntry> {
  const anonId = getOrCreateAnonId();
  const supabase = getSupabaseBrowserClient();
  let userId = entry.userId;
  let synced = false;

  if (supabase && isSupabaseConfigured()) {
    try {
      if (!userId) {
        const { data } = await supabase.auth.getSession();
        userId = data.session?.user?.id ?? null;
      }

      const { error } = await supabase.from("game_sessions").upsert(
        {
          id: entry.sessionId,
          user_id: userId,
          anon_id: anonId,
          board_id: entry.boardId,
          board_date: entry.boardDate,
          game_mode: entry.mode,
          difficulty: entry.difficulty,
          entity_filter: entry.entityFilter,
          row_clue_ids: entry.rowClueLabels,
          col_clue_ids: entry.colClueLabels,
          cells_state: entry.cells,
          guesses_remaining: Math.max(0, 10 - entry.guessesUsed),
          correct_cells: entry.correctCells,
          rarity_score: entry.rarityScore,
          is_completed: entry.isCompleted,
          is_won: entry.isWon,
          completed_at: entry.completedAt,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );
      if (!error) synced = true;
    } catch {
      synced = false;
    }
  }

  const updatedEntry: GameHistoryEntry = {
    ...entry,
    userId,
    syncedToSupabase: synced,
  };

  const existing = getLocalHistory();
  const filtered = existing.filter((e) => e.sessionId !== updatedEntry.sessionId);
  saveLocalHistory([updatedEntry, ...filtered]);

  return updatedEntry;
}

/**
 * When an anonymous player signs in or creates an account, claims all their
 * anonymous sessions in LocalStorage and Supabase so no history is ever lost!
 */
export async function mergeAnonymousHistoryOnSignIn(userId: string): Promise<number> {
  const anonId = getOrCreateAnonId();
  const local = getLocalHistory();
  let claimedCount = 0;

  const updatedLocal = local.map((item) => {
    if (!item.userId) {
      claimedCount++;
      return { ...item, userId };
    }
    return item;
  });
  saveLocalHistory(updatedLocal);

  const supabase = getSupabaseBrowserClient();
  if (supabase && isSupabaseConfigured()) {
    try {
      // Call the Postgres RPC to claim any anon_id rows already in Supabase
      await supabase.rpc("claim_anonymous_history", { p_anon_id: anonId });

      // Also push any local sessions that weren't synced yet
      for (const entry of updatedLocal) {
        await saveGameSession({ ...entry, userId });
      }
    } catch {
      // Ignore error
    }
  }

  await trackEvent(
    "anonymous_history_claimed",
    { claimed_sessions: claimedCount, anon_id: anonId },
    userId
  );

  return claimedCount;
}

export function saveActiveBoardState(boardId: string, state: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      `${ACTIVE_BOARD_STORAGE_PREFIX}${boardId}`,
      JSON.stringify(state)
    );
  } catch {
    // Ignore
  }
}

export function loadActiveBoardState<T>(boardId: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(
      `${ACTIVE_BOARD_STORAGE_PREFIX}${boardId}`
    );
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
