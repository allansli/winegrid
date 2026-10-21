import { GameMode } from "@/types/wine";
import { Locale } from "@/i18n/locale";

export type ShareCell = "green" | "yellow" | "empty";

export const SHARE_URL = "https://winegrid.vercel.app";

/** Rare picks (under 12% of players) are the yellow square. */
export function shareCellForPick(picked: boolean, rarityPct: number | null): ShareCell {
  if (!picked) return "empty";
  if ((rarityPct ?? 50) < 12) return "yellow";
  return "green";
}

const EMOJI: Record<ShareCell, string> = {
  green: "🟩",
  yellow: "🟨",
  empty: "⬜",
};

function rarityText(rarity: number): string {
  return String(Number(rarity.toFixed(1)));
}

export interface ShareScoreInput {
  mode: GameMode;
  date: string;
  difficultyLabel: string;
  correct: number;
  rarity: number;
  rows: ShareCell[][];
  locale: Locale;
}

export function buildShareText(input: ShareScoreInput): string {
  const grid = input.rows.map((row) => row.map((cell) => EMOJI[cell]).join("")).join("\n");
  const rarity = rarityText(input.rarity);
  const score =
    input.locale === "pt-BR"
      ? `Placar: ${input.correct}/9 · Raridade: ${rarity}`
      : `Score: ${input.correct}/9 · Rarity: ${rarity}`;
  let title: string;
  if (input.locale === "pt-BR") {
    title =
      input.mode === "daily"
        ? `Diário (${input.date})`
        : input.mode === "infinite"
        ? "Modo infinito"
        : `Livre (${input.difficultyLabel})`;
  } else {
    title =
      input.mode === "daily"
        ? `Daily (${input.date})`
        : input.mode === "infinite"
        ? "Infinite Mode"
        : `Unlimited (${input.difficultyLabel})`;
  }
  return `🍷 WineGrid ${title}\n${score}\n${grid}\n${SHARE_URL}`;
}

export async function deliverShareText(
  text: string,
  options: {
    preferSystemShare: boolean;
    clipboard: { writeText(value: string): Promise<void> };
    systemShare?: (data: { text: string }) => Promise<void>;
  }
): Promise<"shared" | "copied"> {
  await options.clipboard.writeText(text);
  if (options.preferSystemShare && options.systemShare) {
    try {
      await options.systemShare({ text });
      return "shared";
    } catch {
      return "copied";
    }
  }
  return "copied";
}
