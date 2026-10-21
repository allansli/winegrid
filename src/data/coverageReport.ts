import { CLUE_CATALOG } from "@/data/clueCatalog";
import { ALL_WINE_ENTITIES } from "@/data/wineDatabase";
import { DIFFICULTY_TUNING } from "@/lib/difficultyTuning";
import { generateWineGridBoard } from "@/lib/matrixGenerator";
import { ClueDefinition, DifficultyLevel, EntityFilterMode, WineEntityType } from "@/types/wine";

const TYPE_ORDER: WineEntityType[] = ["appellation", "grape", "producer"];
const TYPE_LABEL: Record<WineEntityType, string> = {
  appellation: "Regions",
  grape: "Grapes",
  producer: "Producers",
};

const FILTERS: EntityFilterMode[] = ["all", "appellation", "grape", "producer"];
const DIFFICULTIES: DifficultyLevel[] = ["wset2", "wset3", "master_somm"];

/** Fixed sample so the committed report does not drift between runs. */
export const COVERAGE_SEEDS = ["coverage-0", "coverage-1", "coverage-2", "coverage-3", "coverage-4", "coverage-5"];

/**
 * Zeros that the catalog defines, rather than holes to fill.
 * Entity-type clues match one type. Classification clues and the blend
 * clue exclude grapes on purpose.
 */
export function isStructuralClueTypeGap(clue: ClueDefinition, type: WineEntityType): boolean {
  if (clue.category === "entity_type") return true;
  if (clue.category === "classification" && type === "grape") return true;
  if (clue.id === "var-multi-blend" && type === "grape") return true;
  return false;
}

export interface ClueTypeCount {
  clueId: string;
  label: string;
  category: string;
  difficulty: DifficultyLevel;
  type: WineEntityType;
  count: number;
  structural: boolean;
}

export function clueTypeCounts(entities = ALL_WINE_ENTITIES): ClueTypeCount[] {
  const rows: ClueTypeCount[] = [];
  for (const clue of CLUE_CATALOG) {
    const counts: Record<WineEntityType, number> = { appellation: 0, grape: 0, producer: 0 };
    for (const entity of entities) {
      if (clue.predicate(entity)) counts[entity.entityType] += 1;
    }
    for (const type of TYPE_ORDER) {
      rows.push({
        clueId: clue.id,
        label: clue.shortLabel,
        category: clue.category,
        difficulty: clue.difficulty,
        type,
        count: counts[type],
        structural: isStructuralClueTypeGap(clue, type),
      });
    }
  }
  return rows;
}

export function coverageGaps(limit = 15): ClueTypeCount[] {
  return clueTypeCounts()
    .filter((row) => !row.structural)
    .sort((a, b) => a.count - b.count || a.clueId.localeCompare(b.clueId) || a.type.localeCompare(b.type))
    .slice(0, limit);
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[mid];
  return (sorted[mid - 1] + sorted[mid]) / 2;
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function inventorySection(): string {
  const lines: string[] = [];
  const totals: Record<WineEntityType, number> = { appellation: 0, grape: 0, producer: 0 };
  const byCountry = new Map<string, Record<WineEntityType, number>>();
  for (const entity of ALL_WINE_ENTITIES) {
    totals[entity.entityType] += 1;
    const row = byCountry.get(entity.country) ?? { appellation: 0, grape: 0, producer: 0 };
    row[entity.entityType] += 1;
    byCountry.set(entity.country, row);
  }
  lines.push("## Inventory");
  lines.push("");
  lines.push(`The catalog has ${ALL_WINE_ENTITIES.length} entities.`);
  lines.push("");
  lines.push("| Type | Count |");
  lines.push("| --- | ---: |");
  for (const type of TYPE_ORDER) lines.push(`| ${TYPE_LABEL[type]} | ${totals[type]} |`);
  lines.push(`| Total | ${ALL_WINE_ENTITIES.length} |`);
  lines.push("");
  lines.push("### Per country");
  lines.push("");
  lines.push("| Country | Regions | Grapes | Producers | Total |");
  lines.push("| --- | ---: | ---: | ---: | ---: |");
  const countries = [...byCountry.entries()].sort((a, b) => {
    const totalA = a[1].appellation + a[1].grape + a[1].producer;
    const totalB = b[1].appellation + b[1].grape + b[1].producer;
    return totalB - totalA || a[0].localeCompare(b[0]);
  });
  for (const [country, counts] of countries) {
    const total = counts.appellation + counts.grape + counts.producer;
    lines.push(`| ${country} | ${counts.appellation} | ${counts.grape} | ${counts.producer} | ${total} |`);
  }
  return lines.join("\n");
}

function categorySection(): string {
  const lines: string[] = [];
  lines.push("## Clue categories");
  lines.push("");
  lines.push("An entity satisfies a category when at least one clue in that category matches it.");
  lines.push("");
  lines.push("| Category | Clues | Regions | Grapes | Producers |");
  lines.push("| --- | ---: | ---: | ---: | ---: |");
  const categories: string[] = [];
  for (const clue of CLUE_CATALOG) {
    if (!categories.includes(clue.category)) categories.push(clue.category);
  }
  for (const category of categories) {
    const clues = CLUE_CATALOG.filter((clue) => clue.category === category);
    const counts: Record<WineEntityType, number> = { appellation: 0, grape: 0, producer: 0 };
    for (const entity of ALL_WINE_ENTITIES) {
      if (clues.some((clue) => clue.predicate(entity))) counts[entity.entityType] += 1;
    }
    lines.push(
      `| ${category} | ${clues.length} | ${counts.appellation} | ${counts.grape} | ${counts.producer} |`
    );
  }
  return lines.join("\n");
}

function floorNote(count: number): string {
  const notes: string[] = [];
  if (count < DIFFICULTY_TUNING.wset2.clueSupportFloor) notes.push("below Standard support");
  else if (count <= DIFFICULTY_TUNING.wset2.minimumValidAnswers) notes.push("at the Standard cell floor");
  if (count < DIFFICULTY_TUNING.master_somm.clueSupportFloor) notes.push("below Master support");
  else if (count <= DIFFICULTY_TUNING.master_somm.minimumValidAnswers) notes.push("at the Master cell floor");
  return notes.join("; ") || "above the floors";
}

function gapSection(): string {
  const gaps = coverageGaps(15);
  const lines: string[] = [];
  lines.push("## Weakest clue × type pairs");
  lines.push("");
  lines.push(
    "These are the 15 smallest non-structural populations. A filtered board can only draw answers of that type, so a pair sitting on a cell floor is what pushes that board to the minimum answer count. A pair under a clue support floor is dropped from that difficulty instead of being dealt."
  );
  lines.push("");
  lines.push(
    `Floors come from \`difficultyTuning.ts\`: Standard and Sommelier cells ${DIFFICULTY_TUNING.wset2.minimumValidAnswers}, clue support ${DIFFICULTY_TUNING.wset2.clueSupportFloor}. Master cells ${DIFFICULTY_TUNING.master_somm.minimumValidAnswers}, clue support ${DIFFICULTY_TUNING.master_somm.clueSupportFloor}.`
  );
  lines.push("");
  lines.push("| Rank | Clue | Type | Matches | Difficulty | Why it binds |");
  lines.push("| ---: | --- | --- | ---: | --- | --- |");
  gaps.forEach((gap, index) => {
    lines.push(
      `| ${index + 1} | ${gap.label} (\`${gap.clueId}\`) | ${TYPE_LABEL[gap.type]} | ${gap.count} | ${gap.difficulty} | ${floorNote(gap.count)} |`
    );
  });
  lines.push("");
  lines.push(
    "Structural zeros are left out of this list. Entity-type clues match only their own type. Classification clues and Classic Blend exclude grapes on purpose."
  );
  return lines.join("\n");
}

function distributionSection(): string {
  const lines: string[] = [];
  lines.push("## Answer-count distribution");
  lines.push("");
  lines.push(
    `Each difficulty is sampled with seeds ${COVERAGE_SEEDS[0]} through ${COVERAGE_SEEDS[COVERAGE_SEEDS.length - 1]} and filters all, regions, grapes, and producers. That is ${COVERAGE_SEEDS.length * FILTERS.length} boards and ${COVERAGE_SEEDS.length * FILTERS.length * 9} cells per difficulty.`
  );
  lines.push("");
  for (const difficulty of DIFFICULTIES) {
    const tuning = DIFFICULTY_TUNING[difficulty];
    const counts: number[] = [];
    for (const seed of COVERAGE_SEEDS) {
      for (const entityFilter of FILTERS) {
        const board = generateWineGridBoard({ seed, mode: "unlimited", difficulty, entityFilter });
        for (const cell of board.cells) counts.push(cell.validEntityIds.length);
      }
    }
    const min = Math.min(...counts);
    const max = Math.max(...counts);
    const atFloor = counts.filter((count) => count === tuning.minimumValidAnswers).length;
    lines.push(`### ${tuning.name}`);
    lines.push("");
    lines.push(
      `${counts.length} cells. Minimum ${min}, median ${formatNumber(median(counts))}, maximum ${max}. ${atFloor} cells (${((100 * atFloor) / counts.length).toFixed(1)}%) sit on the floor of ${tuning.minimumValidAnswers}.`
    );
    lines.push("");
    lines.push("| Answers | Cells | Share |");
    lines.push("| ---: | ---: | ---: |");
    for (let answers = min; answers <= max; answers++) {
      const cells = counts.filter((count) => count === answers).length;
      if (cells === 0) continue;
      lines.push(`| ${answers} | ${cells} | ${((100 * cells) / counts.length).toFixed(1)}% |`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

export function buildCoverageReport(): string {
  const parts = [
    "# WineGrid data coverage",
    "",
    "Generated by `npm run coverage:data`. Do not edit this file by hand. Regenerate it after the catalog changes.",
    "",
    inventorySection(),
    "",
    categorySection(),
    "",
    gapSection(),
    "",
    distributionSection().trimEnd(),
    "",
  ];
  return parts.join("\n");
}
