"use client";

import React, { useMemo, useState } from "react";
import { ALL_WINE_ENTITIES } from "@/data/wineDatabase";
import { CLUE_CATALOG } from "@/data/clueCatalog";
import { EntityFilterMode } from "@/types/wine";
import { Search, X, Filter } from "lucide-react";

interface SommelierCodexModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SommelierCodexModal({
  isOpen,
  onClose,
}: SommelierCodexModalProps) {
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[86vh] flex flex-col rounded-3xl border border-slate-200 bg-white shadow-modal overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-50/80 px-6 py-5 border-b border-slate-200/80 flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-wine-600 font-semibold">
              Knowledge Graph
            </div>
            <h2 className="font-display text-xl font-bold text-slate-900 mt-0.5">
              WineGrid Codex ({filteredEntities.length} of {ALL_WINE_ENTITIES.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition"
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
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search region, grape, estate, or soil..."
                className="w-full rounded-xl bg-slate-50 border border-slate-200/80 pl-9 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-wine-400"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {(
                ["all", "appellation", "grape", "producer"] as EntityFilterMode[]
              ).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTypeFilter(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ${
                    typeFilter === t
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {t === "all" ? "All" : `${t}s`}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedClueId}
              onChange={(e) => setSelectedClueId(e.target.value)}
              className="w-full rounded-xl bg-slate-50 border border-slate-200/80 px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-wine-400"
            >
              <option value="all">
                Filter by any of the {CLUE_CATALOG.length} Matrix Criteria (All)
              </option>
              {CLUE_CATALOG.map((clue) => (
                <option key={clue.id} value={clue.id}>
                  [{clue.category.toUpperCase()}] {clue.label}
                </option>
              ))}
            </select>
          </div>
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
                      {entity.country} &bull; {entity.macroRegion}
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 capitalize">
                    {entity.entityType}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                  {entity.sommelierNote}
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
      </div>
    </div>
  );
}
