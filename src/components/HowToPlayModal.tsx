"use client";

import React, { useEffect, useState } from "react";
import { ModalFrame } from "./ModalFrame";
import { MISS_BUDGET } from "@/lib/guessEconomy";

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STEPS = [
  {
    kicker: "Step 1 of 3",
    title: "Every cell is an intersection",
    body: "A blank cell has to satisfy the clue on its row and the clue on its column at the same time. Tap a header when you want the full definition.",
  },
  {
    kicker: "Step 2 of 3",
    title: "Name one region, grape, or producer",
    body: `The picker only lists the types that cell accepts. A correct answer is free. A wrong answer costs one of your ${MISS_BUDGET} misses. Rarer correct answers improve your score.`,
  },
  {
    kicker: "Step 3 of 3",
    title: "One cell, worked out",
    body: "Row clue France, column clue Sparkling wine. Both have to be true.",
  },
] as const;

export function HowToPlayModal({ isOpen, onClose }: HowToPlayModalProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (isOpen) setStep(0);
  }, [isOpen]);

  const current = STEPS[step];
  const last = step === STEPS.length - 1;

  return (
    <ModalFrame
      isOpen={isOpen}
      onClose={onClose}
      ariaLabel="How to play WineGrid"
      panelClassName="w-full max-w-lg max-h-[90dvh] overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-modal"
    >
      <div className="px-6 pt-6 pb-5">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-wine-600">
          {current.kicker}
        </div>
        <h2 className="font-display text-2xl font-bold text-slate-900 mt-1">
          {current.title}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">{current.body}</p>

        {step === 0 && (
          <div className="mt-5 grid grid-cols-[7rem_1fr_1fr] gap-2 text-center">
            <div />
            <div className="rounded-xl bg-slate-50 border border-slate-200 px-2 py-3 text-xs font-semibold text-slate-700">
              Column clue
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-200 px-2 py-3 text-xs font-semibold text-slate-700">
              Column clue
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-200 px-2 py-3 text-xs font-semibold text-slate-700 flex items-center justify-center">
              Row clue
            </div>
            <div className="rounded-xl border border-dashed border-wine-300 bg-wine-50/60 px-2 py-4 text-[11px] font-medium text-wine-800">
              Fits both
            </div>
            <div className="rounded-xl border border-dashed border-slate-200 px-2 py-4 text-[11px] text-slate-400">
              Another cell
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="mt-5 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                  Row
                </div>
                <div className="font-display font-bold text-slate-900 mt-0.5">France</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                  Column
                </div>
                <div className="font-display font-bold text-slate-900 mt-0.5">
                  Sparkling wine
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 px-4 py-3">
              <div className="text-xs font-semibold text-emerald-800">Champagne fits</div>
              <p className="text-sm text-slate-700 mt-1 leading-relaxed">
                Champagne is a French appellation for traditional-method sparkling wine, so it satisfies both clues.
              </p>
            </div>
            <div className="rounded-2xl border border-rose-200 bg-rose-50/70 px-4 py-3">
              <div className="text-xs font-semibold text-rose-800">
                Cabernet Sauvignon is a miss
              </div>
              <p className="text-sm text-slate-700 mt-1 leading-relaxed">
                Cabernet Sauvignon is a French grape, but it makes dry red wine, not sparkling wine. It matches the row and fails the column.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="px-6 py-4 border-t border-slate-200/80 flex items-center justify-between bg-slate-50/70">
        <div className="flex items-center gap-1.5" aria-hidden="true">
          {STEPS.map((_, index) => (
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
              Back
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
            {last ? "Start playing" : "Next"}
          </button>
        </div>
      </div>
    </ModalFrame>
  );
}
