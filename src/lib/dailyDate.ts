const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isIsoDate(value: string): boolean {
  const match = DATE_RE.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export interface DailyQuery {
  date: string;
  /** Past or non-production future. Does not write streaks or saves. */
  replay: boolean;
  /** Production ignored a future ?date= and the URL should drop it. */
  futureRejected: boolean;
}

/**
 * `?date=` selects a daily. Today is the live puzzle. Past dates replay
 * everywhere. A future date replays only outside production.
 */
export function parseDailyQuery(
  search: string,
  today: string,
  vercelEnv: string | undefined
): DailyQuery {
  const requested = new URLSearchParams(search).get("date");
  if (!requested || !isIsoDate(requested) || requested === today) {
    return { date: today, replay: false, futureRejected: false };
  }
  if (requested < today) return { date: requested, replay: true, futureRejected: false };
  if (vercelEnv === "production") return { date: today, replay: false, futureRejected: true };
  return { date: requested, replay: true, futureRejected: false };
}

/** Search string to put back in the URL. A rejected future date is removed. */
export function searchWithoutRejectedFuture(
  search: string,
  today: string,
  vercelEnv: string | undefined
): string {
  const query = parseDailyQuery(search, today, vercelEnv);
  if (!query.futureRejected) return search;
  const params = new URLSearchParams(search);
  params.delete("date");
  const next = params.toString();
  return next ? `?${next}` : "";
}

/** Inlined at build time so a static export can tell production from preview. */
export function clientVercelEnv(): string | undefined {
  const value = process.env.NEXT_PUBLIC_VERCEL_ENV;
  return value ? value : undefined;
}
