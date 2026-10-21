import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CLUE_BY_ID } from "../data/clueCatalog";
import { ALL_WINE_ENTITIES, searchWineEntities, WINE_ENTITY_BY_ID } from "../data/wineDatabase";
import { generateDailyBoard, generateWineGridBoard } from "./matrixGenerator";
import { buildPickerResults, entityFitsCell, evaluatePick, validEntities, validEntityIds } from "./pickerList";
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

    const used = new Set([...PLACED, "grape-albarino"]);
    const ids = validEntityIds({ validEntityIds: cellIds[iberianBottle] });
    const fitting = validEntities({ validEntityIds: ids }, WINE_ENTITY_BY_ID);
    const row = CLUE_BY_ID["geo-iberia"];
    const col = CLUE_BY_ID["bot-burgundy"];
    const capped = searchWineEntities("", "all", new Set(), {
      matchesCell: (entity) => row.predicate(entity) || col.predicate(entity),
      limit: 40,
    });
    const hidden = capped.filter((entity) => ids.includes(entity.id) && !used.has(entity.id));
    assert.equal(hidden.length, 0);

    const shown = buildPickerResults({
      query: "",
      hintsOn: true,
      validEntities: fitting,
      usedIds: used,
      extraEntities: capped,
    });
    assert.equal(shown.length, ids.length);
    assert.deepEqual(shown.map((entity) => entity.id).sort(), [...ids].sort());
    const firstUsed = shown.findIndex((entity) => used.has(entity.id));
    assert.ok(firstUsed > 0);
    assert.deepEqual(
      shown.slice(0, firstUsed).map((entity) => entity.id).sort(),
      ["grape-mourvedre", "prod-alvaro-palacios"]
    );
    assert.ok(shown.slice(firstUsed).every((entity) => used.has(entity.id)));
    for (const id of ["grape-mourvedre", "prod-alvaro-palacios"]) {
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
    const listed = buildPickerResults({
      query: "chardonnay",
      hintsOn: false,
      validEntities: valid,
      extraEntities: [WINE_ENTITY_BY_ID["grape-chardonnay"]],
    });
    assert.ok(listed.some((entity) => entity.id === "grape-chardonnay"));
    assert.equal(
      listed.filter((entity) => entityFitsCell(entity.id, ids)).some((entity) => entity.id === "grape-chardonnay"),
      false
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
        const row = board.rowClues[cell.row];
        const col = board.colClues[cell.col];
        const capped = searchWineEntities("", cell.row === 0 ? "grape" : "all", new Set(), {
          matchesCell: (entity) => row.predicate(entity) || col.predicate(entity),
          limit: 12,
        });
        const used = new Set(ids.slice(0, Math.min(2, ids.length)));
        const shown = buildPickerResults({
          query: "",
          hintsOn: true,
          validEntities: fitting,
          usedIds: used,
          extraEntities: capped,
        });
        assert.deepEqual(
          shown.map((entity) => entity.id).sort(),
          [...ids].sort(),
          `${board.boardId}#${cell.index}`
        );
        const firstUsed = shown.findIndex((entity) => used.has(entity.id));
        if (firstUsed > 0) {
          assert.ok(shown.slice(0, firstUsed).every((entity) => !used.has(entity.id)));
          assert.ok(shown.slice(firstUsed).every((entity) => used.has(entity.id)));
        }
        const withExtras = buildPickerResults({
          query: "",
          hintsOn: false,
          validEntities: fitting,
          usedIds: used,
          extraEntities: capped,
        });
        for (const id of ids) {
          assert.ok(withExtras.some((entity) => entity.id === id), id);
        }
      }
    }
  });
});
