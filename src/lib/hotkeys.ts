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
  if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return true;
  if (event.dialogOpen) return true;
  const target = event.target as HTMLElement | null;
  if (!target || typeof target.tagName !== "string") return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (target.isContentEditable) return true;
  return false;
}
