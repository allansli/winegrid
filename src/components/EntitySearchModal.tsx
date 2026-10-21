"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ClueDefinition,
  EntityFilterMode,
  WineEntity,
  WineEntityType,
} from "@/types/wine";
import { searchWineEntities } from "@/data/wineDatabase";
import { movePickerIndex, pickerEnterAction } from "@/lib/pickerSelection";
import { ModalFrame } from "./ModalFrame";
import { Search, X, Wine, Grape, Castle, ArrowRight } from "lucide-react";

interface EntitySearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  rowClue: ClueDefinition;
  colClue: ClueDefinition;
  acceptedTypes: WineEntityType[];
  validEntityIds: string[];
  validCount: number;
  usedEntityIds: Set<string>;
  onSelectEntity: (entity: WineEntity) => void;
}

const TYPE_LABELS: Record<WineEntityType, string> = {
  appellation: "Region",
  grape: "Grape",
  producer: "Producer",
};

const HINTS_STORAGE_KEY = "winegrid_picker_hints_v1";

export function EntitySearchModal({
  isOpen,
  onClose,
  rowClue,
  colClue,
  acceptedTypes,
  validEntityIds,
  validCount,
  usedEntityIds,
  onSelectEntity,
}: EntitySearchModalProps) {
  const [query, setQuery] = useState("");
  const [activeTypeTab, setActiveTypeTab] = useState<EntityFilterMode>("all");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [hintsOn, setHintsOn] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const renderedQueryRef = useRef("");

  const cellKey = `${rowClue.id}:${colClue.id}`;
  const acceptedKey = acceptedTypes.join(",");

  useEffect(() => {
    try {
      setHintsOn(window.localStorage.getItem(HINTS_STORAGE_KEY) === "1");
    } catch {
      setHintsOn(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setQuery("");
    setSelectedIndex(0);
    setActiveTypeTab(acceptedTypes.length === 1 ? acceptedTypes[0] : "all");
    // acceptedKey is the stable identity. Depending on the array would wipe
    // the field on every parent render (the daily countdown ticks once a second).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, cellKey, acceptedKey]);

  const validIdSet = useMemo(() => new Set(validEntityIds), [validEntityIds]);

  const results = useMemo(() => {
    return searchWineEntities(query, activeTypeTab, usedEntityIds, {
      acceptedTypes,
      limit: query.trim() ? 25 : 40,
    });
  }, [query, activeTypeTab, usedEntityIds, acceptedTypes]);

  renderedQueryRef.current = query;

  useEffect(() => {
    const firstSelectable = results.findIndex(
      (entity) => !hintsOn || validIdSet.has(entity.id)
    );
    setSelectedIndex(firstSelectable >= 0 ? firstSelectable : 0);
    // Reset the highlight when the query or hint mode changes, not when the
    // parent re-renders an equivalent result list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, activeTypeTab, hintsOn]);

  const toggleHints = () => {
    setHintsOn((current) => {
      const next = !current;
      try {
        window.localStorage.setItem(HINTS_STORAGE_KEY, next ? "1" : "0");
      } catch {
        // Ignore private mode
      }
      return next;
    });
  };

  const rows = results.map((entity) => ({
    id: entity.id,
    selectable: !hintsOn || validIdSet.has(entity.id),
  }));

  const commitIndex = (index: number) => {
    const entity = results[index];
    if (!entity) return;
    if (hintsOn && !validIdSet.has(entity.id)) return;
    onSelectEntity(entity);
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setSelectedIndex((current) =>
        movePickerIndex(rows, current, event.key === "ArrowDown" ? 1 : -1)
      );
      return;
    }
    if (event.key !== "Enter" || event.nativeEvent.isComposing) return;
    event.preventDefault();
    const decision = pickerEnterAction({
      inputValue: event.currentTarget.value,
      renderedQuery: renderedQueryRef.current,
      results: rows,
      selectedIndex,
    });
    if (decision.action === "sync") {
      setQuery(event.currentTarget.value);
      return;
    }
    if (decision.action === "select") commitIndex(decision.index);
  };

  return (
    <ModalFrame
      isOpen={isOpen}
      onClose={onClose}
      ariaLabel={`Pick an answer for ${rowClue.shortLabel} and ${colClue.shortLabel}`}
      initialFocusRef={inputRef}
      overlayClassName="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/30 backdrop-blur-sm p-2.5 sm:p-4 pt-4 sm:pt-16"
      panelClassName="w-full max-w-xl max-h-[90dvh] flex flex-col rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white shadow-modal overflow-hidden"
    >
      <div className="bg-slate-50/80 px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200/70 shrink-0">
        <div className="flex items-center justify-between gap-2 mb-2.5 sm:mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-500 mr-1">
              {validCount} possible · Accepts:
            </span>
            {acceptedTypes.map((type) => (
              <span
                key={type}
                className="inline-flex items-center gap-1 rounded-full px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-[11px] font-medium bg-slate-200/70 text-slate-700 border border-slate-300/80"
              >
                {type === "appellation" && <Wine className="w-3 h-3 text-slate-500" />}
                {type === "grape" && <Grape className="w-3 h-3 text-slate-500" />}
                {type === "producer" && <Castle className="w-3 h-3 text-slate-500" />}
                {TYPE_LABELS[type]}
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className="rounded-xl sm:rounded-2xl bg-white border border-slate-200/80 p-2.5 sm:p-3 shadow-sm">
            <div className="text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold text-slate-400 truncate">
              Row · {rowClue.category.replace("_", " ")}
            </div>
            <div className="font-display text-xs sm:text-sm font-bold text-slate-900 mt-0.5 leading-snug">
              {rowClue.shortLabel}
            </div>
          </div>
          <div className="rounded-xl sm:rounded-2xl bg-white border border-slate-200/80 p-2.5 sm:p-3 shadow-sm">
            <div className="text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold text-slate-400 truncate">
              Col · {colClue.category.replace("_", " ")}
            </div>
            <div className="font-display text-xs sm:text-sm font-bold text-slate-900 mt-0.5 leading-snug">
              {colClue.shortLabel}
            </div>
          </div>
        </div>
      </div>

      {acceptedTypes.length > 1 && (
        <div className="px-4 sm:px-6 pt-2.5 sm:pt-3 pb-1 bg-white flex items-center gap-1.5 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTypeTab("all")}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              activeTypeTab === "all"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
            }`}
          >
            All accepted
          </button>
          {acceptedTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setActiveTypeTab(type)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                activeTypeTab === type
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
              }`}
            >
              {TYPE_LABELS[type]}s
            </button>
          ))}
        </div>
      )}

      <div className="relative border-b border-slate-200/70 bg-white px-4 sm:px-6 py-3 sm:py-3.5 shrink-0">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 sm:left-6 top-1/2 -translate-y-1/2" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder={`Search ${acceptedTypes
            .map((type) => TYPE_LABELS[type].toLowerCase())
            .join(", ")}...`}
          className="w-full bg-transparent pl-8 sm:pl-9 pr-4 text-base text-slate-900 placeholder-slate-400 focus:outline-none"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          aria-autocomplete="list"
        />
      </div>

      <div className="flex-1 min-h-0 max-h-72 overflow-y-auto divide-y divide-slate-100">
        {results.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-400">
            No matching{" "}
            {acceptedTypes.map((type) => TYPE_LABELS[type].toLowerCase()).join(" / ")}{" "}
            for “{query}”.
          </div>
        ) : (
          results.map((entity, index) => {
            const selectable = !hintsOn || validIdSet.has(entity.id);
            const isSelected = index === selectedIndex && selectable;
            return (
              <button
                key={entity.id}
                type="button"
                disabled={!selectable}
                onClick={() => commitIndex(index)}
                onMouseEnter={() => {
                  if (selectable) setSelectedIndex(index);
                }}
                className={`w-full text-left px-6 py-3.5 flex items-center justify-between transition ${
                  !selectable
                    ? "bg-slate-50/80 text-slate-400 cursor-not-allowed"
                    : isSelected
                    ? "bg-slate-50"
                    : "bg-white hover:bg-slate-50/60"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span
                      className={`font-display font-bold text-sm sm:text-base ${
                        selectable ? "text-slate-900" : "text-slate-400"
                      }`}
                    >
                      {entity.name}
                    </span>
                    <TypeBadge type={entity.entityType} muted={!selectable} />
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {entity.country} · {entity.macroRegion}
                    {!selectable ? " · doesn’t fit this cell" : ""}
                  </div>
                </div>
                <ArrowRight
                  className={`w-4 h-4 transition ${
                    isSelected ? "text-slate-900 translate-x-0.5" : "text-slate-300"
                  }`}
                />
              </button>
            );
          })
        )}
      </div>

      <div className="bg-slate-50/80 px-4 sm:px-6 py-3 border-t border-slate-200/70 flex items-center justify-between gap-3 text-[11px] text-slate-400">
        <button
          type="button"
          onClick={toggleHints}
          aria-pressed={hintsOn}
          className={`rounded-full px-3 py-1 font-semibold transition ${
            hintsOn
              ? "bg-slate-900 text-white"
              : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
          }`}
        >
          {hintsOn ? "Hints on" : "Hints off"}
        </button>
        <span className="hidden sm:inline">↑↓ Navigate · Enter selects the synced row</span>
      </div>
    </ModalFrame>
  );
}

function TypeBadge({
  type,
  muted,
}: {
  type: WineEntityType;
  muted: boolean;
}) {
  const className = muted
    ? "inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[11px] font-medium text-slate-400"
    : "inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200/90 px-2.5 py-0.5 text-[11px] font-medium text-slate-600";
  const icon =
    type === "appellation" ? (
      <Wine className="w-3 h-3" />
    ) : type === "grape" ? (
      <Grape className="w-3 h-3" />
    ) : (
      <Castle className="w-3 h-3" />
    );
  return (
    <span className={className}>
      {icon} {TYPE_LABELS[type]}
    </span>
  );
}
