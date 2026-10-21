export interface PickerRow {
  id: string;
  selectable: boolean;
}

export type PickerEnterAction =
  | { action: "select"; index: number }
  | { action: "sync" }
  | { action: "noop" };

/**
 * Enter may select the highlighted row only when that row was rendered for
 * the exact text currently in the input. If the field is ahead of React
 * state, sync first and do not guess.
 */
export function pickerEnterAction(input: {
  inputValue: string;
  renderedQuery: string;
  results: PickerRow[];
  selectedIndex: number;
}): PickerEnterAction {
  if (input.inputValue !== input.renderedQuery) return { action: "sync" };
  const row = input.results[input.selectedIndex];
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
