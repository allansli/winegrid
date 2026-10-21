"use client";

import React, { useEffect, useState } from "react";
import {
  TelemetryEventRecord,
  getLocalTelemetryEvents,
} from "@/lib/observability";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { ModalFrame } from "./ModalFrame";
import { useI18n } from "@/i18n/I18nProvider";
import { Activity, Database, Radio, X } from "lucide-react";

interface ObservabilityDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ObservabilityDrawer({
  isOpen,
  onClose,
}: ObservabilityDrawerProps) {
  const { t } = useI18n();
  const [events, setEvents] = useState<TelemetryEventRecord[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    setEvents(getLocalTelemetryEvents());

    const handleUpdate = () => setEvents(getLocalTelemetryEvents());
    window.addEventListener("winegrid:telemetry_updated", handleUpdate);
    return () =>
      window.removeEventListener("winegrid:telemetry_updated", handleUpdate);
  }, [isOpen]);

  const posthogReady = Boolean(
    process.env.NEXT_PUBLIC_POSTHOG_KEY &&
      process.env.NEXT_PUBLIC_POSTHOG_KEY.startsWith("phc_") &&
      process.env.NEXT_PUBLIC_POSTHOG_KEY !== "phc_your_posthog_project_key"
  );
  const supabaseReady = isSupabaseConfigured();

  return (
    <ModalFrame
      isOpen={isOpen}
      onClose={onClose}
      ariaLabel={t("telemetry.aria")}
      overlayClassName="winegrid-modal-safe fixed inset-0 z-50 flex justify-end bg-slate-900/30 backdrop-blur-sm"
      panelClassName="w-full max-w-md h-full bg-white border-l border-slate-200 flex flex-col shadow-modal"
    >
        <div className="bg-slate-50/80 px-6 py-5 border-b border-slate-200/80 flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-wine-600 font-semibold flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" /> {t("telemetry.kicker")}
            </div>
            <h2 className="font-display text-lg font-bold text-slate-900 mt-0.5">
              {t("telemetry.title")}
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

        <div className="p-5 border-b border-slate-200/70 bg-slate-50/40 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-wine-600" /> PostHog
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  posthogReady
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                {posthogReady ? t("telemetry.live") : t("telemetry.ready")}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-600" /> Supabase
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  supabaseReady
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                {supabaseReady ? t("telemetry.connected") : t("telemetry.local")}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3.5 text-xs"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-display font-bold text-slate-900">
                  {ev.eventName}
                </span>
                <span className="text-[11px] text-slate-400">
                  {new Date(ev.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <pre className="mt-2 rounded-xl bg-white border border-slate-200/60 p-2.5 text-[11px] text-slate-600 overflow-x-auto">
                {JSON.stringify(ev.properties, null, 2)}
              </pre>
            </div>
          ))}
        </div>
    </ModalFrame>
  );
}
