import { WineEntity } from "@/types/wine";

function markCount(value: string): number {
  return (value.normalize("NFD").match(/\p{M}/gu) ?? []).length;
}

function foldKey(value: string): string {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

function segments(value: string): string[] {
  return value
    .split(/\s*(?:\/|&|·|\|)\s*/)
    .map((part) => part.trim())
    .filter(Boolean);
}

type Named = Pick<
  WineEntity,
  "id" | "name" | "canonicalName" | "subRegion" | "aliases" | "primaryGrapes" | "alsoRegions"
>;

/**
 * Wine proper names (the card title, canonical name, subregion, grapes, and
 * extra wine regions) must keep their accented spelling. An ASCII fold is a
 * problem when the same name exists with diacritics. Administrative exonyms
 * such as Aragon are not checked here.
 */
export function accentFoldedWineNames(entities: readonly Named[]): string[] {
  const accented = new Map<string, string>();
  const remember = (value: string) => {
    if (!value || markCount(value) === 0) return;
    const key = foldKey(value);
    const prev = accented.get(key);
    if (!prev || markCount(value) > markCount(prev)) accented.set(key, value);
  };

  for (const entity of entities) {
    for (const value of [
      entity.name,
      entity.canonicalName,
      entity.subRegion ?? "",
      ...entity.aliases,
      ...entity.primaryGrapes,
      ...(entity.alsoRegions ?? []),
    ]) {
      remember(value);
      for (const segment of segments(value)) remember(segment);
    }
  }

  const problems: string[] = [];
  for (const entity of entities) {
    const displayed = [
      entity.name,
      entity.canonicalName,
      entity.subRegion ?? "",
      ...entity.primaryGrapes,
      ...(entity.alsoRegions ?? []),
    ];
    for (const value of displayed) {
      for (const segment of [value, ...segments(value)]) {
        if (!segment || markCount(segment) > 0) continue;
        const canonical = accented.get(foldKey(segment));
        if (canonical && canonical !== segment) {
          problems.push(`${entity.id}: "${segment}" should keep "${canonical}"`);
        }
      }
    }
  }
  return problems;
}
