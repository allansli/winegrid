"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ALL_WINE_ENTITIES, entityMatchesSearch } from "@/data/wineDatabase";
import { localizedNote } from "@/i18n/notesPt";
import { originLine } from "@/i18n/places";
import { CLUE_CATALOG } from "@/data/clueCatalog";
import { EntityFilterMode } from "@/types/wine";
import { ModalFrame } from "./ModalFrame";
import { useI18n } from "@/i18n/I18nProvider";
import { localizedClue } from "@/i18n/clues";
import { MessageKey } from "@/i18n/messages";
import { Search, X, Filter } from "lucide-react";

interface SommelierCodexModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SommelierCodexModal({
  isOpen,
  onClose,
}: SommelierCodexModalProps) {
  const { locale, t } = useI18n();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<EntityFilterMode>("all");
  const [selectedClueId, setSelectedClueId] = useState<string>("all");
  const searchRef = useRef<HTMLInputElement>(null);

  const activeClue = useMemo(
    () => CLUE_CATALOG.find((c) => c.id === selectedClueId) || null,
    [selectedClueId]
  );

  const filteredEntities = useMemo(() => {
    return ALL_WINE_ENTITIES.filter((e) => {
      if (typeFilter !== "all" && e.entityType !== typeFilter) return false;
      if (activeClue && !activeClue.predicate(e)) return false;
      return entityMatchesSearch(e, query, locale, "full");
    });
  }, [query, typeFilter, activeClue, locale]);

  return (
    <ModalFrame
      isOpen={isOpen}
      onClose={onClose}
      ariaLabel={t("codex.aria")}
      initialFocusRef={searchRef}
      panelClassName="w-full max-w-4xl max-h-[86vh] flex flex-col rounded-3xl border border-slate-200 bg-white shadow-modal overflow-hidden"
    >
        {/* Header */}
        <div className="bg-slate-50/80 px-6 py-5 border-b border-slate-200/80 flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-wine-600 font-semibold">
              {t("codex.kicker")}
            </div>
            <h2 className="font-display text-xl font-bold text-slate-900 mt-0.5">
              {t("codex.title", { shown: filteredEntities.length, total: ALL_WINE_ENTITIES.length })}
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

        {/* Filters */}
        <div className="bg-white px-6 py-4 border-b border-slate-200/70 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("codex.search")}
                enterKeyHint="search"
                inputMode="search"
                autoCapitalize="none"
                className="w-full rounded-xl bg-slate-50 border border-slate-200/80 pl-9 pr-4 py-2 text-base sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-wine-400"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {(
                ["all", "appellation", "grape", "producer"] as EntityFilterMode[]
              ).map((kind) => (
                <button
                  key={kind}
                  type="button"
                  onClick={() => setTypeFilter(kind)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    typeFilter === kind
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {kind === "all"
                    ? t("filter.all")
                    : kind === "appellation"
                    ? t("filter.regions")
                    : kind === "grape"
                    ? t("filter.grapes")
                    : t("filter.estates")}
                </button>
              ))}
            </div>
          </div>

          <ClueFilter value={selectedClueId} onChange={setSelectedClueId} />
        </div>

        {/* Cards */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/40">
          {filteredEntities.map((entity) => (
            <div
              key={entity.id}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 flex flex-col justify-between shadow-soft"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display font-bold text-base text-slate-900">
                      {entity.name}
                    </h3>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {originLine(entity.country, entity.macroRegion, locale)}
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
                    {t(
                      entity.entityType === "appellation"
                        ? "type.region"
                        : entity.entityType === "grape"
                        ? "type.grape"
                        : "type.producer"
                    )}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                  {localizedNote(entity.id, entity.sommelierNote, locale)}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
                {entity.primaryGrapes.slice(0, 3).map((g) => (
                  <span
                    key={g}
                    className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
    </ModalFrame>
  );
}

function ClueFilter({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  const { locale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active = CLUE_CATALOG.find((clue) => clue.id === value) ?? null;
  const activeLabel = active
    ? `[${t(`category.${localizedClue(active, locale).category}` as MessageKey)}] ${localizedClue(active, locale).label}`
    : t("codex.filterAll", { n: CLUE_CATALOG.length });

  useEffect(() => {
    const node = ref.current;
    if (!open || !node) return;
    const closeLayer = () => setOpen(false);
    const onPointer = (event: PointerEvent) => {
      if (!node.contains(event.target as Node)) setOpen(false);
    };
    node.addEventListener("winegrid-close-layer", closeLayer);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      node.removeEventListener("winegrid-close-layer", closeLayer);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative" data-escape-layer={open ? "open" : undefined}>
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-slate-400 shrink-0" />
        <button
          type="button"
          aria-expanded={open}
          aria-haspopup="listbox"
          onClick={() => setOpen((current) => !current)}
          className="w-full rounded-xl bg-slate-50 border border-slate-200/80 px-3 py-2 text-left text-xs text-slate-700 hover:border-wine-400"
        >
          {activeLabel}
        </button>
      </div>
      {open && (
        <ul
          role="listbox"
          className="absolute z-20 mt-1 max-h-60 w-[calc(100%-1.5rem)] overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-modal"
        >
          <li>
            <button
              type="button"
              role="option"
              aria-selected={value === "all"}
              onClick={() => {
                onChange("all");
                setOpen(false);
              }}
              className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50"
            >
              {t("codex.filterAll", { n: CLUE_CATALOG.length })}
            </button>
          </li>
          {CLUE_CATALOG.map((clue) => {
            const copy = localizedClue(clue, locale);
            return (
              <li key={clue.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={value === clue.id}
                  onClick={() => {
                    onChange(clue.id);
                    setOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50"
                >
                  [{t(`category.${copy.category}` as MessageKey)}] {copy.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
