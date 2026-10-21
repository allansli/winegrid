"use client";

import React, { useState } from "react";
import {
  GameHistoryEntry,
  PlayerStatsSummary,
  mergeAnonymousHistoryOnSignIn,
} from "@/lib/storageAndSync";
import {
  getSupabaseBrowserClient,
  isSupabaseConfigured,
} from "@/lib/supabase/client";
import { identifyObservabilityUser, trackEvent } from "@/lib/observability";
import { ModalFrame } from "./ModalFrame";
import {
  Award,
  CheckCircle2,
  Flame,
  LogIn,
  LogOut,
  Mail,
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
  history,
  stats,
  onAuthChanged,
}: AuthAndHistoryModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
              `Account created & ${claimed} anonymous game(s) synced to your profile.`
            );
          } else {
            setStatusMessage(
              "Check your email inbox to confirm your WineGrid account."
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
              `Signed in & synced ${claimed} anonymous game(s) to your profile.`
            );
          }
        }
      } catch (err: any) {
        setStatusMessage(err?.message || "Authentication failed.");
      } finally {
        setLoading(false);
      }
    } else {
      const simulatedId = `somm_${email
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "_")}`;
      const claimed = await mergeAnonymousHistoryOnSignIn(simulatedId);
      identifyObservabilityUser(simulatedId, email.trim());
      window.localStorage.setItem(
        "winegrid_demo_user",
        JSON.stringify({ id: simulatedId, email: email.trim() })
      );
      onAuthChanged({ id: simulatedId, email: email.trim() });
      setLoading(false);
      setStatusMessage(
        `Signed in (${claimed} anonymous session(s) merged into your profile).`
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
    setStatusMessage("Signed out. Playing as a guest.");
  };

  return (
    <ModalFrame
      isOpen={isOpen}
      onClose={onClose}
      ariaLabel="Player profile and history"
      panelClassName="w-full max-w-2xl max-h-[86vh] flex flex-col rounded-3xl border border-slate-200 bg-white shadow-modal overflow-hidden"
    >
        {/* Header */}
        <div className="bg-slate-50/80 px-6 py-5 border-b border-slate-200/80 flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-wine-600 font-semibold">
              Player Profile &amp; History
            </div>
            <h2 className="font-display text-xl font-bold text-slate-900 mt-0.5">
              {userEmail ? userEmail : "Guest Sommelier"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Stats Overview */}
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-5">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <div className="text-xs font-semibold text-wine-600 flex items-center gap-1.5">
                  <Award className="w-4 h-4" /> Rank
                </div>
                <div className="font-display text-lg font-bold text-slate-900 mt-0.5">
                  {stats.sommelierRank}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500">
                  Next: {stats.nextRank}
                </div>
                <div className="w-32 h-2 rounded-full bg-slate-200 overflow-hidden mt-1.5">
                  <div
                    className="h-full bg-wine-600 transition-all"
                    style={{ width: `${stats.rankProgressPct}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3 pt-4 border-t border-slate-200/70 text-center">
              <div>
                <div className="font-display text-xl font-bold text-slate-900">
                  {stats.gamesPlayed}
                </div>
                <div className="text-[11px] text-slate-500">Played</div>
              </div>
              <div>
                <div className="font-display text-xl font-bold text-emerald-600">
                  {stats.perfectGrids}
                </div>
                <div className="text-[11px] text-slate-500">Perfect 9/9</div>
              </div>
              <div>
                <div className="font-display text-xl font-bold text-slate-900 flex items-center justify-center gap-1">
                  <Flame className="w-4 h-4 text-amber-500 fill-amber-400" />
                  {stats.currentStreak}
                </div>
                <div className="text-[11px] text-slate-500">Streak</div>
              </div>
              <div>
                <div className="font-display text-xl font-bold text-slate-900">
                  {stats.bestRarityScore !== null ? stats.bestRarityScore : "—"}
                </div>
                <div className="text-[11px] text-slate-500">Best Rarity</div>
              </div>
            </div>
          </div>

          {/* Sign In / Sync Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft">
            {userEmail ? (
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      Signed in as {userEmail}
                    </div>
                    <div className="text-xs text-slate-500">
                      Your game history is synced to your account.
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/70 px-3.5 py-2 text-xs font-semibold text-slate-700 transition"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-display text-sm font-bold text-slate-900">
                      Sync Your Game History
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Sign in to save your {unclaimedAnonCount} guest game(s) across devices.
                    </p>
                  </div>
                  <div className="flex rounded-xl bg-slate-100 p-1">
                    <button
                      type="button"
                      onClick={() => setAuthMode("signin")}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                        authMode === "signin"
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-500"
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthMode("signup")}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                        authMode === "signup"
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-500"
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
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@domain.com"
                      className="w-full rounded-xl bg-slate-50 border border-slate-200 pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-wine-400"
                    />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    minLength={6}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-wine-400"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-wine-600 hover:bg-wine-700 px-4 py-2 text-xs font-semibold text-white shadow-sm transition disabled:opacity-50"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    {loading
                      ? "Syncing..."
                      : authMode === "signin"
                      ? "Sign In"
                      : "Create Account"}
                  </button>
                </form>
              </div>
            )}

            {statusMessage && (
              <div className="mt-3 rounded-xl bg-emerald-50 border border-emerald-200 px-3.5 py-2 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                {statusMessage}
              </div>
            )}
          </div>

          {/* Past Games */}
          <div>
            <h3 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3">
              Recent Games ({history.length})
            </h3>
            {history.length === 0 ? (
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50/50 py-10 text-center text-sm text-slate-400">
                No completed games yet.
              </div>
            ) : (
              <div className="space-y-2.5">
                {history.map((item) => (
                  <div
                    key={item.sessionId}
                    className="rounded-2xl border border-slate-200/80 bg-white p-4 flex items-center justify-between gap-3 shadow-soft"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="grid grid-cols-3 gap-0.5 p-1.5 rounded-xl bg-slate-100">
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((idx) => {
                          const filled = Boolean(item.cells?.[idx]?.entityId);
                          return (
                            <div
                              key={idx}
                              className={`w-2.5 h-2.5 rounded-[3px] ${
                                filled ? "bg-emerald-500" : "bg-slate-300"
                              }`}
                            />
                          );
                        })}
                      </div>
                      <div>
                        <div className="font-display font-bold text-sm text-slate-900">
                          {item.mode === "daily"
                            ? `Daily Grid (${item.boardDate})`
                            : "Unlimited Grid"}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {new Date(item.completedAt).toLocaleDateString()} &bull;{" "}
                          {item.guessesUsed} misses
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <div className="font-display text-sm font-bold text-emerald-600">
                          {item.correctCells}/9
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Rarity {item.rarityScore.toFixed(1)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
    </ModalFrame>
  );
}
