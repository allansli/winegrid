import { entityMatchesSearch, searchQuery } from "@/data/wineDatabase";
import { Locale } from "@/i18n/locale";
import { pickKeepsBoardSolvable, type SolvableCell } from "@/lib/matrixGenerator";
import { EntityFilterMode, WineEntity, WineEntityType } from "@/types/wine";

/** The answer set the count and the validator read. The picker does not. */
export function validEntityIds(cell: { validEntityIds: readonly string[] }): readonly string[] {
  return cell.validEntityIds;
}

/** The same check the board uses when it accepts a guess. */
export function entityFitsCell(entityId: string, ids: readonly string[]): boolean {
  return ids.includes(entityId);
}

export function validEntities(
  cell: { validEntityIds: readonly string[] },
  byId: Readonly<Record<string, WineEntity | undefined>>
): WineEntity[] {
  const entities: WineEntity[] = [];
  for (const id of validEntityIds(cell)) {
    const entity = byId[id];
    if (entity) entities.push(entity);
  }
  return entities;
}

const ALL_TYPES: WineEntityType[] = ["appellation", "grape", "producer"];

const TYPE_BY_CLUE: Record<string, WineEntityType> = {
  "type-appellation": "appellation",
  "type-grape": "grape",
  "type-producer": "producer",
};

/**
 * Types the player already knows from the board filter or a type clue.
 * This does not look at which answers happen to fit the cell.
 */
export function cellAcceptedTypes(input: {
  entityFilter: EntityFilterMode;
  rowClueId: string;
  colClueId: string;
}): WineEntityType[] {
  const filterType =
    input.entityFilter === "appellation" ||
    input.entityFilter === "grape" ||
    input.entityFilter === "producer"
      ? input.entityFilter
      : null;
  const clueType = TYPE_BY_CLUE[input.rowClueId] ?? TYPE_BY_CLUE[input.colClueId] ?? null;
  if (filterType && clueType) return filterType === clueType ? [filterType] : [filterType];
  if (filterType) return [filterType];
  if (clueType) return [clueType];
  return [...ALL_TYPES];
}

function matchesName(entity: WineEntity, rawQuery: string, locale?: Locale): boolean {
  const q = searchQuery(rawQuery);
  if (q === null) return false;
  return entityMatchesSearch(entity, rawQuery, locale, "name");
}

/**
 * Name and alias matches, in the order the caller already ranked them.
 * The cell's clues are not an input, so valid answers cannot be pulled forward
 * and results cannot be filtered down to the cell.
 */
export function buildPickerResults(input: {
  query: string;
  entities: readonly WineEntity[];
  locale?: Locale;
}): WineEntity[] {
  if (searchQuery(input.query) === null) return [];
  return input.entities.filter((entity) => matchesName(entity, input.query, input.locale));
}

export type PickDecision = "used" | "blocked" | "correct" | "miss";

/** What the cell picker does with a click, including the dead-end guard. */
export function evaluatePick(
  cells: readonly SolvableCell[],
  cellIndex: number,
  entityId: string
): PickDecision {
  if (cells.some((cell) => cell.pickedEntityId === entityId)) return "used";
  const cell = cells[cellIndex];
  const valid = cell ? validEntityIds(cell) : [];
  if (!entityFitsCell(entityId, valid)) return "miss";
  if (!pickKeepsBoardSolvable(cells, cellIndex, entityId)) return "blocked";
  return "correct";
}
