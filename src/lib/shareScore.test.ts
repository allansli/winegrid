import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildShareText, deliverShareText, shareCellForPick } from "./shareScore";

const ROWS = [
  ["green", "yellow", "empty"],
  ["green", "green", "green"],
  ["empty", "empty", "yellow"],
] as const;

describe("share score", () => {
  it("copies the exact Wordle-style daily text", () => {
    const text = buildShareText({
      mode: "daily",
      date: "2026-10-21",
      difficultyLabel: "Standard",
      correct: 2,
      rarity: 142.44,
      rows: ROWS.map((row) => [...row]),
      locale: "en",
    });
    assert.equal(
      text,
      [
        "🍷 WineGrid Daily (2026-10-21)",
        "Score: 2/9 · Rarity: 142.4",
        "🟩🟨⬜",
        "🟩🟩🟩",
        "⬜⬜🟨",
        "https://winegrid.vercel.app",
      ].join("\n")
    );
  });

  it("uses the same grid in Portuguese with a translated header", () => {
    const text = buildShareText({
      mode: "daily",
      date: "2026-10-21",
      difficultyLabel: "Padrão",
      correct: 2,
      rarity: 142.44,
      rows: ROWS.map((row) => [...row]),
      locale: "pt-BR",
    });
    assert.equal(
      text,
      [
        "🍷 WineGrid Diário (2026-10-21)",
        "Placar: 2/9 · Raridade: 142.4",
        "🟩🟨⬜",
        "🟩🟩🟩",
        "⬜⬜🟨",
        "https://winegrid.vercel.app",
      ].join("\n")
    );
  });

  it("marks a rare correct pick as yellow and an empty cell as blank", () => {
    assert.equal(shareCellForPick(false, null), "empty");
    assert.equal(shareCellForPick(true, 11.9), "yellow");
    assert.equal(shareCellForPick(true, 12), "green");
  });

  it("writes that exact text to the clipboard and to the system share sheet", async () => {
    const text = buildShareText({
      mode: "unlimited",
      date: "2026-10-21",
      difficultyLabel: "Master",
      correct: 9,
      rarity: 80,
      rows: [
        ["green", "green", "green"],
        ["green", "green", "green"],
        ["green", "green", "green"],
      ],
      locale: "en",
    });
    const written: string[] = [];
    const shared: string[] = [];
    const result = await deliverShareText(text, {
      preferSystemShare: true,
      clipboard: {
        writeText: async (value) => {
          written.push(value);
        },
      },
      systemShare: async (data) => {
        shared.push(data.text);
      },
    });
    assert.equal(result, "shared");
    assert.deepEqual(written, [text]);
    assert.deepEqual(shared, [text]);
    assert.equal(
      text,
      [
        "🍷 WineGrid Unlimited (Master)",
        "Score: 9/9 · Rarity: 80",
        "🟩🟩🟩",
        "🟩🟩🟩",
        "🟩🟩🟩",
        "https://winegrid.vercel.app",
      ].join("\n")
    );
  });
});
