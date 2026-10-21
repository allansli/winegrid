"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";
import {
  ClueDefinition,
  DifficultyLevel,
  EntityFilterMode,
  GameMode,
  GeneratedBoard,
  MatrixCell,
  WineEntity,
  WineEntityType,
} from "@/types/wine";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedClue } from "@/i18n/clues";
import { MessageKey } from "@/i18n/messages";
import { localizedNote } from "@/i18n/notesPt";
import { placeLabel } from "@/i18n/places";
import { readDailyStreak, recordDailyResult, writeDailyStreak, EMPTY_DAILY_STREAK } from "@/lib/dailyStreak";
import { leaderboard } from "@/lib/leaderboard";
import { buildShareText, deliverShareText, formatDecimal, shareCellForPick } from "@/lib/shareScore";
import { WINE_ENTITY_BY_ID } from "@/data/wineDatabase";
import { boardClueHash, reconcileSavedBoard } from "@/lib/boardClueHash";
import { clientVercelEnv, parseDailyQuery } from "@/lib/dailyDate";
import { localizedEntityName } from "@/lib/entityName";
import {
  DAILY_DIFFICULTY,
  generateDailyBoard,
  boardStillSolvable,
  generateWineGridBoard,
} from "@/lib/matrixGenerator";
import { evaluatePick, validEntityIds } from "@/lib/pickerList";
import {
  ECONOMY_VERSION,
  MISS_BUDGET,
  GuessBudget,
  applyPick,
  freshGuessBudget,
  isMissBudgetExhausted,
  restoreGuessBudget,
} from "@/lib/guessEconomy";
import {
  getOrCreateAnonId,
  initObservability,
  trackEvent,
} from "@/lib/observability";
import {
  GameHistoryEntry,
  computePlayerStats,
  clearActiveBoardState,
  getLocalHistory,
  loadActiveBoardState,
  recordAndCalculateCellRarity,
  saveActiveBoardState,
  saveGameSession,
} from "@/lib/storageAndSync";
import {
  InfiniteRunState,
  ResumeSnapshot,
  advanceInfiniteRun,
  clearResumeSnapshot,
  freshInfiniteRun,
  readInfiniteRun,
  readResumeSnapshot,
  readStoredMode,
  readUnlimitedBoard,
  writeInfiniteRun,
  writeResumeSnapshot,
  writeStoredMode,
  writeUnlimitedBoard,
} from "@/lib/sessionPersistence";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { EntitySearchModal } from "./EntitySearchModal";
import { CellInspectModal } from "./CellInspectModal";
import { SommelierCodexModal } from "./SommelierCodexModal";
import { AuthAndHistoryModal } from "./AuthAndHistoryModal";
import { ObservabilityDrawer } from "./ObservabilityDrawer";
import { HowToPlayModal } from "./HowToPlayModal";
import {
  Activity,
  BookOpen,
  Castle,
  CheckCircle2,
  Clock,
  Eye,
  Flame,
  Grape,
  HelpCircle,
  Infinity as InfinityIcon,
  Info,
  Plus,
  RefreshCw,
  Share2,
  Sparkles,
  User,
  Wine,
  X,
  XCircle,
} from "lucide-react";

interface PersistedActiveState {
  sessionId: string;
  boardId: string;
  cells: MatrixCell[];
  guessesRemaining: number;
  missesUsed?: number;
  economyVersion?: number;
  clueHash?: string;
  isCompleted: boolean;
  isRevealed: boolean;
}

type PendingBoardChange =
  | { kind: "mode"; mode: GameMode }
  | { kind: "difficulty"; difficulty: DifficultyLevel }
  | { kind: "filter"; filter: EntityFilterMode }
  | { kind: "new-board" };

const HOW_TO_PLAY_KEY = "winegrid_howto_seen_v1";

function difficultyKey(difficulty: DifficultyLevel): MessageKey {
  if (difficulty === "wset2") return "difficulty.standard";
  if (difficulty === "master_somm") return "difficulty.master";
  return "difficulty.sommelier";
}

function filterKey(filter: EntityFilterMode): MessageKey {
  if (filter === "appellation") return "filter.regions";
  if (filter === "grape") return "filter.grapes";
  if (filter === "producer") return "filter.estates";
  return "filter.allTypes";
}

function categoryKey(category: string): MessageKey {
  return `category.${category}` as MessageKey;
}

function shareRows(cells: MatrixCell[]) {
  return [0, 1, 2].map((row) =>
    [0, 1, 2].map((col) => {
      const cell = cells[row * 3 + col];
      return shareCellForPick(Boolean(cell?.pickedEntityId), cell?.pickedRarityPct ?? null);
    })
  );
}

export function WineGridGame() {
  const { locale, setLocale, t } = useI18n();
  const [booted, setBooted] = useState(false);
  const [todayStr, setTodayStr] = useState<string>("");
  const [dailyDate, setDailyDate] = useState<string>("");
  const [dailyReplay, setDailyReplay] = useState(false);
  const dailyReplayRef = useRef(false);
  const [nextDailyCountdown, setNextDailyCountdown] = useState<string>("");
  const [mode, setMode] = useState<GameMode>("daily");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("wset3");
  const [entityFilter, setEntityFilter] = useState<EntityFilterMode>("all");
  const [unlimitedSeed, setUnlimitedSeed] = useState<string>("unlimited-0");
  const [infiniteRun, setInfiniteRun] = useState<InfiniteRunState | null>(null);
  const [resumeOffer, setResumeOffer] = useState<ResumeSnapshot | null>(null);
  const runBudgetRef = useRef<GuessBudget>(freshGuessBudget());
  const keepFeedbackRef = useRef(false);

  const [sessionId, setSessionId] = useState<string>("");
  const [board, setBoard] = useState<GeneratedBoard | null>(null);
  const [cells, setCells] = useState<MatrixCell[]>([]);
  const [guessesRemaining, setGuessesRemaining] = useState<number>(MISS_BUDGET);
  const [guessesUsedCount, setGuessesUsedCount] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);

  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | "info";
    title: string;
    detail: string;
  } | null>(null);

  const [activeCellIndex, setActiveCellIndex] = useState<number | null>(null);
  const [inspectCellIndex, setInspectCellIndex] = useState<number | null>(null);
  const [codexOpen, setCodexOpen] = useState<boolean>(false);
  const [authHistoryOpen, setAuthHistoryOpen] = useState<boolean>(false);
  const [observabilityOpen, setObservabilityOpen] = useState<boolean>(false);
  const [shareState, setShareState] = useState<"idle" | "copied" | "shared">("idle");
  const [dailyStreak, setDailyStreak] = useState(EMPTY_DAILY_STREAK);
  const [howToOpen, setHowToOpen] = useState(false);
  const [justFilledIndex, setJustFilledIndex] = useState<number | null>(null);
  const [missFlashIndex, setMissFlashIndex] = useState<number | null>(null);

  const [anonId, setAnonId] = useState<string>("anon_guest");
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    email: string;
  } | null>(null);
  const [history, setHistory] = useState<GameHistoryEntry[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister();
        }
      });
    }

    initObservability();
    const id = getOrCreateAnonId();
    setAnonId(id);

    const storedMode = readStoredMode(window.localStorage);
    const storedRun = readInfiniteRun(window.localStorage);
    const storedUnlimited = readUnlimitedBoard(window.localStorage);
    setMode(storedMode);
    if (storedMode === "infinite") {
      const run =
        storedRun ?? freshInfiniteRun(difficulty, entityFilter);
      if (!storedRun) writeInfiniteRun(window.localStorage, run);
      setInfiniteRun(run);
      setDifficulty(run.difficulty);
      setEntityFilter(run.entityFilter);
      setUnlimitedSeed(run.seed);
    } else if (storedMode === "unlimited" && storedUnlimited) {
      setDifficulty(storedUnlimited.difficulty);
      setEntityFilter(storedUnlimited.entityFilter);
      setUnlimitedSeed(storedUnlimited.seed);
    } else if (storedMode === "unlimited") {
      const seed = `unlimited-${Date.now()}`;
      setUnlimitedSeed(seed);
      writeUnlimitedBoard(window.localStorage, {
        seed,
        difficulty,
        entityFilter,
      });
    }
    if (storedMode === "unlimited" || storedMode === "infinite") {
      setResumeOffer(readResumeSnapshot(window.localStorage, storedMode));
    }

    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const today = `${yyyy}-${mm}-${dd}`;
    const queried = parseDailyQuery(window.location.search, today, clientVercelEnv());
    setTodayStr(today);
    setDailyDate(queried.date);
    setDailyReplay(queried.replay);
    dailyReplayRef.current = queried.replay;
    setBooted(true);

    const updateCountdown = () => {
      const current = new Date();
      const curY = current.getFullYear();
      const curM = String(current.getMonth() + 1).padStart(2, "0");
      const curD = String(current.getDate()).padStart(2, "0");
      const currentDayStr = `${curY}-${curM}-${curD}`;
      setTodayStr((prev) => (prev !== currentDayStr ? currentDayStr : prev));
      if (!dailyReplayRef.current) {
        setDailyDate((prev) => (prev !== currentDayStr ? currentDayStr : prev));
      }

      const tomorrowMidnight = new Date(
        current.getFullYear(),
        current.getMonth(),
        current.getDate() + 1,
        0,
        0,
        0,
        0
      );
      const diffMs = Math.max(0, tomorrowMidnight.getTime() - current.getTime());
      const totalSeconds = Math.floor(diffMs / 1000);
      const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
      const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
      const seconds = String(totalSeconds % 60).padStart(2, "0");
      setNextDailyCountdown(`${hours}:${minutes}:${seconds}`);
    };

    updateCountdown();
    const timer = window.setInterval(updateCountdown, 1000);

    setHistory(getLocalHistory());
    setDailyStreak(readDailyStreak(window.localStorage));

    const demoRaw = window.localStorage.getItem("winegrid_demo_user");
    if (demoRaw) {
      try {
        setCurrentUser(JSON.parse(demoRaw));
      } catch {
        // Ignore
      }
    }

    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session?.user) {
          setCurrentUser({
            id: data.session.user.id,
            email: data.session.user.email || "Sommelier",
          });
        }
      });
    }

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(HOW_TO_PLAY_KEY)) setHowToOpen(true);
    } catch {
      // Ignore private mode
    }
  }, []);

  useEffect(() => {
    if (justFilledIndex === null) return;
    const timer = window.setTimeout(() => setJustFilledIndex(null), 700);
    return () => window.clearTimeout(timer);
  }, [justFilledIndex]);

  useEffect(() => {
    if (missFlashIndex === null) return;
    const timer = window.setTimeout(() => setMissFlashIndex(null), 450);
    return () => window.clearTimeout(timer);
  }, [missFlashIndex]);

  useEffect(() => {
    if (!feedback || feedback.type === "info") return;
    const timer = window.setTimeout(() => setFeedback(null), 4600);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const initBoard = useCallback(
    (
      targetMode: GameMode,
      targetDiff: DifficultyLevel,
      targetFilter: EntityFilterMode,
      targetSeed: string
    ) => {
      if (!booted || !todayStr || !dailyDate) return;
      const effDiff = targetMode === "daily" ? DAILY_DIFFICULTY : targetDiff;
      const effFilter = targetMode === "daily" ? "all" : targetFilter;
      const puzzleDate = targetMode === "daily" ? dailyDate : todayStr;

      const generated =
        targetMode === "daily"
          ? generateDailyBoard(puzzleDate)
          : generateWineGridBoard({
              seed: targetSeed,
              mode: targetMode,
              difficulty: effDiff,
              entityFilter: effFilter,
              boardDate: todayStr,
            });

      const replay = targetMode === "daily" && dailyReplay;
      const saved = replay
        ? null
        : loadActiveBoardState<PersistedActiveState>(generated.boardId);
      const reconciled = replay
        ? { action: "discard" as const }
        : reconcileSavedBoard(saved, generated.cells, {
            keepCompletedDaily:
              targetMode === "daily" &&
              saved?.isCompleted === true &&
              puzzleDate === todayStr,
          });
      const restoredBudget =
        reconciled.action === "restore" && saved
          ? restoreGuessBudget(
              {
                economyVersion: saved.economyVersion,
                missesRemaining: saved.guessesRemaining,
                missesUsed: saved.missesUsed,
                guessesRemaining: saved.guessesRemaining,
                cells: reconciled.cells,
              },
              targetMode
            )
          : null;
      if (reconciled.action === "restore" && saved && restoredBudget) {
        if (targetMode === "infinite") runBudgetRef.current = restoredBudget;
        setSessionId(saved.sessionId);
        setBoard(generated);
        setCells(reconciled.cells);
        setGuessesRemaining(restoredBudget.missesRemaining);
        setGuessesUsedCount(restoredBudget.missesUsed);
        setIsCompleted(reconciled.isCompleted);
        setIsRevealed(saved.isRevealed && reconciled.isCompleted);
      } else {
        if (saved && !replay) clearActiveBoardState(generated.boardId);
        const newSessionId = crypto.randomUUID();
        const fresh =
          targetMode === "infinite" ? runBudgetRef.current : freshGuessBudget();
        setSessionId(newSessionId);
        setBoard(generated);
        setCells(generated.cells);
        setGuessesRemaining(fresh.missesRemaining);
        setGuessesUsedCount(fresh.missesUsed);
        setIsCompleted(false);
        setIsRevealed(false);
        if (!keepFeedbackRef.current) setFeedback(null);
        keepFeedbackRef.current = false;

        trackEvent("game_started", {
          board_id: generated.boardId,
          mode: targetMode,
          difficulty: effDiff,
          entity_filter: effFilter,
        });
      }
    },
    [booted, todayStr, dailyDate, dailyReplay]
  );

  useEffect(() => {
    if (!booted || !todayStr || !dailyDate) return;
    initBoard(mode, difficulty, entityFilter, unlimitedSeed);
  }, [booted, todayStr, dailyDate, mode, difficulty, entityFilter, unlimitedSeed, initBoard]);

  useEffect(() => {
    if (!board || !sessionId || cells.length !== 9) return;
    if (board.mode === "daily" && dailyReplay) return;
    saveActiveBoardState(board.boardId, {
      sessionId,
      boardId: board.boardId,
      cells,
      guessesRemaining,
      missesUsed: guessesUsedCount,
      economyVersion: ECONOMY_VERSION,
      clueHash: boardClueHash(board),
      isCompleted,
      isRevealed,
    });
  }, [board, sessionId, cells, guessesRemaining, guessesUsedCount, isCompleted, isRevealed, dailyReplay]);

  const usedEntityIds = useMemo(() => {
    const s = new Set<string>();
    for (const c of cells) {
      if (c.pickedEntityId) s.add(c.pickedEntityId);
    }
    return s;
  }, [cells]);

  const correctCount = useMemo(
    () => cells.filter((c) => Boolean(c.pickedEntityId)).length,
    [cells]
  );

  const boardStuck = useMemo(() => {
    if (cells.length !== 9 || isCompleted || isRevealed) return false;
    if (!cells.some((cell) => !cell.pickedEntityId)) return false;
    return !boardStillSolvable(cells);
  }, [cells, isCompleted, isRevealed]);

  const currentRarityScore = useMemo(() => {
    if (cells.length !== 9) return 900;
    const total = cells.reduce((acc, c) => {
      if (c.pickedEntityId && c.pickedRarityPct !== null) {
        return acc + c.pickedRarityPct;
      }
      return acc + 100;
    }, 0);
    return Number(total.toFixed(1));
  }, [cells]);

  const playerStats = useMemo(() => computePlayerStats(history), [history]);

  const finalizeGame = useCallback(
    async (
      updatedCells: MatrixCell[],
      missesUsed: number,
      revealedByGiveUp = false,
      options?: { continueRun?: boolean }
    ) => {
      if (!board) return;
      const solved = updatedCells.filter((c) => Boolean(c.pickedEntityId)).length;
      const won = solved === 9 && !revealedByGiveUp;
      const rarityTotal = Number(
        updatedCells
          .reduce(
            (acc, c) =>
              acc +
              (c.pickedEntityId && c.pickedRarityPct !== null
                ? c.pickedRarityPct
                : 100),
            0
          )
          .toFixed(1)
      );

      if (!options?.continueRun) setIsCompleted(true);
      if (won) {
        confetti({
          particleCount: 80,
          spread: 65,
          origin: { y: 0.6 },
        });
      }

      if (dailyReplayRef.current) return;

      const entry: GameHistoryEntry = {
        sessionId,
        boardId: board.boardId,
        boardDate: todayStr,
        mode: board.mode,
        difficulty: board.difficulty,
        entityFilter: board.entityFilter,
        rowClueLabels: board.rowClues.map((r) => r.shortLabel),
        colClueLabels: board.colClues.map((c) => c.shortLabel),
        correctCells: solved,
        guessesUsed: missesUsed,
        rarityScore: rarityTotal,
        isCompleted: true,
        isWon: won,
        cells: updatedCells.map((c) => ({
          cellIndex: c.index,
          entityId: c.pickedEntityId,
          entityName: c.pickedEntityId
            ? WINE_ENTITY_BY_ID[c.pickedEntityId]?.canonicalName ?? null
            : null,
          rarityPct: c.pickedRarityPct,
        })),
        completedAt: new Date().toISOString(),
        syncedToSupabase: false,
        userId: currentUser?.id ?? null,
      };

      await saveGameSession(entry);
      setHistory(getLocalHistory());

      if (board.mode === "daily" && !dailyReplayRef.current) {
        const nextStreak = recordDailyResult(
          readDailyStreak(window.localStorage),
          todayStr,
          won
        );
        writeDailyStreak(window.localStorage, nextStreak);
        setDailyStreak(nextStreak);
        const shareText = buildShareText({
          mode: "daily",
          date: todayStr,
          difficultyLabel: t("difficulty.standard"),
          correct: solved,
          rarity: rarityTotal,
          missesUsed,
          streak: nextStreak.current,
          rows: shareRows(updatedCells),
          locale,
        });
        void leaderboard
          .submit({
            date: todayStr,
            anonId,
            correctCells: solved,
            missesUsed,
            rarityScore: rarityTotal,
            won,
            shareText,
          })
          .catch(() => {
            // The leaderboard backend is not wired yet.
          });
      }

      trackEvent("game_completed", {
        board_id: board.boardId,
        mode: board.mode,
        difficulty: board.difficulty,
        correct_cells: solved,
        guesses_used: missesUsed,
        rarity_score: rarityTotal,
        is_won: won,
        revealed_by_give_up: revealedByGiveUp,
      });
    },
    [anonId, board, locale, sessionId, t, todayStr, currentUser]
  );

  const displayName = (entity: WineEntity) =>
    localizedEntityName(
      entity.name,
      entity.entityType,
      entity.entityType === "appellation"
        ? t("type.region")
        : entity.entityType === "grape"
        ? t("type.grape")
        : t("type.producer")
    );

  const handleSelectEntity = async (entity: WineEntity) => {
    if (activeCellIndex === null || !board || isCompleted) return;
    if (usedEntityIds.has(entity.id)) {
      setFeedback({
        type: "info",
        title: t("picker.used"),
        detail: displayName(entity),
      });
      return;
    }
    const cellIndex = activeCellIndex;
    const cell = cells[cellIndex];
    const rowClue = board.rowClues[cell.row];
    const colClue = board.colClues[cell.col];
    const rowCopy = localizedClue(rowClue, locale);
    const colCopy = localizedClue(colClue, locale);
    const decision = evaluatePick(cells, cellIndex, entity.id);
    if (decision === "used") return;
    if (decision === "blocked") {
      setFeedback({
        type: "info",
        title: t("picker.blocks"),
        detail: t("picker.blocksDetail", { name: displayName(entity) }),
      });
      return;
    }
    const isValid = decision === "correct";
    const nextBudget = applyPick(
      { missesRemaining: guessesRemaining, missesUsed: guessesUsedCount },
      isValid ? "correct" : "miss",
      board.mode
    );

    setActiveCellIndex(null);
    setGuessesRemaining(nextBudget.missesRemaining);
    setGuessesUsedCount(nextBudget.missesUsed);
    if (board.mode === "infinite") runBudgetRef.current = nextBudget;

    if (isValid) {
      const rarityPct = await recordAndCalculateCellRarity(
        rowClue.id,
        colClue.id,
        entity.id,
        cell.validEntityIds
      );

      const nextCells = cells.map((c, idx) =>
        idx === cellIndex
          ? {
              ...c,
              pickedEntityId: entity.id,
              pickedRarityPct: rarityPct,
              isLocked: true,
            }
          : c
      );

      setCells(nextCells);
      setJustFilledIndex(cellIndex);
      setFeedback({
        type: "success",
        title: t("feedback.correctTitle", {
          name: displayName(entity),
          pct: formatDecimal(rarityPct, locale),
        }),
        detail: localizedNote(entity.id, entity.sommelierNote, locale),
      });

      trackEvent("cell_guess_submitted", {
        board_id: board.boardId,
        cell_index: cellIndex,
        row_clue: rowClue.id,
        col_clue: colClue.id,
        entity_id: entity.id,
        entity_name: entity.canonicalName,
        is_correct: true,
        rarity_pct: rarityPct,
        guesses_remaining: nextBudget.missesRemaining,
      });

      const allNineSolved = nextCells.every((c) => Boolean(c.pickedEntityId));
      if (allNineSolved && board.mode === "infinite" && infiniteRun && !infiniteRun.failed) {
        await finalizeGame(nextCells, nextBudget.missesUsed, false, { continueRun: true });
        const next = advanceInfiniteRun(infiniteRun);
        writeInfiniteRun(window.localStorage, next);
        setInfiniteRun(next);
        keepFeedbackRef.current = true;
        setFeedback({
          type: "success",
          title: t("infinite.next"),
          detail: t("infinite.boards") + `: ${next.boardsCleared}`,
        });
        setUnlimitedSeed(next.seed);
      } else if (allNineSolved) {
        await finalizeGame(nextCells, nextBudget.missesUsed, false);
      }
    } else {
      const matchesRow = rowClue.predicate(entity);
      const matchesCol = colClue.predicate(entity);
      const reasonKey =
        !matchesRow && !matchesCol
          ? "feedback.missNeither"
          : !matchesRow
          ? "feedback.missRow"
          : "feedback.missCol";

      setMissFlashIndex(cellIndex);
      const why = [!matchesRow ? rowCopy.tooltip : "", !matchesCol ? colCopy.tooltip : ""]
        .filter(Boolean)
        .join(" ");
      setFeedback({
        type: "error",
        title: t("feedback.missTitle", { name: displayName(entity) }),
        detail: t(reasonKey, {
          name: displayName(entity),
          row: !matchesRow && matchesCol ? rowCopy.label : rowCopy.shortLabel,
          col: matchesRow && !matchesCol ? colCopy.label : colCopy.shortLabel,
          why,
        }),
      });

      trackEvent("cell_guess_submitted", {
        board_id: board.boardId,
        cell_index: cellIndex,
        row_clue: rowClue.id,
        col_clue: colClue.id,
        entity_id: entity.id,
        entity_name: entity.canonicalName,
        is_correct: false,
        guesses_remaining: nextBudget.missesRemaining,
      });

      if (isMissBudgetExhausted(nextBudget, board.mode)) {
        if (board.mode === "infinite" && infiniteRun) {
          const failed = { ...infiniteRun, failed: true };
          writeInfiniteRun(window.localStorage, failed);
          setInfiniteRun(failed);
          setFeedback({
            type: "error",
            title: t("infinite.failedTitle"),
            detail: t("infinite.failedDetail", {
              boards: failed.boardsCleared,
              misses: nextBudget.missesUsed,
            }),
          });
        }
        await finalizeGame(cells, nextBudget.missesUsed, false);
      }
    }
  };

  const rememberPracticeBoard = (
    nextMode: GameMode,
    nextSeed: string,
    nextDifficulty: DifficultyLevel,
    nextFilter: EntityFilterMode
  ) => {
    if (nextMode === "unlimited") {
      writeUnlimitedBoard(window.localStorage, {
        seed: nextSeed,
        difficulty: nextDifficulty,
        entityFilter: nextFilter,
      });
    }
  };

  const stashPracticeBoard = (from: GameMode) => {
    if (!board || (from !== "unlimited" && from !== "infinite") || isCompleted) return;
    if (correctCount === 0 && guessesUsedCount === 0) return;
    const snap: ResumeSnapshot = {
      seed: unlimitedSeed,
      difficulty,
      entityFilter,
      sessionId,
      cells,
      guessesRemaining,
      missesUsed: guessesUsedCount,
      economyVersion: ECONOMY_VERSION,
      isRevealed,
      clueHash: boardClueHash(board),
      run: from === "infinite" ? infiniteRun ?? undefined : undefined,
    };
    writeResumeSnapshot(window.localStorage, from, snap);
    clearActiveBoardState(board.boardId);
  };

  const startFreshPractice = (nextMode: "unlimited" | "infinite") => {
    if (nextMode === "infinite") {
      const run = freshInfiniteRun(difficulty, entityFilter);
      runBudgetRef.current = freshGuessBudget();
      writeInfiniteRun(window.localStorage, run);
      setInfiniteRun(run);
      setUnlimitedSeed(run.seed);
      return;
    }
    const seed = `unlimited-${Date.now()}`;
    setUnlimitedSeed(seed);
    writeUnlimitedBoard(window.localStorage, {
      seed,
      difficulty,
      entityFilter,
    });
  };

  const requestBoardChange = (change: PendingBoardChange) => {
    if (change.kind === "mode" && change.mode === mode) return;
    if (change.kind === "difficulty" && change.difficulty === difficulty) return;
    if (change.kind === "filter" && change.filter === entityFilter) return;

    if (change.kind === "new-board") {
      if (board) clearActiveBoardState(board.boardId);
      if (mode === "unlimited" || mode === "infinite") {
        clearResumeSnapshot(window.localStorage, mode);
      }
      if (mode === "infinite") startFreshPractice("infinite");
      else startFreshPractice("unlimited");
      setResumeOffer(null);
      return;
    }

    if (change.kind === "mode") {
      stashPracticeBoard(mode);
      writeStoredMode(window.localStorage, change.mode);
      setMode(change.mode);
      if (change.mode === "daily") {
        setResumeOffer(null);
        return;
      }
      setResumeOffer(readResumeSnapshot(window.localStorage, change.mode));
      startFreshPractice(change.mode);
      return;
    }

    if (board && mode !== "daily") clearActiveBoardState(board.boardId);
    const nextDiff = change.kind === "difficulty" ? change.difficulty : difficulty;
    const nextFilter = change.kind === "filter" ? change.filter : entityFilter;
    if (change.kind === "difficulty") setDifficulty(nextDiff);
    else setEntityFilter(nextFilter);
    if (mode === "infinite" && infiniteRun) {
      const run = {
        ...infiniteRun,
        difficulty: nextDiff,
        entityFilter: nextFilter,
        seed: `infinite-${infiniteRun.runId}-${infiniteRun.boardsCleared}-${Date.now()}`,
      };
      writeInfiniteRun(window.localStorage, run);
      setInfiniteRun(run);
      setUnlimitedSeed(run.seed);
    } else {
      rememberPracticeBoard(mode, unlimitedSeed, nextDiff, nextFilter);
    }
  };

  const resumePractice = () => {
    if (!resumeOffer || (mode !== "unlimited" && mode !== "infinite")) return;
    const boardId = `${mode}-${resumeOffer.seed}-${resumeOffer.difficulty}-${resumeOffer.entityFilter}`;
    saveActiveBoardState(boardId, {
      sessionId: resumeOffer.sessionId,
      boardId,
      cells: resumeOffer.cells,
      guessesRemaining: resumeOffer.guessesRemaining,
      missesUsed: resumeOffer.missesUsed,
      economyVersion: resumeOffer.economyVersion,
      clueHash: resumeOffer.clueHash,
      isCompleted: false,
      isRevealed: resumeOffer.isRevealed,
    });
    runBudgetRef.current = {
      missesRemaining: resumeOffer.guessesRemaining,
      missesUsed: resumeOffer.missesUsed,
    };
    if (resumeOffer.run) {
      const run = {
        ...resumeOffer.run,
        seed: resumeOffer.seed,
        difficulty: resumeOffer.difficulty,
        entityFilter: resumeOffer.entityFilter,
        failed: false,
      };
      writeInfiniteRun(window.localStorage, run);
      setInfiniteRun(run);
    }
    setDifficulty(resumeOffer.difficulty);
    setEntityFilter(resumeOffer.entityFilter);
    setUnlimitedSeed(resumeOffer.seed);
    clearResumeSnapshot(window.localStorage, mode);
    setResumeOffer(null);
  };

  const closeHowTo = () => {
    setHowToOpen(false);
    try {
      window.localStorage.setItem(HOW_TO_PLAY_KEY, "1");
    } catch {
      // Ignore private mode
    }
  };

  const handleRevealSolutions = async () => {
    setIsRevealed(true);
    if (mode === "infinite" && infiniteRun && !infiniteRun.failed) {
      const failed = { ...infiniteRun, failed: true };
      writeInfiniteRun(window.localStorage, failed);
      setInfiniteRun(failed);
    }
    if (!isCompleted) {
      await finalizeGame(cells, guessesUsedCount, true);
    }
    setFeedback({
      type: "info",
      title: t("feedback.revealedTitle"),
      detail: t("feedback.revealedDetail"),
    });
  };

  const handleShareResults = async () => {
    if (!board) return;
    const shareText = buildShareText({
      mode: board.mode,
      date: todayStr,
      difficultyLabel: t(difficultyKey(board.difficulty)),
      correct: correctCount,
      rarity: currentRarityScore,
      missesUsed: guessesUsedCount,
      streak: board.mode === "daily" ? dailyStreak.current : 0,
      rows: shareRows(cells),
      locale,
    });
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    try {
      const result = await deliverShareText(shareText, {
        preferSystemShare: mobile,
        clipboard: navigator.clipboard,
        systemShare: navigator.share
          ? (data) => navigator.share(data)
          : undefined,
      });
      setShareState(result);
      trackEvent("share_results_copied", {
        board_id: board.boardId,
        correct_cells: correctCount,
        rarity_score: currentRarityScore,
        delivery: result,
      });
      window.setTimeout(() => setShareState("idle"), 2500);
    } catch {
      // Clipboard can be denied; the score stays on screen.
    }
  };

  const getRarityPillStyle = (pct: number | null) => {
    if (pct === null) return "bg-slate-100 text-slate-600";
    if (pct < 10) return "bg-amber-100 text-amber-800 border border-amber-300/80";
    if (pct < 25) return "bg-violet-100 text-violet-800 border border-violet-200";
    return "bg-emerald-100 text-emerald-800 border border-emerald-200";
  };

  const getCellAcceptedTypes = useCallback((cell: MatrixCell): WineEntityType[] => {
    const typesSet = new Set<WineEntityType>();
    for (const id of validEntityIds(cell)) {
      const ent = WINE_ENTITY_BY_ID[id];
      if (ent) typesSet.add(ent.entityType);
    }
    const ordered: WineEntityType[] = [];
    if (typesSet.has("appellation")) ordered.push("appellation");
    if (typesSet.has("grape")) ordered.push("grape");
    if (typesSet.has("producer")) ordered.push("producer");
    return ordered.length > 0 ? ordered : ["appellation", "grape", "producer"];
  }, []);

  const formatEntityTypeLabel = (type: WineEntityType) => {
    if (type === "appellation") return t("type.region");
    if (type === "grape") return t("type.grape");
    return t("type.producer");
  };

  const presentClue = (clue: ClueDefinition) => localizedClue(clue, locale);

  if (!board) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-wine-50 border border-wine-100 flex items-center justify-center">
            <Wine className="w-6 h-6 text-wine-600 animate-pulse" />
          </div>
          <p className="font-display text-sm font-medium text-slate-500">
            {t("loading")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col">
      {/* Clean Minimal Big-Tech Navigation Bar (Mobile + Desktop Responsive) */}
      <header className="winegrid-safe-top sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/70">
        <div className="max-w-6xl mx-auto px-3 sm:px-8 py-2.5 sm:py-0 sm:h-16 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-4">
          {/* Top Row on Mobile: Brand Logo + Right Action Pills */}
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-wine-600 flex items-center justify-center shadow-sm">
                <Wine className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="font-display text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                WineGrid
              </span>
            </div>

            {/* Right Action Pills (Mobile Position) */}
            <div className="flex sm:hidden items-center gap-1">
              <button
                type="button"
                onClick={() => setLocale(locale === "en" ? "pt-BR" : "en")}
                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white hover:bg-slate-50 border border-slate-200/80 text-[10px] font-bold tracking-wide text-slate-700 transition shadow-sm"
                aria-label={t("nav.language")}
                title={t("nav.language")}
              >
                {locale === "pt-BR" ? "PT" : "EN"}
              </button>
              <button
                type="button"
                onClick={() => setHowToOpen(true)}
                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-600 transition shadow-sm"
                aria-label={t("nav.howTo")}
                title={t("nav.howTo")}
              >
                <HelpCircle className="w-4 h-4 text-slate-500" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setCodexOpen(true);
                  trackEvent("codex_opened");
                }}
                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-600 transition shadow-sm"
                title={t("nav.codexTitle")}
                aria-label={t("nav.codex")}
              >
                <BookOpen className="w-4 h-4 text-slate-500" />
              </button>

              <button
                type="button"
                onClick={() => setObservabilityOpen(true)}
                className="hidden min-[400px]:inline-flex items-center justify-center w-8 h-8 rounded-full bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-600 transition shadow-sm"
                title={t("nav.telemetry")}
                aria-label={t("nav.telemetry")}
              >
                <Activity className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthHistoryOpen(true);
                  trackEvent("auth_history_modal_opened");
                }}
                className="inline-flex shrink-0 items-center justify-center w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 text-[11px] font-semibold text-white transition shadow-sm"
                aria-label={currentUser ? currentUser.email : t("nav.signIn")}
              >
                <User className="w-3 h-3" />
                {dailyStreak.current > 0 && (
                  <span
                    className="inline-flex items-center gap-0.5 text-amber-300 font-bold"
                    title={t("streak.bestTitle", { n: dailyStreak.best })}
                  >
                    <Flame className="w-3 h-3 fill-amber-400" />
                    {dailyStreak.current}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Center Segmented Mode Pill (Full width on mobile, centered pill on desktop) */}
          <div className="grid grid-cols-3 sm:flex items-center bg-slate-100 p-1 rounded-full border border-slate-200/60 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => requestBoardChange({ kind: "mode", mode: "daily" })}
              className={`winegrid-mode-tab px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold text-center transition-all ${
                mode === "daily"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {t("mode.daily")}
            </button>
            <button
              type="button"
              onClick={() => requestBoardChange({ kind: "mode", mode: "unlimited" })}
              className={`winegrid-mode-tab px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold text-center transition-all ${
                mode === "unlimited"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {t("mode.unlimited")}
            </button>
            <button
              type="button"
              onClick={() => requestBoardChange({ kind: "mode", mode: "infinite" })}
              className={`winegrid-mode-tab inline-flex items-center justify-center gap-1 px-2.5 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                mode === "infinite"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <InfinityIcon className="w-3.5 h-3.5 shrink-0" /> {t("mode.infinite")}
            </button>
          </div>

          {/* Right Action Pills (Desktop Position) */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLocale(locale === "en" ? "pt-BR" : "en")}
              className="inline-flex items-center justify-center h-9 min-w-9 px-2.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200/80 text-[11px] font-bold tracking-wide text-slate-700 transition shadow-sm"
              aria-label={t("nav.language")}
              title={t("nav.language")}
            >
              {locale === "pt-BR" ? "PT" : "EN"}
            </button>
            <button
              type="button"
              onClick={() => setHowToOpen(true)}
              className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-600 transition shadow-sm"
              aria-label={t("nav.howTo")}
              title={t("nav.howTo")}
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setCodexOpen(true);
                trackEvent("codex_opened");
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200/80 px-3.5 py-2 text-xs font-medium text-slate-700 transition shadow-sm"
              title={t("nav.codexTitle")}
            >
              <BookOpen className="w-4 h-4 text-slate-500" />
              <span>{t("nav.codex")}</span>
            </button>

            <button
              type="button"
              onClick={() => setObservabilityOpen(true)}
              className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-600 transition shadow-sm"
              title={t("nav.telemetry")}
              aria-label={t("nav.telemetry")}
            >
              <Activity className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthHistoryOpen(true);
                trackEvent("auth_history_modal_opened");
              }}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 hover:bg-slate-800 px-2.5 md:px-4 py-2 text-xs font-semibold text-white transition shadow-sm"
              aria-label={currentUser ? currentUser.email : t("nav.signIn")}
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden md:inline">
                {currentUser ? currentUser.email.split("@")[0] : t("nav.signIn")}
              </span>
              {dailyStreak.current > 0 && (
                <span
                  className="inline-flex items-center gap-0.5 text-amber-300 font-bold"
                  title={t("streak.bestTitle", { n: dailyStreak.best })}
                >
                  <Flame className="w-3.5 h-3.5 fill-amber-400" />
                  {dailyStreak.current}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Spacious Wide Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-2.5 sm:px-8 py-4 sm:py-10 space-y-4 sm:space-y-6">
        {/* Unlimited / Infinite Mode Filter Bar */}
        {(mode === "unlimited" || mode === "infinite") && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <div className="grid grid-cols-3 sm:flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
                {(
                  [
                    { id: "wset2", label: t("difficulty.standard") },
                    { id: "wset3", label: t("difficulty.sommelier") },
                    { id: "master_somm", label: t("difficulty.master") },
                  ] as { id: DifficultyLevel; label: string }[]
                ).map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() =>
                      requestBoardChange({ kind: "difficulty", difficulty: d.id })
                    }
                    className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-medium transition ${
                      difficulty === d.id
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-4 sm:flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
                {(
                  [
                    { id: "all", label: t("filter.all") },
                    { id: "appellation", label: t("filter.regions") },
                    { id: "grape", label: t("filter.grapes") },
                    { id: "producer", label: t("filter.estates") },
                  ] as { id: EntityFilterMode; label: string }[]
                ).map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() =>
                      requestBoardChange({ kind: "filter", filter: f.id })
                    }
                    className={`px-2 sm:px-3 py-1 rounded-lg text-xs font-medium transition ${
                      entityFilter === f.id
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-slate-500 sm:max-w-[16rem] sm:text-right">
              {t("filter.hint")}
            </p>

            {resumeOffer && (
              <button
                type="button"
                onClick={resumePractice}
                className="winegrid-mode-tab inline-flex items-center justify-center gap-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-800 shadow-sm transition w-full sm:w-auto"
              >
                {t("action.resume")}
              </button>
            )}

            <button
              type="button"
              onClick={() => requestBoardChange({ kind: "new-board" })}
              className="winegrid-mode-tab inline-flex items-center justify-center gap-1.5 rounded-xl bg-wine-600 hover:bg-wine-700 px-4 py-2 text-xs font-semibold text-white shadow-sm transition w-full sm:w-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" />{" "}
              {mode === "infinite" && infiniteRun?.failed
                ? t("infinite.newRun")
                : t("action.newBoard")}
            </button>
          </div>
        )}

        {board.mode === "daily" && dailyReplay && (
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
            {t("replay.detail", { date: dailyDate })}
          </div>
        )}

        {boardStuck && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            <div className="font-display font-semibold">{t("board.stuckTitle")}</div>
            <p className="mt-1 text-amber-900">{t("board.stuckDetail")}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleRevealSolutions}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white border border-amber-200 px-4 py-2 text-xs font-semibold text-amber-950"
              >
                <Eye className="w-3.5 h-3.5" />
                {t("action.reveal")}
              </button>
              <button
                type="button"
                onClick={() => requestBoardChange({ kind: "new-board" })}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {t("action.newBoard")}
              </button>
            </div>
          </div>
        )}

        {board.mode === "infinite" && infiniteRun?.failed && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-950">
            <div className="font-display font-semibold">{t("infinite.failedTitle")}</div>
            <p className="mt-1 text-rose-800">
              {t("infinite.failedDetail", {
                boards: infiniteRun.boardsCleared,
                misses: guessesUsedCount,
              })}
            </p>
          </div>
        )}

        {/* THE 3x3 MATRIX GRID (Responsive via @media .winegrid-matrix) */}
        <div className="winegrid-matrix">
          {/* Top-Left Corner Info */}
          <div className="winegrid-corner-card bg-slate-100/70 border border-slate-200/70 flex flex-col justify-between">
            <div>
              <span className="winegrid-clue-category inline-flex items-center rounded-full bg-wine-50 border border-wine-200/70 px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-wine-700">
                {board.mode === "daily"
                  ? t("mode.daily")
                  : board.mode === "infinite"
                  ? t("mode.infinite")
                  : t("mode.practice")}
              </span>
              <div className="winegrid-clue-title font-display text-xs sm:text-xl font-bold text-slate-900 mt-1.5 sm:mt-2">
                {board.mode === "daily" ? dailyDate : t("mode.custom")}
              </div>
              <div className="text-[10px] sm:text-xs font-semibold text-slate-500 mt-1">
                {board.mode === "daily"
                  ? t("difficulty.standard")
                  : `${t(difficultyKey(board.difficulty))} · ${t(filterKey(board.entityFilter))}`}
              </div>
              {board.mode === "daily" && (
                <div className="text-[10px] sm:text-xs font-semibold text-amber-700 mt-1">
                  {t("streak.line", {
                    current: dailyStreak.current,
                    best: dailyStreak.best,
                  })}
                </div>
              )}
              {board.mode === "daily" && isCompleted && (
                <div className="text-[10px] sm:text-xs font-semibold text-wine-700 mt-1">
                  {t("daily.comeBack")}
                </div>
              )}
              {board.mode === "infinite" && (
                <div className="text-[10px] sm:text-xs font-semibold text-slate-600 mt-1">
                  {t("infinite.boards")}: {infiniteRun?.boardsCleared ?? 0}
                </div>
              )}
            </div>
            {board.mode === "daily" && nextDailyCountdown && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-1.5 text-[10px] sm:text-xs font-medium text-slate-500 mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-slate-200/70">
                <div className="inline-flex items-center gap-1">
                  <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 shrink-0 hidden sm:inline" />
                  <span>{t("stat.nextIn")}</span>
                </div>
                <span className="font-mono font-semibold text-slate-800 text-[10px] sm:text-xs">
                  {nextDailyCountdown}
                </span>
              </div>
            )}
          </div>

          {/* 3 Column Headers (Tap on mobile or hover on desktop to inspect clue) */}
          {board.colClues.map((sourceCol) => {
            const colClue = presentClue(sourceCol);
            return (
            <button
              key={colClue.id}
              type="button"
              onClick={() =>
                setFeedback({
                  type: "info",
                  title: `${colClue.shortLabel} (${t(categoryKey(colClue.category))})`,
                  detail: t("clue.detail", { label: colClue.label, tooltip: colClue.tooltip }),
                })
              }
              className="winegrid-clue-card group relative bg-white border border-slate-200/90 flex flex-col justify-between text-left shadow-soft hover:border-slate-300 transition"
            >
              <div className="flex items-center justify-between gap-1 w-full">
                <span className="winegrid-clue-category inline-flex items-center rounded-full bg-slate-100 px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-500 max-w-full whitespace-normal leading-tight">
                  {t(categoryKey(colClue.category))}
                </span>
                <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-300 group-hover:text-slate-500 transition shrink-0 hidden sm:inline" />
              </div>
              <div className="mt-1.5 sm:mt-3 w-full">
                <div className="winegrid-clue-title font-display font-bold text-xs sm:text-lg text-slate-900 leading-snug">
                  {colClue.shortLabel}
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed hidden lg:block">
                  {colClue.label}
                </p>
              </div>

              {/* Clean Light Tooltip (Desktop Hover) */}
              <div className="hidden sm:block pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute left-1/2 -translate-x-1/2 bottom-full mb-2.5 w-72 z-40 rounded-2xl bg-slate-900 p-4 text-xs text-white shadow-xl">
                <div className="font-semibold text-rose-300 mb-1">
                  {colClue.label}
                </div>
                <p className="text-slate-200 leading-relaxed">{colClue.tooltip}</p>
              </div>
            </button>
            );
          })}

          {/* 3 Rows */}
          {board.rowClues.map((sourceRow, rIdx) => {
            const rowClue = presentClue(sourceRow);
            return (
            <React.Fragment key={rowClue.id}>
              {/* Row Header (Tap on mobile or hover on desktop to inspect clue) */}
              <button
                type="button"
                onClick={() =>
                  setFeedback({
                    type: "info",
                    title: `${rowClue.shortLabel} (${t(categoryKey(rowClue.category))})`,
                    detail: t("clue.detail", { label: rowClue.label, tooltip: rowClue.tooltip }),
                  })
                }
                className="winegrid-clue-card group relative bg-white border border-slate-200/90 flex flex-col justify-between text-left shadow-soft hover:border-slate-300 transition"
              >
                <div className="flex items-center justify-between gap-1 w-full">
                  <span className="winegrid-clue-category inline-flex items-center rounded-full bg-slate-100 px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-500 max-w-full whitespace-normal leading-tight">
                    {t(categoryKey(rowClue.category))}
                  </span>
                  <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-300 group-hover:text-slate-500 transition shrink-0 hidden sm:inline" />
                </div>
                <div className="mt-1.5 sm:mt-3 w-full">
                  <div className="winegrid-clue-title font-display font-bold text-xs sm:text-lg text-slate-900 leading-snug">
                    {rowClue.shortLabel}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed hidden lg:block">
                    {rowClue.label}
                  </p>
                </div>

                {/* Clean Light Tooltip (Desktop Hover) */}
                <div className="hidden sm:block pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute left-0 bottom-full mb-2.5 w-72 z-40 rounded-2xl bg-slate-900 p-4 text-xs text-white shadow-xl">
                  <div className="font-semibold text-rose-300 mb-1">
                    {rowClue.label}
                  </div>
                  <p className="text-slate-200 leading-relaxed">{rowClue.tooltip}</p>
                </div>
              </button>

              {/* 3 Interactive Cells */}
              {[0, 1, 2].map((cIdx) => {
                const cellIndex = rIdx * 3 + cIdx;
                const cell = cells[cellIndex];
                const acceptedTypes = cell ? getCellAcceptedTypes(cell) : [];
                const pickedEntity = cell?.pickedEntityId
                  ? WINE_ENTITY_BY_ID[cell.pickedEntityId]
                  : null;
                const sampleSolutionEntity =
                  isRevealed && !pickedEntity
                    ? WINE_ENTITY_BY_ID[board.guaranteedSolution[cellIndex]]
                    : null;

                if (pickedEntity) {
                  return (
                    <button
                      key={cellIndex}
                      type="button"
                      onClick={() => setInspectCellIndex(cellIndex)}
                      className={`winegrid-cell bg-emerald-50/70 hover:bg-emerald-50 border-2 border-emerald-500/40 flex flex-col justify-between text-left transition-all shadow-soft ${
                        justFilledIndex === cellIndex ? "winegrid-cell-pop" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 w-full flex-wrap">
                        <span className="winegrid-card-meta text-[9px] sm:text-[11px] font-semibold uppercase tracking-wider text-emerald-700 truncate">
                          {placeLabel(pickedEntity.country, locale, "country")}
                        </span>
                        <span
                          className={`text-[10px] sm:text-xs font-bold px-1.5 sm:px-2.5 py-0.5 rounded-full shrink-0 ${getRarityPillStyle(
                            cell.pickedRarityPct
                          )}`}
                        >
                          {cell.pickedRarityPct === null
                            ? "—"
                            : `${formatDecimal(cell.pickedRarityPct, locale)}%`}
                        </span>
                      </div>

                      <div className="my-1 sm:my-2">
                        <div className="winegrid-clue-title font-display font-bold text-xs sm:text-lg text-slate-900 leading-snug">
                          {pickedEntity.canonicalName}
                        </div>
                        <div className="winegrid-card-meta text-xs text-slate-500 mt-1 hidden sm:block">
                          {placeLabel(pickedEntity.macroRegion, locale, "region")}
                        </div>
                      </div>

                      <div className="winegrid-card-meta text-[10px] sm:text-xs font-medium text-emerald-700">
                        <span className="hidden sm:inline">{t("stat.tasting")}</span>
                        <span className="sm:hidden">{t("stat.notes")}</span>
                      </div>
                    </button>
                  );
                }

                if (isRevealed && sampleSolutionEntity) {
                  return (
                    <button
                      key={cellIndex}
                      type="button"
                      onClick={() => setInspectCellIndex(cellIndex)}
                      className="winegrid-cell bg-amber-50/60 hover:bg-amber-50 border border-amber-300/80 flex flex-col justify-between text-left transition-all shadow-soft"
                    >
                      <span className="text-[9px] sm:text-[11px] font-semibold uppercase tracking-wider text-amber-700 truncate">
                        {formatEntityTypeLabel(sampleSolutionEntity.entityType)}
                      </span>
                      <div className="my-1 sm:my-2">
                        <div className="winegrid-clue-title font-display font-bold text-xs sm:text-lg text-slate-900 leading-snug">
                          {sampleSolutionEntity.canonicalName}
                        </div>
                        <div className="winegrid-card-meta text-xs text-slate-500 mt-1 hidden sm:block">
                          {placeLabel(sampleSolutionEntity.country, locale, "country")} &bull;{" "}
                          {placeLabel(sampleSolutionEntity.macroRegion, locale, "region")}
                        </div>
                      </div>
                      <span className="text-[10px] sm:text-xs font-medium text-amber-800">
                        {t("stat.validMore", { n: validEntityIds(cell).length })}
                      </span>
                    </button>
                  );
                }

                return (
                  <button
                    key={cellIndex}
                    type="button"
                    disabled={isCompleted}
                    onClick={() => setActiveCellIndex(cellIndex)}
                    className={`winegrid-cell group bg-white hover:bg-slate-50/70 border border-slate-200/90 hover:border-slate-300 flex flex-col items-center justify-between text-center transition-all duration-200 shadow-soft hover:shadow-card sm:hover:-translate-y-0.5 disabled:opacity-50 ${
                      missFlashIndex === cellIndex ? "winegrid-cell-miss" : ""
                    }`}
                  >
                    <div className="winegrid-possible-label text-[10px] sm:text-xs font-semibold text-slate-400 group-hover:text-slate-600 transition">
                      {t("stat.possible", { n: cell ? validEntityIds(cell).length : 0 })}
                    </div>

                    <div className="winegrid-plus-btn w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-slate-50 group-hover:bg-slate-900 border border-slate-200/80 group-hover:border-slate-900 flex items-center justify-center transition my-1">
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 group-hover:text-white transition" />
                    </div>

                    {/* Neutral Gray Accepted Answer Type Badges */}
                    <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 w-full">
                      {acceptedTypes.map((kind) => (
                        <span
                          key={kind}
                          className="winegrid-type-pill inline-flex items-center gap-1 rounded-full px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200/80"
                        >
                          {kind === "appellation" && (
                            <Wine className="winegrid-type-pill-icon w-3 h-3 text-slate-500 shrink-0" />
                          )}
                          {kind === "grape" && (
                            <Grape className="winegrid-type-pill-icon w-3 h-3 text-slate-500 shrink-0" />
                          )}
                          {kind === "producer" && (
                            <Castle className="winegrid-type-pill-icon w-3 h-3 text-slate-500 shrink-0" />
                          )}
                          {formatEntityTypeLabel(kind)}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </React.Fragment>
            );
          })}
        </div>

        {/* Sleek Bottom Floating Status & Controls Bar (Responsive on Mobile & Desktop) */}
        <div className="winegrid-safe-bottom bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
          <div className="grid grid-cols-3 sm:flex items-center gap-3 sm:gap-10 w-full sm:w-auto text-center sm:text-left">
            <div>
              <div className="text-[10px] sm:text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                {t("stat.missesLeft")}
              </div>
              <div className="font-display text-xl sm:text-2xl font-bold text-slate-900 mt-0.5 flex items-center justify-center sm:justify-start gap-1">
                {guessesRemaining}
                <span className="text-xs sm:text-sm font-normal text-slate-400">
                  {" "}
                  / {MISS_BUDGET}
                </span>
              </div>
            </div>

            <div className="hidden sm:block h-8 w-px bg-slate-200" />

            <div>
              <div className="text-[10px] sm:text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                {t("stat.solved")}
              </div>
              <div className="font-display text-xl sm:text-2xl font-bold text-emerald-600 mt-0.5">
                {correctCount}
                <span className="text-xs sm:text-sm font-normal text-slate-400"> / 9</span>
              </div>
            </div>

            <div className="hidden sm:block h-8 w-px bg-slate-200" />

            <div title={t("stat.rarityHint")}>
              <div className="text-[10px] sm:text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1">
                <Sparkles className="w-3 h-3 text-amber-500 shrink-0" /> {t("stat.rarity")}
              </div>
              <div className="text-[10px] font-medium text-slate-400 normal-case tracking-normal">
                {t("stat.rarityScale")}
              </div>
              <div className="font-display text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
                {formatDecimal(currentRarityScore, locale)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:flex items-center gap-2.5 w-full sm:w-auto">
            {!isRevealed && (
              <button
                type="button"
                onClick={handleRevealSolutions}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 px-3.5 sm:px-4 py-2.5 text-xs font-semibold text-slate-700 transition"
              >
                <Eye className="w-4 h-4 text-slate-500 shrink-0" />
                {t("action.reveal")}
              </button>
            )}

            <button
              type="button"
              onClick={handleShareResults}
              className={`inline-flex items-center justify-center gap-2 rounded-xl bg-wine-600 hover:bg-wine-700 px-4 sm:px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition ${
                isRevealed ? "col-span-2" : ""
              }`}
            >
              <Share2 className="w-4 h-4 shrink-0" />
              {shareState === "shared"
                ? t("action.shared")
                : shareState === "copied"
                ? t("action.copied")
                : t("action.share")}
            </button>
          </div>
        </div>
      </main>

      {/* Modals */}
      {activeCellIndex !== null && (
        <EntitySearchModal
          isOpen={true}
          onClose={() => setActiveCellIndex(null)}
          rowClue={board.rowClues[cells[activeCellIndex].row]}
          colClue={board.colClues[cells[activeCellIndex].col]}
          acceptedTypes={getCellAcceptedTypes(cells[activeCellIndex])}
          validEntityIds={validEntityIds(cells[activeCellIndex])}
          usedEntityIds={usedEntityIds}
          onSelectEntity={handleSelectEntity}
        />
      )}

      {inspectCellIndex !== null && (
        <CellInspectModal
          isOpen={true}
          onClose={() => setInspectCellIndex(null)}
          cell={cells[inspectCellIndex]}
          rowClue={board.rowClues[cells[inspectCellIndex].row]}
          colClue={board.colClues[cells[inspectCellIndex].col]}
        />
      )}

      <SommelierCodexModal
        isOpen={codexOpen}
        onClose={() => setCodexOpen(false)}
      />

      <AuthAndHistoryModal
        isOpen={authHistoryOpen}
        onClose={() => setAuthHistoryOpen(false)}
        userEmail={currentUser?.email ?? null}
        userId={currentUser?.id ?? null}
        anonId={anonId}
        history={history}
        stats={playerStats}
        onAuthChanged={(user) => {
          setCurrentUser(user);
          setHistory(getLocalHistory());
        }}
      />

      <ObservabilityDrawer
        isOpen={observabilityOpen}
        onClose={() => setObservabilityOpen(false)}
      />

      <HowToPlayModal isOpen={howToOpen} onClose={closeHowTo} />

      {feedback && (
        <div className="pointer-events-none fixed z-40 bottom-4 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md flex justify-end">
          <div
            role="status"
            aria-live="polite"
            className={`pointer-events-auto w-full max-w-lg rounded-2xl border p-3.5 sm:p-4 flex items-start justify-between gap-3 shadow-modal ${
              feedback.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                : feedback.type === "error"
                ? "bg-rose-50 border-rose-200 text-rose-950"
                : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            <div className="flex items-start gap-2.5 sm:gap-3">
              {feedback.type === "success" && (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              )}
              {feedback.type === "error" && (
                <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              {feedback.type === "info" && (
                <Info className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="font-display font-semibold text-xs sm:text-sm">
                  {feedback.title}
                </div>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5 leading-relaxed">
                  {feedback.detail}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-slate-400 hover:text-slate-600 p-1"
              aria-label={t("action.dismiss")}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
