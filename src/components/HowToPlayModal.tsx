"use client";

import React, { useEffect, useState } from "react";
import { ModalFrame } from "./ModalFrame";
import { MISS_BUDGET } from "@/lib/guessEconomy";
import { useI18n } from "@/i18n/I18nProvider";
import { MessageKey } from "@/i18n/messages";

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STEP_KEYS: { title: MessageKey; body: MessageKey }[] = [
  { title: "howto.s1.title", body: "howto.s1.body" },
  { title: "howto.s2.title", body: "howto.s2.body" },
  { title: "howto.s3.title", body: "howto.s3.body" },
];

export function HowToPlayModal({ isOpen, onClose }: HowToPlayModalProps) {
  const { t } = useI18n();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (isOpen) setStep(0);
  }, [isOpen]);

  const current = STEP_KEYS[step];
  const last = step === STEP_KEYS.length - 1;

  return (
    <ModalFrame
      isOpen={isOpen}
      onClose={onClose}
      ariaLabel={t("howto.aria")}
      panelClassName="w-full max-w-lg max-h-[90dvh] overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-modal"
    >
      <div className="px-5 sm:px-6 pt-6 pb-5">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-wine-600">
          {t("howto.step", { n: step + 1 })}
        </div>
        <h2 className="font-display text-2xl font-bold text-slate-900 mt-1">
          {t(current.title)}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          {t(current.body, { misses: MISS_BUDGET })}
        </p>

        {step === 0 && (
          <div className="mt-5 grid grid-cols-[5.5rem_1fr_1fr] sm:grid-cols-[7rem_1fr_1fr] gap-2 text-center">
            <div />
            <div className="rounded-xl bg-slate-50 border border-slate-200 px-2 py-3 text-xs font-semibold text-slate-700">
              {t("howto.column")}
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-200 px-2 py-3 text-xs font-semibold text-slate-700">
              {t("howto.column")}
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-200 px-2 py-3 text-xs font-semibold text-slate-700 flex items-center justify-center">
              {t("howto.row")}
            </div>
            <div className="rounded-xl border border-dashed border-wine-300 bg-wine-50/60 px-2 py-4 text-[11px] font-medium text-wine-800">
              {t("howto.fitsBoth")}
            </div>
            <div className="rounded-xl border border-dashed border-slate-200 px-2 py-4 text-[11px] text-slate-400">
              {t("howto.another")}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="mt-5 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                  {t("howto.axis.row")}
                </div>
                <div className="font-display font-bold text-slate-900 mt-0.5">
                  {t("howto.example.row")}
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                  {t("howto.axis.col")}
                </div>
                <div className="font-display font-bold text-slate-900 mt-0.5">
                  {t("howto.example.col")}
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 px-4 py-3">
              <div className="text-xs font-semibold text-emerald-800">{t("howto.fit.title")}</div>
              <p className="text-sm text-slate-700 mt-1 leading-relaxed">{t("howto.fit.body")}</p>
            </div>
            <div className="rounded-2xl border border-rose-200 bg-rose-50/70 px-4 py-3">
              <div className="text-xs font-semibold text-rose-800">{t("howto.miss.title")}</div>
              <p className="text-sm text-slate-700 mt-1 leading-relaxed">{t("howto.miss.body")}</p>
            </div>
          </div>
        )}
      </div>

      <div className="px-5 sm:px-6 py-4 border-t border-slate-200/80 flex items-center justify-between bg-slate-50/70">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          {STEP_KEYS.map((_, index) => (
            <span
              key={index}
              className={`h-1.5 rounded-full transition-all ${
                index === step ? "w-6 bg-wine-600" : "w-1.5 bg-slate-300"
              }`}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((value) => value - 1)}
              className="rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/70 transition"
            >
              {t("howto.back")}
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              if (last) onClose();
              else setStep((value) => value + 1);
            }}
            className="rounded-xl bg-slate-900 hover:bg-slate-800 px-4 py-2 text-xs font-semibold text-white transition"
          >
            {last ? t("howto.start") : t("howto.next")}
          </button>
        </div>
      </div>
    </ModalFrame>
  );
}
