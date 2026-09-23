import { startingPriceAed, type Project } from "./projects";

/**
 * Just what a homepage card and the search filter need. The homepage passes
 * these to a client component, so everything here is serialized into the
 * page — the full Project (descriptions, galleries, payment plans, FAQs…)
 * stays on the server.
 */
export type ProjectCardData = Pick<
  Project,
  "slug" | "name" | "tagline" | "summary" | "areaTag" | "heroImage" | "startingPrice"
> & {
  apartmentTypes: { label: string; priceFrom?: string }[];
  /** Numeric, from the English data — see startingPriceAed(). */
  startingPriceAed: number | null;
};

export function toProjectCard(project: Project): ProjectCardData {
  return {
    slug: project.slug,
    name: project.name,
    tagline: project.tagline,
    summary: project.summary,
    areaTag: project.areaTag,
    heroImage: project.heroImage,
    startingPrice: project.startingPrice,
    apartmentTypes: project.apartmentTypes.map(({ label, priceFrom }) => (priceFrom ? { label, priceFrom } : { label })),
    startingPriceAed: startingPriceAed(project.slug),
  };
}
