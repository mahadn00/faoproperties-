import Image from "next/image";
import Link from "next/link";
import { Check, Plus } from "lucide-react";
import type { ProjectCardData } from "@/lib/project-card";
import { dictionary, type Locale } from "@/lib/i18n/dictionary";
import { projectPath } from "@/lib/i18n/paths";
import { formatAedShort } from "@/lib/format";

/**
 * Homepage project card: the facts off-plan buyers compare (starting price,
 * handover year, down payment) up front, unit types as chips, and a compare
 * toggle. Stacked on tablet/desktop; a compact row with a thumbnail on phones
 * so 27 projects don't make a 25-screen scroll.
 */
export default function ProjectCard({
  project,
  locale = "en",
  compared = false,
  compareFull = false,
  onToggleCompare,
}: {
  project: ProjectCardData;
  locale?: Locale;
  compared?: boolean;
  /** Three projects already picked: other cards can't be added. */
  compareFull?: boolean;
  onToggleCompare?: () => void;
}) {
  const t = dictionary[locale];
  const href = projectPath(locale, project.slug);
  const price = project.startingPriceAed !== null ? formatAedShort(project.startingPriceAed) : t.stats.onRequest;
  const handover = project.handoverYear !== null ? String(project.handoverYear) : "—";
  const down = project.downPaymentPct !== null ? `${project.downPaymentPct}%` : "—";
  const phoneMeta = [
    project.handoverYear !== null && `${t.project.handover} ${project.handoverYear}`,
    project.downPaymentPct !== null && `${t.browse.downPayment} ${project.downPaymentPct}%`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className="group relative flex overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition-shadow hover:shadow-xl sm:flex-col">
      <div className="relative w-28 shrink-0 overflow-hidden sm:aspect-[4/3] sm:w-full">
        <Image
          src={project.heroImage}
          alt={project.name}
          fill
          sizes="(min-width: 1024px) 32vw, (min-width: 640px) 48vw, 112px"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute start-4 top-4 hidden rounded-full bg-white/90 px-3 py-1 text-xs font-medium uppercase tracking-wide text-[var(--color-ink)] sm:block">
          {project.areaTag}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-6">
        <p className="truncate text-[11px] uppercase tracking-wide text-[var(--color-text-muted)] sm:hidden">
          {project.areaTag}
        </p>
        <h3 className="font-display text-lg leading-snug text-[var(--color-text)] sm:text-2xl">
          {/* Stretched over the whole card, so the card is one big link while
              the compare button (z-10) stays separately clickable. */}
          <Link
            href={href}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:after:rounded-2xl focus-visible:after:ring-2 focus-visible:after:ring-[var(--color-gold)]"
          >
            {project.name}
          </Link>
        </h3>
        <p className="mt-1 hidden truncate text-sm text-[var(--color-text-muted)] sm:block">{project.tagline}</p>

        {/* Phones: price on its own line, then whichever of handover and down
            payment are actually known. */}
        <div className="mt-2 sm:hidden">
          <p className="font-display text-base text-[var(--color-text)]">{price}</p>
          {phoneMeta && <p className="text-xs text-[var(--color-text-muted)]">{phoneMeta}</p>}
        </div>

        <dl className="mt-5 hidden grid-cols-3 gap-3 border-t border-[var(--color-sand-line)] pt-4 sm:grid">
          <Fact label={t.card.startingFrom} value={price} />
          <Fact label={t.project.handover} value={handover} />
          <Fact label={t.browse.downPayment} value={down} />
        </dl>

        {project.apartmentTypes.length > 0 && (
          <ul className="mt-4 hidden flex-wrap gap-1.5 sm:flex" aria-label={t.card.apartmentTypes}>
            {project.apartmentTypes.map((type) => (
              <li
                key={type.label}
                className="rounded-full border border-[var(--color-sand-line)] px-2.5 py-0.5 text-xs text-[var(--color-text-muted)]"
              >
                {type.label}
              </li>
            ))}
          </ul>
        )}

        {onToggleCompare && (
          <div className="mt-auto pt-3 sm:pt-5">
            <button
              type="button"
              onClick={onToggleCompare}
              aria-pressed={compared}
              disabled={compareFull && !compared}
              title={compareFull && !compared ? t.browse.compareLimit : undefined}
              className={`relative z-10 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                compared
                  ? "border-[var(--color-gold-deep)] bg-[var(--color-gold-deep)] text-white"
                  : "border-[var(--color-sand-line)] text-[var(--color-text-muted)] hover:border-[var(--color-gold-deep)] hover:text-[var(--color-text)]"
              }`}
            >
              {compared ? <Check size={13} aria-hidden="true" /> : <Plus size={13} aria-hidden="true" />}
              {t.browse.compare}
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

// Labels may wrap to two lines in narrower columns or longer languages; the
// value sits at the bottom so the three stay level.
function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col justify-between gap-1">
      <dt className="text-[11px] uppercase leading-tight tracking-wide text-[var(--color-text-muted)]">{label}</dt>
      <dd className="font-display text-lg leading-tight text-[var(--color-text)]">{value}</dd>
    </div>
  );
}
