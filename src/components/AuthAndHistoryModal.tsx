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
import { useI18n } from "@/i18n/I18nProvider";
import { formatDecimal } from "@/lib/shareScore";
import { MessageKey } from "@/i18n/messages";
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

const RANK_KEYS: Record<string, MessageKey> = {
  "Cellar Apprentice": "rank.apprentice",
  "Certified Sommelier": "rank.certified",
  "Advanced Sommelier": "rank.advanced",
  "Master Sommelier": "rank.master",
  "Max Rank Achieved": "rank.max",
};

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
  const { locale, t } = useI18n();
  const rankLabel = (rank: string) => (RANK_KEYS[rank] ? t(RANK_KEYS[rank]) : rank);
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
            setStatusMessage(t("profile.created", { n: claimed }));
          } else {
            setStatusMessage(t("profile.checkEmail"));
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
            setStatusMessage(t("profile.signedInSynced", { n: claimed }));
          }
        }
      } catch (err: any) {
        setStatusMessage(err?.message || t("profile.authFailed"));
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
      setStatusMessage(t("profile.signedInDemo", { n: claimed }));
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
    setStatusMessage(t("profile.signedOut"));
  };

  return (
    <ModalFrame
      isOpen={isOpen}
      onClose={onClose}
      ariaLabel={t("profile.aria")}
      panelClassName="w-full max-w-2xl max-h-[86vh] flex flex-col rounded-3xl border border-slate-200 bg-white shadow-modal overflow-hidden"
    >
        {/* Header */}
        <div className="bg-slate-50/80 px-6 py-5 border-b border-slate-200/80 flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-wine-600 font-semibold">
              {t("profile.kicker")}
            </div>
            <h2 className="font-display text-xl font-bold text-slate-900 mt-0.5">
              {userEmail ? userEmail : t("profile.guest")}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition"
            aria-label={t("action.close")}
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
                  <Award className="w-4 h-4" /> {t("profile.rank")}
                </div>
                <div className="font-display text-lg font-bold text-slate-900 mt-0.5">
                  {rankLabel(stats.sommelierRank)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500">
                  {t("profile.next", { rank: rankLabel(stats.nextRank) })}
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
                <div className="text-[11px] text-slate-500">{t("profile.played")}</div>
              </div>
              <div>
                <div className="font-display text-xl font-bold text-emerald-600">
                  {stats.perfectGrids}
                </div>
                <div className="text-[11px] text-slate-500">{t("profile.perfect")}</div>
              </div>
              <div>
                <div className="font-display text-xl font-bold text-slate-900 flex items-center justify-center gap-1">
                  <Flame className="w-4 h-4 text-amber-500 fill-amber-400" />
                  {stats.currentStreak}
                </div>
                <div className="text-[11px] text-slate-500">{t("profile.streak")}</div>
              </div>
              <div>
                <div className="font-display text-xl font-bold text-slate-900">
                  {stats.bestRarityScore !== null
                    ? formatDecimal(stats.bestRarityScore, locale)
                    : "—"}
                </div>
                <div className="text-[11px] text-slate-500">{t("profile.bestRarity")}</div>
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
                      {t("profile.signedIn", { email: userEmail })}
                    </div>
                    <div className="text-xs text-slate-500">
                      {t("profile.synced")}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/70 px-3.5 py-2 text-xs font-semibold text-slate-700 transition"
                >
                  <LogOut className="w-3.5 h-3.5" /> {t("profile.signOut")}
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-display text-sm font-bold text-slate-900">
                      {t("profile.syncTitle")}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {t("profile.syncBody", { n: unclaimedAnonCount })}
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
                      {t("nav.signIn")}
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
                      {t("profile.register")}
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
                    placeholder={t("profile.password")}
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
                      ? t("profile.syncing")
                      : authMode === "signin"
                      ? t("nav.signIn")
                      : t("profile.create")}
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
              {t("profile.recent", { n: history.length })}
            </h3>
            {history.length === 0 ? (
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50/50 py-10 text-center text-sm text-slate-400">
                {t("profile.empty")}
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
                            ? t("profile.dailyGrid", { date: item.boardDate })
                            : t("profile.unlimitedGrid")}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {new Date(item.completedAt).toLocaleDateString()} &bull;{" "}
                          {t("profile.misses", { n: item.guessesUsed })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <div className="font-display text-sm font-bold text-emerald-600">
                          {item.correctCells}/9
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {t("history.rarity", {
                            score: formatDecimal(item.rarityScore, locale),
                          })}
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
