import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DAILY_STREAK_STORAGE_KEY,
  EMPTY_DAILY_STREAK,
  readDailyStreak,
  recordDailyResult,
  writeDailyStreak,
} from "./dailyStreak";

describe("daily streak", () => {
  it("starts at 1 on a win and remembers the best", () => {
    const next = recordDailyResult(EMPTY_DAILY_STREAK, "2026-10-21", true);
    assert.deepEqual(next, {
      current: 1,
      best: 1,
      lastCompletedDate: "2026-10-21",
      lastOutcome: "won",
    });
  });

  it("increments across consecutive winning days and keeps the best", () => {
    let streak = recordDailyResult(EMPTY_DAILY_STREAK, "2026-10-20", true);
    streak = recordDailyResult(streak, "2026-10-21", true);
    streak = recordDailyResult(streak, "2026-10-22", true);
    assert.equal(streak.current, 3);
    assert.equal(streak.best, 3);
  });

  it("resets after a missed day and does not double-count the same date", () => {
    let streak = recordDailyResult(EMPTY_DAILY_STREAK, "2026-10-19", true);
    streak = recordDailyResult(streak, "2026-10-21", true);
    assert.equal(streak.current, 1);
    assert.equal(streak.best, 1);
    const again = recordDailyResult(streak, "2026-10-21", true);
    assert.equal(again, streak);
  });

  it("breaks the current streak on a loss without lowering the best", () => {
    let streak = recordDailyResult(EMPTY_DAILY_STREAK, "2026-10-20", true);
    streak = recordDailyResult(streak, "2026-10-21", true);
    streak = recordDailyResult(streak, "2026-10-22", false);
    assert.equal(streak.current, 0);
    assert.equal(streak.best, 2);
    assert.equal(streak.lastOutcome, "lost");
  });

  it("round-trips through localStorage", () => {
    const memory = new Map<string, string>();
    const storage = {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => {
        memory.set(key, value);
      },
    };
    const streak = recordDailyResult(EMPTY_DAILY_STREAK, "2026-10-21", true);
    writeDailyStreak(storage, streak);
    assert.equal(memory.has(DAILY_STREAK_STORAGE_KEY), true);
    assert.deepEqual(readDailyStreak(storage), streak);
  });
});
