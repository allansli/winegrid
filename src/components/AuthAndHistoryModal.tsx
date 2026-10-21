"use client";

import React, { useState } from "react";
import {
  GameHistoryEntry,
  PlayerStatsSummary,
  mergeAnonymousHistoryOnSignIn,
} from "@/lib/storageAndSync";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { identifyObservabilityUser, trackEvent } from "@/lib/observability";
import {
  Award,
  Calendar,
  CheckCircle2,
  Flame,
  History,
  LogIn,
  LogOut,
  Mail,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserCheck,
  X,
} from "lucide-react";

interface AuthAndHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string | null;
  userId: string | null;
  anonId: string;
  history: GameHistoryEntry[];
  stats: PlayerStatsSummary;
  onAuthChanged: (user: { id: string; email: string } | null) => void;
}

export function AuthAndHistoryModal({
  isOpen,
  onClose,
  userEmail,
  userId,
  anonId,
  history,
  stats,
  onAuthChanged,
}: AuthAndHistoryModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const supabaseReady = isSupabaseConfigured();
  const unclaimedAnonCount = history.filter((h) => !h.userId).length;

  const handleSupabaseAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setStatusMessage(null);

    const supabase = getSupabaseBrowserClient();
    if (supabase && supabaseReady) {
      try {
        if (authMode === "signup") {
          const { data, error } = await supabase.auth.signUp({
            email: email.trim(),
            password: password || "WineGridSomm2026!",
          });
          if (error) throw error;
          if (data.user) {
            const claimed = await mergeAnonymousHistoryOnSignIn(data.user.id);
            identifyObservabilityUser(data.user.id, email.trim());
            onAuthChanged({ id: data.user.id, email: email.trim() });
            setStatusMessage(
              `Welcome! Account created & ${claimed} anonymous cellar session(s) merged into your profile.`
            );
          } else {
            setStatusMessage(
              "Check your email inbox to confirm your Supabase Sommelier account!"
            );
          }
        } else {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });
          if (error) throw error;
          if (data.user) {
            const claimed = await mergeAnonymousHistoryOnSignIn(data.user.id);
            identifyObservabilityUser(data.user.id, email.trim());
            onAuthChanged({ id: data.user.id, email: email.trim() });
            setStatusMessage(
              `Signed in! Synced ${claimed} anonymous session(s) to your historical cellar.`
            );
          }
        }
      } catch (err: any) {
        setStatusMessage(err?.message || "Authentication failed.");
      } finally {
        setLoading(false);
      }
    } else {
      // Local Demo Auth fallback before Supabase env vars are added
      const simulatedId = `somm_${email.trim().toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
      const claimed = await mergeAnonymousHistoryOnSignIn(simulatedId);
      identifyObservabilityUser(simulatedId, email.trim());
      window.localStorage.setItem(
        "winegrid_demo_user",
        JSON.stringify({ id: simulatedId, email: email.trim() })
      );
      onAuthChanged({ id: simulatedId, email: email.trim() });
      setLoading(false);
      setStatusMessage(
        `Signed in (${claimed} anonymous session(s) merged into your historical profile)!`
      );
    }
  };

  const handleSignOut = async () => {
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    window.localStorage.removeItem("winegrid_demo_user");
    trackEvent("user_signed_out", { previous_user_id: userId });
    onAuthChanged(null);
    setStatusMessage("Signed out. Playing in Anonymous Sommelier mode.");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[88vh] flex flex-col rounded-2xl border border-champagne-500/30 bg-cellar-900 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-burgundy-950 via-cellar-900 to-burgundy-950 px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest text-champagne-400 font-semibold flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5" /> Sommelier Cellar & Historical Passport
            </div>
            <h2 className="text-xl font-serif font-bold text-white mt-0.5">
              {userEmail ? `Cellar of ${userEmail}` : "Anonymous Guest Cellar"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Sommelier Rank & KPI Cards */}
          <div className="rounded-2xl border border-champagne-500/30 bg-gradient-to-br from-burgundy-950/60 via-cellar-950 to-cellar-900 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs uppercase tracking-wider text-champagne-400 font-semibold flex items-center gap-1.5">
                  <Award className="w-4 h-4" /> Current Sommelier Standing
                </div>
                <div className="text-2xl font-serif font-bold text-white mt-0.5">
                  {stats.sommelierRank}
                </div>
                <div className="text-xs text-zinc-400 mt-0.5">
                  Next Tier: <span className="text-champagne-200">{stats.nextRank}</span> ({stats.rankProgressPct}%)
                </div>
              </div>

              <div className="w-full sm:w-48">
                <div className="h-2.5 w-full rounded-full bg-black/60 border border-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-burgundy-500 to-champagne-400 transition-all duration-500"
                    style={{ width: `${stats.rankProgressPct}%` }}
                  />
                </div>
                <div className="text-[11px] text-right text-zinc-400 mt-1">
                  Device ID: <span className="font-mono">{anonId.slice(0, 13)}...</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4 pt-4 border-t border-white/10">
              <div className="rounded-xl bg-black/40 p-3 border border-white/5 text-center">
                <div className="text-xl font-bold text-white">{stats.gamesPlayed}</div>
                <div className="text-[11px] text-zinc-400">Grids Played</div>
              </div>
              <div className="rounded-xl bg-black/40 p-3 border border-white/5 text-center">
                <div className="text-xl font-bold text-emerald-400">{stats.perfectGrids}</div>
                <div className="text-[11px] text-zinc-400">Perfect 9/9</div>
              </div>
              <div className="rounded-xl bg-black/40 p-3 border border-white/5 text-center">
                <div className="text-xl font-bold text-champagne-300 flex items-center justify-center gap-1">
                  <Flame className="w-4 h-4 text-amber-400" /> {stats.currentStreak}
                </div>
                <div className="text-[11px] text-zinc-400">
                  Streak (Max {stats.maxStreak})
                </div>
              </div>
              <div className="rounded-xl bg-black/40 p-3 border border-white/5 text-center">
                <div className="text-xl font-bold text-champagne-400">
                  {stats.bestRarityScore !== null ? stats.bestRarityScore : "—"}
                </div>
                <div className="text-[11px] text-zinc-400">Best Rarity</div>
              </div>
              <div className="rounded-xl bg-black/40 p-3 border border-white/5 text-center col-span-2 sm:col-span-1">
                <div className="text-xl font-bold text-zinc-200">
                  {stats.avgRarityScore !== null ? stats.avgRarityScore : "—"}
                </div>
                <div className="text-[11px] text-zinc-400">Avg Rarity</div>
              </div>
            </div>
          </div>

          {/* Auth Card: Convert Anonymous to Permanent Account */}
          <div className="rounded-2xl border border-white/10 bg-cellar-950 p-5">
            {userEmail ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white flex items-center gap-2">
                      Signed In as {userEmail}
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-500/30">
                        History Synced
                      </span>
                    </div>
                    <div className="text-xs text-zinc-400">
                      All anonymous and signed-in WineGrid sessions are bound to your account.
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-medium text-zinc-300 hover:bg-white/10 hover:text-white transition"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-champagne-200 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-champagne-400" />
                      Save & Sync Your Historical WineGrid Cellar
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      You can play freely as an anonymous guest anytime. Sign in to permanently lock in your{" "}
                      <span className="text-champagne-300 font-semibold">
                        {unclaimedAnonCount} anonymous game(s)
                      </span>{" "}
                      and keep your streak across devices!
                    </p>
                  </div>
                  <div className="flex rounded-lg bg-cellar-900 p-0.5 border border-white/10 shrink-0">
                    <button
                      type="button"
                      onClick={() => setAuthMode("signin")}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                        authMode === "signin"
                          ? "bg-burgundy-700 text-white"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthMode("signup")}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                        authMode === "signup"
                          ? "bg-burgundy-700 text-white"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      Register
                    </button>
                  </div>
                </div>

                <form
                  onSubmit={handleSupabaseAuth}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-2.5"
                >
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="sommelier@domain.com"
                      className="w-full rounded-xl bg-cellar-900 border border-white/10 pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-champagne-400"
                    />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password (min 6 chars)"
                    minLength={6}
                    className="w-full rounded-xl bg-cellar-900 border border-white/10 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-champagne-400"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-burgundy-700 to-burgundy-600 hover:from-burgundy-600 hover:to-burgundy-500 px-4 py-2 text-xs font-semibold text-white shadow transition disabled:opacity-50"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    {loading
                      ? "Syncing Cellar..."
                      : authMode === "signin"
                      ? "Sign In & Claim History"
                      : "Create Free Account"}
                  </button>
                </form>

                {!supabaseReady && (
                  <p className="text-[11px] text-zinc-500 mt-2">
                    Note: Running in Local/Demo Auth mode until <code className="text-zinc-400">NEXT_PUBLIC_SUPABASE_URL</code> is configured in <code className="text-zinc-400">.env.local</code>.
                  </p>
                )}
              </div>
            )}

            {statusMessage && (
              <div className="mt-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30 px-3.5 py-2 text-xs text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                {statusMessage}
              </div>
            )}
          </div>

          {/* Historical Games List */}
          <div>
            <h3 className="text-xs uppercase tracking-wider text-champagne-300 font-semibold flex items-center gap-1.5 mb-3">
              <History className="w-3.5 h-3.5" /> Historical Tasting Log ({history.length} Sessions)
            </h3>

            {history.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-cellar-950/50 py-10 text-center text-sm text-zinc-400">
                No completed or active grids recorded yet. Make your first guess on the board!
              </div>
            ) : (
              <div className="space-y-2.5">
                {history.map((item) => (
                  <div
                    key={item.sessionId}
                    className="rounded-xl border border-white/10 bg-cellar-950/80 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3.5">
                      {/* Mini 3x3 Visual Grid */}
                      <div className="grid grid-cols-3 gap-0.5 p-1 rounded-lg bg-black/60 border border-white/10 shrink-0">
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((idx) => {
                          const cell = item.cells?.[idx];
                          const filled = Boolean(cell?.entityId);
                          return (
                            <div
                              key={idx}
                              className={`w-2.5 h-2.5 rounded-[2px] ${
                                filled ? "bg-emerald-500" : "bg-zinc-800"
                              }`}
                            />
                          );
                        })}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-serif font-bold text-sm text-white">
                            {item.mode === "daily"
                              ? `Daily Vintage (${item.boardDate})`
                              : "Unlimited Sommelier Matrix"}
                          </span>
                          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-burgundy-950 border border-burgundy-700/50 text-burgundy-200">
                            {item.difficulty}
                          </span>
                          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-300">
                            {item.entityFilter}
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          {new Date(item.completedAt).toLocaleString()}
                          <span>&bull;</span>
                          <span>
                            {item.userId ? "Bound to Account" : "Anonymous Session"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 sm:text-right">
                      <div>
                        <div className="text-sm font-bold text-emerald-400">
                          {item.correctCells} / 9 Cells
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          {item.guessesUsed} Guesses Used
                        </div>
                      </div>
                      <div className="rounded-lg bg-black/50 border border-champagne-500/30 px-3 py-1.5 text-center">
                        <div className="text-xs font-mono font-bold text-champagne-300">
                          {item.rarityScore.toFixed(1)}
                        </div>
                        <div className="text-[10px] text-zinc-400 flex items-center gap-0.5">
                          <Sparkles className="w-2.5 h-2.5 text-champagne-400" /> Rarity
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
