import { GameMode } from "@/types/wine";
import { Locale } from "@/i18n/locale";

export type ShareCell = "purple" | "green" | "yellow" | "orange" | "empty";

export const SHARE_URL = "https://winegrid.vercel.app";

/**
 * Pick-rate shades: purple under 10%, green from 10% up to 25%,
 * yellow from 25% through 40%, orange above 40%. An empty cell is unsolved.
 */
export function shareCellForPick(picked: boolean, rarityPct: number | null): ShareCell {
  if (!picked) return "empty";
  const pct = rarityPct ?? 50;
  if (pct < 10) return "purple";
  if (pct < 25) return "green";
  if (pct <= 40) return "yellow";
  return "orange";
}

const EMOJI: Record<ShareCell, string> = {
  purple: "🟪",
  green: "🟩",
  yellow: "🟨",
  orange: "🟧",
  empty: "⬜",
};

export function formatDecimal(value: number, locale: Locale): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value);
}

export interface ShareScoreInput {
  mode: GameMode;
  date: string;
  difficultyLabel: string;
  correct: number;
  rarity: number;
  missesUsed: number;
  streak: number;
  rows: ShareCell[][];
  locale: Locale;
}

export function buildShareText(input: ShareScoreInput): string {
  const grid = input.rows.map((row) => row.map((cell) => EMOJI[cell]).join("")).join("\n");
  const rarity = formatDecimal(input.rarity, input.locale);
  const score =
    input.locale === "pt-BR"
      ? `Placar: ${input.correct}/9 · Raridade: ${rarity}\n❌×${input.missesUsed} · Sequência ${input.streak}`
      : `Score: ${input.correct}/9 · Rarity: ${rarity}\n❌×${input.missesUsed} · Streak ${input.streak}`;
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
