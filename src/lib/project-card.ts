import { getProjectBySlug, startingPriceAed, type Project } from "./projects";

/**
 * Just what a homepage card, the search filters and the compare table need.
 * The homepage passes these to a client component, so everything here is
 * serialized into the page — the full Project (descriptions, galleries,
 * FAQs…) stays on the server.
 */
export type ProjectCardData = Pick<
  Project,
  "slug" | "name" | "tagline" | "areaTag" | "heroImage" | "developer" | "community" | "handover" | "totalUnits"
> & {
  apartmentTypes: { label: string; priceFrom?: string }[];
  // Numbers read from the English data, so they're comparable and look the
  // same in every language (the display strings above may be translated).
  startingPriceAed: number | null;
  handoverYear: number | null;
  downPaymentPct: number | null;
  finalPaymentPct: number | null;
};

// "20%", "20% + 4% DLD Fee" -> 20; "AED 100K – 500K (by unit type)" -> null
function leadingPercent(text: string | undefined): number | null {
  const match = text?.match(/^\s*(\d+(?:\.\d+)?)\s*%/);
  return match ? Number(match[1]) : null;
}

// "Q4 2028 (inferred from …)", "December 2028 (Towers 1 & 2); …" -> 2028
function firstYear(text: string | undefined): number | null {
  const match = text?.match(/\b(20\d{2})\b/);
  return match ? Number(match[1]) : null;
}

export function toProjectCard(project: Project): ProjectCardData {
  const base = getProjectBySlug(project.slug) ?? project;
  const plan = base.paymentPlan ?? [];
  return {
    slug: project.slug,
    name: project.name,
    tagline: project.tagline,
    areaTag: project.areaTag,
    heroImage: project.heroImage,
    developer: project.developer,
    community: project.community,
    handover: project.handover,
    totalUnits: project.totalUnits,
    apartmentTypes: project.apartmentTypes.map(({ label, priceFrom }) => (priceFrom ? { label, priceFrom } : { label })),
    startingPriceAed: startingPriceAed(project.slug),
    handoverYear: firstYear(base.handover),
    downPaymentPct: plan.length > 0 ? leadingPercent(plan[0].percentage) : null,
    finalPaymentPct: plan.length > 1 ? leadingPercent(plan[plan.length - 1].percentage) : null,
  };
}
