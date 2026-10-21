/**
 * The future-date notice stays up for the board that was on screen when it
 * appeared. A later board, including a mode change, dismisses it.
 */
export function futureNoticeVisible(
  showing: boolean,
  previousBoardId: string | null,
  nextBoardId: string | null
): boolean {
  if (!showing) return false;
  if (previousBoardId === null || nextBoardId === null) return true;
  return previousBoardId === nextBoardId;
}
