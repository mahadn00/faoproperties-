import Link from "next/link";
import { CONTACT_EMAIL, SITE_NAME, WHATSAPP_DISPLAY, whatsappLink } from "@/lib/constants";
import { projects } from "@/lib/projects";
import { dictionary, type Locale } from "@/lib/i18n/dictionary";

export default function Footer({ locale = "en" as Locale }: { locale?: Locale }) {
  const t = dictionary[locale];
  const projectHref = (slug: string) => (locale === "sr" ? `/sr/projects/${slug}` : `/projects/${slug}`);

  return (
    <footer className="bg-[var(--color-ink)] text-[var(--color-text-on-dark-muted)]">
      <div className="mx-auto max-w-7xl px-6 md:px-10 py-16 grid gap-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="font-display text-2xl text-white">{SITE_NAME}</div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed">
            {t.footer.blurb}
          </p>
        </div>

        <div>
          <div className="text-xs tracking-[0.2em] uppercase text-[var(--color-gold)] mb-4">
            {t.footer.projects}
          </div>
          <ul className="space-y-2 text-sm">
            {projects.map((p) => (
              <li key={p.slug}>
                <Link href={projectHref(p.slug)} className="hover:text-white transition-colors">
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="text-xs tracking-[0.2em] uppercase text-[var(--color-gold)] mb-4">
            {t.footer.contact}
          </div>
          <ul className="space-y-2 text-sm">
            <li>
              <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-white transition-colors">
                {CONTACT_EMAIL}
              </a>
            </li>
            <li>
              <a
                href={whatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                WhatsApp {WHATSAPP_DISPLAY}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[var(--color-navy-line)]">
        <div className="mx-auto max-w-7xl px-6 md:px-10 py-6 text-xs flex flex-col md:flex-row gap-2 justify-between">
          <span>{t.footer.rights(new Date().getFullYear(), SITE_NAME)}</span>
          <span>{t.footer.priceNote}</span>
        </div>
      </div>
    </footer>
  );
}
