/**
 * Daily leaderboard seam.
 *
 * A public board needs a backend (account identity, anti-cheat, and a place
 * to rank scores). That decision is deferred. Game completion already calls
 * `leaderboard.submit`; swap this object for a real client without changing
 * the call site.
 */

export interface DailyScoreSubmission {
  date: string;
  anonId: string;
  correctCells: number;
  missesUsed: number;
  rarityScore: number;
  won: boolean;
  shareText: string;
}

export interface DailyLeaderboardEntry extends DailyScoreSubmission {
  rank: number;
  displayName: string;
}

export interface DailyLeaderboardClient {
  submit(entry: DailyScoreSubmission): Promise<void>;
  top(date: string, limit?: number): Promise<DailyLeaderboardEntry[]>;
}

export const unimplementedLeaderboard: DailyLeaderboardClient = {
  async submit() {
    // Intentionally empty until a backend is chosen.
  },
  async top() {
    return [];
  },
};

export const leaderboard: DailyLeaderboardClient = unimplementedLeaderboard;
