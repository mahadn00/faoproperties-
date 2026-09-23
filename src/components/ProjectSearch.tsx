"use client";

import { useMemo, useState } from "react";
import ProjectCard from "./ProjectCard";
import type { Project } from "@/lib/projects";
import { dictionary, type Locale } from "@/lib/i18n/dictionary";
import { PROPERTY_TYPES, projectMatchesSearch, type PropertyType } from "@/lib/search";

export default function ProjectSearch({
  projects,
  startingPrices,
  locale = "en",
}: {
  projects: Project[];
  /** Numeric AED starting price per slug — see startingPriceAed() in lib/projects. */
  startingPrices: Record<string, number | null>;
  locale?: Locale;
}) {
  const t = dictionary[locale].search;
  const [selectedTypes, setSelectedTypes] = useState<Set<PropertyType>>(new Set());
  const [minBudget, setMinBudget] = useState<string>("");
  const [maxBudget, setMaxBudget] = useState<string>("");

  const min = minBudget.trim() === "" ? null : Number(minBudget);
  const max = maxBudget.trim() === "" ? null : Number(maxBudget);

  const filtered = useMemo(
    () =>
      projects.filter((p) =>
        projectMatchesSearch(
          p,
          selectedTypes,
          Number.isFinite(min as number) ? min : null,
          Number.isFinite(max as number) ? max : null,
          startingPrices[p.slug] ?? null
        )
      ),
    [projects, startingPrices, selectedTypes, min, max]
  );

  const hasFilters = selectedTypes.size > 0 || minBudget !== "" || maxBudget !== "";

  const toggleType = (type: PropertyType) => {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const clearFilters = () => {
    setSelectedTypes(new Set());
    setMinBudget("");
    setMaxBudget("");
  };

  return (
    <>
      <div className="mb-10 rounded-2xl border border-[var(--color-sand-line)] bg-white p-5 sm:p-6">
        <div className="flex flex-wrap gap-8">
          <div>
            <div className="mb-3 text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
              {t.typeLabel}
            </div>
            <ul className="flex flex-wrap gap-x-6 gap-y-2.5">
              {PROPERTY_TYPES.map((pt) => (
                <li key={pt}>
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--color-text)]">
                    <input
                      type="checkbox"
                      checked={selectedTypes.has(pt)}
                      onChange={() => toggleType(pt)}
                      className="h-4 w-4 rounded border-[var(--color-sand-line)] accent-[var(--color-gold-deep)]"
                    />
                    {t.types[pt]}
                  </label>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="mb-3 text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
              {t.budgetLabel}
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                inputMode="numeric"
                min={0}
                placeholder={t.budgetFrom}
                value={minBudget}
                onChange={(e) => setMinBudget(e.target.value)}
                className="w-32 rounded-md border border-[var(--color-sand-line)] bg-white px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)]"
              />
              <span className="text-[var(--color-text-muted)]">—</span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                placeholder={t.budgetTo}
                value={maxBudget}
                onChange={(e) => setMaxBudget(e.target.value)}
                className="w-32 rounded-md border border-[var(--color-sand-line)] bg-white px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)]"
              />
            </div>
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="self-start text-sm font-medium text-[var(--color-gold-deep)] hover:underline"
            >
              {t.clearFilters}
            </button>
          )}

          <div className="ms-auto self-end whitespace-nowrap text-sm text-[var(--color-text-muted)]">
            {t.resultsCount(filtered.length)}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[var(--color-sand-line)] bg-white/60 p-12 text-center text-sm text-[var(--color-text-muted)]">
          {t.noResults}
        </p>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          {filtered.map((project) => (
            <ProjectCard key={project.slug} project={project} locale={locale} />
          ))}
        </div>
      )}
    </>
  );
}
