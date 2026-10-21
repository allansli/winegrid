export interface PickerRow {
  id: string;
  selectable: boolean;
}

export type PickerEnterAction =
  | { action: "select"; index: number }
  | { action: "noop" };

/**
 * Enter picks from the text in the field right now. If that text is ahead of
 * the rendered list, use the freshly searched rows and take their top match
 * instead of a stale highlight.
 */
export function pickerEnterAction(input: {
  inputValue: string;
  renderedQuery: string;
  results: PickerRow[];
  selectedIndex: number;
  liveResults?: PickerRow[];
}): PickerEnterAction {
  const live = input.inputValue !== input.renderedQuery;
  const rows = live ? input.liveResults ?? [] : input.results;
  if (live) {
    const index = rows.findIndex((row) => row.selectable);
    if (index < 0) return { action: "noop" };
    return { action: "select", index };
  }
  const row = rows[input.selectedIndex];
  if (!row || !row.selectable) return { action: "noop" };
  return { action: "select", index: input.selectedIndex };
}

export function movePickerIndex(
  results: PickerRow[],
  selectedIndex: number,
  direction: 1 | -1
): number {
  if (results.length === 0) return 0;
  let index = selectedIndex;
  for (let step = 0; step < results.length; step++) {
    index += direction;
    if (index < 0 || index >= results.length) return selectedIndex;
    if (results[index]?.selectable) return index;
  }
  return selectedIndex;
}
