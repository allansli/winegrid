import assert from "node:assert/strict";
import fs from "node:fs";
import { describe, it } from "node:test";
import { CLUE_BY_ID, CLUE_CATALOG } from "./clueCatalog";
import { COVERAGE_SEEDS } from "./coverageReport";
import { EMPTY_REQUIRED_TAG_ALLOWLIST, answeredClueIds, validateCatalog } from "./entitySchema";
import { ALSO_COUNTRY_SOURCES, CLIMATE_SOURCES, TAG_SOURCES, alsoCountryNote } from "./tagSources";
import {
  ALL_WINE_ENTITIES,
  WINE_ENTITY_BY_ID,
  codexClueMatcher,
  entityMatchesCodexQuery,
  entityMatchesSearch,
  filterCodexEntities,
  normalizeSearchText,
  searchQuery,
} from "./wineDatabase";
import { localizedClue, PT_CLUE_COPY } from "../i18n/clues";
import { PT_NOTES } from "../i18n/notesPt";
import { entityOriginLine } from "../i18n/places";
import { displayEntityName } from "../lib/entityName";
import { DIFFICULTY_TUNING } from "../lib/difficultyTuning";
import {
  createPrng,
  generateDailyBoard,
  generateWineGridBoard,
  guardedPlaythroughSucceeds,
} from "../lib/matrixGenerator";
import { DifficultyLevel, EntityFilterMode } from "../types/wine";

const CHECKLIST_PATH = new URL("../../docs/acceptance-checklist.md", import.meta.url);
const SOURCES_PATH = new URL("../../docs/new-clues-sources.json", import.meta.url);
const SCHEMA_PATH = new URL("./entitySchema.ts", import.meta.url);

const TAG_FIELDS = [
  "classifications",
  "soils",
  "climates",
  "waterBodies",
  "styles",
  "vinification",
  "sensory",
  "varietalTraits",
  "bottleShapes",
  "heritage",
] as const;

const TIER_NAME = {
  wset2: "Standard",
  wset3: "Sommelier",
  master_somm: "Master",
} as const;

const NEW_SOURCED_TAGS = ["used_neutral_oak", "sandy_soil", "gneiss", "tropical_double_pruning"] as const;

const DIFFICULTIES: DifficultyLevel[] = ["wset2", "wset3", "master_somm"];
const FILTERS: EntityFilterMode[] = ["all", "appellation", "grape", "producer"];

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[mid];
  return (sorted[mid - 1] + sorted[mid]) / 2;
}

function accentFree(value: string): string {
  return value.normalize("NFD").replace(/\p{M}/gu, "");
}

function clueCardCount(clueId: string): number {
  const clue = CLUE_BY_ID[clueId];
  return ALL_WINE_ENTITIES.filter((entity) => clue.predicate(entity)).length;
}

function allowlistReasons(source: string): Record<string, string> {
  const start = source.indexOf("export const EMPTY_REQUIRED_TAG_ALLOWLIST");
  const end = source.indexOf("export interface EntityValidationContext");
  const block = source.slice(start, end);
  const reasons: Record<string, string> = {};
  let pending: string[] = [];
  for (const line of block.split("\n")) {
    const comment = line.match(/^\s*\/\/\s*(.*)$/);
    if (comment) {
      pending.push(comment[1].trim());
      continue;
    }
    const key = line.match(/"([^"]+)"\s*:/);
    if (key) {
      reasons[key[1]] = pending.join(" ").trim();
      pending = [];
    }
  }
  return reasons;
}

describe("acceptance checklist: data", () => {
  it("accepts the catalog, including pt-BR notes, labels, and unique aliases", () => {
    assert.deepEqual(validateCatalog(ALL_WINE_ENTITIES), []);
    for (const entity of ALL_WINE_ENTITIES) {
      assert.ok(PT_NOTES[entity.id]?.trim(), entity.id);
      const seen = new Set<string>();
      for (const alias of entity.aliases) {
        const key = alias.trim().toLowerCase();
        assert.equal(seen.has(key), false, `${entity.id} duplicate alias ${alias}`);
        seen.add(key);
      }
      for (const locale of ["en", "pt-BR"] as const) {
        const line = entityOriginLine(entity, locale);
        assert.match(line, / • /, entity.id);
        if (entity.displayRegion) assert.match(line, new RegExp(entity.displayRegion.replace(/[()]/g, "\\$&")));
      }
    }
  });

  it("gives every tag on every card a per-tag source, and lists every source URL", () => {
    const missing = new Set<string>();
    for (const entity of ALL_WINE_ENTITIES) {
      for (const field of TAG_FIELDS) {
        for (const tag of entity[field]) {
          if (!TAG_SOURCES[tag]) missing.add(tag);
        }
      }
    }
    assert.deepEqual([...missing], []);

    for (const [id, countries] of Object.entries(ALSO_COUNTRY_SOURCES)) {
      for (const [country, source] of Object.entries(countries)) {
        assert.match(alsoCountryNote(source), /https:\/\/\S+/, `${id} ${country}`);
      }
    }
    for (const [id, climates] of Object.entries(CLIMATE_SOURCES)) {
      for (const [climate, note] of Object.entries(climates)) {
        assert.match(note ?? "", /https:\/\/\S+/, `${id} ${climate}`);
      }
    }

    const listed = JSON.parse(fs.readFileSync(SOURCES_PATH, "utf8")) as Array<{
      card: string;
      tag: string;
      url: string;
    }>;
    assert.ok(listed.length > 0);
    const covered = new Map<string, Set<string>>();
    for (const row of listed) {
      assert.match(row.url, /^https:\/\/\S+$/, `${row.card} ${row.tag}`);
      assert.ok(WINE_ENTITY_BY_ID[row.card], row.card);
      if (TAG_SOURCES[row.tag]) {
        const entity = WINE_ENTITY_BY_ID[row.card];
        const tags = TAG_FIELDS.flatMap((field) => entity[field] as readonly string[]);
        assert.equal(tags.includes(row.tag), true, `${row.card} ${row.tag}`);
      }
      const tags = covered.get(row.card) ?? new Set<string>();
      for (const tag of NEW_SOURCED_TAGS) {
        if (row.tag.split(/[^a-z0-9_]+/).includes(tag)) tags.add(tag);
      }
      covered.set(row.card, tags);
    }
    for (const entity of ALL_WINE_ENTITIES) {
      const tags = TAG_FIELDS.flatMap((field) => entity[field] as readonly string[]);
      for (const tag of NEW_SOURCED_TAGS) {
        if (!tags.includes(tag)) continue;
        assert.equal(covered.get(entity.id)?.has(tag), true, `${entity.id} ${tag}`);
      }
    }
  });

  it("writes a reason on every empty-tag exception and leaves Huet and Raveneau sourced", () => {
    const reasons = allowlistReasons(fs.readFileSync(SCHEMA_PATH, "utf8"));
    assert.deepEqual(Object.keys(reasons).sort(), Object.keys(EMPTY_REQUIRED_TAG_ALLOWLIST).sort());
    for (const [id, reason] of Object.entries(reasons)) {
      assert.ok(reason.length >= 20, `${id} needs a written reason`);
    }
    for (const id of ["prod-huet", "prod-raveneau"]) {
      const entity = WINE_ENTITY_BY_ID[id];
      assert.equal(entity.vinification.includes("large_neutral_botte_foudre"), false, id);
      assert.equal(entity.vinification.includes("used_neutral_oak"), true, id);
      assert.equal(EMPTY_REQUIRED_TAG_ALLOWLIST[id], undefined, id);
      assert.ok(answeredClueIds(entity).length >= 3, id);
    }
  });
});

describe("acceptance checklist: clues", () => {
  it("gives every clue English and pt-BR labels and a tier", () => {
    for (const clue of CLUE_CATALOG) {
      assert.ok(clue.label.trim(), clue.id);
      assert.ok(clue.shortLabel.trim(), clue.id);
      assert.ok(clue.tooltip.trim(), clue.id);
      assert.ok(TIER_NAME[clue.difficulty], clue.id);
      const copy = PT_CLUE_COPY[clue.id];
      assert.ok(copy, clue.id);
      assert.ok(copy.label.trim(), clue.id);
      assert.ok(copy.shortLabel.trim(), clue.id);
      assert.ok(copy.tooltip.trim(), clue.id);
      const localized = localizedClue(clue, "pt-BR");
      assert.equal(localized.label, copy.label);
      assert.equal(localized.predicate, clue.predicate);
    }
  });

  it("matches the reported card counts and flags thin or wide clues", () => {
    const checklist = fs.readFileSync(CHECKLIST_PATH, "utf8");
    const start = checklist.indexOf("<!-- clue-counts:start -->");
    const end = checklist.indexOf("<!-- clue-counts:end -->");
    assert.ok(start >= 0 && end > start);
    const reported = new Map<string, { tier: string; count: number; flag: string }>();
    for (const line of checklist.slice(start, end).split("\n")) {
      const match = line.match(/^\| `([^`]+)` \| (Standard|Sommelier|Master) \| (\d+) \| ([^|]*)\|$/);
      if (!match) continue;
      reported.set(match[1], { tier: match[2], count: Number(match[3]), flag: match[4].trim() });
    }
    assert.equal(reported.size, CLUE_CATALOG.length);
    for (const clue of CLUE_CATALOG) {
      const count = clueCardCount(clue.id);
      const row = reported.get(clue.id);
      assert.ok(row, clue.id);
      assert.equal(row.tier, TIER_NAME[clue.difficulty], clue.id);
      assert.equal(row.count, count, clue.id);
      assert.ok(count >= 3, `${clue.id} has ${count}`);
      const flag = clue.difficulty !== "wset2" && count > 20 ? "over 20" : "";
      assert.equal(row.flag, flag, clue.id);
    }
    assert.equal(CLUE_BY_ID["geo-south-america"].difficulty, "wset2");
    assert.equal(clueCardCount("geo-south-america-all"), 36);
    assert.equal(clueCardCount("vin-used-large-oak"), 7);
    assert.equal(clueCardCount("soil-sandy"), 23);
    assert.equal(clueCardCount("soil-granite"), 43);
    assert.equal(clueCardCount("clim-tropical-double-pruning"), 3);
    assert.equal(CLUE_BY_ID["clim-tropical-double-pruning"].difficulty, "wset3");
    const doubles = ALL_WINE_ENTITIES.filter((entity) =>
      CLUE_BY_ID["clim-tropical-double-pruning"].predicate(entity)
    ).map((entity) => entity.id);
    assert.deepEqual(doubles.sort(), ["app-vale-do-sao-francisco", "prod-guaspari", "prod-rio-sol"]);
  });
});

describe("acceptance checklist: answers and Codex", () => {
  it("accepts every card name and alias in both locales, including accent-free forms", () => {
    for (const locale of ["en", "pt-BR"] as const) {
      for (const entity of ALL_WINE_ENTITIES) {
        const queries = [entity.name, entity.canonicalName, ...entity.aliases];
        for (const query of queries) {
          assert.ok(searchQuery(query), `${entity.id} ${query}`);
          assert.equal(entityMatchesSearch(entity, query, locale, "name"), true, `${locale} ${entity.id} ${query}`);
          const plain = accentFree(query);
          if (plain !== query) {
            assert.equal(entityMatchesSearch(entity, plain, locale, "name"), true, `${locale} ${entity.id} ${plain}`);
          }
        }
      }
    }
  });

  it("searches the Codex by names and aliases, and (All) clears a clue filter", () => {
    for (const entity of ALL_WINE_ENTITIES) {
      for (const field of [entity.name, entity.canonicalName]) {
        for (const token of normalizeSearchText(field).split(/[^a-z0-9]+/)) {
          if (token.length < 2) continue;
          assert.equal(entityMatchesCodexQuery(entity, token), true, `${entity.id} ${token}`);
        }
      }
      for (const alias of entity.aliases) {
        if (!searchQuery(alias)) continue;
        assert.equal(entityMatchesCodexQuery(entity, alias), true, `${entity.id} ${alias}`);
      }
      const fragment = entity.sommelierNote.slice(24, 72).trim();
      if (!searchQuery(fragment)) continue;
      const named = [entity.name, entity.canonicalName, ...entity.aliases].some((field) =>
        normalizeSearchText(field).includes(normalizeSearchText(fragment))
      );
      if (!named) assert.equal(entityMatchesCodexQuery(entity, fragment), false, entity.id);
    }

    assert.equal(codexClueMatcher("all"), undefined);
    assert.equal(codexClueMatcher(""), undefined);
    const mediterranean = codexClueMatcher("clim-mediterranean");
    assert.ok(mediterranean);
    const narrowed = filterCodexEntities(ALL_WINE_ENTITIES, { query: "", matchesClue: mediterranean });
    const reset = filterCodexEntities(ALL_WINE_ENTITIES, {
      query: "",
      matchesClue: codexClueMatcher("all"),
    });
    assert.ok(narrowed.length < ALL_WINE_ENTITIES.length);
    assert.equal(narrowed.some((entity) => entity.id === "prod-almaviva"), true);
    assert.equal(narrowed.some((entity) => entity.id === "prod-don-melchor"), true);
    assert.equal(reset.length, ALL_WINE_ENTITIES.length);
  });

  it("strips entity-type suffixes from titles", () => {
    for (const entity of ALL_WINE_ENTITIES) {
      assert.doesNotMatch(
        displayEntityName(entity.name, entity.entityType),
        / \((Grape|Appellation|Region|Producer|Estate)\)$/,
        entity.id
      );
    }
  });
});

describe("acceptance checklist: generation", () => {
  it("meets the cell floors and the median rules on the coverage sample", () => {
    assert.equal(DIFFICULTY_TUNING.wset2.minimumValidAnswers, 5);
    assert.equal(DIFFICULTY_TUNING.wset3.minimumValidAnswers, 3);
    assert.equal(DIFFICULTY_TUNING.master_somm.minimumValidAnswers, 2);
    const counts: Record<DifficultyLevel, number[]> = { wset2: [], wset3: [], master_somm: [] };
    let n = 0;
    for (const difficulty of DIFFICULTIES) {
      for (const seed of COVERAGE_SEEDS) {
        for (const entityFilter of FILTERS) {
          const board = generateWineGridBoard({ seed, mode: "unlimited", difficulty, entityFilter });
          const floor = DIFFICULTY_TUNING[difficulty].minimumValidAnswers;
          for (const cell of board.cells) {
            assert.ok(cell.validEntityIds.length >= floor, `${board.boardId} ${cell.index}`);
            counts[difficulty].push(cell.validEntityIds.length);
          }
          assert.equal(
            guardedPlaythroughSucceeds(
              board.cells.map((cell) => cell.validEntityIds),
              createPrng(++n)
            ),
            true,
            board.boardId
          );
        }
      }
    }
    const standard = median(counts.wset2);
    const sommelier = median(counts.wset3);
    const master = median(counts.master_somm);
    assert.ok(master <= 6, `Master median ${master}`);
    assert.ok(standard >= sommelier, `Standard ${standard} Sommelier ${sommelier}`);
    assert.ok(Math.min(...counts.wset2) >= 5);
    assert.ok(Math.min(...counts.wset3) >= 3);
    assert.ok(Math.min(...counts.master_somm) >= 2);
  });

  it("builds one daily and one grapes-only board at the Standard floor", () => {
    const daily = generateDailyBoard("2026-06-21");
    for (const cell of daily.cells) {
      assert.ok(cell.validEntityIds.length >= DIFFICULTY_TUNING.wset2.minimumValidAnswers);
    }
    const grapes = generateWineGridBoard({
      seed: "acceptance-grapes",
      mode: "infinite",
      difficulty: "wset2",
      entityFilter: "grape",
    });
    for (const cell of grapes.cells) {
      assert.ok(cell.validEntityIds.length >= 5, String(cell.validEntityIds.length));
    }
  });
});
