"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import type { ProjectCardData } from "@/lib/project-card";
import { dictionary, type Locale } from "@/lib/i18n/dictionary";
import { projectPath } from "@/lib/i18n/paths";
import { formatAedShort } from "@/lib/format";

/** Side-by-side table of 2–3 projects picked on the homepage. */
export default function CompareDialog({
  projects,
  locale,
  onClose,
  onRemove,
}: {
  projects: ProjectCardData[];
  locale: Locale;
  onClose: () => void;
  onRemove: (slug: string) => void;
}) {
  const t = dictionary[locale];
  const closeRef = useRef<HTMLButtonElement>(null);

  // Escape closes, the page behind doesn't scroll, focus starts on Close and
  // returns to whatever opened the dialog.
  useEffect(() => {
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
  }, [onClose]);

  const pct = (n: number | null) => (n !== null ? `${n}%` : "—");
  const rows: [string, (p: ProjectCardData) => string][] = [
    [t.card.startingFrom, (p) => (p.startingPriceAed !== null ? formatAedShort(p.startingPriceAed) : t.stats.onRequest)],
    [t.project.handover, (p) => p.handover || t.project.onRequest],
    [t.browse.downPayment, (p) => pct(p.downPaymentPct)],
    [t.browse.finalPayment, (p) => pct(p.finalPaymentPct)],
    [t.card.apartmentTypes, (p) => p.apartmentTypes.map((a) => a.label).join(", ") || "—"],
    [t.browse.area, (p) => p.community || p.areaTag],
    [t.browse.developer, (p) => p.developer || "—"],
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="compare-title"
      onClick={onClose}
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 sm:items-center sm:p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-2xl bg-[var(--color-sand)] shadow-2xl sm:rounded-2xl"
      >
        <div className="flex items-center justify-between gap-4 border-b border-[var(--color-sand-line)] px-5 py-4 sm:px-6">
          <h2 id="compare-title" className="font-display text-xl text-[var(--color-text)]">
            {t.browse.compareTitle}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={t.browse.close}
            className="rounded-full p-1.5 text-[var(--color-text-muted)] transition-colors hover:bg-black/5 hover:text-[var(--color-text)]"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-auto">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="sticky start-0 z-10 w-36 bg-[var(--color-sand)]" />
                {projects.map((p) => (
                  <th key={p.slug} scope="col" className="px-4 pb-4 pt-5 text-start align-top font-normal">
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
                      <Image src={p.heroImage} alt="" fill sizes="240px" className="object-cover" />
                    </div>
                    <Link
                      href={projectPath(locale, p.slug)}
                      className="font-display mt-3 block text-lg leading-snug text-[var(--color-text)] hover:text-[var(--color-gold-deep)]"
                    >
                      {p.name}
                    </Link>
                    <button
                      type="button"
                      onClick={() => onRemove(p.slug)}
                      className="mt-1 text-xs text-[var(--color-text-muted)] underline-offset-2 hover:underline"
                    >
                      {t.browse.remove}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, value]) => (
                <tr key={label} className="border-t border-[var(--color-sand-line)]">
                  <th
                    scope="row"
                    className="sticky start-0 bg-[var(--color-sand)] px-5 py-3 text-start align-top text-xs font-medium uppercase tracking-wide text-[var(--color-text-muted)] sm:px-6"
                  >
                    {label}
                  </th>
                  {projects.map((p) => (
                    <td key={p.slug} className="px-4 py-3 align-top text-[var(--color-text)]">
                      {value(p)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
