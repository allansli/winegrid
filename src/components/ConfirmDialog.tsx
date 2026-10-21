"use client";

import React from "react";
import { ModalFrame } from "./ModalFrame";
import { useI18n } from "@/i18n/I18nProvider";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  body,
  confirmLabel,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const { t } = useI18n();
  return (
    <ModalFrame
      isOpen={isOpen}
      onClose={onClose}
      ariaLabel={title}
      overlayClassName="winegrid-modal-safe fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm"
      panelClassName="w-full max-w-md rounded-3xl border border-slate-200 bg-white shadow-modal p-6"
    >
      <h2 className="font-display text-lg font-bold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
      <div className="mt-5 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl bg-slate-100 hover:bg-slate-200/80 px-4 py-2 text-xs font-semibold text-slate-700 transition"
        >
          {t("confirm.stay")}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="rounded-xl bg-wine-600 hover:bg-wine-700 px-4 py-2 text-xs font-semibold text-white transition"
        >
          {confirmLabel}
        </button>
      </div>
    </ModalFrame>
  );
}
