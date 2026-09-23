import { parseAedValue } from "./format";
import type { ProjectCardData } from "./project-card";

/** The fields search needs — a homepage card (ProjectCardData) has them. */
type SearchableProject = Pick<ProjectCardData, "apartmentTypes" | "startingPriceAed">;

export type PropertyType = "studio" | "1br" | "2br" | "3br" | "villa";

export const PROPERTY_TYPES: PropertyType[] = ["studio", "1br", "2br", "3br", "villa"];

// Buckets an apartment-type label into one of the five types the search
// filter offers. Works on the label in ANY of the site's languages (the
// search component is handed whichever locale's project list is on screen,
// and classification needs to give the same answer regardless) —
// larger/uncommon types (4BR+, duplexes, penthouses, presidential suites)
// intentionally have no bucket and are simply not reachable via this
// filter, per spec.
export function classifyApartmentType(label: string): PropertyType | null {
  const l = label.toLowerCase();

  // Villa / townhouse / beach mansion, across every locale's phrasing.
  if (
    l.includes("villa") ||
    l.includes("townhouse") ||
    l.includes("mansion") ||
    l.includes("vila") || // sr
    l.includes("kuća u nizu") || // sr townhouse
    l.includes("müstakil") || // tr villa/townhouse
    l.includes("فيلا") || // ar villa
    l.includes("منزل مستقل") || // ar townhouse
    l.includes("ویلا") // fa villa
  )
    return "villa";

  // Studio.
  if (
    l.includes("studio") ||
    l.includes("garsonjera") || // sr
    l.includes("stüdyo") || // tr
    l.includes("استوديو") || // ar
    l.includes("استودیو") // fa
  )
    return "studio";

  // Bedroom counts — every locale's label starts with the count, so a
  // prefix check is enough and avoids matching e.g. "2 Bedroom" inside a
  // "12 Bedroom" (not that we have one, but keeps the intent explicit).
  const oneBed = ["1 bedroom", "1 spavaća", "1 yatak", "غرفة نوم واحدة", "یک خوابه"];
  const twoBed = ["2 bedroom", "2 spavaće", "2 yatak", "غرفتا نوم", "دو خوابه"];
  const threeBed = ["3 bedroom", "3 spavaće", "3 yatak", "ثلاث غرف نوم", "سه خوابه"];

  if (oneBed.some((p) => l.startsWith(p))) return "1br";
  if (twoBed.some((p) => l.startsWith(p))) return "2br";
  if (threeBed.some((p) => l.startsWith(p))) return "3br";
  return null;
}

export type ProjectSearchInfo = {
  types: Set<PropertyType>;
  minPriceByType: Partial<Record<PropertyType, number>>;
};

// Always classifies off the base English project (see classifyApartmentType).
export function getProjectSearchInfo(project: Pick<SearchableProject, "apartmentTypes">): ProjectSearchInfo {
  const types = new Set<PropertyType>();
  const minPriceByType: Partial<Record<PropertyType, number>> = {};

  for (const type of project.apartmentTypes) {
    const bucket = classifyApartmentType(type.label);
    if (!bucket) continue;
    types.add(bucket);

    const price = type.priceFrom ? parseAedValue(type.priceFrom) : null;
    if (price !== null) {
      const current = minPriceByType[bucket];
      if (current === undefined || price < current) minPriceByType[bucket] = price;
    }
  }

  return { types, minPriceByType };
}

// `selectedTypes` empty = no type filter (matches every project). Budget is
// an open-ended [min, max] range — either side can be left null.
export function projectMatchesSearch(
  project: SearchableProject,
  selectedTypes: ReadonlySet<PropertyType>,
  minBudget: number | null,
  maxBudget: number | null
): boolean {
  const info = getProjectSearchInfo(project);

  const relevantTypes =
    selectedTypes.size > 0 ? [...info.types].filter((t) => selectedTypes.has(t)) : [...info.types];

  // Types were requested but this project has none of them.
  if (selectedTypes.size > 0 && relevantTypes.length === 0) return false;

  if (minBudget === null && maxBudget === null) return true;

  const min = minBudget ?? -Infinity;
  const max = maxBudget ?? Infinity;

  const candidatePrices = relevantTypes
    .map((t) => info.minPriceByType[t])
    .filter((p): p is number => p !== undefined);

  if (candidatePrices.length > 0) return candidatePrices.some((p) => p >= min && p <= max);

  // No per-type price among the relevant types — fall back to the project's
  // overall starting price rather than excluding it outright. It's the numeric
  // startingPriceAed because the display `startingPrice` may be translated
  // text like "601,000 درهم" that parseAedValue can't read.
  const overall = project.startingPriceAed;
  return overall !== null && overall >= min && overall <= max;
}
