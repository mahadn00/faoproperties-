import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/lib/projects";
import { dictionary, type Locale } from "@/lib/i18n/dictionary";

export default function ProjectCard({
  project,
  locale = "en",
}: {
  project: Project;
  locale?: Locale;
}) {
  const t = dictionary[locale].card;
  const href = locale === "sr" ? `/sr/projects/${project.slug}` : `/projects/${project.slug}`;
  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition-shadow hover:shadow-xl"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={project.heroImage}
          alt={project.name}
          fill
          sizes="(min-width: 1024px) 32vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
        <div className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1 text-xs font-medium uppercase tracking-wide text-[var(--color-ink)]">
          {project.areaTag}
        </div>
      </div>

      <div className="p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-2xl text-[var(--color-text)]">{project.name}</h3>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">{project.tagline}</p>
          </div>
          <ArrowUpRight
            size={22}
            className="mt-1 shrink-0 text-[var(--color-gold-deep)] transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
          />
        </div>

        <p className="mt-4 text-sm leading-relaxed text-[var(--color-text-muted)] line-clamp-3">
          {project.summary}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-[var(--color-sand-line)] pt-5 text-sm">
          <div>
            <span className="block text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
              {t.startingFrom}
            </span>
            <span className="font-display text-lg text-[var(--color-text)]">
              {project.startingPrice}
            </span>
          </div>
          <div>
            <span className="block text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
              {t.apartmentTypes}
            </span>
            <span className="text-[var(--color-text)]">
              {project.apartmentTypes.map((t) => t.label).join(" · ")}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
