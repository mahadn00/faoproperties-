import Link from "next/link";
import { locale as rootLocale } from "next/root-params";
import { dictionary, isLocale } from "@/lib/i18n/dictionary";
import { localizedPath } from "@/lib/i18n/paths";

// Shown for unknown project slugs (e.g. /tr/projects/nope), inside the site's
// header and footer, in the visitor's language.
export default async function NotFound() {
  const value = await rootLocale();
  const locale = value && isLocale(value) ? value : "en";
  const t = dictionary[locale].notFound;

  return (
    <section className="flex min-h-[70vh] items-end bg-[var(--color-ink)]">
      <div className="mx-auto w-full max-w-7xl px-6 pb-20 pt-40 md:px-10">
        <p className="font-display text-6xl text-[var(--color-gold)] md:text-7xl">404</p>
        <h1 className="font-display mt-4 text-3xl text-white md:text-5xl">{t.title}</h1>
        <p className="mt-4 max-w-xl text-base text-white/75">{t.body}</p>
        <Link
          href={`${localizedPath(locale, "/")}#projects`}
          className="mt-10 inline-flex rounded-full bg-[var(--color-gold)] px-7 py-3.5 text-sm font-medium text-[var(--color-ink)] transition-opacity hover:opacity-90"
        >
          {t.cta}
        </Link>
      </div>
    </section>
  );
}
