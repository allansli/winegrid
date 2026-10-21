import { DifficultyLevel } from "@/types/wine";

/**
 * Answer floors for the three difficulties.
 *
 * These numbers are configuration. They are not computed from how many
 * grapes, regions, or producers exist, so adding entities cannot silently
 * lower Master's floor or raise Standard's. A larger catalog can only add
 * legal answers above the floor. There is no upper cap.
 *
 * Standard is the easy tier: every cell has at least 5 answers. A floor of
 * 6 still cannot build a grapes-only board after the South America clue:
 * that clue adds regions and producers, not grapes. A clue must still match at least 3
 * entities in the active filter before it is dealt. Sommelier stays at 3
 * answers and a support floor of 3. Master stays
 * hard: a cell may have 2 answers, master-only clues stay in the pool, and
 * a clue still needs 4 matches before it is dealt.
 */
export interface DifficultyTuning {
  id: DifficultyLevel;
  name: "Standard" | "Sommelier" | "Master";
  minimumValidAnswers: number;
  clueSupportFloor: number;
  clueDifficulties: readonly DifficultyLevel[];
}

export const DIFFICULTY_TUNING: Record<DifficultyLevel, DifficultyTuning> = {
  wset2: {
    id: "wset2",
    name: "Standard",
    minimumValidAnswers: 5,
    clueSupportFloor: 3,
    clueDifficulties: ["wset2"],
  },
  wset3: {
    id: "wset3",
    name: "Sommelier",
    minimumValidAnswers: 3,
    clueSupportFloor: 3,
    clueDifficulties: ["wset2", "wset3"],
  },
  master_somm: {
    id: "master_somm",
    name: "Master",
    minimumValidAnswers: 2,
    clueSupportFloor: 4,
    clueDifficulties: ["wset2", "wset3", "master_somm"],
  },
};

export function minimumValidAnswers(difficulty: DifficultyLevel): number {
  return DIFFICULTY_TUNING[difficulty].minimumValidAnswers;
}

export function clueSupportFloor(difficulty: DifficultyLevel): number {
  return DIFFICULTY_TUNING[difficulty].clueSupportFloor;
}

export function allowedClueDifficulties(difficulty: DifficultyLevel): Set<DifficultyLevel> {
  return new Set(DIFFICULTY_TUNING[difficulty].clueDifficulties);
}

/**
 * Personal Sommelier catalog rule. Every entity must answer at least this
 * many distinct clues in the live catalog. Entity-type clues do not count:
 * they only say that the card is a grape, a region, or a producer.
 * Do not lower this when a card falls short. Grandfather that id in
 * CLUE_MINIMUM_ALLOWLIST instead.
 */
export const MINIMUM_ANSWERED_CLUES = 3;
