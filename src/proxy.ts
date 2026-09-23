import { NextResponse, type NextRequest } from "next/server";
import { projects } from "@/lib/projects";
import { LOCALES } from "@/lib/i18n/dictionary";

// Answers unknown page URLs with the static 404 before routing. Without this,
// probes like /wp-login or /tr/projects/nope reach the [locale] route, which
// (with dynamicParams = false) does 404 correctly but also logs an
// "Internal: NoFallbackError" per request — bots would bury real errors.

const PREFIXED_LOCALES = new Set<string>(LOCALES.filter((l) => l !== "en"));
const SLUGS = new Set(projects.map((p) => p.slug));

/** The only public pages: each language's homepage and project pages. */
function isKnownPage(pathname: string): boolean {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length > 0 && PREFIXED_LOCALES.has(parts[0])) parts.shift();
  if (parts.length === 0) return true;
  return parts.length === 2 && parts[0] === "projects" && SLUGS.has(parts[1]);
}

export function proxy(request: NextRequest) {
  if (isKnownPage(request.nextUrl.pathname)) return NextResponse.next();
  return NextResponse.rewrite(new URL("/_not-found", request.url), { status: 404 });
}

export const config = {
  // Page URLs only: skips Next internals, API routes, the admin area and
  // anything with a file extension (gallery images, og/, sitemap.xml, llms.txt…).
  matcher: ["/((?!_next/|api/|admin/|.*\\.).*)"],
};
