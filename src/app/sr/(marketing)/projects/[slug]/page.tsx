import Image from "next/image";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { projects as baseProjects } from "@/lib/projects";
import { getLocalizedProjectBySlug } from "@/lib/i18n/localize";
import { dictionary } from "@/lib/i18n/dictionary";
import Gallery from "@/components/Gallery";
import MapEmbed from "@/components/MapEmbed";
import DownloadGate from "@/components/DownloadGate";
import MobileCtaBar from "@/components/MobileCtaBar";
import JsonLd from "@/components/JsonLd";
import ProjectFaq from "@/components/ProjectFaq";
import { whatsappLink } from "@/lib/constants";
import {
  buildPageMetadata,
  projectJsonLd,
  breadcrumbJsonLd,
  projectFaqs,
  faqJsonLd,
  absoluteUrl,
  localizedPath,
  shareImagePath,
} from "@/lib/seo";

const t = dictionary.sr;

export function generateStaticParams() {
  return baseProjects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/sr/projects/[slug]">) {
  const { slug } = await params;
  const project = getLocalizedProjectBySlug(slug, "sr");
  if (!project) return {};
  return buildPageMetadata({
    locale: "sr",
    path: `/projects/${project.slug}`,
    title: project.developer ? `${project.name} — ${project.developer}` : project.name,
    description: project.summary,
    image: shareImagePath(project.slug),
  });
}

export default async function SerbianProjectPage({ params }: PageProps<"/sr/projects/[slug]">) {
  const { slug } = await params;
  const project = getLocalizedProjectBySlug(slug, "sr");
  if (!project) notFound();

  const homeUrl = absoluteUrl(localizedPath("sr", "/"));
  const faqs = projectFaqs(project, "sr");

  return (
    <>
      <JsonLd data={projectJsonLd(project, "sr")} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: t.nav.home, url: homeUrl },
          { name: t.nav.projects, url: `${homeUrl}#projects` },
          { name: project.name, url: absoluteUrl(localizedPath("sr", `/projects/${project.slug}`)) },
        ])}
      />
      <JsonLd data={faqJsonLd(faqs)} />
      {/* Hero */}
      <section className="relative flex min-h-[70vh] items-end overflow-hidden bg-[var(--color-ink)]">
        <Image
          src={project.heroImage}
          alt={project.name}
          fill
          priority
          className="object-cover opacity-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ink)] via-[var(--color-ink)]/30 to-transparent" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-16 pt-40 md:px-10">
          {project.developer && (
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-gold)]">
              {t.project.by} {project.developer}
            </p>
          )}
          <h1 className="font-display mt-4 text-4xl text-white md:text-6xl">{project.name}</h1>
          <p className="mt-4 max-w-xl text-base text-white/80 md:text-lg">{project.tagline}</p>
        </div>
      </section>

      {/* Quick facts */}
      <section className="border-b border-[var(--color-sand-line)] bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-10 md:grid-cols-4 md:px-10">
          <Fact label={t.project.startingFrom} value={project.startingPrice} />
          <Fact
            label={t.project.apartmentTypesLabel}
            value={project.apartmentTypes.map((type) => type.label).join(" · ")}
          />
          <Fact label={t.project.community} value={project.community} />
          <Fact label={t.project.handover} value={project.handover || t.project.onRequest} />
        </div>
        {project.startingPriceNote && (
          <p className="mx-auto max-w-7xl px-6 pb-8 text-xs text-[var(--color-text-muted)] md:px-10">
            {project.startingPriceNote}
          </p>
        )}
      </section>

      {/* Gallery — full-width so photos have room to breathe */}
      <section className="border-b border-[var(--color-sand-line)] bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <h2 className="font-display text-2xl text-[var(--color-text)] md:text-3xl">
            {t.project.gallery}
          </h2>
          <div className="rule-gold mt-4 mb-6" />
          <Gallery images={project.gallery} locale="sr" />
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24">
        <div className="grid gap-16 lg:grid-cols-3">
          {/* Main column */}
          <div className="space-y-16 lg:col-span-2">
            {/* Description */}
            <div>
              <h2 className="font-display text-2xl text-[var(--color-text)] md:text-3xl">
                {t.project.about} {project.name}
              </h2>
              <div className="rule-gold mt-4 mb-6" />
              <div className="space-y-4 text-[15px] leading-relaxed text-[var(--color-text-muted)]">
                {project.description.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </div>

            {/* Apartment types */}
            <div>
              <h2 className="font-display text-2xl text-[var(--color-text)] md:text-3xl">
                {t.project.apartmentTypesLabel}
              </h2>
              <div className="rule-gold mt-4 mb-6" />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {project.apartmentTypes.map((type) => (
                  <div
                    key={type.label}
                    className="rounded-lg border border-[var(--color-sand-line)] bg-white p-5"
                  >
                    <div className="font-display text-lg text-[var(--color-text)]">
                      {type.label}
                    </div>
                    {type.sizeRange && (
                      <div className="mt-1 text-sm text-[var(--color-text-muted)]">
                        {type.sizeRange}
                      </div>
                    )}
                    {type.priceFrom && (
                      <div className="mt-2 text-sm font-medium text-[var(--color-gold-deep)]">
                        {t.project.from} {type.priceFrom}
                      </div>
                    )}
                    {type.units && (
                      <div className="mt-1 text-xs text-[var(--color-text-muted)]">
                        {type.units}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {project.totalUnits && (
                <p className="mt-3 text-xs text-[var(--color-text-muted)]">{project.totalUnits}</p>
              )}
            </div>

            {/* Payment plan */}
            {project.paymentPlan && (
              <div>
                <h2 className="font-display text-2xl text-[var(--color-text)] md:text-3xl">
                  {t.project.paymentPlan}
                </h2>
                <div className="rule-gold mt-4 mb-6" />
                <div className="overflow-hidden rounded-lg border border-[var(--color-sand-line)]">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-white text-start text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
                        <th className="px-4 py-3 text-start">{t.project.milestone}</th>
                        <th className="px-4 py-3 text-start">{t.project.percentage}</th>
                        <th className="px-4 py-3 text-start">{t.project.timing}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {project.paymentPlan.map((milestone, i) => (
                        <tr
                          key={milestone.label}
                          className={`border-t border-[var(--color-sand-line)] ${i % 2 === 1 ? "bg-white" : "bg-[var(--color-sand)]"}`}
                        >
                          <td className="px-4 py-3">{milestone.label}</td>
                          <td className="px-4 py-3 font-medium text-[var(--color-gold-deep)]">
                            {milestone.percentage}
                          </td>
                          <td className="px-4 py-3 text-[var(--color-text-muted)]">{milestone.timing}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Amenities */}
            <div>
              <h2 className="font-display text-2xl text-[var(--color-text)] md:text-3xl">
                {t.project.amenities}
              </h2>
              <div className="rule-gold mt-4 mb-6" />
              <ul className="grid gap-3 sm:grid-cols-2">
                {project.amenities.map((a) => (
                  <li key={a} className="flex items-start gap-2.5 text-sm text-[var(--color-text)]">
                    <Check size={16} className="mt-0.5 shrink-0 text-[var(--color-gold-deep)]" />
                    {a}
                  </li>
                ))}
              </ul>
            </div>

            {/* Location */}
            <div>
              <h2 className="font-display text-2xl text-[var(--color-text)] md:text-3xl">
                {t.project.location}
              </h2>
              <div className="rule-gold mt-4 mb-6" />
              <MapEmbed location={project.location} locale="sr" />
            </div>

            {/* FAQ */}
            <ProjectFaq heading={t.faq.heading} items={faqs} />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div id="documents" className="scroll-mt-24 rounded-xl border border-[var(--color-sand-line)] bg-white p-6">
                <h3 className="font-display text-lg text-[var(--color-text)]">
                  {t.project.documentsTitle}
                </h3>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  {t.project.documentsBody}
                </p>
                <div className="mt-5 space-y-3">
                  {project.documents.map((doc) => (
                    <DownloadGate
                      key={doc.id}
                      projectSlug={project.slug}
                      projectName={project.name}
                      document={doc}
                      locale="sr"
                    />
                  ))}
                </div>
              </div>

              <a
                href={whatsappLink(t.project.whatsappMessage(project.name))}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] py-4 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                {t.project.whatsappCta}
              </a>
            </div>
          </div>
        </div>
      </div>
      <MobileCtaBar
        documentsLabel={t.project.documentsTitle}
        whatsappLabel={t.contact.whatsapp}
        whatsappHref={whatsappLink(t.project.whatsappMessage(project.name))}
      />
    </>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  const sizeClass =
    value.length > 100
      ? "text-xs md:text-sm leading-snug"
      : value.length > 60
        ? "text-sm md:text-base leading-snug"
        : value.length > 30
          ? "text-base md:text-lg leading-snug"
          : "text-lg md:text-xl";

  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
        {label}
      </div>
      <div className={`font-display mt-1 text-[var(--color-text)] ${sizeClass}`}>
        {value}
      </div>
    </div>
  );
}
