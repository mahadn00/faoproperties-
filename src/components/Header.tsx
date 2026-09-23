"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { SITE_NAME } from "@/lib/constants";
import {
  dictionary,
  LOCALES,
  LOCALE_PREFIX,
  LOCALE_LABEL,
  LOCALE_NATIVE_NAME,
  type Locale,
} from "@/lib/i18n/dictionary";
import { localizedPath, stripLocalePrefix } from "@/lib/i18n/paths";

export default function Header({ locale = "en" as Locale }: { locale?: Locale }) {
  const pathname = usePathname();
  const t = dictionary[locale];
  const home = LOCALE_PREFIX[locale] || "/";
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // The same page in another language: strip the current prefix, add the target's.
  const unprefixedPath = stripLocalePrefix(pathname);
  const hrefForLocale = (target: Locale) => localizedPath(target, unprefixedPath);

  const navLinks = [
    { href: home, label: t.nav.home },
    { href: `${home}#projects`, label: t.nav.projects },
    { href: `${home}#contact`, label: t.nav.enquire },
  ];

  const closeMenu = () => setMenuOpen(false);

  // While the mobile menu is open: lock page scroll, close on Escape or when
  // the viewport grows past the breakpoint (the sheet is md:hidden), and move
  // focus into the sheet — then hand it back to the menu button on close.
  useEffect(() => {
    if (!menuOpen) return;
    const menuButton = menuButtonRef.current;
    closeButtonRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    const desktop = window.matchMedia("(min-width: 768px)");
    const onResize = () => {
      if (desktop.matches) setMenuOpen(false);
    };

    document.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onResize);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onResize);
      document.body.style.overflow = prevOverflow;
      menuButton?.focus();
    };
  }, [menuOpen]);

  return (
    // Raised above the floating WhatsApp button (z-50) while the menu sheet is
    // open — the sheet lives inside this stacking context.
    <header className={`absolute top-0 left-0 right-0 ${menuOpen ? "z-[80]" : "z-30"}`}>
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 md:h-24 md:px-10">
        <Link href={home} className="font-display text-xl tracking-wide text-white md:text-2xl">
          {SITE_NAME}
        </Link>
        <nav className="hidden items-center gap-8 text-sm tracking-wide uppercase text-white/85 md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-[var(--color-gold)]">
              {link.label}
            </Link>
          ))}
          <div className="flex items-center gap-1 border-s border-white/20 ps-4">
            {LOCALES.map((l) => (
              <Link
                key={l}
                href={hrefForLocale(l)}
                hrefLang={l}
                aria-current={l === locale ? "true" : undefined}
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
        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label={t.nav.openMenu}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          className="-me-2 rounded-full p-2 text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-gold)] md:hidden"
        >
          <Menu size={26} />
        </button>
      </div>

      {menuOpen && (
        <div
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label={t.nav.menu}
          className="fixed inset-0 flex flex-col overflow-y-auto bg-[var(--color-ink)] px-6 pb-10 md:hidden"
        >
          <div className="flex h-20 shrink-0 items-center justify-between">
            <Link href={home} onClick={closeMenu} className="font-display text-xl tracking-wide text-white">
              {SITE_NAME}
            </Link>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={closeMenu}
              aria-label={t.nav.closeMenu}
              className="-me-2 rounded-full p-2 text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-gold)]"
            >
              <X size={26} />
            </button>
          </div>

          <nav className="mt-4 flex flex-col">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className="font-display border-b border-[var(--color-navy-line)] py-5 text-3xl text-white transition-colors hover:text-[var(--color-gold)]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mt-auto pt-10">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-text-on-dark-muted)]">
              {t.nav.language}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {LOCALES.map((l) => (
                <Link
                  key={l}
                  href={hrefForLocale(l)}
                  hrefLang={l}
                  lang={l}
                  onClick={closeMenu}
                  aria-current={l === locale ? "true" : undefined}
                  className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                    l === locale
                      ? "border-[var(--color-gold)] bg-[var(--color-gold)] text-[var(--color-ink)]"
                      : "border-white/25 text-white/85 hover:border-white/60"
                  }`}
                >
                  {LOCALE_NATIVE_NAME[l]}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
