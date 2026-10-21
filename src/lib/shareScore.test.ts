import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildShareText, deliverShareText, shareCellForPick } from "./shareScore";

const ROWS = [
  ["purple", "green", "yellow"],
  ["green", "orange", "empty"],
  ["empty", "empty", "green"],
] as const;

describe("share score", () => {
  it("copies three rows, the misses, and the streak", () => {
    const text = buildShareText({
      mode: "daily",
      date: "2026-10-21",
      difficultyLabel: "Standard",
      correct: 6,
      rarity: 198.24,
      missesUsed: 1,
      streak: 3,
      rows: ROWS.map((row) => [...row]),
      locale: "en",
    });
    assert.equal(
      text,
      [
        "🍷 WineGrid Daily (2026-10-21)",
        "Score: 6/9 · Rarity: 198.2 · ❌×1 · Streak 3",
        "🟪🟩🟨",
        "🟩🟧⬜",
        "⬜⬜🟩",
        "https://winegrid.vercel.app",
      ].join("\n")
    );
    assert.equal(text.split("\n").filter((line) => line.includes("🟩") || line.includes("⬜")).length, 3);
  });

  it("uses a decimal comma in Portuguese", () => {
    const text = buildShareText({
      mode: "daily",
      date: "2026-10-21",
      difficultyLabel: "Padrão",
      correct: 6,
      rarity: 840.94,
      missesUsed: 0,
      streak: 2,
      rows: ROWS.map((row) => [...row]),
      locale: "pt-BR",
    });
    assert.match(text, /Raridade: 840,9 · ❌×0 · Sequência 2/);
    assert.equal(text.split("\n").length, 6);
  });

  it("shades pick rate as purple, green, yellow, then orange", () => {
    assert.equal(shareCellForPick(false, null), "empty");
    assert.equal(shareCellForPick(true, 9.9), "purple");
    assert.equal(shareCellForPick(true, 10), "green");
    assert.equal(shareCellForPick(true, 24.9), "green");
    assert.equal(shareCellForPick(true, 25), "yellow");
    assert.equal(shareCellForPick(true, 40), "yellow");
    assert.equal(shareCellForPick(true, 40.1), "orange");
  });

  it("writes that exact text to the clipboard and to the system share sheet", async () => {
    const text = buildShareText({
      mode: "unlimited",
      date: "2026-10-21",
      difficultyLabel: "Master",
      correct: 9,
      rarity: 80,
      missesUsed: 0,
      streak: 0,
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
    assert.equal(text.split("\n")[2], "🟩🟩🟩");
    assert.equal(text.split("\n")[3], "🟩🟩🟩");
    assert.equal(text.split("\n")[4], "🟩🟩🟩");
  });
});
