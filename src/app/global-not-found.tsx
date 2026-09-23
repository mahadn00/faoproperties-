import type { Metadata } from "next";
import "./globals.css";
import { fontVariables } from "./fonts";
import { SITE_NAME } from "@/lib/constants";
import { LOCALES, LOCALE_NATIVE_NAME } from "@/lib/i18n/dictionary";
import { localizedPath } from "@/lib/i18n/paths";

// For URLs that match no route at all (e.g. /xx or /admin). There's no single
// root layout to render inside — the site has one per language plus admin —
// so this page brings its own <html>, styles and fonts, and offers every
// language's homepage rather than guessing one.
export const metadata: Metadata = {
  title: `Page not found | ${SITE_NAME}`,
  robots: { index: false },
};

export default function GlobalNotFound() {
  return (
    <html lang="en" className={`${fontVariables} h-full antialiased`}>
      <body className="flex min-h-full items-center bg-[var(--color-ink)] text-white">
        <main className="mx-auto w-full max-w-3xl px-6 py-24">
          <p className="font-display text-7xl text-[var(--color-gold)]">404</p>
          <h1 className="font-display mt-4 text-4xl">Page not found</h1>
          <p className="mt-4 text-white/75">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
          <nav className="mt-10 flex flex-wrap gap-3" aria-label="Homepages">
            {LOCALES.map((l) => (
              <a
                key={l}
                href={localizedPath(l, "/")}
                lang={l}
                hrefLang={l}
                className="rounded-full border border-white/25 px-5 py-2.5 text-sm transition-colors hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
              >
                {LOCALE_NATIVE_NAME[l]}
              </a>
            ))}
          </nav>
        </main>
      </body>
    </html>
  );
}
