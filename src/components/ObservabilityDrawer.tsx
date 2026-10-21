"use client";

import React, { useEffect, useState } from "react";
import {
  TelemetryEventRecord,
  getLocalTelemetryEvents,
} from "@/lib/observability";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { Activity, CheckCircle2, Database, Radio, Terminal, X } from "lucide-react";

interface ObservabilityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ObservabilityDrawer({ isOpen, onClose }: ObservabilityDrawerProps) {
  const [events, setEvents] = useState<TelemetryEventRecord[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    setEvents(getLocalTelemetryEvents());

    const handleUpdate = () => setEvents(getLocalTelemetryEvents());
    window.addEventListener("winegrid:telemetry_updated", handleUpdate);
    return () => window.removeEventListener("winegrid:telemetry_updated", handleUpdate);
  }, [isOpen]);

  if (!isOpen) return null;

  const posthogReady = Boolean(
    process.env.NEXT_PUBLIC_POSTHOG_KEY &&
      process.env.NEXT_PUBLIC_POSTHOG_KEY.startsWith("phc_") &&
      process.env.NEXT_PUBLIC_POSTHOG_KEY !== "phc_your_posthog_project_key"
  );
  const supabaseReady = isSupabaseConfigured();

  const guessEvents = events.filter((e) => e.eventName === "cell_guess_submitted");
  const correctGuesses = guessEvents.filter((e) => e.properties?.is_correct === true);
  const accuracyPct =
    guessEvents.length > 0
      ? Math.round((correctGuesses.length / guessEvents.length) * 100)
      : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg h-full bg-cellar-900 border-l border-champagne-500/30 flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-burgundy-950 via-cellar-900 to-cellar-950 px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest text-champagne-400 font-semibold flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" /> Free-Tier Observability & Telemetry
            </div>
            <h2 className="text-lg font-serif font-bold text-white mt-0.5">
              Live Usage & Event Stream
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pipeline Status */}
        <div className="p-5 border-b border-white/10 bg-cellar-950 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/10 bg-cellar-900 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-champagne-400" /> PostHog Cloud
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    posthogReady
                      ? "bg-emerald-950 text-emerald-300 border border-emerald-600/40"
                      : "bg-amber-950 text-amber-300 border border-amber-600/40"
                  }`}
                >
                  {posthogReady ? "Connected" : "Ready (.env)"}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                1M free events/mo, Session Replay, Web Vitals & Error Capture
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-cellar-900 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-emerald-400" /> Supabase SQL
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    supabaseReady
                      ? "bg-emerald-950 text-emerald-300 border border-emerald-600/40"
                      : "bg-amber-950 text-amber-300 border border-amber-600/40"
                  }`}
                >
                  {supabaseReady ? "Connected" : "Local Buffer"}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                First-party <code className="text-zinc-300">telemetry_events</code> &amp; <code className="text-zinc-300">cell_pick_stats</code>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5 pt-1">
            <div className="rounded-lg bg-black/40 border border-white/5 p-2.5 text-center">
              <div className="text-base font-bold text-white">{events.length}</div>
              <div className="text-[10px] text-zinc-400">Buffered Events</div>
            </div>
            <div className="rounded-lg bg-black/40 border border-white/5 p-2.5 text-center">
              <div className="text-base font-bold text-champagne-300">
                {guessEvents.length}
              </div>
              <div className="text-[10px] text-zinc-400">Guesses Tracked</div>
            </div>
            <div className="rounded-lg bg-black/40 border border-white/5 p-2.5 text-center">
              <div className="text-base font-bold text-emerald-400">{accuracyPct}%</div>
              <div className="text-[10px] text-zinc-400">Guess Accuracy</div>
            </div>
          </div>
        </div>

        {/* Event Log */}
        <div className="flex-1 overflow-y-auto p-5 space-y-2.5">
          <div className="text-xs uppercase tracking-wider text-champagne-300 font-semibold flex items-center gap-1.5 mb-2">
            <Terminal className="w-3.5 h-3.5" /> Real-Time Telemetry Stream
          </div>

          {events.map((ev) => (
            <div
              key={ev.id}
              className="rounded-xl border border-white/10 bg-cellar-950 p-3 text-xs font-mono"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-champagne-300">{ev.eventName}</span>
                <span className="text-[10px] text-zinc-500">
                  {new Date(ev.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="text-[10px] text-zinc-400 mt-1 flex items-center gap-2">
                <span>anon: {ev.anonId.slice(0, 12)}...</span>
                {ev.userId && (
                  <span className="text-emerald-400 flex items-center gap-0.5">
                    <CheckCircle2 className="w-2.5 h-2.5" /> user: {ev.userId.slice(0, 10)}
                  </span>
                )}
              </div>
              <pre className="mt-2 rounded bg-black/60 p-2 text-[10px] text-zinc-300 overflow-x-auto">
                {JSON.stringify(ev.properties, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
