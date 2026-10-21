"use client";

import React from "react";
import { ClueDefinition, MatrixCell } from "@/types/wine";
import { WINE_ENTITY_BY_ID } from "@/data/wineDatabase";
import { ModalFrame } from "./ModalFrame";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedNote } from "@/i18n/notesPt";
import { placeLabel } from "@/i18n/places";
import { localizedClue } from "@/i18n/clues";
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
  const { locale, t } = useI18n();
  if (!cell || !rowClue || !colClue) return null;
  const rowCopy = localizedClue(rowClue, locale);
  const colCopy = localizedClue(colClue, locale);

  const pickedEntity = cell.pickedEntityId
    ? WINE_ENTITY_BY_ID[cell.pickedEntityId]
    : null;

  const validEntities = cell.validEntityIds
    .map((id) => WINE_ENTITY_BY_ID[id])
    .filter(Boolean)
    .sort((a, b) => b.baseRarity - a.baseRarity);

  return (
    <ModalFrame
      isOpen={isOpen}
      onClose={onClose}
      ariaLabel={t("inspect.aria", { row: rowCopy.shortLabel, col: colCopy.shortLabel })}
      panelClassName="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl border border-slate-200 bg-white shadow-modal overflow-hidden"
    >
        {/* Header */}
        <div className="bg-slate-50/80 px-6 py-5 border-b border-slate-200/80 flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-wine-600 font-semibold">
              {t("inspect.kicker")}
            </div>
            <h3 className="font-display text-lg font-bold text-slate-900 mt-0.5">
              {rowCopy.shortLabel} &times; {colCopy.shortLabel}
            </h3>
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

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Player's Pick */}
          {pickedEntity && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
                  <Award className="w-4 h-4 text-emerald-600" />
                  {t("inspect.yourAnswer")}
                </div>
                {cell.pickedRarityPct !== null && (
                  <span className="rounded-full bg-white border border-emerald-200 px-3 py-0.5 text-xs font-bold text-emerald-700">
                    {t("inspect.pickRate", { pct: cell.pickedRarityPct })}
                  </span>
                )}
              </div>
              <div className="mt-2 font-display text-xl font-bold text-slate-900">
                {pickedEntity.name}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {placeLabel(pickedEntity.country, locale, "country")} &bull; {placeLabel(pickedEntity.macroRegion, locale, "region")} &bull;{" "}
                {pickedEntity.primaryGrapes.join(", ")}
              </div>
              <p className="text-sm text-slate-700 mt-3 leading-relaxed">
                {localizedNote(pickedEntity.id, pickedEntity.sommelierNote, locale)}
              </p>
            </div>
          )}

          {/* All Valid Answers */}
          <div>
            <h4 className="text-xs uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              {t("inspect.all", { n: validEntities.length })}
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
                          {placeLabel(entity.country, locale, "country")} &bull; {placeLabel(entity.macroRegion, locale, "region")}
                        </span>
                      </div>
                      <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full capitalize">
                        {t(
                          entity.entityType === "appellation"
                            ? "type.region"
                            : entity.entityType === "grape"
                            ? "type.grape"
                            : "type.producer"
                        )}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                      {localizedNote(entity.id, entity.sommelierNote, locale)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
    </ModalFrame>
  );
}
