import { LOCALES, LOCALE_PREFIX, type Locale } from "./dictionary";

// Kept separate from seo.ts so client components (cards, header, footer) can
// build localized links without pulling the SEO helpers into the bundle.

/** Locale-agnostic path (e.g. "/" or "/projects/eltiera-views") -> that locale's route. */
export function localizedPath(locale: Locale, path: string): string {
  const prefix = LOCALE_PREFIX[locale];
  if (path === "/") return prefix || "/";
  return `${prefix}${path}`;
}

export function projectPath(locale: Locale, slug: string): string {
  return localizedPath(locale, `/projects/${slug}`);
}

/**
 * The locale-agnostic path of a pathname ("/tr/projects/x" -> "/projects/x").
 * Strips "/en" too: English pages are prerendered at /en/… and reached through
 * a rewrite, so the server renders with "/en/projects/x" while the browser
 * reports "/projects/x" — anything built from usePathname() must come out the
 * same for both, or hydration fails.
 */
export function stripLocalePrefix(pathname: string): string {
  for (const locale of LOCALES) {
    if (pathname === `/${locale}`) return "/";
    if (pathname.startsWith(`/${locale}/`)) return pathname.slice(locale.length + 1);
  }
  return pathname || "/";
}
