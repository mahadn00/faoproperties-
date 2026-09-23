import type { Metadata } from "next";
import Image from "next/image";
import { ArrowDown } from "lucide-react";
import ProjectSearch from "@/components/ProjectSearch";
import LeadForm from "@/components/LeadForm";
import { projects } from "@/lib/projects";
import { CONTACT_EMAIL, SITE_TAGLINE, WHATSAPP_DISPLAY } from "@/lib/constants";
import { parseAedValue, formatAedShort } from "@/lib/format";
import { dictionary } from "@/lib/i18n/dictionary";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  locale: "en",
  path: "/",
  title: dictionary.en.meta.homeTitle,
  description: dictionary.en.meta.homeDescription,
});

const lowestStartingPrice = projects
  .map((p) => parseAedValue(p.startingPrice))
  .filter((v): v is number => v !== null)
  .reduce((min, v) => (v < min ? v : min), Infinity);

const districtCount = new Set(projects.map((p) => p.areaTag)).size;

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative flex min-h-[92vh] items-end overflow-hidden bg-[var(--color-ink)]">
        <Image
          src="/projects/eltiera-views/gallery/01_exterior_aerial_twilight.jpg"
          alt="Luxury off-plan residences in Dubai"
          fill
          priority
          className="object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ink)] via-[var(--color-ink)]/40 to-[var(--color-ink)]/10" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-20 pt-40 md:px-10 md:pb-28">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-gold)]">
            {SITE_TAGLINE}
          </p>
          <h1 className="font-display mt-5 max-w-3xl text-4xl leading-[1.1] text-white md:text-6xl">
            Distinct addresses. One standard of living.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/80 md:text-lg">
            Explore our full portfolio of Dubai&apos;s most considered new
            developments — waterfront towers, sky-deck residences, palm-frond
            villas and branded addresses — and enquire directly with our team.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="#projects"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-gold)] px-7 py-3.5 text-sm font-medium text-[var(--color-ink)] transition-opacity hover:opacity-90"
            >
              Explore Projects
              <ArrowDown size={16} />
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-7 py-3.5 text-sm font-medium text-white transition-colors hover:border-white"
            >
              Speak to Our Team
            </a>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-b border-[var(--color-sand-line)] bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-10 md:grid-cols-4 md:px-10">
          <Stat label="Signature Developments" value={String(projects.length)} />
          <Stat
            label="Starting From"
            value={Number.isFinite(lowestStartingPrice) ? formatAedShort(lowestStartingPrice) : "On Request"}
          />
          <Stat label="Prime Dubai Districts" value={`${districtCount}+`} />
          <Stat label="Enquiries" value="WhatsApp & Email" />
        </div>
      </section>

      {/* Projects */}
      <section id="projects" className="bg-[var(--color-sand)] py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-gold-deep)]">
              Our Portfolio
            </p>
            <h2 className="font-display mt-4 text-3xl text-[var(--color-text)] md:text-4xl">
              A portfolio of developments, each with its own point of view
            </h2>
          </div>

          <div className="mt-14">
            <ProjectSearch projects={projects} locale="en" />
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="bg-[var(--color-ink)] py-24 md:py-32">
        <div className="mx-auto grid max-w-7xl gap-16 px-6 md:grid-cols-2 md:px-10">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-gold)]">
              Get In Touch
            </p>
            <h2 className="font-display mt-4 text-3xl text-white md:text-4xl">
              Speak to our sales team
            </h2>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-white/70">
              Send us your details and preferred project, and a member of the
              team will reach out with availability, pricing and next steps.
            </p>

            <div className="mt-10 space-y-3 text-sm text-white/80">
              <p>
                Email:{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-[var(--color-gold)] hover:underline">
                  {CONTACT_EMAIL}
                </a>
              </p>
              <p>WhatsApp: {WHATSAPP_DISPLAY}</p>
            </div>
          </div>

          <div className="rounded-2xl bg-[var(--color-sand)] p-6 sm:p-8">
            <LeadForm source="general-enquiry" submitLabel="Send Enquiry" />
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
