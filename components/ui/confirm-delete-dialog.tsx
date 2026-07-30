"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, LoaderCircle, X } from "lucide-react";

const subscribeToClient = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function ConfirmDeleteDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  pending = false,
  error = "",
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  pending?: boolean;
  error?: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const mounted = useSyncExternalStore(
    subscribeToClient,
    getClientSnapshot,
    getServerSnapshot,
  );
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cancelButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !pending) {
        event.preventDefault();
        onCancel();
        return;
      }
      if (event.key !== "Tab") return;

      const controls = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!controls?.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [open, pending, onCancel]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-ink/55 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !pending) onCancel();
      }}
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        className="w-full max-w-md border border-line bg-white p-6 shadow-[0_28px_100px_rgba(10,28,21,.28)] sm:p-7"
      >
        <div className="flex items-start justify-between gap-5">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-red-50 text-red-700">
            <AlertTriangle size={19} />
          </span>
          <button
            type="button"
            aria-label="Close delete confirmation"
            disabled={pending}
            onClick={onCancel}
            className="grid size-9 shrink-0 place-items-center rounded-full text-stone hover:bg-cream hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={16} />
          </button>
        </div>

        <h2 id="delete-dialog-title" className="mt-5 font-display text-3xl font-medium tracking-[-.03em]">
          {title}
        </h2>
        <p id="delete-dialog-description" className="mt-3 text-sm leading-6 text-stone">
          {description}
        </p>
        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs leading-5 text-red-700">
            {error}
          </p>
        )}

        <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            ref={cancelButtonRef}
            type="button"
            disabled={pending}
            onClick={onCancel}
            className="min-h-11 rounded-full border border-line bg-white px-5 text-[10px] font-bold uppercase tracking-[.1em] text-ink hover:bg-cream disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={onConfirm}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-red-700 px-5 text-[10px] font-bold uppercase tracking-[.1em] text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-65"
          >
            {pending && <LoaderCircle size={14} className="animate-spin" />}
            {pending ? "Deleting" : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
