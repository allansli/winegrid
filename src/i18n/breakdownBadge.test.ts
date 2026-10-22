import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it } from "node:test";
import { CellInspectModal } from "../components/CellInspectModal";
import { CLUE_BY_ID } from "../data/clueCatalog";
import { I18nProvider } from "./I18nProvider";
import { Locale } from "./locale";
import { MatrixCell } from "../types/wine";

const cell: MatrixCell = {
  index: 0,
  row: 0,
  col: 0,
  rowClueId: "clim-continental",
  colClueId: "style-dry-red",
  validEntityIds: ["app-pommard", "prod-drc"],
  pickedEntityId: "prod-drc",
  pickedRarityPct: 12,
  isLocked: true,
};

function renderBreakdown(locale: Locale): string {
  return renderToStaticMarkup(
    React.createElement(I18nProvider, {
      initialLocale: locale,
      children: React.createElement(CellInspectModal, {
        isOpen: true,
        onClose: () => undefined,
        cell,
        rowClue: CLUE_BY_ID["clim-continental"],
        colClue: CLUE_BY_ID["style-dry-red"],
      }),
    })
  );
}

function badgeTexts(html: string): string[] {
  const texts: string[] = [];
  const pattern = /<span\b[^>]*rounded-full[^>]*>([^<]+)<\/span>/g;
  for (const match of html.matchAll(pattern)) {
    texts.push(match[1].replace(/\s+/g, " ").trim());
  }
  return texts;
}

describe("cell breakdown type badges", () => {
  it("uses Region and Producer in English", () => {
    const html = renderBreakdown("en");
    assert.match(html, /Cell Breakdown/);
    const badges = badgeTexts(html);
    assert.equal(badges.includes("Producer"), true);
    assert.equal(badges.includes("Region"), true);
    assert.equal(badges.includes("Produtor"), false);
    assert.equal(badges.includes("Região"), false);
  });

  it("uses Região and Produtor in Brazilian Portuguese", () => {
    const html = renderBreakdown("pt-BR");
    assert.match(html, /Detalhe da casa/);
    const badges = badgeTexts(html);
    assert.equal(badges.includes("Produtor"), true);
    assert.equal(badges.includes("Região"), true);
    assert.equal(badges.includes("Producer"), false);
    assert.equal(badges.includes("Region"), false);
  });
});
