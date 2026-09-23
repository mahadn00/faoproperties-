import { LOCALE_PREFIX, type Locale } from "./dictionary";

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
