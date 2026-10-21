"use client";

import React from "react";
import { ClueDefinition, MatrixCell } from "@/types/wine";
import { WINE_ENTITY_BY_ID } from "@/data/wineDatabase";
import { X, Award, Sparkles } from "lucide-react";

interface CellInspectModalProps {
  isOpen: boolean;
  onClose: () => void;
  cell: MatrixCell | null;
  rowClue: ClueDefinition | null;
  colClue: ClueDefinition | null;
}

export function CellInspectModal({
  isOpen,
  onClose,
  cell,
  rowClue,
  colClue,
}: CellInspectModalProps) {
  if (!isOpen || !cell || !rowClue || !colClue) return null;

  const pickedEntity = cell.pickedEntityId
    ? WINE_ENTITY_BY_ID[cell.pickedEntityId]
    : null;

  const validEntities = cell.validEntityIds
    .map((id) => WINE_ENTITY_BY_ID[id])
    .filter(Boolean)
    .sort((a, b) => b.baseRarity - a.baseRarity);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl border border-slate-200 bg-white shadow-modal overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-50/80 px-6 py-5 border-b border-slate-200/80 flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-wine-600 font-semibold">
              Cell Breakdown
            </div>
            <h3 className="font-display text-lg font-bold text-slate-900 mt-0.5">
              {rowClue.shortLabel} &times; {colClue.shortLabel}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Player's Pick */}
          {pickedEntity && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
                  <Award className="w-4 h-4 text-emerald-600" />
                  Your Answer
                </div>
                {cell.pickedRarityPct !== null && (
                  <span className="rounded-full bg-white border border-emerald-200 px-3 py-0.5 text-xs font-bold text-emerald-700">
                    {cell.pickedRarityPct}% Pick Rate
                  </span>
                )}
              </div>
              <div className="mt-2 font-display text-xl font-bold text-slate-900">
                {pickedEntity.name}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {pickedEntity.country} &bull; {pickedEntity.macroRegion} &bull;{" "}
                {pickedEntity.primaryGrapes.join(", ")}
              </div>
              <p className="text-sm text-slate-700 mt-3 leading-relaxed">
                {pickedEntity.sommelierNote}
              </p>
            </div>
          )}

          {/* All Valid Answers */}
          <div>
            <h4 className="text-xs uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              All {validEntities.length} Valid Answers (Rarest First)
            </h4>
            <div className="space-y-3">
              {validEntities.map((entity) => {
                const isPlayerPick = entity.id === cell.pickedEntityId;
                return (
                  <div
                    key={entity.id}
                    className={`rounded-2xl border p-4 transition ${
                      isPlayerPick
                        ? "border-emerald-300 bg-emerald-50/30"
                        : "border-slate-200/80 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <span className="font-display font-bold text-base text-slate-900">
                          {entity.name}
                        </span>
                        <span className="ml-2 text-xs text-slate-500">
                          {entity.country} &bull; {entity.macroRegion}
                        </span>
                      </div>
                      <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full capitalize">
                        {entity.entityType}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                      {entity.sommelierNote}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
