export interface DailyStreak {
  current: number;
  best: number;
  lastCompletedDate: string | null;
  lastOutcome: "won" | "lost" | null;
}

export const EMPTY_DAILY_STREAK: DailyStreak = {
  current: 0,
  best: 0,
  lastCompletedDate: null,
  lastOutcome: null,
};

export const DAILY_STREAK_STORAGE_KEY = "winegrid_daily_streak_v1";

export function previousIsoDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

/**
 * Records one finished daily puzzle. The same date is ignored so a reload
 * cannot inflate the streak. A missed day starts a new streak on the next win.
 */
export function recordDailyResult(
  state: DailyStreak,
  date: string,
  won: boolean
): DailyStreak {
  if (state.lastCompletedDate === date) return state;
  const continued =
    won &&
    state.lastOutcome === "won" &&
    state.lastCompletedDate === previousIsoDate(date);
  const current = won ? (continued ? state.current + 1 : 1) : 0;
  return {
    current,
    best: Math.max(state.best, current),
    lastCompletedDate: date,
    lastOutcome: won ? "won" : "lost",
  };
}

export function readDailyStreak(storage: Pick<Storage, "getItem"> | null): DailyStreak {
  if (!storage) return EMPTY_DAILY_STREAK;
  try {
    const raw = storage.getItem(DAILY_STREAK_STORAGE_KEY);
    if (!raw) return EMPTY_DAILY_STREAK;
    const parsed = JSON.parse(raw) as Partial<DailyStreak>;
    return {
      current: typeof parsed.current === "number" ? parsed.current : 0,
      best: typeof parsed.best === "number" ? parsed.best : 0,
      lastCompletedDate:
        typeof parsed.lastCompletedDate === "string" ? parsed.lastCompletedDate : null,
      lastOutcome: parsed.lastOutcome === "won" || parsed.lastOutcome === "lost" ? parsed.lastOutcome : null,
    };
  } catch {
    return EMPTY_DAILY_STREAK;
  }
}

export function writeDailyStreak(storage: Pick<Storage, "setItem">, streak: DailyStreak): void {
  storage.setItem(DAILY_STREAK_STORAGE_KEY, JSON.stringify(streak));
}
