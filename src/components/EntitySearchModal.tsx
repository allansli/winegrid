"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ClueDefinition, EntityFilterMode, WineEntity } from "@/types/wine";
import { searchWineEntities } from "@/data/wineDatabase";
import { Search, X, Wine, Grape, Castle, ArrowRight } from "lucide-react";

interface EntitySearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  rowClue: ClueDefinition;
  colClue: ClueDefinition;
  entityFilter: EntityFilterMode;
  usedEntityIds: Set<string>;
  onSelectEntity: (entity: WineEntity) => void;
}

export function EntitySearchModal({
  isOpen,
  onClose,
  rowClue,
  colClue,
  entityFilter,
  usedEntityIds,
  onSelectEntity,
}: EntitySearchModalProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [isOpen]);

  const results = useMemo(
    () => searchWineEntities(query, entityFilter, usedEntityIds),
    [query, entityFilter, usedEntityIds]
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

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
            <Castle className="w-3 h-3" /> Estate
          </span>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/30 backdrop-blur-sm p-4 pt-14 sm:pt-20"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-3xl border border-slate-200/90 bg-white shadow-modal overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Clean Intersection Header */}
        <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-200/70">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
              Match Both Criteria
            </span>
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
                Row &bull; {rowClue.category}
              </div>
              <div className="font-display text-sm font-bold text-slate-900 mt-0.5">
                {rowClue.shortLabel}
              </div>
            </div>
            <div className="rounded-2xl bg-white border border-slate-200/80 p-3 shadow-sm">
              <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                Column &bull; {colClue.category}
              </div>
              <div className="font-display text-sm font-bold text-slate-900 mt-0.5">
                {colClue.shortLabel}
              </div>
            </div>
          </div>
        </div>

        {/* Spotlight Search Input */}
        <div className="relative border-b border-slate-200/70 bg-white px-6 py-4">
          <Search className="w-5 h-5 text-slate-400 absolute left-6 top-1/2 -translate-y-1/2" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search region (Barolo, Champagne), grape (Pinot Noir), or estate..."
            className="w-full bg-transparent pl-9 pr-4 text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:outline-none"
          />
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
          {results.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">
              No unused wine entities found for &ldquo;{query}&rdquo;.
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
