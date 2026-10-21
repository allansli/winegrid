import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  clueTooltipEscape,
  consumeModalEscape,
  modalEscapeAction,
  overflowMenuEscape,
  shouldIgnoreHotkey,
} from "./hotkeys";

describe("hotkeys", () => {
  it("ignores keys while typing, in a dialog, or with a modifier", () => {
    const input = { tagName: "INPUT", isContentEditable: false } as HTMLElement;
    assert.equal(
      shouldIgnoreHotkey({ metaKey: false, ctrlKey: false, altKey: false, shiftKey: false, target: input }),
      true
    );
    assert.equal(
      shouldIgnoreHotkey({
        metaKey: true,
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        target: { tagName: "DIV", isContentEditable: false } as HTMLElement,
      }),
      true
    );
    assert.equal(
      shouldIgnoreHotkey({
        metaKey: false,
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        target: { tagName: "DIV", isContentEditable: false } as HTMLElement,
        dialogOpen: true,
      }),
      true
    );
  });

  it("closes the topmost dialog on Escape and does not fall through", () => {
    assert.equal(modalEscapeAction({ key: "Escape", topmost: true }), "close-dialog");
    assert.equal(
      modalEscapeAction({ key: "Escape", topmost: true, nestedLayerOpen: true }),
      "close-layer"
    );
    assert.equal(modalEscapeAction({ key: "Escape", topmost: false }), "ignore");
    assert.equal(modalEscapeAction({ key: "Enter", topmost: true }), "ignore");

    const calls: string[] = [];
    const action = consumeModalEscape(
      {
        key: "Escape",
        preventDefault: () => calls.push("prevent"),
        stopPropagation: () => calls.push("stop"),
        stopImmediatePropagation: () => calls.push("immediate"),
      },
      { topmost: true }
    );
    assert.equal(action, "close-dialog");
    assert.deepEqual(calls, ["prevent", "stop", "immediate"]);

    const ignored: string[] = [];
    assert.equal(
      consumeModalEscape(
        {
          key: "n",
          preventDefault: () => ignored.push("prevent"),
          stopPropagation: () => ignored.push("stop"),
        },
        { topmost: true }
      ),
      "ignore"
    );
    assert.deepEqual(ignored, []);
    assert.equal(
      shouldIgnoreHotkey({
        metaKey: false,
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        target: { tagName: "DIV", isContentEditable: false } as HTMLElement,
        dialogOpen: true,
      }),
      true
    );
  });

  it("closes an open overflow menu on Escape", () => {
    assert.equal(overflowMenuEscape("Escape", true), true);
    assert.equal(overflowMenuEscape("Esc", true), true);
    assert.equal(overflowMenuEscape("Escape", false), false);
    assert.equal(overflowMenuEscape("n", true), false);
  });

  it("lets the first Escape close a dialog instead of the menu behind it", () => {
    assert.equal(overflowMenuEscape("Escape", true, true), false);
    assert.equal(overflowMenuEscape("Escape", true, false), true);
  });

  it("closes a clue tooltip on the first Escape and leaves it for an open dialog", () => {
    assert.equal(clueTooltipEscape("Escape", true, false), true);
    assert.equal(clueTooltipEscape("Esc", true, false), true);
    assert.equal(clueTooltipEscape("Escape", false, false), false);
    assert.equal(clueTooltipEscape("Escape", true, true), false);
    assert.equal(clueTooltipEscape("Enter", true, false), false);
  });

  it("allows a bare key on the board itself", () => {
    assert.equal(
      shouldIgnoreHotkey({
        metaKey: false,
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        target: { tagName: "BUTTON", isContentEditable: false } as HTMLElement,
      }),
      false
    );
  });
});
