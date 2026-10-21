"use client";

import React, { useMemo, useState } from "react";
import { ALL_WINE_ENTITIES } from "@/data/wineDatabase";
import { CLUE_CATALOG } from "@/data/clueCatalog";
import { EntityFilterMode } from "@/types/wine";
import { BookOpen, Search, X, Wine, Grape, Castle, Filter } from "lucide-react";

interface SommelierCodexModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SommelierCodexModal({ isOpen, onClose }: SommelierCodexModalProps) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<EntityFilterMode>("all");
  const [selectedClueId, setSelectedClueId] = useState<string>("all");

  const activeClue = useMemo(
    () => CLUE_CATALOG.find((c) => c.id === selectedClueId) || null,
    [selectedClueId]
  );

  const filteredEntities = useMemo(() => {
    const q = query.toLowerCase().trim();
    return ALL_WINE_ENTITIES.filter((e) => {
      if (typeFilter !== "all" && e.entityType !== typeFilter) return false;
      if (activeClue && !activeClue.predicate(e)) return false;
      if (!q) return true;
      return (
        e.name.toLowerCase().includes(q) ||
        e.country.toLowerCase().includes(q) ||
        e.macroRegion.toLowerCase().includes(q) ||
        e.primaryGrapes.some((g) => g.toLowerCase().includes(q)) ||
        e.sommelierNote.toLowerCase().includes(q)
      );
    });
  }, [query, typeFilter, activeClue]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[88vh] flex flex-col rounded-2xl border border-champagne-500/30 bg-cellar-900 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-burgundy-950 via-cellar-900 to-burgundy-950 px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-widest text-champagne-400 font-semibold flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> Master Sommelier Knowledge Graph
            </div>
            <h2 className="text-xl font-serif font-bold text-white mt-0.5">
              WineGrid Codex ({ALL_WINE_ENTITIES.length} Entities &bull; {CLUE_CATALOG.length} Matrix Predicates)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters Bar */}
        <div className="bg-cellar-950 px-6 py-3.5 border-b border-white/10 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-champagne-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by appellation, grape, producer, soil, or tasting note..."
                className="w-full rounded-xl bg-cellar-900 border border-white/10 pl-9 pr-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-champagne-400"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-cellar-900 p-1 rounded-xl border border-white/10">
              {(["all", "appellation", "grape", "producer"] as EntityFilterMode[]).map(
                (t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTypeFilter(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ${
                      typeFilter === t
                        ? "bg-burgundy-700 text-white"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {t === "all" ? "All Types" : `${t}s`}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-champagne-400 shrink-0" />
            <select
              value={selectedClueId}
              onChange={(e) => setSelectedClueId(e.target.value)}
              className="w-full rounded-xl bg-cellar-900 border border-white/10 px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-champagne-400"
            >
              <option value="all">
                Filter by any of the {CLUE_CATALOG.length} Sommelier Matrix Clues (Showing All)
              </option>
              {CLUE_CATALOG.map((clue) => (
                <option key={clue.id} value={clue.id}>
                  [{clue.category.toUpperCase()} - {clue.difficulty.toUpperCase()}] {clue.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Entity Cards */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredEntities.map((entity) => (
            <div
              key={entity.id}
              className="rounded-xl border border-white/10 bg-cellar-950/90 p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-serif font-bold text-base text-champagne-100">
                      {entity.name}
                    </h3>
                    <div className="text-xs text-zinc-400 mt-0.5">
                      {entity.country} &bull; {entity.macroRegion}
                      {entity.subRegion ? ` (${entity.subRegion})` : ""}
                    </div>
                  </div>
                  <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-[11px] text-champagne-300 capitalize">
                    {entity.entityType === "appellation" && <Wine className="w-3 h-3" />}
                    {entity.entityType === "grape" && <Grape className="w-3 h-3" />}
                    {entity.entityType === "producer" && <Castle className="w-3 h-3" />}
                    {entity.entityType}
                  </span>
                </div>

                <p className="text-xs text-zinc-300 mt-2.5 leading-relaxed">
                  {entity.sommelierNote}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-white/5 flex flex-wrap gap-1.5">
                {entity.classifications.map((c) => (
                  <span
                    key={c}
                    className="text-[10px] px-2 py-0.5 rounded bg-champagne-950/70 border border-champagne-700/40 text-champagne-200"
                  >
                    {c.replace(/_/g, " ")}
                  </span>
                ))}
                {entity.soils.map((s) => (
                  <span
                    key={s}
                    className="text-[10px] px-2 py-0.5 rounded bg-burgundy-950/80 border border-burgundy-800/50 text-burgundy-200"
                  >
                    {s.replace(/_/g, " ")}
                  </span>
                ))}
                {entity.primaryGrapes.slice(0, 3).map((g) => (
                  <span
                    key={g}
                    className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-800/50 text-emerald-200"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
