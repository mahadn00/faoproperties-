"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE_NAME } from "@/lib/constants";
import { dictionary, LOCALES, LOCALE_PREFIX, LOCALE_LABEL, type Locale } from "@/lib/i18n/dictionary";

export default function Header({ locale = "en" as Locale }: { locale?: Locale }) {
  const pathname = usePathname();
  const t = dictionary[locale];
  const home = LOCALE_PREFIX[locale] || "/";

  // Strips whichever locale prefix is currently active off the pathname, so
  // switching locales can re-prefix the same page with the new one.
  const unprefixedPath = (() => {
    const prefix = LOCALE_PREFIX[locale];
    if (!prefix) return pathname; // already unprefixed (en)
    return pathname === prefix ? "" : pathname.slice(prefix.length);
  })();

  const hrefForLocale = (target: Locale) => {
    const targetPrefix = LOCALE_PREFIX[target];
    return `${targetPrefix}${unprefixedPath}` || "/";
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-30">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 md:h-24 md:px-10">
        <Link href={home} className="font-display text-xl tracking-wide text-white md:text-2xl">
          {SITE_NAME}
        </Link>
        <nav className="hidden items-center gap-8 text-sm tracking-wide uppercase text-white/85 md:flex">
          <Link href={home} className="transition-colors hover:text-[var(--color-gold)]">
            {t.nav.home}
          </Link>
          <Link href={`${home}#projects`} className="transition-colors hover:text-[var(--color-gold)]">
            {t.nav.projects}
          </Link>
          <Link href={`${home}#contact`} className="transition-colors hover:text-[var(--color-gold)]">
            {t.nav.enquire}
          </Link>
          <div className="flex items-center gap-1 border-s border-white/20 ps-4">
            {LOCALES.map((l) => (
              <Link
                key={l}
                href={hrefForLocale(l)}
                className={`rounded-full px-2.5 py-1 text-xs tracking-widest transition-colors ${
                  l === locale
                    ? "bg-[var(--color-gold)] text-[var(--color-ink)]"
                    : "text-white/70 hover:text-[var(--color-gold)]"
                }`}
              >
                {LOCALE_LABEL[l]}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
