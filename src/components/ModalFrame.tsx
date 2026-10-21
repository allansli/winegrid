"use client";

import React, { useLayoutEffect, useRef } from "react";
import { consumeModalEscape } from "@/lib/hotkeys";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function getFocusable(root: HTMLElement): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)].filter(
    (element) => !element.hasAttribute("disabled") && element.tabIndex !== -1
  );
}

interface ModalFrameProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  ariaLabel: string;
  panelClassName: string;
  overlayClassName?: string;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
}

export function ModalFrame({
  isOpen,
  onClose,
  children,
  ariaLabel,
  panelClassName,
  overlayClassName = "winegrid-modal-safe fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm",
  initialFocusRef,
}: ModalFrameProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useLayoutEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusInitial = () => {
      const root = panelRef.current;
      if (!root) return;
      const preferred = initialFocusRef?.current;
      if (preferred && root.contains(preferred)) {
        preferred.focus();
        return;
      }
      getFocusable(root)[0]?.focus();
    };
    const focusFrame = window.requestAnimationFrame(focusInitial);

    const onKeyDown = (event: KeyboardEvent) => {
      const root = panelRef.current;
      const dialogs = document.querySelectorAll("[role='dialog'][aria-modal='true']");
      const topmost = Boolean(root && dialogs[dialogs.length - 1] === root);
      const nested = Boolean(root?.querySelector("[data-escape-layer='open']"));
      const escape = consumeModalEscape(event, { topmost, nestedLayerOpen: nested });
      if (escape === "close-layer") {
        root
          ?.querySelector("[data-escape-layer='open']")
          ?.dispatchEvent(new Event("winegrid-close-layer"));
        return;
      }
      if (escape === "close-dialog") {
        onCloseRef.current();
        return;
      }
      if (!topmost || event.key !== "Tab" || !root) return;
      const items = getFocusable(root);
      if (items.length === 0) {
        event.preventDefault();
        return;
      }
      const active = document.activeElement as HTMLElement | null;
      const inside = Boolean(active && root.contains(active));
      const first = items[0];
      const last = items[items.length - 1];
      if (!inside) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
        return;
      }
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", onKeyDown, true);
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused?.isConnected) previouslyFocused.focus();
    };
  }, [isOpen, initialFocusRef]);

  if (!isOpen) return null;

  return (
    <div className={overlayClassName} onClick={onClose}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        className={panelClassName}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
