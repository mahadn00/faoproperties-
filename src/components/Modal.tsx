"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

/**
 * Rendered into <body> through a portal: the brochure buttons live inside the
 * project page's sticky sidebar, and a sticky element is its own stacking
 * context — left there, the dialog sat underneath the mobile CTA bar. The
 * overlay scrolls, so a form taller than a phone screen stays reachable.
 */
export default function Modal({
  open,
  onClose,
  title,
  closeLabel = "Close",
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  closeLabel?: string;
  children: React.ReactNode;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      opener?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] overflow-y-auto bg-black/60 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center">
        <div
          className="w-full max-w-md rounded-xl bg-[var(--color-sand)] p-6 shadow-2xl sm:p-8"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-6 flex items-start justify-between gap-4">
            <h3 className="font-display text-xl text-[var(--color-text)]">{title}</h3>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label={closeLabel}
              className="rounded-full p-1 text-[var(--color-text-muted)] transition-colors hover:bg-black/5 hover:text-[var(--color-text)]"
            >
              <X size={20} />
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
