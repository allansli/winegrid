"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import confetti from "canvas-confetti";
import {
  DifficultyLevel,
  EntityFilterMode,
  GameMode,
  GeneratedBoard,
  MatrixCell,
  WineEntity,
  WineEntityType,
} from "@/types/wine";
import { WINE_ENTITY_BY_ID } from "@/data/wineDatabase";
import { generateWineGridBoard } from "@/lib/matrixGenerator";
import {
  getOrCreateAnonId,
  initObservability,
  trackEvent,
} from "@/lib/observability";
import {
  GameHistoryEntry,
  computePlayerStats,
  getLocalHistory,
  loadActiveBoardState,
  recordAndCalculateCellRarity,
  saveActiveBoardState,
  saveGameSession,
} from "@/lib/storageAndSync";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { EntitySearchModal } from "./EntitySearchModal";
import { CellInspectModal } from "./CellInspectModal";
import { SommelierCodexModal } from "./SommelierCodexModal";
import { AuthAndHistoryModal } from "./AuthAndHistoryModal";
import { ObservabilityDrawer } from "./ObservabilityDrawer";
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
  isCompleted: boolean;
  isRevealed: boolean;
}

export function WineGridGame() {
  const [todayStr, setTodayStr] = useState<string>("2026-10-20");
  const [nextDailyCountdown, setNextDailyCountdown] = useState<string>("");
  const [mode, setMode] = useState<GameMode>("daily");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("wset3");
  const [entityFilter, setEntityFilter] = useState<EntityFilterMode>("all");
  const [unlimitedSeed, setUnlimitedSeed] = useState<string>("somm-1");

  const [sessionId, setSessionId] = useState<string>("");
  const [board, setBoard] = useState<GeneratedBoard | null>(null);
  const [cells, setCells] = useState<MatrixCell[]>([]);
  const [guessesRemaining, setGuessesRemaining] = useState<number>(10);
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
  const [copiedShare, setCopiedShare] = useState<boolean>(false);

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

    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    setTodayStr(`${yyyy}-${mm}-${dd}`);

    const updateCountdown = () => {
      const current = new Date();
      const curY = current.getFullYear();
      const curM = String(current.getMonth() + 1).padStart(2, "0");
      const curD = String(current.getDate()).padStart(2, "0");
      const currentDayStr = `${curY}-${curM}-${curD}`;
      setTodayStr((prev) => (prev !== currentDayStr ? currentDayStr : prev));

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

  const initBoard = useCallback(
    (
      targetMode: GameMode,
      targetDiff: DifficultyLevel,
      targetFilter: EntityFilterMode,
      targetSeed: string
    ) => {
      const seedToUse = targetMode === "daily" ? todayStr : targetSeed;
      const effDiff = targetMode === "daily" ? "wset3" : targetDiff;
      const effFilter = targetMode === "daily" ? "all" : targetFilter;

      const generated = generateWineGridBoard({
        seed: seedToUse,
        mode: targetMode,
        difficulty: effDiff,
        entityFilter: effFilter,
        boardDate: todayStr,
      });

      const saved = loadActiveBoardState<PersistedActiveState>(
        generated.boardId
      );
      if (saved && saved.cells && saved.cells.length === 9) {
        setSessionId(saved.sessionId);
        setBoard(generated);
        setCells(saved.cells);
        setGuessesRemaining(saved.guessesRemaining);
        setGuessesUsedCount(Math.max(0, 10 - saved.guessesRemaining));
        setIsCompleted(saved.isCompleted);
        setIsRevealed(saved.isRevealed);
      } else {
        const newSessionId = crypto.randomUUID();
        setSessionId(newSessionId);
        setBoard(generated);
        setCells(generated.cells);
        setGuessesRemaining(targetMode === "infinite" ? 999 : 10);
        setGuessesUsedCount(0);
        setIsCompleted(false);
        setIsRevealed(false);
        setFeedback(null);

        trackEvent("game_started", {
          board_id: generated.boardId,
          mode: targetMode,
          difficulty: effDiff,
          entity_filter: effFilter,
        });
      }
    },
    [todayStr]
  );

  useEffect(() => {
    if (!todayStr) return;
    initBoard(mode, difficulty, entityFilter, unlimitedSeed);
  }, [todayStr, mode, difficulty, entityFilter, unlimitedSeed, initBoard]);

  useEffect(() => {
    if (!board || !sessionId || cells.length !== 9) return;
    saveActiveBoardState(board.boardId, {
      sessionId,
      boardId: board.boardId,
      cells,
      guessesRemaining,
      isCompleted,
      isRevealed,
    });
  }, [board, sessionId, cells, guessesRemaining, isCompleted, isRevealed]);

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
      remainingGuesses: number,
      revealedByGiveUp = false
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

      setIsCompleted(true);
      if (won) {
        confetti({
          particleCount: 80,
          spread: 65,
          origin: { y: 0.6 },
        });
      }

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
        guessesUsed: 10 - remainingGuesses,
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

      trackEvent("game_completed", {
        board_id: board.boardId,
        mode: board.mode,
        difficulty: board.difficulty,
        correct_cells: solved,
        guesses_used: 10 - remainingGuesses,
        rarity_score: rarityTotal,
        is_won: won,
        revealed_by_give_up: revealedByGiveUp,
      });
    },
    [board, sessionId, todayStr, currentUser]
  );

  const handleSelectEntity = async (entity: WineEntity) => {
    if (activeCellIndex === null || !board || isCompleted) return;
    const cell = cells[activeCellIndex];
    const rowClue = board.rowClues[cell.row];
    const colClue = board.colClues[cell.col];

    setActiveCellIndex(null);

    const isInfinite = board.mode === "infinite";
    const isValid = cell.validEntityIds.includes(entity.id);
    const nextUsed = guessesUsedCount + 1;
    setGuessesUsedCount(nextUsed);
    const nextGuesses = isInfinite
      ? 999
      : Math.max(0, guessesRemaining - 1);
    setGuessesRemaining(nextGuesses);

    if (isValid) {
      const rarityPct = await recordAndCalculateCellRarity(
        rowClue.id,
        colClue.id,
        entity.id,
        cell.validEntityIds
      );

      const nextCells = cells.map((c, idx) =>
        idx === activeCellIndex
          ? {
              ...c,
              pickedEntityId: entity.id,
              pickedRarityPct: rarityPct,
              isLocked: true,
            }
          : c
      );

      setCells(nextCells);
      setFeedback({
        type: "success",
        title: `${entity.name} — ${rarityPct}% Pick Rate`,
        detail: entity.sommelierNote,
      });

      trackEvent("cell_guess_submitted", {
        board_id: board.boardId,
        cell_index: activeCellIndex,
        row_clue: rowClue.id,
        col_clue: colClue.id,
        entity_id: entity.id,
        entity_name: entity.canonicalName,
        is_correct: true,
        rarity_pct: rarityPct,
        guesses_remaining: nextGuesses,
      });

      const allNineSolved = nextCells.every((c) => Boolean(c.pickedEntityId));
      if (allNineSolved || (!isInfinite && nextGuesses === 0)) {
        await finalizeGame(
          nextCells,
          isInfinite ? Math.max(0, 10 - nextUsed) : nextGuesses,
          false
        );
      }
    } else {
      const matchesRow = rowClue.predicate(entity);
      const matchesCol = colClue.predicate(entity);
      let reason = "";
      if (!matchesRow && !matchesCol) {
        reason = `${entity.name} matches neither "${rowClue.shortLabel}" nor "${colClue.shortLabel}".`;
      } else if (!matchesRow) {
        reason = `${entity.name} fits "${colClue.shortLabel}", but not "${rowClue.label}".`;
      } else {
        reason = `${entity.name} fits "${rowClue.shortLabel}", but not "${colClue.label}".`;
      }

      setFeedback({
        type: "error",
        title: `Not quite — ${entity.name}`,
        detail: reason,
      });

      trackEvent("cell_guess_submitted", {
        board_id: board.boardId,
        cell_index: activeCellIndex,
        row_clue: rowClue.id,
        col_clue: colClue.id,
        entity_id: entity.id,
        entity_name: entity.canonicalName,
        is_correct: false,
        guesses_remaining: nextGuesses,
      });

      if (!isInfinite && nextGuesses === 0) {
        await finalizeGame(cells, 0, false);
      }
    }
  };

  const handleNewUnlimitedBoard = () => {
    const nextSeed = `somm-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    setUnlimitedSeed(nextSeed);
  };

  const handleRevealSolutions = async () => {
    setIsRevealed(true);
    if (!isCompleted) {
      await finalizeGame(cells, guessesRemaining, true);
    }
    setFeedback({
      type: "info",
      title: "Solutions Revealed",
      detail: "Click any cell on the grid to explore all valid answers and tasting notes.",
    });
  };

  const handleShareResults = async () => {
    if (!board) return;
    const rowsEmoji = [0, 1, 2]
      .map((r) =>
        [0, 1, 2]
          .map((c) => {
            const cell = cells[r * 3 + c];
            if (!cell?.pickedEntityId) return "⬜";
            if ((cell.pickedRarityPct ?? 50) < 12) return "🟨";
            return "🟩";
          })
          .join("")
      )
      .join("\n");

    const shareText = `WineGrid ${
      board.mode === "daily"
        ? `Daily (${todayStr})`
        : `Unlimited (${board.difficulty.toUpperCase()})`
    }\nScore: ${correctCount}/9 · Rarity: ${currentRarityScore}\n${rowsEmoji}`;

    try {
      await navigator.clipboard.writeText(shareText);
      setCopiedShare(true);
      trackEvent("share_results_copied", {
        board_id: board.boardId,
        correct_cells: correctCount,
        rarity_score: currentRarityScore,
      });
      setTimeout(() => setCopiedShare(false), 2500);
    } catch {
      // Ignore
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
    for (const id of cell.validEntityIds) {
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
    if (type === "appellation") return "Region";
    if (type === "grape") return "Grape";
    return "Producer";
  };

  if (!board) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-wine-50 border border-wine-100 flex items-center justify-center">
            <Wine className="w-6 h-6 text-wine-600 animate-pulse" />
          </div>
          <p className="font-display text-sm font-medium text-slate-500">
            Preparing WineGrid...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col">
      {/* Clean Minimal Big-Tech Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-slate-200/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-wine-600 flex items-center justify-center shadow-sm">
              <Wine className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-slate-900">
              WineGrid
            </span>
          </div>

          {/* Center Segmented Mode Pill */}
          <div className="flex items-center bg-slate-100 p-1 rounded-full border border-slate-200/60">
            <button
              type="button"
              onClick={() => setMode("daily")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                mode === "daily"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Daily
            </button>
            <button
              type="button"
              onClick={() => setMode("unlimited")}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                mode === "unlimited"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Unlimited (10)
            </button>
            <button
              type="button"
              onClick={() => setMode("infinite")}
              className={`inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                mode === "infinite"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <InfinityIcon className="w-3.5 h-3.5" /> Infinite
            </button>
          </div>

          {/* Right Action Pills */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setCodexOpen(true);
                trackEvent("codex_opened");
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200/80 px-3.5 py-2 text-xs font-medium text-slate-700 transition shadow-sm"
              title="Browse Wine Knowledge Graph"
            >
              <BookOpen className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Codex</span>
            </button>

            <button
              type="button"
              onClick={() => setObservabilityOpen(true)}
              className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-600 transition shadow-sm"
              title="Live Telemetry & Usage"
            >
              <Activity className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthHistoryOpen(true);
                trackEvent("auth_history_modal_opened");
              }}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 hover:bg-slate-800 px-4 py-2 text-xs font-semibold text-white transition shadow-sm"
            >
              <User className="w-3.5 h-3.5" />
              <span className="max-w-[100px] truncate">
                {currentUser ? currentUser.email.split("@")[0] : "Sign In"}
              </span>
              {playerStats.currentStreak > 0 && (
                <span className="inline-flex items-center gap-0.5 text-amber-300 font-bold">
                  <Flame className="w-3.5 h-3.5 fill-amber-400" />
                  {playerStats.currentStreak}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Spacious Wide Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-8 sm:py-10 space-y-6">
        {/* Unlimited / Infinite Mode Filter Bar */}
        {(mode === "unlimited" || mode === "infinite") && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-soft flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                {(
                  [
                    { id: "wset2", label: "Standard" },
                    { id: "wset3", label: "Sommelier" },
                    { id: "master_somm", label: "Master" },
                  ] as { id: DifficultyLevel; label: string }[]
                ).map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDifficulty(d.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                      difficulty === d.id
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                {(
                  [
                    { id: "all", label: "All" },
                    { id: "appellation", label: "Regions" },
                    { id: "grape", label: "Grapes" },
                    { id: "producer", label: "Estates" },
                  ] as { id: EntityFilterMode; label: string }[]
                ).map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setEntityFilter(f.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
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

            <button
              type="button"
              onClick={handleNewUnlimitedBoard}
              className="inline-flex items-center gap-1.5 rounded-xl bg-wine-600 hover:bg-wine-700 px-4 py-2 text-xs font-semibold text-white shadow-sm transition"
            >
              <RefreshCw className="w-3.5 h-3.5" /> New Board
            </button>
          </div>
        )}

        {/* Toast Feedback Banner */}
        {feedback && (
          <div
            className={`rounded-2xl border p-4 flex items-start justify-between gap-4 shadow-soft transition-all ${
              feedback.type === "success"
                ? "bg-emerald-50/90 border-emerald-200 text-emerald-950"
                : feedback.type === "error"
                ? "bg-rose-50/90 border-rose-200 text-rose-950"
                : "bg-slate-100 border-slate-200 text-slate-900"
            }`}
          >
            <div className="flex items-start gap-3">
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
                <div className="font-display font-semibold text-sm">
                  {feedback.title}
                </div>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5 leading-relaxed">
                  {feedback.detail}
                </p>
              </div>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="text-slate-400 hover:text-slate-600 p-1"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* THE 3x3 MATRIX GRID */}
        <div className="grid grid-cols-4 lg:grid-cols-[240px_1fr_1fr_1fr] gap-3 sm:gap-5">
          {/* Top-Left Corner Info */}
          <div className="rounded-3xl bg-slate-100/70 border border-slate-200/70 p-4 sm:p-6 flex flex-col justify-between">
            <div>
              <span className="inline-flex items-center rounded-full bg-wine-50 border border-wine-200/70 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-wine-700">
                {board.mode === "daily"
                  ? "Daily Grid"
                  : board.mode === "infinite"
                  ? "Infinite Mode"
                  : "Practice"}
              </span>
              <div className="font-display text-base sm:text-xl font-bold text-slate-900 mt-2">
                {board.mode === "daily" ? todayStr : "Custom 3×3"}
              </div>
            </div>
            {board.mode === "daily" && nextDailyCountdown && (
              <div className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 mt-3 pt-3 border-t border-slate-200/70">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Next in</span>
                <span className="font-mono font-semibold text-slate-800">
                  {nextDailyCountdown}
                </span>
              </div>
            )}
          </div>

          {/* 3 Column Headers */}
          {board.colClues.map((colClue) => (
            <div
              key={colClue.id}
              className="group relative rounded-3xl bg-white border border-slate-200/90 p-4 sm:p-6 flex flex-col justify-between shadow-soft hover:border-slate-300 transition"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {colClue.category.replace("_", " ")}
                </span>
                <HelpCircle className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition shrink-0" />
              </div>
              <div className="mt-3">
                <div className="font-display font-bold text-sm sm:text-lg text-slate-900 leading-snug">
                  {colClue.shortLabel}
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed hidden md:block">
                  {colClue.label}
                </p>
              </div>

              {/* Clean Light Tooltip */}
              <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute left-1/2 -translate-x-1/2 bottom-full mb-2.5 w-72 z-40 rounded-2xl bg-slate-900 p-4 text-xs text-white shadow-xl">
                <div className="font-semibold text-rose-300 mb-1">
                  {colClue.label}
                </div>
                <p className="text-slate-200 leading-relaxed">{colClue.tooltip}</p>
              </div>
            </div>
          ))}

          {/* 3 Rows */}
          {board.rowClues.map((rowClue, rIdx) => (
            <React.Fragment key={rowClue.id}>
              {/* Row Header */}
              <div className="group relative rounded-3xl bg-white border border-slate-200/90 p-4 sm:p-6 flex flex-col justify-between shadow-soft hover:border-slate-300 transition">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    {rowClue.category.replace("_", " ")}
                  </span>
                  <HelpCircle className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition shrink-0" />
                </div>
                <div className="mt-3">
                  <div className="font-display font-bold text-sm sm:text-lg text-slate-900 leading-snug">
                    {rowClue.shortLabel}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed hidden md:block">
                    {rowClue.label}
                  </p>
                </div>

                {/* Clean Light Tooltip */}
                <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute left-0 bottom-full mb-2.5 w-72 z-40 rounded-2xl bg-slate-900 p-4 text-xs text-white shadow-xl">
                  <div className="font-semibold text-rose-300 mb-1">
                    {rowClue.label}
                  </div>
                  <p className="text-slate-200 leading-relaxed">{rowClue.tooltip}</p>
                </div>
              </div>

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
                      className="min-h-[140px] sm:min-h-[172px] rounded-3xl bg-emerald-50/70 hover:bg-emerald-50 border-2 border-emerald-500/40 p-4 sm:p-6 flex flex-col justify-between text-left transition-all shadow-soft"
                    >
                      <div className="flex items-center justify-between gap-2 w-full">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700">
                          {pickedEntity.country} &bull;{" "}
                          {formatEntityTypeLabel(pickedEntity.entityType)}
                        </span>
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded-full shrink-0 ${getRarityPillStyle(
                            cell.pickedRarityPct
                          )}`}
                        >
                          {cell.pickedRarityPct}%
                        </span>
                      </div>

                      <div className="my-2">
                        <div className="font-display font-bold text-sm sm:text-lg text-slate-900 leading-snug">
                          {pickedEntity.canonicalName}
                        </div>
                        <div className="text-xs text-slate-500 mt-1 hidden sm:block">
                          {pickedEntity.macroRegion}
                        </div>
                      </div>

                      <div className="text-xs font-medium text-emerald-700">
                        View tasting note &rarr;
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
                      className="min-h-[140px] sm:min-h-[172px] rounded-3xl bg-amber-50/60 hover:bg-amber-50 border border-amber-300/80 p-4 sm:p-6 flex flex-col justify-between text-left transition-all shadow-soft"
                    >
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">
                        Revealed &bull;{" "}
                        {formatEntityTypeLabel(sampleSolutionEntity.entityType)}
                      </span>
                      <div className="my-2">
                        <div className="font-display font-bold text-sm sm:text-lg text-slate-900 leading-snug">
                          {sampleSolutionEntity.canonicalName}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {sampleSolutionEntity.country} &bull;{" "}
                          {sampleSolutionEntity.macroRegion}
                        </div>
                      </div>
                      <span className="text-xs font-medium text-amber-800">
                        +{cell.validEntityIds.length} valid options &rarr;
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
                    className="group min-h-[140px] sm:min-h-[172px] rounded-3xl bg-white hover:bg-slate-50/70 border border-slate-200/90 hover:border-slate-300 p-4 sm:p-6 flex flex-col items-center justify-between text-center transition-all duration-200 shadow-soft hover:shadow-card hover:-translate-y-0.5 disabled:opacity-50"
                  >
                    <div className="text-xs font-semibold text-slate-400 group-hover:text-slate-600 transition">
                      {cell?.validEntityIds.length ?? 0} possible
                    </div>

                    <div className="w-11 h-11 rounded-full bg-slate-50 group-hover:bg-slate-900 border border-slate-200/80 group-hover:border-slate-900 flex items-center justify-center transition">
                      <Plus className="w-5 h-5 text-slate-400 group-hover:text-white transition" />
                    </div>

                    {/* Neutral Gray Accepted Answer Type Badges */}
                    <div className="flex flex-wrap items-center justify-center gap-1.5 w-full">
                      {acceptedTypes.map((t) => (
                        <span
                          key={t}
                          className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200/80"
                        >
                          {t === "appellation" && (
                            <Wine className="w-3 h-3 text-slate-500 shrink-0" />
                          )}
                          {t === "grape" && (
                            <Grape className="w-3 h-3 text-slate-500 shrink-0" />
                          )}
                          {t === "producer" && (
                            <Castle className="w-3 h-3 text-slate-500 shrink-0" />
                          )}
                          {formatEntityTypeLabel(t)}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </React.Fragment>
          ))}
        </div>

        {/* Sleek Bottom Floating Status & Controls Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-6 sm:gap-10">
            <div>
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                {board.mode === "infinite" ? "Guesses Limit" : "Guesses Left"}
              </div>
              <div className="font-display text-2xl font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                {board.mode === "infinite" ? (
                  <>
                    <InfinityIcon className="w-6 h-6 text-slate-900" />
                    <span className="text-xs font-normal text-slate-400">
                      ({guessesUsedCount} used)
                    </span>
                  </>
                ) : (
                  <>
                    {guessesRemaining}
                    <span className="text-sm font-normal text-slate-400">
                      {" "}
                      / 10
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="h-8 w-px bg-slate-200" />

            <div>
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Solved
              </div>
              <div className="font-display text-2xl font-bold text-emerald-600 mt-0.5">
                {correctCount}
                <span className="text-sm font-normal text-slate-400"> / 9</span>
              </div>
            </div>

            <div className="h-8 w-px bg-slate-200" />

            <div>
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" /> Rarity Score
              </div>
              <div className="font-display text-2xl font-bold text-slate-900 mt-0.5">
                {currentRarityScore}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {!isRevealed && (
              <button
                type="button"
                onClick={handleRevealSolutions}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 px-4 py-2.5 text-xs font-semibold text-slate-700 transition"
              >
                <Eye className="w-4 h-4 text-slate-500" />
                Reveal Answers
              </button>
            )}

            <button
              type="button"
              onClick={handleShareResults}
              className="inline-flex items-center gap-2 rounded-xl bg-wine-600 hover:bg-wine-700 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition"
            >
              <Share2 className="w-4 h-4" />
              {copiedShare ? "Copied!" : "Share Score"}
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
          entityFilter={board.entityFilter}
          acceptedTypes={getCellAcceptedTypes(cells[activeCellIndex])}
          validCount={cells[activeCellIndex]?.validEntityIds.length ?? 0}
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
    </div>
  );
}
