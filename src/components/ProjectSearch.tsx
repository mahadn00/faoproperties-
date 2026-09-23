"use client";

import { useCallback, useMemo, useState } from "react";
import { X } from "lucide-react";
import ProjectCard from "./ProjectCard";
import CompareDialog from "./CompareDialog";
import type { ProjectCardData } from "@/lib/project-card";
import { dictionary, type Locale } from "@/lib/i18n/dictionary";
import {
  BUDGET_PRESETS,
  BUDGET_PRESET_KEYS,
  PROPERTY_TYPES,
  projectMatchesSearch,
  type BudgetPreset,
  type PropertyType,
} from "@/lib/search";

const PAGE_SIZE = 9;
const MAX_COMPARE = 3;

type SortKey = "recommended" | "priceAsc" | "priceDesc" | "handover";
const SORT_KEYS: SortKey[] = ["recommended", "priceAsc", "priceDesc", "handover"];

// Ascending by a nullable number, unknowns always last (e.g. "price on request").
function byValue(get: (p: ProjectCardData) => number | null, direction: 1 | -1) {
  return (a: ProjectCardData, b: ProjectCardData) => {
    const x = get(a);
    const y = get(b);
    if (x === null) return y === null ? 0 : 1;
    if (y === null) return -1;
    return (x - y) * direction;
  };
}

export default function ProjectSearch({
  projects,
  locale = "en",
}: {
  projects: ProjectCardData[];
  locale?: Locale;
}) {
  const t = dictionary[locale];
  const [selectedTypes, setSelectedTypes] = useState<Set<PropertyType>>(new Set());
  const [budget, setBudget] = useState<BudgetPreset>("any");
  const [area, setArea] = useState("all");
  const [sort, setSort] = useState<SortKey>("recommended");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [compare, setCompare] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);

  const areas = useMemo(
    () => [...new Set(projects.map((p) => p.areaTag))].sort((a, b) => a.localeCompare(b)),
    [projects]
  );

  const results = useMemo(() => {
    const [min, max] = BUDGET_PRESETS[budget];
    const list = projects.filter(
      (p) => (area === "all" || p.areaTag === area) && projectMatchesSearch(p, selectedTypes, min, max)
    );
    // Array#sort is stable, so ties keep the curated "recommended" order.
    if (sort === "priceAsc") list.sort(byValue((p) => p.startingPriceAed, 1));
    if (sort === "priceDesc") list.sort(byValue((p) => p.startingPriceAed, -1));
    if (sort === "handover") list.sort(byValue((p) => p.handoverYear, 1));
    return list;
  }, [projects, selectedTypes, budget, area, sort]);

  // Any change to what's listed starts again from the first page.
  const refine = (apply: () => void) => {
    apply();
    setVisible(PAGE_SIZE);
  };

  const toggleType = (type: PropertyType) =>
    refine(() =>
      setSelectedTypes((prev) => {
        const next = new Set(prev);
        if (next.has(type)) next.delete(type);
        else next.add(type);
        return next;
      })
    );

  const hasFilters = selectedTypes.size > 0 || budget !== "any" || area !== "all";
  const clearFilters = () =>
    refine(() => {
      setSelectedTypes(new Set());
      setBudget("any");
      setArea("all");
    });

  const toggleCompare = (slug: string) =>
    setCompare((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : prev.length < MAX_COMPARE ? [...prev, slug] : prev
    );
  const closeCompare = useCallback(() => setCompareOpen(false), []);
  const removeFromCompare = (slug: string) => {
    const next = compare.filter((s) => s !== slug);
    setCompare(next);
    if (next.length < 2) setCompareOpen(false); // nothing left to compare
  };
  const compared = compare
    .map((slug) => projects.find((p) => p.slug === slug))
    .filter((p): p is ProjectCardData => Boolean(p));

  const shown = results.slice(0, visible);
  const remaining = results.length - shown.length;

  return (
    <>
      <div className="mb-10 space-y-6 rounded-2xl border border-[var(--color-sand-line)] bg-white p-5 sm:p-6">
        <fieldset>
          <legend className="mb-3 text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
            {t.search.typeLabel}
          </legend>
          <div className="flex flex-wrap gap-2">
            {PROPERTY_TYPES.map((pt) => (
              <Chip key={pt} active={selectedTypes.has(pt)} onClick={() => toggleType(pt)}>
                {t.search.types[pt]}
              </Chip>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-3 text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
            {t.search.budgetLabel}
          </legend>
          <div className="flex flex-wrap gap-2">
            {BUDGET_PRESET_KEYS.map((key) => (
              <Chip key={key} active={budget === key} onClick={() => refine(() => setBudget(key))}>
                {t.browse.budget[key]}
              </Chip>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2 lg:flex lg:items-end lg:gap-6">
          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
              {t.browse.areaLabel}
            </span>
            <select
              value={area}
              onChange={(e) => refine(() => setArea(e.target.value))}
              className="w-full rounded-md border border-[var(--color-sand-line)] bg-white px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] lg:w-56"
            >
              <option value="all">{t.browse.allAreas}</option>
              {areas.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
              {t.browse.sortLabel}
            </span>
            <select
              value={sort}
              onChange={(e) => refine(() => setSort(e.target.value as SortKey))}
              className="w-full rounded-md border border-[var(--color-sand-line)] bg-white px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-gold)] lg:w-56"
            >
              {SORT_KEYS.map((key) => (
                <option key={key} value={key}>
                  {t.browse.sort[key]}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm sm:col-span-2 lg:ms-auto lg:pb-2">
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="font-medium text-[var(--color-gold-deep)] hover:underline"
              >
                {t.search.clearFilters}
              </button>
            )}
            <span className="text-[var(--color-text-muted)]" aria-live="polite">
              {t.search.resultsCount(results.length)}
            </span>
          </div>
        </div>
      </div>

      {results.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[var(--color-sand-line)] bg-white/60 p-12 text-center text-sm text-[var(--color-text-muted)]">
          {t.search.noResults}
        </p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-8">
            {shown.map((project) => (
              <ProjectCard
                key={project.slug}
                project={project}
                locale={locale}
                compared={compare.includes(project.slug)}
                compareFull={compare.length >= MAX_COMPARE}
                onToggleCompare={() => toggleCompare(project.slug)}
              />
            ))}
          </div>
          {remaining > 0 && (
            <div className="mt-10 text-center">
              <button
                type="button"
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
                className="rounded-full border border-[var(--color-ink)] px-7 py-3 text-sm font-medium text-[var(--color-ink)] transition-colors hover:bg-[var(--color-ink)] hover:text-white"
              >
                {t.browse.showMore(Math.min(PAGE_SIZE, remaining))}
              </button>
            </div>
          )}
        </>
      )}

      {compared.length > 0 && (
        // Floating tray while projects are picked; globals.css lifts the
        // WhatsApp bubble above it (data-compare-tray).
        <div
          data-compare-tray
          className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-sand-line)] bg-white/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(10,18,32,0.08)] backdrop-blur"
        >
          <div className="mx-auto flex max-w-7xl items-center gap-3">
            <ul className="flex min-w-0 flex-1 gap-2 overflow-x-auto">
              {compared.map((p) => (
                <li
                  key={p.slug}
                  className="flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--color-sand-line)] bg-white py-1 pe-1.5 ps-3 text-xs text-[var(--color-text)]"
                >
                  <span className="max-w-[9rem] truncate">{p.name}</span>
                  <button
                    type="button"
                    onClick={() => toggleCompare(p.slug)}
                    aria-label={`${t.browse.remove}: ${p.name}`}
                    className="rounded-full p-0.5 text-[var(--color-text-muted)] hover:bg-black/5 hover:text-[var(--color-text)]"
                  >
                    <X size={13} />
                  </button>
                </li>
              ))}
              {compared.length < 2 && (
                <li className="hidden shrink-0 self-center text-xs text-[var(--color-text-muted)] sm:block">
                  {t.browse.compareHint}
                </li>
              )}
            </ul>
            <button
              type="button"
              onClick={() => setCompare([])}
              className="hidden shrink-0 text-xs font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] sm:block"
            >
              {t.browse.clear}
            </button>
            <button
              type="button"
              disabled={compared.length < 2}
              onClick={() => setCompareOpen(true)}
              className="shrink-0 rounded-full bg-[var(--color-ink)] px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {t.browse.compareCta(compared.length)}
            </button>
          </div>
        </div>
      )}

      {compareOpen && compared.length >= 2 && (
        <CompareDialog projects={compared} locale={locale} onClose={closeCompare} onRemove={removeFromCompare} />
      )}
    </>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
        active
          ? "border-[var(--color-gold-deep)] bg-[var(--color-gold-deep)] text-white"
          : "border-[var(--color-sand-line)] bg-white text-[var(--color-text)] hover:border-[var(--color-gold-deep)]"
      }`}
    >
      {children}
    </button>
  );
}
