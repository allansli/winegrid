"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ClueDefinition, EntityFilterMode, WineEntity } from "@/types/wine";
import { searchWineEntities } from "@/data/wineDatabase";
import { Search, X, Wine, Grape, Castle, Sparkles, Check } from "lucide-react";

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
      setSelectedIndex((prev) => Math.min(prev + 1, Math.max(0, results.length - 1)));
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
          <span className="inline-flex items-center gap-1 rounded-full bg-burgundy-900/70 border border-burgundy-700/50 px-2 py-0.5 text-[11px] font-medium text-burgundy-200">
            <Wine className="w-3 h-3" /> Appellation
          </span>
        );
      case "grape":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950/80 border border-emerald-700/50 px-2 py-0.5 text-[11px] font-medium text-emerald-200">
            <Grape className="w-3 h-3" /> Grape Variety
          </span>
        );
      case "producer":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-champagne-950/80 border border-champagne-600/50 px-2 py-0.5 text-[11px] font-medium text-champagne-200">
            <Castle className="w-3 h-3" /> Iconic Estate
          </span>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 backdrop-blur-sm p-4 pt-12 sm:pt-20"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl border border-champagne-500/30 bg-cellar-900 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Intersecting Clues Banner */}
        <div className="bg-gradient-to-r from-burgundy-950 via-cellar-900 to-burgundy-950 px-5 py-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-widest text-champagne-400 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Select Wine Entity for Intersection
            </span>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-zinc-400 hover:bg-white/10 hover:text-white transition"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="rounded-xl bg-black/40 border border-white/10 p-2.5">
              <div className="text-[10px] uppercase tracking-wider text-zinc-400">
                Row Criterion ({rowClue.category})
              </div>
              <div className="text-sm font-serif font-semibold text-champagne-100 mt-0.5">
                {rowClue.label}
              </div>
            </div>
            <div className="rounded-xl bg-black/40 border border-white/10 p-2.5">
              <div className="text-[10px] uppercase tracking-wider text-zinc-400">
                Column Criterion ({colClue.category})
              </div>
              <div className="text-sm font-serif font-semibold text-champagne-100 mt-0.5">
                {colClue.label}
              </div>
            </div>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative border-b border-white/10 bg-cellar-950 px-4 py-3">
          <Search className="w-5 h-5 text-champagne-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search appellation (Barolo, Pauillac...), grape (Nebbiolo, Riesling...), or estate (DRC, Krug...)"
            className="w-full bg-transparent pl-8 pr-4 text-sm sm:text-base text-white placeholder-zinc-500 focus:outline-none"
          />
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
          {results.length === 0 ? (
            <div className="py-10 text-center text-sm text-zinc-400">
              No matching unused wine entities found for &ldquo;{query}&rdquo;.
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
                  className={`w-full text-left px-5 py-3 flex items-center justify-between transition ${
                    isSelected
                      ? "bg-burgundy-900/50 text-white"
                      : "hover:bg-white/5 text-zinc-200"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-serif font-semibold text-base text-champagne-50">
                        {entity.name}
                      </span>
                      {getEntityBadge(entity.entityType)}
                    </div>
                    <div className="text-xs text-zinc-400 mt-0.5">
                      {entity.country} &bull; {entity.macroRegion}
                      {entity.subRegion ? ` (${entity.subRegion})` : ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-champagne-400 font-medium hidden sm:inline">
                      Select
                    </span>
                    <Check
                      className={`w-4 h-4 ${
                        isSelected ? "text-champagne-400" : "text-zinc-600"
                      }`}
                    />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer tip */}
        <div className="bg-cellar-950 px-5 py-2.5 border-t border-white/10 flex items-center justify-between text-[11px] text-zinc-400">
          <span>
            Tip: Rarer valid answers earn a lower (better) Sommelier Rarity Score!
          </span>
          <span className="hidden sm:inline text-zinc-500">
            ↑↓ Navigate &bull; Enter to Guess &bull; Esc to Cancel
          </span>
        </div>
      </div>
    </div>
  );
}
