"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import confetti from "canvas-confetti";
import {
  DifficultyLevel,
  EntityFilterMode,
  GeneratedBoard,
  MatrixCell,
  WineEntity,
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
  Award,
  BookOpen,
  Calendar,
  Castle,
  CheckCircle2,
  Eye,
  Flame,
  Grape,
  HelpCircle,
  Info,
  LogIn,
  RefreshCw,
  Share2,
  Sparkles,
  Trophy,
  UserCheck,
  Wine,
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
  // Game configuration state
  const [todayStr, setTodayStr] = useState<string>("2026-10-20");
  const [mode, setMode] = useState<"daily" | "unlimited">("daily");
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("wset3");
  const [entityFilter, setEntityFilter] = useState<EntityFilterMode>("all");
  const [unlimitedSeed, setUnlimitedSeed] = useState<string>("somm-1");

  // Active board & gameplay state
  const [sessionId, setSessionId] = useState<string>("");
  const [board, setBoard] = useState<GeneratedBoard | null>(null);
  const [cells, setCells] = useState<MatrixCell[]>([]);
  const [guessesRemaining, setGuessesRemaining] = useState<number>(10);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);

  // Feedback banner (explains exact sommelier reason on right/wrong guess!)
  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | "info";
    title: string;
    detail: string;
  } | null>(null);

  // Modals state
  const [activeCellIndex, setActiveCellIndex] = useState<number | null>(null);
  const [inspectCellIndex, setInspectCellIndex] = useState<number | null>(null);
  const [codexOpen, setCodexOpen] = useState<boolean>(false);
  const [authHistoryOpen, setAuthHistoryOpen] = useState<boolean>(false);
  const [observabilityOpen, setObservabilityOpen] = useState<boolean>(false);
  const [copiedShare, setCopiedShare] = useState<boolean>(false);

  // User & History state
  const [anonId, setAnonId] = useState<string>("anon_guest");
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    email: string;
  } | null>(null);
  const [history, setHistory] = useState<GameHistoryEntry[]>([]);

  // Initialize observability, anonId, auth session, and today's date
  useEffect(() => {
    // Unregister any leftover Service Workers from older localhost:3000 projects
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

    setHistory(getLocalHistory());

    // Check Demo User or Supabase User
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
  }, []);

  // Load or generate board when mode/difficulty/filter/seed changes
  const initBoard = useCallback(
    (
      targetMode: "daily" | "unlimited",
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
        setIsCompleted(saved.isCompleted);
        setIsRevealed(saved.isRevealed);
      } else {
        const newSessionId = crypto.randomUUID();
        setSessionId(newSessionId);
        setBoard(generated);
        setCells(generated.cells);
        setGuessesRemaining(10);
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

  // Persist active board state on change
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

  // GeoGrid Rarity Score: sum of rarity % for solved cells + 100 for each unsolved cell
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
          particleCount: 90,
          spread: 70,
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

  // Handle selecting an entity for activeCellIndex
  const handleSelectEntity = async (entity: WineEntity) => {
    if (activeCellIndex === null || !board || isCompleted) return;
    const cell = cells[activeCellIndex];
    const rowClue = board.rowClues[cell.row];
    const colClue = board.colClues[cell.col];

    setActiveCellIndex(null);

    const isValid = cell.validEntityIds.includes(entity.id);
    const nextGuesses = Math.max(0, guessesRemaining - 1);
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
        title: ` Correct! ${entity.name} (${rarityPct}% Global Pick Rate)`,
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
      if (allNineSolved || nextGuesses === 0) {
        await finalizeGame(nextCells, nextGuesses, false);
      }
    } else {
      // Explain specifically which clue(s) failed so the player learns sommelier theory!
      const matchesRow = rowClue.predicate(entity);
      const matchesCol = colClue.predicate(entity);
      let reason = "";
      if (!matchesRow && !matchesCol) {
        reason = `${entity.name} satisfies neither "${rowClue.shortLabel}" nor "${colClue.shortLabel}".`;
      } else if (!matchesRow) {
        reason = `${entity.name} matches "${colClue.shortLabel}", but does NOT satisfy Row Criterion "${rowClue.label}".`;
      } else {
        reason = `${entity.name} matches "${rowClue.shortLabel}", but does NOT satisfy Column Criterion "${colClue.label}".`;
      }

      setFeedback({
        type: "error",
        title: `Incorrect Guess: ${entity.name}`,
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

      if (nextGuesses === 0) {
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
      title: "Sommelier Cellar Solutions Unlocked",
      detail:
        "Click any of the 9 cells on the grid to inspect all valid Appellations, Grape Varieties, and Iconic Estates for that intersection!",
    });
  };

  const handleShareResults = async () => {
    if (!board) return;
    const rowsEmoji = [0, 1, 2]
      .map((r) =>
        [0, 1, 2]
          .map((c) => {
            const cell = cells[r * 3 + c];
            if (!cell?.pickedEntityId) return "⬛";
            if ((cell.pickedRarityPct ?? 50) < 12) return "🟨"; // Gold/Legendary rarity
            return "🍷";
          })
          .join("")
      )
      .join("\n");

    const shareText = `WineGrid ${
      board.mode === "daily" ? `Daily (${todayStr})` : `Unlimited (${board.difficulty.toUpperCase()})`
    }\nScore: ${correctCount}/9 | Rarity: ${currentRarityScore}\n${rowsEmoji}\nPlay WineGrid!`;

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
      // Ignore clipboard error
    }
  };

  const getRarityBadgeColor = (pct: number | null) => {
    if (pct === null) return "bg-zinc-800 text-zinc-300";
    if (pct < 10)
      return "bg-gradient-to-r from-amber-500/30 to-champagne-500/30 text-champagne-200 border border-champagne-400/60";
    if (pct < 22)
      return "bg-purple-950/80 text-purple-200 border border-purple-500/50";
    if (pct < 40)
      return "bg-emerald-950/80 text-emerald-200 border border-emerald-500/50";
    return "bg-burgundy-950/80 text-burgundy-200 border border-burgundy-600/40";
  };

  if (!board) {
    return (
      <div className="min-h-screen bg-cellar-950 text-white flex items-center justify-center">
        <div className="text-center space-y-2">
          <Wine className="w-10 h-10 text-champagne-400 animate-pulse mx-auto" />
          <div className="font-serif text-lg text-champagne-100">
            Decanting Sommelier Matrix...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cellar-950 text-zinc-100 flex flex-col selection:bg-burgundy-700 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-white/10 bg-cellar-900/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-burgundy-600 to-burgundy-900 border border-champagne-400/40 flex items-center justify-center shadow-lg">
              <Wine className="w-5 h-5 text-champagne-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Wine<span className="text-champagne-400">Grid</span>
                </h1>
                <span className="hidden sm:inline-flex items-center rounded-full bg-burgundy-950 border border-burgundy-700/60 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-champagne-300">
                  Master Sommelier Edition
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block">
                The Oenological Matrix Game &bull; Appellations, Noble Grapes &amp; Iconic Estates
              </p>
            </div>
          </div>

          {/* Mode Switcher & Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Daily vs Unlimited */}
            <div className="flex rounded-xl bg-cellar-950 p-1 border border-white/10">
              <button
                type="button"
                onClick={() => setMode("daily")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  mode === "daily"
                    ? "bg-gradient-to-r from-burgundy-700 to-burgundy-600 text-white shadow"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Calendar className="w-3.5 h-3.5" /> Daily Vintage
              </button>
              <button
                type="button"
                onClick={() => setMode("unlimited")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  mode === "unlimited"
                    ? "bg-gradient-to-r from-burgundy-700 to-burgundy-600 text-white shadow"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" /> Unlimited Matrix
              </button>
            </div>

            {/* Codex Button */}
            <button
              type="button"
              onClick={() => {
                setCodexOpen(true);
                trackEvent("codex_opened");
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-cellar-950 hover:bg-white/5 px-3 py-2 text-xs font-medium text-champagne-200 transition"
              title="Open Master Sommelier Codex"
            >
              <BookOpen className="w-4 h-4 text-champagne-400" />
              <span className="hidden md:inline">Codex (123)</span>
            </button>

            {/* Observability Button */}
            <button
              type="button"
              onClick={() => setObservabilityOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-cellar-950 hover:bg-white/5 px-3 py-2 text-xs font-medium text-zinc-300 transition"
              title="Live Usage & Telemetry Stream"
            >
              <Activity className="w-4 h-4 text-emerald-400" />
              <span className="hidden lg:inline">Telemetry</span>
            </button>

            {/* Auth & Historical Cellar Button */}
            <button
              type="button"
              onClick={() => {
                setAuthHistoryOpen(true);
                trackEvent("auth_history_modal_opened");
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-champagne-500/30 bg-gradient-to-r from-burgundy-950 to-cellar-900 hover:border-champagne-400/60 px-3.5 py-2 text-xs font-semibold text-white transition"
            >
              {currentUser ? (
                <>
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span className="max-w-[110px] truncate">{currentUser.email}</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 text-champagne-400" />
                  <span>Guest Cellar ({history.length})</span>
                </>
              )}
              {playerStats.currentStreak > 0 && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[10px] text-amber-300">
                  <Flame className="w-3 h-3" /> {playerStats.currentStreak}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-6 py-6 space-y-6">
        {/* Unlimited Mode Controls Bar */}
        {mode === "unlimited" && (
          <div className="rounded-2xl border border-champagne-500/25 bg-cellar-900/90 p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Difficulty Selector */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-zinc-400 font-semibold mb-1">
                  Sommelier Exam Tier
                </label>
                <div className="flex rounded-xl bg-cellar-950 p-1 border border-white/10">
                  {(
                    [
                      { id: "wset2", label: "WSET L2" },
                      { id: "wset3", label: "WSET L3" },
                      { id: "master_somm", label: "Master Somm" },
                    ] as { id: DifficultyLevel; label: string }[]
                  ).map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setDifficulty(d.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                        difficulty === d.id
                          ? "bg-burgundy-700 text-white"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Entity Filter Selector */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-zinc-400 font-semibold mb-1">
                  Answer Pool Mode
                </label>
                <div className="flex rounded-xl bg-cellar-950 p-1 border border-white/10">
                  {(
                    [
                      { id: "all", label: "All Entities" },
                      { id: "appellation", label: "Appellations" },
                      { id: "grape", label: "Grapes" },
                      { id: "producer", label: "Estates" },
                    ] as { id: EntityFilterMode; label: string }[]
                  ).map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setEntityFilter(f.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                        entityFilter === f.id
                          ? "bg-champagne-600 text-white"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleNewUnlimitedBoard}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-champagne-600 to-champagne-500 hover:from-champagne-500 hover:to-champagne-400 px-4 py-2.5 text-xs font-bold text-cellar-950 shadow-lg transition"
            >
              <RefreshCw className="w-4 h-4" /> Generate New 3&times;3 Matrix
            </button>
          </div>
        )}

        {/* Live Feedback Banner */}
        {feedback && (
          <div
            className={`rounded-2xl border p-4 flex items-start justify-between gap-3 transition-all ${
              feedback.type === "success"
                ? "border-emerald-500/40 bg-emerald-950/30 text-emerald-100"
                : feedback.type === "error"
                ? "border-rose-500/40 bg-rose-950/30 text-rose-100"
                : "border-champagne-500/40 bg-champagne-950/20 text-champagne-100"
            }`}
          >
            <div className="flex items-start gap-3">
              {feedback.type === "success" && (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              )}
              {feedback.type === "error" && (
                <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              {feedback.type === "info" && (
                <Info className="w-5 h-5 text-champagne-400 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="font-serif font-bold text-sm sm:text-base">
                  {feedback.title}
                </div>
                <p className="text-xs sm:text-sm text-zinc-200/90 mt-0.5 leading-relaxed">
                  {feedback.detail}
                </p>
              </div>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="text-xs text-zinc-400 hover:text-white px-2 py-1"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* THE 3x3 SOMMELIER MATRIX GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Matrix Table (9 columns on lg) */}
          <div className="lg:col-span-9">
            <div className="grid grid-cols-4 gap-2 sm:gap-3">
              {/* Top-Left Corner Cell: Mode & Rank Badge */}
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-cellar-900 to-cellar-950 p-2.5 sm:p-4 flex flex-col justify-between">
                <div className="text-[10px] uppercase tracking-widest text-champagne-400 font-semibold">
                  {board.mode === "daily" ? "Daily Vintage" : "Custom Matrix"}
                </div>
                <div className="my-1">
                  <div className="font-serif font-bold text-xs sm:text-sm text-white leading-snug">
                    {board.mode === "daily"
                      ? todayStr
                      : board.difficulty.replace("_", " ").toUpperCase()}
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5 capitalize">
                    Pool: {board.entityFilter}
                  </div>
                </div>
                <div className="text-[10px] text-zinc-500 hidden sm:block">
                  Tap any cell to guess
                </div>
              </div>

              {/* 3 Column Clue Headers */}
              {board.colClues.map((colClue, cIdx) => (
                <div
                  key={colClue.id}
                  className="group relative rounded-2xl border border-champagne-500/30 bg-gradient-to-b from-burgundy-950/90 to-cellar-900 p-2.5 sm:p-4 flex flex-col justify-between shadow-md"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[9px] sm:text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/40 text-champagne-300 border border-champagne-500/20 font-semibold truncate">
                      {colClue.category.replace("_", " ")}
                    </span>
                    <HelpCircle className="w-3.5 h-3.5 text-zinc-400 group-hover:text-champagne-300 shrink-0" />
                  </div>
                  <div className="font-serif font-bold text-xs sm:text-base text-white mt-2 leading-snug">
                    {colClue.shortLabel}
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-1 line-clamp-2 hidden sm:block">
                    {colClue.label}
                  </div>

                  {/* Hover Tooltip */}
                  <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-60 z-40 rounded-xl bg-black/95 border border-champagne-500/40 p-3 text-xs text-zinc-200 shadow-xl">
                    <div className="font-bold text-champagne-300 mb-1">
                      Column {cIdx + 1}: {colClue.label}
                    </div>
                    {colClue.tooltip}
                  </div>
                </div>
              ))}

              {/* 3 Rows (Each Row Header + 3 Interactive Cells) */}
              {board.rowClues.map((rowClue, rIdx) => (
                <React.Fragment key={rowClue.id}>
                  {/* Row Clue Header */}
                  <div className="group relative rounded-2xl border border-champagne-500/30 bg-gradient-to-r from-burgundy-950/90 to-cellar-900 p-2.5 sm:p-4 flex flex-col justify-between shadow-md">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[9px] sm:text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/40 text-champagne-300 border border-champagne-500/20 font-semibold truncate">
                        {rowClue.category.replace("_", " ")}
                      </span>
                      <HelpCircle className="w-3.5 h-3.5 text-zinc-400 group-hover:text-champagne-300 shrink-0" />
                    </div>
                    <div className="font-serif font-bold text-xs sm:text-base text-white mt-2 leading-snug">
                      {rowClue.shortLabel}
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-1 line-clamp-2 hidden sm:block">
                      {rowClue.label}
                    </div>

                    {/* Hover Tooltip */}
                    <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute left-full ml-2 top-1/2 -translate-y-1/2 w-60 z-40 rounded-xl bg-black/95 border border-champagne-500/40 p-3 text-xs text-zinc-200 shadow-xl">
                      <div className="font-bold text-champagne-300 mb-1">
                        Row {rIdx + 1}: {rowClue.label}
                      </div>
                      {rowClue.tooltip}
                    </div>
                  </div>

                  {/* 3 Cells in this Row */}
                  {[0, 1, 2].map((cIdx) => {
                    const cellIndex = rIdx * 3 + cIdx;
                    const cell = cells[cellIndex];
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
                          className="group relative min-h-[108px] sm:min-h-[132px] rounded-2xl border-2 border-emerald-500/60 bg-gradient-to-br from-emerald-950/60 via-cellar-900 to-cellar-950 p-2.5 sm:p-3.5 flex flex-col justify-between text-left hover:border-emerald-400 transition shadow-lg"
                        >
                          <div className="flex items-center justify-between gap-1 w-full">
                            <span className="text-[10px] font-semibold text-emerald-300 uppercase tracking-wider truncate">
                              {pickedEntity.country}
                            </span>
                            <span
                              className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${getRarityBadgeColor(
                                cell.pickedRarityPct
                              )}`}
                            >
                              {cell.pickedRarityPct}%
                            </span>
                          </div>

                          <div className="my-1">
                            <div className="font-serif font-bold text-xs sm:text-base text-white leading-tight line-clamp-2">
                              {pickedEntity.canonicalName}
                            </div>
                            <div className="text-[10px] text-zinc-400 mt-0.5 truncate hidden sm:block">
                              {pickedEntity.macroRegion}
                            </div>
                          </div>

                          <div className="flex items-center justify-between w-full text-[10px] text-emerald-300/80">
                            <span className="capitalize flex items-center gap-1">
                              {pickedEntity.entityType === "appellation" && (
                                <Wine className="w-3 h-3" />
                              )}
                              {pickedEntity.entityType === "grape" && (
                                <Grape className="w-3 h-3" />
                              )}
                              {pickedEntity.entityType === "producer" && (
                                <Castle className="w-3 h-3" />
                              )}
                              <span className="hidden sm:inline">
                                {pickedEntity.entityType}
                              </span>
                            </span>
                            <span className="underline decoration-dotted">
                              Notes
                            </span>
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
                          className="min-h-[108px] sm:min-h-[132px] rounded-2xl border border-champagne-500/40 bg-gradient-to-br from-burgundy-950/50 to-cellar-950 p-2.5 sm:p-3.5 flex flex-col justify-between text-left hover:border-champagne-400 transition"
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="text-[10px] uppercase tracking-wider text-champagne-400 font-semibold">
                              Revealed
                            </span>
                            <span className="text-[10px] text-zinc-400">
                              {cell.validEntityIds.length} valid
                            </span>
                          </div>
                          <div>
                            <div className="font-serif font-bold text-xs sm:text-sm text-champagne-100 leading-tight line-clamp-2">
                              {sampleSolutionEntity.canonicalName}
                            </div>
                            <div className="text-[10px] text-zinc-400 mt-0.5 truncate">
                              {sampleSolutionEntity.country}
                            </div>
                          </div>
                          <div className="text-[10px] text-champagne-300 underline decoration-dotted">
                            See all {cell.validEntityIds.length} answers
                          </div>
                        </button>
                      );
                    }

                    return (
                      <button
                        key={cellIndex}
                        type="button"
                        disabled={isCompleted}
                        onClick={() => setActiveCellIndex(cellIndex)}
                        className="group min-h-[108px] sm:min-h-[132px] rounded-2xl border border-white/10 hover:border-champagne-400/60 bg-cellar-900/70 hover:bg-burgundy-950/40 p-2.5 sm:p-3.5 flex flex-col items-center justify-center text-center transition relative overflow-hidden disabled:opacity-50"
                      >
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/5 group-hover:bg-champagne-500/20 border border-white/10 group-hover:border-champagne-400/40 flex items-center justify-center transition">
                          <Wine className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-500 group-hover:text-champagne-300 transition" />
                        </div>
                        <span className="mt-2 text-[11px] font-medium text-zinc-400 group-hover:text-champagne-200">
                          Guess Wine
                        </span>
                        <span className="mt-0.5 text-[10px] text-zinc-500">
                          {cell?.validEntityIds.length ?? 0} possible
                        </span>
                      </button>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Right Column: Live Sommelier Scoreboard & Actions (3 columns on lg) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="rounded-2xl border border-champagne-500/30 bg-cellar-900 p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-champagne-400 font-semibold">
                    Tasting Scoreboard
                  </div>
                  <div className="font-serif text-lg font-bold text-white">
                    {isCompleted ? "Tasting Complete" : "In Progress"}
                  </div>
                </div>
                <Trophy className="w-6 h-6 text-champagne-400" />
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 lg:grid-cols-1 gap-3">
                <div className="rounded-xl bg-cellar-950 border border-white/10 p-3 flex items-center justify-between">
                  <span className="text-xs text-zinc-400">Guesses Left</span>
                  <span className="text-xl font-bold text-champagne-300 font-mono">
                    {guessesRemaining} / 10
                  </span>
                </div>

                <div className="rounded-xl bg-cellar-950 border border-white/10 p-3 flex items-center justify-between">
                  <span className="text-xs text-zinc-400">Cells Solved</span>
                  <span className="text-xl font-bold text-emerald-400 font-mono">
                    {correctCount} / 9
                  </span>
                </div>

                <div className="rounded-xl bg-cellar-950 border border-champagne-500/30 p-3 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-champagne-200 block">
                      Rarity Score
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      Lower = Rarer Picks
                    </span>
                  </div>
                  <span className="text-xl font-bold text-champagne-400 font-mono">
                    {currentRarityScore}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleShareResults}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-burgundy-700 to-burgundy-600 hover:from-burgundy-600 hover:to-burgundy-500 px-4 py-2.5 text-xs font-semibold text-white shadow transition"
                >
                  <Share2 className="w-4 h-4" />
                  {copiedShare
                    ? "Copied Matrix to Clipboard!"
                    : "Share Sommelier Grid"}
                </button>

                {!isRevealed && (
                  <button
                    type="button"
                    onClick={handleRevealSolutions}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-4 py-2 text-xs font-medium text-zinc-300 hover:text-white transition"
                  >
                    <Eye className="w-4 h-4 text-champagne-400" />
                    Reveal All Cell Answers
                  </button>
                )}
              </div>

              {/* Sommelier Standing Card */}
              <div className="rounded-xl bg-gradient-to-br from-burgundy-950/60 to-cellar-950 border border-white/10 p-3.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-champagne-300">
                  <Award className="w-4 h-4" />
                  {playerStats.sommelierRank}
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  {currentUser
                    ? `Signed in & syncing all grids to ${currentUser.email}.`
                    : "Playing anonymously. Open Guest Cellar to sign in and keep your history across devices!"}
                </p>
              </div>
            </div>
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
