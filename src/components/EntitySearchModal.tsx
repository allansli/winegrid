"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ClueDefinition,
  EntityFilterMode,
  WineEntity,
  WineEntityType,
} from "@/types/wine";
import { searchWineEntities } from "@/data/wineDatabase";
import { Search, X, Wine, Grape, Castle, ArrowRight } from "lucide-react";

interface EntitySearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  rowClue: ClueDefinition;
  colClue: ClueDefinition;
  entityFilter: EntityFilterMode;
  acceptedTypes: WineEntityType[];
  usedEntityIds: Set<string>;
  onSelectEntity: (entity: WineEntity) => void;
}

const TYPE_LABELS: Record<WineEntityType, string> = {
  appellation: "Region",
  grape: "Grape",
  producer: "Producer",
};

export function EntitySearchModal({
  isOpen,
  onClose,
  rowClue,
  colClue,
  entityFilter,
  acceptedTypes,
  usedEntityIds,
  onSelectEntity,
}: EntitySearchModalProps) {
  const [query, setQuery] = useState("");
  const [activeTypeTab, setActiveTypeTab] = useState<EntityFilterMode>("all");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setActiveTypeTab(
        acceptedTypes.length === 1 ? acceptedTypes[0] : entityFilter
      );
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [isOpen, acceptedTypes, entityFilter]);

  const results = useMemo(() => {
    const raw = searchWineEntities(query, activeTypeTab, usedEntityIds);
    // Filter to only entity types that are accepted in this cell
    return raw.filter((e) => acceptedTypes.includes(e.entityType));
  }, [query, activeTypeTab, usedEntityIds, acceptedTypes]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query, activeTypeTab]);

  if (!isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        Math.min(prev + 1, Math.max(0, results.length - 1))
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      onSelectEntity(results[selectedIndex]);
    }
  };

  const getEntityBadge = (type: WineEntity["entityType"]) => {
    switch (type) {
      case "appellation":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 border border-rose-200/80 px-2.5 py-0.5 text-[11px] font-medium text-rose-700">
            <Wine className="w-3 h-3" /> Region
          </span>
        );
      case "grape":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
            <Grape className="w-3 h-3" /> Grape
          </span>
        );
      case "producer":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 text-[11px] font-medium text-amber-800">
            <Castle className="w-3 h-3" /> Producer
          </span>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/30 backdrop-blur-sm p-4 pt-12 sm:pt-16"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-3xl border border-slate-200/90 bg-white shadow-modal overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Clean Intersection Header */}
        <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-200/70">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                Accepted Answer Types:
              </span>
              {acceptedTypes.map((t) => (
                <span
                  key={t}
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                    t === "appellation"
                      ? "bg-rose-50 text-rose-700 border-rose-200"
                      : t === "grape"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-amber-50 text-amber-800 border-amber-200"
                  }`}
                >
                  {t === "appellation" && <Wine className="w-3 h-3" />}
                  {t === "grape" && <Grape className="w-3 h-3" />}
                  {t === "producer" && <Castle className="w-3 h-3" />}
                  {TYPE_LABELS[t]}
                </span>
              ))}
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white border border-slate-200/80 p-3 shadow-sm">
              <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                Row &bull; {rowClue.category.replace("_", " ")}
              </div>
              <div className="font-display text-sm font-bold text-slate-900 mt-0.5">
                {rowClue.shortLabel}
              </div>
            </div>
            <div className="rounded-2xl bg-white border border-slate-200/80 p-3 shadow-sm">
              <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                Column &bull; {colClue.category.replace("_", " ")}
              </div>
              <div className="font-display text-sm font-bold text-slate-900 mt-0.5">
                {colClue.shortLabel}
              </div>
            </div>
          </div>
        </div>

        {/* Type Filter Pills (when multiple types are accepted) */}
        {acceptedTypes.length > 1 && (
          <div className="px-6 pt-3 pb-1 bg-white flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTypeTab("all")}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                activeTypeTab === "all"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
              }`}
            >
              All Accepted ({acceptedTypes.map((t) => TYPE_LABELS[t]).join(", ")})
            </button>
            {acceptedTypes.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setActiveTypeTab(t)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                  activeTypeTab === t
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
                }`}
              >
                {TYPE_LABELS[t]}s
              </button>
            ))}
          </div>
        )}

        {/* Spotlight Search Input */}
        <div className="relative border-b border-slate-200/70 bg-white px-6 py-3.5">
          <Search className="w-5 h-5 text-slate-400 absolute left-6 top-1/2 -translate-y-1/2" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${acceptedTypes
              .map((t) => TYPE_LABELS[t].toLowerCase())
              .join(", ")}...`}
            className="w-full bg-transparent pl-9 pr-4 text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-none"
          />
        </div>

        {/* Results List */}
        <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
          {results.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">
              No matching {acceptedTypes.map((t) => TYPE_LABELS[t].toLowerCase()).join(" / ")} found for &ldquo;{query}&rdquo;.
            </div>
          ) : (
            results.map((entity, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={entity.id}
                  type="button"
                  onClick={() => onSelectEntity(entity)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full text-left px-6 py-3.5 flex items-center justify-between transition ${
                    isSelected ? "bg-slate-50" : "bg-white hover:bg-slate-50/60"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-display font-bold text-sm sm:text-base text-slate-900">
                        {entity.name}
                      </span>
                      {getEntityBadge(entity.entityType)}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {entity.country} &bull; {entity.macroRegion}
                    </div>
                  </div>
                  <ArrowRight
                    className={`w-4 h-4 transition ${
                      isSelected
                        ? "text-wine-600 translate-x-0.5"
                        : "text-slate-300"
                    }`}
                  />
                </button>
              );
            })
          )}
        </div>

        {/* Minimal Footer */}
        <div className="bg-slate-50/80 px-6 py-3 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-slate-400">
          <span>Rarer answers improve your Rarity Score</span>
          <span className="hidden sm:inline">↑↓ Navigate &bull; Enter to Select</span>
        </div>
      </div>
    </div>
  );
}
