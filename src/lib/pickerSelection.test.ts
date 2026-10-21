import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { movePickerIndex, pickerEnterAction } from "./pickerSelection";

const rows = [
  { id: "drc", selectable: true },
  { id: "lafite", selectable: true },
];

describe("picker enter sync", () => {
  it("picks the top match of the live query when the field is ahead of the list", () => {
    const action = pickerEnterAction({
      inputValue: "Chardonnay",
      renderedQuery: "Char",
      results: [{ id: "marlborough", selectable: true }],
      selectedIndex: 0,
      liveResults: [
        { id: "grape-chardonnay", selectable: true },
        { id: "app-chablis", selectable: true },
      ],
    });
    assert.deepEqual(action, { action: "select", index: 0 });
  });

  it("selects the highlighted row only when the list matches the field", () => {
    const action = pickerEnterAction({
      inputValue: "Romanee-Conti",
      renderedQuery: "Romanee-Conti",
      results: rows,
      selectedIndex: 0,
    });
    assert.deepEqual(action, { action: "select", index: 0 });
  });

  it("skips a row the hint mode has marked unselectable", () => {
    const action = pickerEnterAction({
      inputValue: "a",
      renderedQuery: "a",
      results: [{ id: "nope", selectable: false }],
      selectedIndex: 0,
    });
    assert.deepEqual(action, { action: "noop" });
  });

  it("moves the highlight only onto selectable rows", () => {
    const mixed = [
      { id: "a", selectable: false },
      { id: "b", selectable: true },
      { id: "c", selectable: false },
    ];
    assert.equal(movePickerIndex(mixed, 1, 1), 1);
    assert.equal(movePickerIndex(mixed, 1, -1), 1);
  });
});
