"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE_NAME } from "@/lib/constants";
import { dictionary, type Locale } from "@/lib/i18n/dictionary";

export default function Header({ locale = "en" as Locale }: { locale?: Locale }) {
  const pathname = usePathname();
  const t = dictionary[locale];
  const home = locale === "sr" ? "/sr" : "/";

  const altHref =
    locale === "sr"
      ? pathname === "/sr"
        ? "/"
        : (pathname.replace(/^\/sr/, "") || "/")
      : pathname === "/"
        ? "/sr"
        : `/sr${pathname}`;

  return (
    <header className="absolute top-0 left-0 right-0 z-30">
      <div className="mx-auto max-w-7xl px-6 md:px-10 flex items-center justify-between h-20 md:h-24">
        <Link
          href={home}
          className="font-display text-xl md:text-2xl tracking-wide text-white"
        >
          {SITE_NAME}
        </Link>
        <nav className="hidden md:flex items-center gap-10 text-sm tracking-wide uppercase text-white/85">
          <Link href={home} className="hover:text-[var(--color-gold)] transition-colors">
            {t.nav.home}
          </Link>
          <Link href={`${home}#projects`} className="hover:text-[var(--color-gold)] transition-colors">
            {t.nav.projects}
          </Link>
          <Link href={`${home}#contact`} className="hover:text-[var(--color-gold)] transition-colors">
            {t.nav.enquire}
          </Link>
          <Link
            href={altHref}
            className="rounded-full border border-white/30 px-3 py-1 text-xs tracking-widest hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-colors"
          >
            {t.langSwitchLabel}
          </Link>
        </nav>
      </div>
    </header>
  );
}
