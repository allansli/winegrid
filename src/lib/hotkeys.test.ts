import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { shouldIgnoreHotkey } from "./hotkeys";

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
