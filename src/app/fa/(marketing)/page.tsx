import Image from "next/image";
import { ArrowDown } from "lucide-react";
import ProjectSearch from "@/components/ProjectSearch";
import LeadForm from "@/components/LeadForm";
import { localizeProjects } from "@/lib/i18n/localize";
import { CONTACT_EMAIL, WHATSAPP_DISPLAY } from "@/lib/constants";
import { dictionary } from "@/lib/i18n/dictionary";
import { parseAedValue, formatAedShort } from "@/lib/format";

const t = dictionary.fa;
const projects = localizeProjects("fa");

const lowestStartingPrice = projects
  .map((p) => parseAedValue(p.startingPrice))
  .filter((v): v is number => v !== null)
  .reduce((min, v) => (v < min ? v : min), Infinity);

const districtCount = new Set(projects.map((p) => p.areaTag)).size;

export default function PersianHomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[92vh] items-end overflow-hidden bg-[var(--color-ink)]">
        <Image
          src="/projects/eltiera-views/gallery/01_exterior_aerial_twilight.jpg"
          alt="املاک لوکس در حال ساخت در دبی"
          fill
          priority
          className="object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ink)] via-[var(--color-ink)]/40 to-[var(--color-ink)]/10" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-20 pt-40 md:px-10 md:pb-28">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-gold)]">
            {t.hero.eyebrow}
          </p>
          <h1 className="font-display mt-5 max-w-3xl text-4xl leading-[1.2] text-white md:text-6xl">
            {t.hero.heading}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/80 md:text-lg">
            {t.hero.body}
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="#projects"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-gold)] px-7 py-3.5 text-sm font-medium text-[var(--color-ink)] transition-opacity hover:opacity-90"
            >
              {t.hero.ctaExplore}
              <ArrowDown size={16} />
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-7 py-3.5 text-sm font-medium text-white transition-colors hover:border-white"
            >
              {t.hero.ctaContact}
            </a>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-b border-[var(--color-sand-line)] bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-10 md:grid-cols-4 md:px-10">
          <Stat label={t.stats.developments} value={String(projects.length)} />
          <Stat
            label={t.stats.startingFrom}
            value={Number.isFinite(lowestStartingPrice) ? formatAedShort(lowestStartingPrice) : t.stats.onRequest}
          />
          <Stat label={t.stats.districts} value={`${districtCount}+`} />
          <Stat label={t.stats.enquiries} value={t.stats.enquiriesValue} />
        </div>
      </section>

      {/* Projects */}
      <section id="projects" className="bg-[var(--color-sand)] py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-gold-deep)]">
              {t.portfolio.eyebrow}
            </p>
            <h2 className="font-display mt-4 text-3xl text-[var(--color-text)] md:text-4xl">
              {t.portfolio.heading}
            </h2>
          </div>

          <div className="mt-14">
            <ProjectSearch projects={projects} locale="fa" />
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="bg-[var(--color-ink)] py-24 md:py-32">
        <div className="mx-auto grid max-w-7xl gap-16 px-6 md:grid-cols-2 md:px-10">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-gold)]">
              {t.contact.eyebrow}
            </p>
            <h2 className="font-display mt-4 text-3xl text-white md:text-4xl">
              {t.contact.heading}
            </h2>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-white/70">
              {t.contact.body}
            </p>

            <div className="mt-10 space-y-3 text-sm text-white/80">
              <p>
                {t.contact.email}:{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-[var(--color-gold)] hover:underline">
                  {CONTACT_EMAIL}
                </a>
              </p>
              <p>{t.contact.whatsapp}: {WHATSAPP_DISPLAY}</p>
            </div>
          </div>

          <div className="rounded-2xl bg-[var(--color-sand)] p-6 sm:p-8">
            <LeadForm source="general-enquiry" submitLabel={t.contact.submitLabel} locale="fa" />
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex h-full flex-col justify-between gap-2">
      <div className="font-display text-2xl leading-tight text-[var(--color-text)] md:text-3xl">
        {value}
      </div>
      <div className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
        {label}
      </div>
    </div>
  );
}
