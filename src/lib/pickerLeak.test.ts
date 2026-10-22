import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it } from "node:test";
import { EntitySearchModal } from "../components/EntitySearchModal";
import { searchWineEntities, WINE_ENTITY_BY_ID } from "../data/wineDatabase";
import { I18nProvider } from "../i18n/I18nProvider";
import { translate } from "../i18n/messages";
import { displayEntityName } from "./entityName";
import { generateDailyBoard } from "./matrixGenerator";
import { WineEntityType } from "../types/wine";

function renderPicker(input: {
  validEntityIds: readonly string[];
  acceptedTypes: WineEntityType[];
  row: number;
  col: number;
}) {
  const board = generateDailyBoard("2026-10-21");
  const html = renderToStaticMarkup(
    React.createElement(
      I18nProvider,
      null,
      React.createElement(EntitySearchModal, {
        isOpen: true,
        onClose: () => undefined,
        rowClue: board.rowClues[input.row],
        colClue: board.colClues[input.col],
        acceptedTypes: input.acceptedTypes,
        validEntityIds: input.validEntityIds,
        usedEntityIds: new Set<string>(),
        onSelectEntity: () => undefined,
      })
    )
  );
  return html;
}

function resultRows(html: string): { id: string; text: string }[] {
  const rows: { id: string; text: string }[] = [];
  const pattern = /<button\b([^>]*)>([\s\S]*?)<\/button>/g;
  for (const match of html.matchAll(pattern)) {
    const attrs = match[1];
    const id = attrs.match(/data-picker-result="([^"]+)"/)?.[1];
    if (!id) continue;
    const text = match[2]
      .replace(/<[^>]+>/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&#x27;|&apos;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, " ")
      .trim();
    rows.push({ id, text });
  }
  return rows;
}

describe("picker results do not leak the cell", () => {
  it("renders only the name, with a type badge only when the cell is one type", () => {
    const board = generateDailyBoard("2026-10-21");
    const cell = board.cells[0];
    const other = board.cells[board.cells.length - 1];
    const allTypes: WineEntityType[] = ["appellation", "grape", "producer"];
    const open = renderPicker({
      validEntityIds: cell.validEntityIds,
      acceptedTypes: allTypes,
      row: cell.row,
      col: cell.col,
    });
    const swapped = renderPicker({
      validEntityIds: other.validEntityIds,
      acceptedTypes: allTypes,
      row: cell.row,
      col: cell.col,
    });
    const rows = resultRows(open);
    const ranked = searchWineEntities("", "all", new Set(), {
      acceptedTypes: allTypes,
      scope: "name",
      limit: 40,
    });
    assert.ok(rows.length > 0);
    assert.deepEqual(
      rows.map((row) => row.id),
      ranked.map((entity) => entity.id)
    );
    assert.deepEqual(
      rows.map((row) => row.id),
      resultRows(swapped).map((row) => row.id)
    );
    assert.notDeepEqual(cell.validEntityIds, other.validEntityIds);

    for (const row of rows) {
      const entity = WINE_ENTITY_BY_ID[row.id];
      const name = displayEntityName(entity.name, entity.entityType);
      assert.equal(row.text, name, row.id);
      const forbidden = [
        entity.country,
        entity.macroRegion,
        entity.subRegion ?? "",
        ...entity.primaryGrapes,
        entity.sommelierNote.slice(0, 48),
        "fits this cell",
        "Hints",
        "Pick Rate",
        String(entity.baseRarity),
      ];
      for (const field of forbidden) {
        if (!field || name.toLowerCase().includes(field.toLowerCase())) continue;
        assert.equal(row.text.toLowerCase().includes(field.toLowerCase()), false, `${row.id} ${field}`);
      }
    }

    const grapesOnly = renderPicker({
      validEntityIds: cell.validEntityIds,
      acceptedTypes: ["grape"],
      row: cell.row,
      col: cell.col,
    });
    const grapeRows = resultRows(grapesOnly);
    assert.ok(grapeRows.length > 0);
    for (const row of grapeRows) {
      const entity = WINE_ENTITY_BY_ID[row.id];
      assert.equal(entity.entityType, "grape");
      assert.equal(row.text, `${displayEntityName(entity.name, entity.entityType)} Grape`);
    }

    assert.equal(translate("en", "stat.possible", { n: cell.validEntityIds.length }), `${cell.validEntityIds.length} possible`);
    assert.equal(translate("pt-BR", "stat.possible", { n: 4 }), "4 possíveis");
    assert.match(open, new RegExp(`${cell.validEntityIds.length} possible`));
  });
});
