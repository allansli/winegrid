/**
 * Single-key shortcuts must not fire while the player is typing, a panel is
 * open, or a modifier is held. There is no language-toggle shortcut.
 */
export function shouldIgnoreHotkey(event: {
  metaKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
  target: EventTarget | null;
  dialogOpen?: boolean;
}): boolean {
  if (event.dialogOpen) return true;
  if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return true;
  const target = event.target as HTMLElement | null;
  if (!target || typeof target.tagName !== "string") return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (target.isContentEditable) return true;
  return false;
}

/**
 * Escape closes an open overflow menu and the caller returns focus to its button.
 * An open dialog wins: the first Escape closes the picker, not the menu behind it.
 */
export function overflowMenuEscape(key: string, open: boolean, dialogOpen = false): boolean {
  if (dialogOpen) return false;
  return open && (key === "Escape" || key === "Esc");
}

/** Escape closes a pinned or hovered clue tooltip when no dialog is open. */
export function clueTooltipEscape(key: string, open: boolean, dialogOpen = false): boolean {
  if (dialogOpen) return false;
  return open && (key === "Escape" || key === "Esc");
}

export type EscapeAction = "ignore" | "close-layer" | "close-dialog";

/** Escape closes the topmost dialog, or only its open nested layer. */
export function modalEscapeAction(input: {
  key: string;
  topmost: boolean;
  nestedLayerOpen?: boolean;
}): EscapeAction {
  if (input.key !== "Escape" && input.key !== "Esc") return "ignore";
  if (!input.topmost) return "ignore";
  if (input.nestedLayerOpen) return "close-layer";
  return "close-dialog";
}

export function consumeModalEscape(
  event: {
    key: string;
    preventDefault(): void;
    stopPropagation(): void;
    stopImmediatePropagation?(): void;
  },
  options: { topmost: boolean; nestedLayerOpen?: boolean }
): EscapeAction {
  const action = modalEscapeAction({ key: event.key, ...options });
  if (action === "ignore") return action;
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation?.();
  return action;
}
