import * as fs from "fs";
import * as path from "path";
import { ALL_WINE_ENTITIES, WINE_ENTITY_BY_ID } from "../src/data/wineDatabase";
import { CLUE_CATALOG } from "../src/data/clueCatalog";
import {
  createPrng,
  generateDailyBoard,
  generateWineGridBoard,
  guardedPlaythroughSucceeds,
  minimumValidAnswers,
} from "../src/lib/matrixGenerator";
import { DifficultyLevel, EntityFilterMode } from "../src/types/wine";

function escapeSql(str: string): string {
  return str.replace(/'/g, "''");
}

function main() {
  console.log("=== WINEGRID SOMMELIER DATABASE & MATRIX VERIFICATION ===");
  console.log(`Total Curated Wine Entities: ${ALL_WINE_ENTITIES.length}`);
  const byType = {
    appellation: ALL_WINE_ENTITIES.filter((e) => e.entityType === "appellation").length,
    grape: ALL_WINE_ENTITIES.filter((e) => e.entityType === "grape").length,
    producer: ALL_WINE_ENTITIES.filter((e) => e.entityType === "producer").length,
  };
  console.log(`  - Appellations: ${byType.appellation}`);
  console.log(`  - Grape Varieties: ${byType.grape}`);
  console.log(`  - Iconic Producers: ${byType.producer}`);
  console.log(`Total Sommelier Clue Predicates: ${CLUE_CATALOG.length}`);

  // Verify every clue matches at least 1 entity
  for (const clue of CLUE_CATALOG) {
    const matches = ALL_WINE_ENTITIES.filter((e) => clue.predicate(e));
    if (matches.length === 0) {
      throw new Error(`Clue ${clue.id} matched 0 entities!`);
    }
  }

  // Test generating boards across all modes & difficulties
  const difficulties: DifficultyLevel[] = ["wset2", "wset3", "master_somm"];
  const filters: EntityFilterMode[] = ["all", "appellation", "grape", "producer"];

  let totalVerified = 0;
  const sizesByLevel: Record<DifficultyLevel, number[]> = {
    wset2: [],
    wset3: [],
    master_somm: [],
  };
  for (const diff of difficulties) {
    const minAnswers = minimumValidAnswers(diff);
    for (const filter of filters) {
      for (let i = 0; i < 15; i++) {
        const board = generateWineGridBoard({
          seed: `test-${diff}-${filter}-${i}`,
          mode: "unlimited",
          difficulty: diff,
          entityFilter: filter,
        });
        const uniqueSolutions = new Set(board.guaranteedSolution);
        if (uniqueSolutions.size !== 9) {
          throw new Error(`Board ${board.boardId} did not have 9 distinct solutions!`);
        }
        for (const cell of board.cells) {
          const count = cell.validEntityIds.length;
          if (count < minAnswers) {
            throw new Error(
              `${board.boardId} cell ${cell.index} has ${count} answers, under the floor of ${minAnswers}`
            );
          }
          sizesByLevel[diff].push(count);
        }
        if (
          !guardedPlaythroughSucceeds(
            board.cells.map((cell) => cell.validEntityIds),
            createPrng(i + 1)
          )
        ) {
          throw new Error(`Guarded playthrough dead-ended on ${board.boardId}`);
        }
        totalVerified++;
      }
    }
  }

  console.log(`Successfully generated & verified ${totalVerified} 3x3 boards across all modes & difficulties (100% solvable with 9 distinct answers)!`);
  for (const diff of difficulties) {
    const sizes = [...sizesByLevel[diff]].sort((a, b) => a - b);
    const mid = Math.floor(sizes.length / 2);
    const median = sizes.length % 2 === 0 ? (sizes[mid - 1] + sizes[mid]) / 2 : sizes[mid];
    console.log(
      `  ${diff}: min ${sizes[0]} / median ${median} / max ${sizes[sizes.length - 1]} (floor ${minimumValidAnswers(diff)}, n=${sizes.length})`
    );
  }

  // Sample board printout
  const sample = generateDailyBoard("2026-10-20");
  console.log("\nSample Daily Challenge Board (2026-10-20):");
  console.log("Rows:", sample.rowClues.map((r) => `[${r.category}] ${r.shortLabel}`).join(" | "));
  console.log("Cols:", sample.colClues.map((c) => `[${c.category}] ${c.shortLabel}`).join(" | "));
  console.log(
    "Guaranteed 9-Cell Solution:",
    sample.guaranteedSolution.map((id) => WINE_ENTITY_BY_ID[id].canonicalName).join(", ")
  );

  // Generate supabase/seed.sql
  const sqlLines: string[] = [
    "-- ============================================================================",
    "-- WINEGRID - SUPABASE SEED DATA (AUTO-GENERATED FROM SOMMELIER CODEX)",
    "-- ============================================================================",
    "",
    "insert into public.wine_entities (id, name, canonical_name, entity_type, country, region, subregion, aliases, attributes, base_rarity, sommelier_note)",
    "values",
  ];

  const rowsSql = ALL_WINE_ENTITIES.map((e) => {
    const aliasesArray = `ARRAY[${e.aliases.map((a) => `'${escapeSql(a)}'`).join(", ")}]::text[]`;
    const attrs = JSON.stringify({
      countryCode: e.countryCode,
      originCountries: e.originCountries ?? [],
      alsoCountries: e.alsoCountries ?? [],
      alsoRegions: e.alsoRegions ?? [],
      world: e.world,
      hemisphere: e.hemisphere,
      latitudeBand: e.latitudeBand,
      coastalOrIsland: e.coastalOrIsland,
      classifications: e.classifications,
      soils: e.soils,
      climates: e.climates,
      waterBodies: e.waterBodies,
      styles: e.styles,
      vinification: e.vinification,
      sensory: e.sensory,
      varietalTraits: e.varietalTraits,
      primaryGrapes: e.primaryGrapes,
      bottleShapes: e.bottleShapes,
      heritage: e.heritage,
    });
    return `  ('${escapeSql(e.id)}', '${escapeSql(e.name)}', '${escapeSql(e.canonicalName)}', '${escapeSql(e.entityType)}', '${escapeSql(e.country)}', '${escapeSql(e.macroRegion)}', ${
      e.subRegion ? `'${escapeSql(e.subRegion)}'` : "null"
    }, ${aliasesArray}, '${escapeSql(attrs)}'::jsonb, ${e.baseRarity}, '${escapeSql(e.sommelierNote)}')`;
  });

  sqlLines.push(rowsSql.join(",\n"));
  sqlLines.push(
    "on conflict (id) do update set",
    "  name = excluded.name,",
    "  canonical_name = excluded.canonical_name,",
    "  entity_type = excluded.entity_type,",
    "  country = excluded.country,",
    "  region = excluded.region,",
    "  subregion = excluded.subregion,",
    "  aliases = excluded.aliases,",
    "  attributes = excluded.attributes,",
    "  base_rarity = excluded.base_rarity,",
    "  sommelier_note = excluded.sommelier_note;",
    ""
  );

  const seedPath = path.join(process.cwd(), "supabase", "seed.sql");
  fs.mkdirSync(path.dirname(seedPath), { recursive: true });
  fs.writeFileSync(seedPath, sqlLines.join("\n"), "utf8");
  console.log(`\nGenerated Supabase seed file at: ${seedPath}`);
}

main();
