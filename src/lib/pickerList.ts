import { fieldsMatchSearch, searchQuery } from "@/data/wineDatabase";
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

function matchesQuery(entity: WineEntity, rawQuery: string): boolean {
  const q = searchQuery(rawQuery);
  if (q === null) return false;
  if (q === "") return true;
  return fieldsMatchSearch(
    [
      entity.name,
      entity.canonicalName,
      entity.country,
      entity.macroRegion,
      entity.subRegion ?? "",
      ...entity.aliases,
      ...entity.primaryGrapes,
    ],
    rawQuery
  );
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
 * Suggestions and hints are the cell's valid answers, with no rarity cap.
 * Unused answers come before ones already on the board. With hints off, other
 * search hits follow and are labeled as misses.
 */
export function buildPickerResults(input: {
  query: string;
  hintsOn: boolean;
  validEntities: readonly WineEntity[];
  usedIds?: ReadonlySet<string>;
  extraEntities?: readonly WineEntity[];
}): WineEntity[] {
  if (searchQuery(input.query) === null) return [];
  const valid = orderValids(
    input.validEntities.filter((entity) => matchesQuery(entity, input.query)),
    input.usedIds ?? new Set()
  );
  if (input.hintsOn) return valid;
  const validIds = new Set(valid.map((entity) => entity.id));
  const extras = (input.extraEntities ?? []).filter(
    (entity) => !validIds.has(entity.id) && matchesQuery(entity, input.query)
  );
  return [...valid, ...extras];
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
