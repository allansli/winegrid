import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CLUE_BY_ID } from "../data/clueCatalog";
import { ALL_WINE_ENTITIES, searchWineEntities, WINE_ENTITY_BY_ID } from "../data/wineDatabase";
import { generateDailyBoard, generateWineGridBoard } from "./matrixGenerator";
import {
  buildPickerResults,
  cellAcceptedTypes,
  entityFitsCell,
  evaluatePick,
  validEntities,
  validEntityIds,
} from "./pickerList";
import { DifficultyLevel, EntityFilterMode } from "../types/wine";

const PLACED = [
  "app-priorat",
  "grape-grenache",
  "app-rias-baixas",
  "app-vinho-verde",
  "app-sancerre",
  "prod-vega-sicilia",
];

function intersection(rowId: string, colId: string): string[] {
  return ALL_WINE_ENTITIES.filter(
    (entity) => CLUE_BY_ID[rowId].predicate(entity) && CLUE_BY_ID[colId].predicate(entity)
  ).map((entity) => entity.id);
}

describe("picker and the dead-end guard share one answer set", () => {
  it("replays the Iberian production sequence through the picker the UI uses", () => {
    const rows = ["clim-high-altitude", "vin-no-mlf-unoaked", "geo-iberia"];
    const cols = ["bot-burgundy", "var-indigenous-med", "style-dry-red"];
    const cellIds = rows.flatMap((row) => cols.map((col) => intersection(row, col)));
    const iberianNative = 7;
    const iberianBottle = 6;
    const play = cellIds.map((ids) => ({ validEntityIds: ids, pickedEntityId: null as string | null }));

    const homes: Record<string, number> = {
      "app-priorat": 2,
      "grape-grenache": 0,
      "app-rias-baixas": 3,
      "app-vinho-verde": 4,
      "app-sancerre": 5,
      "prod-vega-sicilia": 1,
    };
    for (const id of PLACED) {
      const index = homes[id];
      assert.equal(evaluatePick(play, index, id), "correct", id);
      play[index].pickedEntityId = id;
    }

    assert.equal(evaluatePick(play, iberianNative, "grape-albarino"), "correct");
    play[iberianNative].pickedEntityId = "grape-albarino";

    const ids = validEntityIds({ validEntityIds: cellIds[iberianBottle] });
    const ranked = searchWineEntities("", "all", new Set(), { scope: "name", limit: 40 });
    const shown = buildPickerResults({ query: "", entities: ranked });
    assert.deepEqual(
      shown.map((entity) => entity.id),
      ranked.map((entity) => entity.id)
    );
    assert.ok(shown.some((entity) => !ids.includes(entity.id)));
    for (const id of ["grape-mourvedre", "grape-pais", "prod-alvaro-palacios"]) {
      assert.equal(entityFitsCell(id, ids), true);
      assert.equal(evaluatePick(play, iberianBottle, id) === "miss", false);
    }
  });

  it("blocks a pick that the shared decision says would dead-end the board", () => {
    const lists = [
      ["app-champagne", "app-muscadet", "app-sonoma-coast", "app-willamette-valley", "app-margaret-river", "app-marlborough", "grape-pinot-noir", "grape-chardonnay", "prod-krug", "prod-selosse"],
      ["app-savennieres", "app-chinon", "app-muscadet", "app-rias-baixas", "app-sonoma-coast", "app-willamette-valley", "app-margaret-river", "app-marlborough", "grape-chardonnay", "grape-sauvignon-blanc", "grape-chenin-blanc", "grape-albarino", "grape-palomino-fino", "prod-chateau-margaux", "prod-chateau-dyquem", "app-vouvray", "app-vinho-verde", "grape-semillon", "prod-ridge"],
      ["app-pauillac", "app-pomerol", "app-saint-emilion", "app-margaux", "app-saint-julien", "app-saint-estephe", "app-chinon", "app-bolgheri", "app-sonoma-coast", "app-willamette-valley", "app-coonawarra", "app-margaret-river", "app-marlborough", "grape-cabernet-sauvignon", "grape-merlot", "grape-cabernet-franc", "grape-pinot-noir", "prod-chateau-lafite", "prod-chateau-margaux", "prod-chateau-petrus", "prod-sassicaia", "app-vinho-verde", "prod-ridge"],
      ["app-margaret-river", "app-marlborough", "app-central-otago"],
      ["app-clare-eden-valley", "app-margaret-river", "app-marlborough", "app-central-otago", "prod-penfolds", "prod-henschke"],
      ["app-barossa-valley", "app-coonawarra", "app-clare-eden-valley", "app-margaret-river", "app-marlborough", "app-central-otago", "prod-penfolds", "prod-henschke"],
      ["app-champagne", "app-chablis", "app-gevrey-chambertin", "app-meursault", "app-morgon", "grape-pinot-noir", "grape-chardonnay", "grape-gamay", "prod-drc", "prod-krug", "prod-selosse", "prod-raveneau"],
      ["app-chablis", "app-meursault", "grape-chardonnay", "prod-drc", "prod-raveneau"],
      ["app-gevrey-chambertin", "app-morgon", "grape-pinot-noir", "grape-gamay", "prod-drc"],
    ];
    const play = lists.map((ids) => ({ validEntityIds: ids, pickedEntityId: null as string | null }));
    play[0].pickedEntityId = "app-margaret-river";
    play[1].pickedEntityId = "app-marlborough";
    assert.equal(evaluatePick(play, 4, "app-central-otago"), "blocked");
    assert.equal(evaluatePick(play, 4, "app-clare-eden-valley"), "correct");
    assert.equal(evaluatePick(play, 4, "grape-chardonnay"), "miss");
  });

  it("does not treat Chardonnay as a Bordeaux varietal just because it matches the other clue", () => {
    const bordeaux = CLUE_BY_ID["var-bordeaux-family"];
    const france = CLUE_BY_ID["geo-france"];
    const valid = ALL_WINE_ENTITIES.filter(
      (entity) => bordeaux.predicate(entity) && france.predicate(entity)
    );
    const ids = valid.map((entity) => entity.id);
    assert.equal(entityFitsCell("grape-chardonnay", ids), false);
    const ranked = searchWineEntities("chardonnay", "all", new Set(), { scope: "name" });
    const listed = buildPickerResults({ query: "chardonnay", entities: ranked });
    assert.deepEqual(
      listed.map((entity) => entity.id),
      ranked.map((entity) => entity.id)
    );
    assert.ok(listed.some((entity) => entity.id === "grape-chardonnay"));
    assert.equal(
      evaluatePick([{ validEntityIds: ids, pickedEntityId: null }], 0, "grape-chardonnay"),
      "miss"
    );
    const otherCell = ALL_WINE_ENTITIES.filter(
      (entity) => france.predicate(entity) && CLUE_BY_ID["style-dry-white"].predicate(entity)
    );
    const sameOrder = buildPickerResults({ query: "chardonnay", entities: ranked });
    assert.deepEqual(
      sameOrder.map((entity) => entity.id),
      listed.map((entity) => entity.id)
    );
    assert.notDeepEqual(
      valid.map((entity) => entity.id).sort(),
      otherCell.map((entity) => entity.id).sort()
    );
  });

  it("resolves Müller with the same alias search in a cell that accepts him", () => {
    const muller = WINE_ENTITY_BY_ID["prod-egon-muller"];
    const germanic = CLUE_BY_ID["geo-germanic"];
    const white = CLUE_BY_ID["style-dry-white"];
    assert.equal(germanic.predicate(muller) && white.predicate(muller), true);
    const valid = ALL_WINE_ENTITIES.filter(
      (entity) => germanic.predicate(entity) && white.predicate(entity)
    );
    const france = CLUE_BY_ID["geo-france"];
    const bordeaux = CLUE_BY_ID["var-bordeaux-family"];
    const other = ALL_WINE_ENTITIES.filter(
      (entity) => france.predicate(entity) && bordeaux.predicate(entity)
    );
    assert.equal(other.some((entity) => entity.id === "prod-egon-muller"), false);

    for (const query of ["Mueller", "Müller"]) {
      const ranked = searchWineEntities(query, "all", new Set(), {
        acceptedTypes: ["producer"],
        scope: "name",
      });
      assert.ok(ranked.some((entity) => entity.id === "prod-egon-muller"), query);
      const whereValid = buildPickerResults({ query, entities: ranked });
      const whereInvalid = buildPickerResults({ query, entities: ranked });
      assert.deepEqual(
        whereValid.map((entity) => entity.id),
        ranked.map((entity) => entity.id)
      );
      assert.deepEqual(
        whereInvalid.map((entity) => entity.id),
        whereValid.map((entity) => entity.id)
      );
      assert.equal(entityFitsCell("prod-egon-muller", valid.map((entity) => entity.id)), true);
      assert.ok(whereInvalid.some((entity) => entity.id === "prod-egon-muller"), query);
      assert.equal(
        evaluatePick(
          [{ validEntityIds: other.map((entity) => entity.id), pickedEntityId: null }],
          0,
          "prod-egon-muller"
        ),
        "miss"
      );
    }
  });

  it("does not surface clue words from notes, grapes, or place", () => {
    for (const query of ["volcanic", "terra rossa"]) {
      const noted = searchWineEntities(query, "all", new Set(), { scope: "full", limit: 200 });
      assert.ok(noted.length > 0, query);
      const named = searchWineEntities(query, "all", new Set(), { scope: "name", limit: 200 });
      const listed = buildPickerResults({ query, entities: named });
      assert.deepEqual(listed.map((entity) => entity.id), [], query);
    }

    const ranked = searchWineEntities("Mueller", "all", new Set(), {
      acceptedTypes: ["producer"],
      scope: "name",
    });
    const listed = buildPickerResults({ query: "Mueller", entities: ranked });
    assert.ok(listed.some((entity) => entity.id === "prod-egon-muller"));
    assert.equal(
      searchWineEntities("Catalunha", "all", new Set(), { scope: "name", limit: 200 }).some(
        (entity) => entity.country === "Spain" && !`${entity.name} ${entity.aliases.join(" ")}`.includes("Catalunha")
      ),
      false
    );
  });

  it("does not change result order when the cell's clues change", () => {
    const query = "ch";
    const ranked = searchWineEntities(query, "all", new Set(), { scope: "name", limit: 40 });
    assert.ok(ranked.length > 4);
    const franceWhite = new Set(
      ALL_WINE_ENTITIES.filter(
        (entity) =>
          CLUE_BY_ID["geo-france"].predicate(entity) && CLUE_BY_ID["style-dry-white"].predicate(entity)
      ).map((entity) => entity.id)
    );
    const spainRed = new Set(
      ALL_WINE_ENTITIES.filter(
        (entity) =>
          CLUE_BY_ID["geo-spain"].predicate(entity) && CLUE_BY_ID["style-dry-red"].predicate(entity)
      ).map((entity) => entity.id)
    );
    const listed = buildPickerResults({ query, entities: ranked });
    assert.deepEqual(
      listed.map((entity) => entity.id),
      ranked.map((entity) => entity.id)
    );
    const firstMiss = listed.findIndex((entity) => !franceWhite.has(entity.id));
    const laterHit = listed.findLastIndex((entity) => franceWhite.has(entity.id));
    assert.ok(firstMiss >= 0 && laterHit > firstMiss);
    assert.notDeepEqual([...franceWhite].sort(), [...spainRed].sort());
    assert.equal(cellAcceptedTypes({
      entityFilter: "all",
      rowClueId: "geo-france",
      colClueId: "style-dry-white",
    }).join(","), "appellation,grape,producer");
    assert.deepEqual(
      cellAcceptedTypes({ entityFilter: "grape", rowClueId: "geo-france", colClueId: "style-dry-red" }),
      ["grape"]
    );
    assert.deepEqual(
      cellAcceptedTypes({ entityFilter: "all", rowClueId: "type-grape", colClueId: "geo-france" }),
      ["grape"]
    );
  });

  it("lists the validator set for every cell of sampled boards", () => {
    const difficulties: DifficultyLevel[] = ["wset2", "wset3", "master_somm"];
    const filters: EntityFilterMode[] = ["all", "appellation", "grape", "producer"];
    const boards = [
      ...difficulties.flatMap((difficulty) =>
        filters.map((entityFilter) =>
          generateWineGridBoard({
            seed: `picker-audit-${difficulty}-${entityFilter}`,
            mode: "unlimited" as const,
            difficulty,
            entityFilter,
          })
        )
      ),
      generateDailyBoard("2026-10-21"),
      generateDailyBoard("2026-10-23"),
    ];

    for (const board of boards) {
      for (const cell of board.cells) {
        const ids = validEntityIds(cell);
        const fitting = validEntities(cell, WINE_ENTITY_BY_ID);
        assert.equal(fitting.length, ids.length, `${board.boardId}#${cell.index}`);
        const accepted = cellAcceptedTypes({
          entityFilter: board.entityFilter,
          rowClueId: cell.rowClueId,
          colClueId: cell.colClueId,
        });
        const ranked = searchWineEntities("", "all", new Set(), {
          acceptedTypes: accepted,
          scope: "name",
          limit: 40,
        });
        const shown = buildPickerResults({ query: "", entities: ranked });
        assert.deepEqual(
          shown.map((entity) => entity.id),
          ranked.map((entity) => entity.id),
          `${board.boardId}#${cell.index}`
        );
        assert.ok(ids.length >= 1, `${board.boardId}#${cell.index}`);
      }
    }
  });
});
