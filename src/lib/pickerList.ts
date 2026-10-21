import { entityMatchesSearch, EntitySearchScope, searchQuery } from "@/data/wineDatabase";
import { Locale } from "@/i18n/locale";
import { pickKeepsBoardSolvable, type SolvableCell } from "@/lib/matrixGenerator";
import { WineEntity } from "@/types/wine";

/** The only answer set the picker, the hints, the count, and the validator read. */
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

function matchesQuery(
  entity: WineEntity,
  rawQuery: string,
  scope: EntitySearchScope,
  locale?: Locale
): boolean {
  const q = searchQuery(rawQuery);
  if (q === null) return false;
  return entityMatchesSearch(entity, rawQuery, locale, scope);
}

function byRarity(a: WineEntity, b: WineEntity): number {
  return a.baseRarity - b.baseRarity || a.canonicalName.localeCompare(b.canonicalName);
}

function orderValids(valid: readonly WineEntity[], usedIds: ReadonlySet<string>): WineEntity[] {
  const unused: WineEntity[] = [];
  const used: WineEntity[] = [];
  for (const entity of [...valid].sort(byRarity)) {
    if (usedIds.has(entity.id)) used.push(entity);
    else unused.push(entity);
  }
  return [...unused, ...used];
}

/**
 * Hints on: the cell's valid answers, unused before used, with no rarity cap.
 * The query uses the full scope, including notes and grapes.
 * Hints off: name, alias, and place only, in the shared search ranking.
 * Fitting answers are not pulled to the front.
 */
export function buildPickerResults(input: {
  query: string;
  hintsOn: boolean;
  validEntities: readonly WineEntity[];
  usedIds?: ReadonlySet<string>;
  extraEntities?: readonly WineEntity[];
  locale?: Locale;
}): WineEntity[] {
  if (searchQuery(input.query) === null) return [];
  const scope: EntitySearchScope = input.hintsOn ? "full" : "identity";
  if (input.hintsOn) {
    return orderValids(
      input.validEntities.filter((entity) => matchesQuery(entity, input.query, scope, input.locale)),
      input.usedIds ?? new Set()
    );
  }
  return (input.extraEntities ?? []).filter((entity) =>
    matchesQuery(entity, input.query, scope, input.locale)
  );
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
