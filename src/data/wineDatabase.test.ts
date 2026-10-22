import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  codexClueMatcher,
  entityMatchesSearch,
  entitySearchScore,
  fieldsMatchSearch,
  filterCodexEntities,
  normalizeSearchText,
  searchQuery,
  searchWineEntities,
  ALL_WINE_ENTITIES,
  WINE_ENTITY_BY_ID,
} from "./wineDatabase";

describe("cell-scoped entity search", () => {
  it("does not list other types when a cell only accepts producers", () => {
    const results = searchWineEntities("", "all", new Set(), {
      acceptedTypes: ["producer"],
      limit: 200,
    });
    assert.ok(results.length > 0);
    assert.ok(results.every((entity) => entity.entityType === "producer"));
    assert.ok(results.some((entity) => entity.id === "prod-drc"));
    assert.equal(results.some((entity) => entity.entityType === "grape"), false);
    assert.equal(results.some((entity) => entity.entityType === "appellation"), false);
  });

  it("keeps grapes out of a region-only cell even when the query matches a grape", () => {
    const results = searchWineEntities("cabernet", "all", new Set(), {
      acceptedTypes: ["appellation"],
    });
    assert.equal(
      results.some((entity) => entity.id === "grape-cabernet-sauvignon"),
      false
    );
  });

  it("ranks Romanée-Conti first for a producer cell when the query is complete", () => {
    const results = searchWineEntities("Romanee-Conti", "all", new Set(), {
      acceptedTypes: ["producer"],
    });
    assert.equal(results[0]?.id, "prod-drc");
  });

  it("folds accents, hyphens, umlauts, and aliases", () => {
    assert.equal(normalizeSearchText("Côte-Rôtie"), normalizeSearchText("Cote Rotie"));
    assert.equal(normalizeSearchText("Grüner Veltliner"), normalizeSearchText("Gruener Veltliner"));
    assert.equal(normalizeSearchText("Gewürztraminer"), normalizeSearchText("Gewuerztraminer"));
    assert.equal(normalizeSearchText("Müller"), normalizeSearchText("Mueller"));
    assert.equal(normalizeSearchText("Château d’Yquem"), normalizeSearchText("Chateau d'Yquem"));
    assert.equal(normalizeSearchText("Xarel·lo"), normalizeSearchText("Xarello"));
    assert.ok(searchWineEntities("Cote Rotie").some((entity) => entity.id === "app-cote-rotie"));
    assert.ok(searchWineEntities("Chateauneuf du Pape").some((entity) => entity.id === "app-chateauneuf-du-pape"));
    assert.ok(searchWineEntities("Saint Emilion").some((entity) => entity.id === "app-saint-emilion"));
    assert.ok(searchWineEntities("St Emilion").some((entity) => entity.id === "app-saint-emilion"));
    assert.ok(searchWineEntities("Mueller").some((entity) => entity.id === "prod-egon-muller"));
    assert.ok(searchWineEntities("Gruener Veltliner").some((entity) => entity.id === "grape-gruner-veltliner"));
    assert.ok(searchWineEntities("Gewuerztraminer").some((entity) => entity.id === "grape-gewurztraminer"));
    assert.ok(searchWineEntities("Château d’Yquem").some((entity) => entity.id === "prod-chateau-dyquem"));
    assert.ok(searchWineEntities("Xarello").some((entity) => entity.id === "app-cava"));
    assert.equal(normalizeSearchText("Spätburgunder"), normalizeSearchText("Spatburgunder"));
    assert.equal(normalizeSearchText("Blaufränkisch"), normalizeSearchText("Blaufrankisch"));
    assert.equal(normalizeSearchText("Frühburgunder"), normalizeSearchText("Fruhburgunder"));
    assert.equal(normalizeSearchText("Rüdesheim"), normalizeSearchText("Rudesheim"));
    assert.equal(normalizeSearchText("Spätlese"), normalizeSearchText("Spatlese"));
    assert.ok(searchWineEntities("Spatburgunder").some((entity) => entity.id === "grape-pinot-noir"));
    assert.ok(searchWineEntities("Blaufrankisch").some((entity) => entity.id === "app-burgenland"));
    assert.ok(searchWineEntities("Fruhburgunder").some((entity) => entity.id === "app-ahr"));
    assert.ok(searchWineEntities("Borgonha").some((entity) => entity.macroRegion === "Burgundy"));
    assert.ok(searchWineEntities("Itália").some((entity) => entity.country === "Italy"));
    assert.ok(searchWineEntities("Alemanha").some((entity) => entity.country === "Germany"));
    assert.ok(searchWineEntities("Piemonte").some((entity) => entity.macroRegion === "Piedmont"));
    assert.ok(searchWineEntities("Galiza").some((entity) => entity.macroRegion === "Galicia"));
  });

  it("ignores queries that fold down to fewer than two characters", () => {
    for (const query of ["ue", "oe", "ae", "ü", "ö", "ä", "u", "a", "·"]) {
      assert.equal(searchQuery(query), null, query);
      assert.equal(searchWineEntities(query).length, 0, query);
      assert.equal(fieldsMatchSearch(["Pinot Noir", "Spätburgunder", "Blaufränkisch"], query), false, query);
    }
    assert.equal(searchQuery(""), "");
    assert.equal(searchQuery("   "), "");
    assert.ok(searchWineEntities("").length > 0);
    assert.equal(fieldsMatchSearch(["Pinot Noir"], ""), true);
    assert.equal(fieldsMatchSearch(["Spätburgunder"], "Spatburgunder"), true);
    assert.ok(searchWineEntities("Spatburgunder").some((entity) => entity.id === "grape-pinot-noir"));
    assert.ok(searchWineEntities("Blaufrankisch").some((entity) => entity.id === "app-burgenland"));
  });

  it("drops an entity that matches neither clue", () => {
    const results = searchWineEntities("cava", "all", new Set(), {
      matchesCell: (entity) =>
        entity.macroRegion === "Rhône Valley" || entity.alsoRegions?.includes("Rhône Valley") === true,
    });
    assert.equal(results.some((entity) => entity.id === "app-cava"), false);
  });

  it("limits the identity scope to name, alias, and place", () => {
    const cava = WINE_ENTITY_BY_ID["app-cava"];
    for (const query of ["volcanic", "terra rossa", "vulcânico"]) {
      assert.equal(
        searchWineEntities(query, "all", new Set(), { scope: "identity", locale: "pt-BR", limit: 200 }).length,
        0,
        query
      );
      assert.equal(entityMatchesSearch(cava, query, "pt-BR", "identity"), false, query);
    }
    assert.ok(searchWineEntities("volcanic", "all", new Set(), { scope: "full", limit: 200 }).length > 0);
    assert.ok(searchWineEntities("terra rossa", "all", new Set(), { scope: "full", limit: 200 }).length > 0);
    assert.ok(
      searchWineEntities("vulcânico", "all", new Set(), { scope: "full", locale: "pt-BR", limit: 200 }).length > 0
    );
    assert.equal(entityMatchesSearch(cava, "Xarello", "en", "identity"), false);
    assert.equal(entityMatchesSearch(cava, "Xarello", "en", "full"), true);
    assert.equal(entityMatchesSearch(cava, "Parellada", "pt-BR", "identity"), false);
    assert.equal(entityMatchesSearch(cava, "Parellada", "pt-BR", "full"), true);
    assert.ok(
      searchWineEntities("Mueller", "all", new Set(), { scope: "identity" }).some(
        (entity) => entity.id === "prod-egon-muller"
      )
    );
    assert.ok(
      searchWineEntities("Aragão", "all", new Set(), { scope: "identity" }).some(
        (entity) => entity.id === "grape-grenache"
      )
    );
    assert.ok(
      searchWineEntities("Catalunha", "all", new Set(), { scope: "identity" }).some(
        (entity) => entity.id === "app-cava"
      )
    );
    assert.ok(
      searchWineEntities("Penedès", "all", new Set(), { scope: "identity" }).some(
        (entity) => entity.id === "app-cava"
      )
    );
  });

  it("returns no producer when the cell only accepts grapes", () => {
    const results = searchWineEntities("Romanee-Conti", "all", new Set(), {
      acceptedTypes: ["grape"],
    });
    assert.equal(results.length, 0);
  });

  it("searches the Codex by name and alias, not notes or place", () => {
    const ranked = filterCodexEntities(ALL_WINE_ENTITIES, { query: "País", locale: "pt-BR" });
    assert.deepEqual(
      ranked.map((entity) => entity.id),
      ["grape-pais"]
    );
    for (const id of ["grape-tempranillo", "app-itata", "grape-torrontes"]) {
      assert.equal(
        ranked.some((entity) => entity.id === id),
        false,
        id
      );
    }
    assert.equal(
      filterCodexEntities(ALL_WINE_ENTITIES, { query: "Tinta del País" }).some(
        (entity) => entity.id === "grape-tempranillo"
      ),
      true
    );
    for (const [query, id] of [
      ["Donnhoff", "prod-donnhoff"],
      ["Prum", "prod-jj-prum"],
      ["Coulee", "prod-coulee-de-serrant"],
    ] as const) {
      assert.equal(
        filterCodexEntities(ALL_WINE_ENTITIES, { query }).some((entity) => entity.id === id),
        true,
        query
      );
    }
  });

  it("ranks a name typo after exact and prefix hits, and ignores place names", () => {
    const meursault = WINE_ENTITY_BY_ID["app-meursault"];
    const aligote = WINE_ENTITY_BY_ID["grape-aligote"];
    const exact = entitySearchScore(meursault, "Meursault", "en", "name");
    const prefix = entitySearchScore(WINE_ENTITY_BY_ID["app-chassagne-montrachet"], "chassag", "en", "name");
    const typo = entitySearchScore(meursault, "mersault", "en", "name");
    assert.equal(exact, 100);
    assert.equal(prefix, 85);
    assert.ok(exact > prefix);
    assert.ok(prefix > typo);
    assert.equal(typo, 60);

    const named = (query: string) =>
      searchWineEntities(query, "all", new Set(), { scope: "name", limit: 40 });
    assert.equal(named("mersault")[0]?.id, "app-meursault");
    assert.equal(named("aligote")[0]?.id, "grape-aligote");
    assert.equal(entitySearchScore(aligote, "aligote", "en", "name") > typo, true);
    assert.equal(named("puligny")[0]?.id, "app-puligny-montrachet");

    const villages = [
      "app-meursault",
      "app-puligny-montrachet",
      "app-chassagne-montrachet",
      "app-volnay",
      "app-pommard",
      "app-gevrey-chambertin",
      "grape-aligote",
    ];
    for (const query of ["burgundy", "borgonha"]) {
      const results = named(query);
      for (const id of villages) {
        assert.equal(results.some((entity) => entity.id === id), false, `${query} ${id}`);
      }
      for (const entity of results) {
        const fields = [entity.name, entity.canonicalName, ...entity.aliases].join(" ");
        assert.match(fields, /burgundy|borgonha/i, entity.id);
      }
    }
  });

  it("matches Almaviva and Don Melchor in the Codex Mediterranean filter", () => {
    assert.equal(codexClueMatcher("all"), undefined);
    const matchesClue = codexClueMatcher("clim-mediterranean");
    assert.ok(matchesClue);
    const filtered = filterCodexEntities(ALL_WINE_ENTITIES, { query: "", matchesClue });
    const ids = filtered.map((entity) => entity.id);
    assert.equal(ids.includes("prod-almaviva"), true);
    assert.equal(ids.includes("prod-don-melchor"), true);
    assert.deepEqual(
      filterCodexEntities(ALL_WINE_ENTITIES, { query: "Almaviva", matchesClue }).map((entity) => entity.id),
      ["prod-almaviva"]
    );
    assert.deepEqual(
      filterCodexEntities(ALL_WINE_ENTITIES, { query: "Don Melchor", matchesClue }).map((entity) => entity.id),
      ["prod-don-melchor"]
    );
  });
});
