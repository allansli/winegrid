"use client";

import React from "react";
import { ClueDefinition, MatrixCell } from "@/types/wine";
import { WINE_ENTITY_BY_ID } from "@/data/wineDatabase";
import { X, Award, Sparkles, BookOpen } from "lucide-react";

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
    .sort((a, b) => b.baseRarity - a.baseRarity); // Rarest first!

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-champagne-500/30 bg-cellar-900 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-burgundy-950 via-cellar-900 to-burgundy-950 px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest text-champagne-400 font-semibold flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> Sommelier Cell Analysis
            </div>
            <h3 className="text-lg font-serif font-bold text-white mt-0.5">
              {rowClue.shortLabel} &times; {colClue.shortLabel}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Clue Explanations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl bg-black/40 border border-white/10 p-3">
              <div className="text-[11px] uppercase tracking-wider text-champagne-400 font-semibold">
                Row: {rowClue.label}
              </div>
              <p className="text-xs text-zinc-300 mt-1">{rowClue.tooltip}</p>
            </div>
            <div className="rounded-xl bg-black/40 border border-white/10 p-3">
              <div className="text-[11px] uppercase tracking-wider text-champagne-400 font-semibold">
                Column: {colClue.label}
              </div>
              <p className="text-xs text-zinc-300 mt-1">{colClue.tooltip}</p>
            </div>
          </div>

          {/* Player's Pick */}
          {pickedEntity && (
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 p-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs uppercase tracking-wider text-emerald-300 font-semibold">
                    Your Valid Sommelier Pick
                  </span>
                </div>
                {cell.pickedRarityPct !== null && (
                  <span className="rounded-full bg-emerald-900/80 border border-emerald-500/40 px-2.5 py-0.5 text-xs font-bold text-emerald-200">
                    {cell.pickedRarityPct}% Global Pick Rate
                  </span>
                )}
              </div>
              <div className="mt-2 font-serif text-xl font-bold text-white">
                {pickedEntity.name}
              </div>
              <div className="text-xs text-emerald-200/80 mt-0.5">
                {pickedEntity.country} &bull; {pickedEntity.macroRegion} &bull; Primary Grapes:{" "}
                {pickedEntity.primaryGrapes.join(", ")}
              </div>
              <p className="text-sm text-zinc-200 mt-2.5 leading-relaxed">
                {pickedEntity.sommelierNote}
              </p>
            </div>
          )}

          {/* All Valid Answers in Pool */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs uppercase tracking-wider text-champagne-300 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> All {validEntities.length} Valid Sommelier Answers (Ordered Rarest First)
              </h4>
            </div>
            <div className="space-y-2.5">
              {validEntities.map((entity) => {
                const isPlayerPick = entity.id === cell.pickedEntityId;
                return (
                  <div
                    key={entity.id}
                    className={`rounded-xl border p-3.5 transition ${
                      isPlayerPick
                        ? "border-emerald-500/40 bg-emerald-950/20"
                        : "border-white/10 bg-cellar-950/80"
                    }`}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <span className="font-serif font-semibold text-base text-champagne-100">
                          {entity.name}
                        </span>
                        <span className="ml-2 text-xs text-zinc-400">
                          ({entity.country} &bull; {entity.macroRegion})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-zinc-300 border border-white/10">
                          {entity.entityType}
                        </span>
                        <span className="text-xs font-mono text-champagne-400">
                          Rarity Index: {entity.baseRarity}/100
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-300 mt-1.5 leading-relaxed">
                      {entity.sommelierNote}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {entity.soils.map((s) => (
                        <span
                          key={s}
                          className="text-[10px] px-2 py-0.5 rounded bg-burgundy-950/80 border border-burgundy-800/50 text-burgundy-200"
                        >
                          Soil: {s.replace(/_/g, " ")}
                        </span>
                      ))}
                      {entity.primaryGrapes.slice(0, 3).map((g) => (
                        <span
                          key={g}
                          className="text-[10px] px-2 py-0.5 rounded bg-champagne-950/60 border border-champagne-700/40 text-champagne-200"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
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
