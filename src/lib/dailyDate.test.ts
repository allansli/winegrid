import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseDailyQuery } from "./dailyDate";

describe("daily date query", () => {
  const today = "2026-10-21";

  it("keeps today as the live puzzle", () => {
    assert.deepEqual(parseDailyQuery("", today, "production"), { date: today, replay: false });
    assert.deepEqual(parseDailyQuery("?date=2026-10-21", today, "production"), {
      date: today,
      replay: false,
    });
    assert.deepEqual(parseDailyQuery("?date=nope", today, "preview"), { date: today, replay: false });
  });

  it("replays past dates everywhere and future dates only off production", () => {
    assert.deepEqual(parseDailyQuery("?date=2026-10-20", today, "production"), {
      date: "2026-10-20",
      replay: true,
    });
    assert.deepEqual(parseDailyQuery("?date=2026-10-22", today, "production"), {
      date: today,
      replay: false,
    });
    assert.deepEqual(parseDailyQuery("?date=2026-10-22", today, "preview"), {
      date: "2026-10-22",
      replay: true,
    });
    assert.deepEqual(parseDailyQuery("?date=2026-10-22", today, undefined), {
      date: "2026-10-22",
      replay: true,
    });
  });
});
