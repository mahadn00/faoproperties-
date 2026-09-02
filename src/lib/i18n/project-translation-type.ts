// Shared shape for a per-locale translation overlay on a Project (see
// projects.sr.ts / projects.tr.ts / projects.ar.ts / projects.fa.ts).
// Only translatable prose lives here — numbers, currency, coordinates, image
// paths, document ids/filenames and slugs stay identical to projects.ts and
// are merged in by localize.ts. Array fields (apartmentTypes, amenities,
// paymentPlan) must stay the same length/order as their English counterparts
// so they merge by index; documents merge by id instead.
export type ProjectTranslation = {
  tagline?: string;
  summary?: string;
  description?: string[];
  community?: string;
  startingPrice?: string;
  startingPriceNote?: string;
  totalUnits?: string;
  handover?: string;
  apartmentTypes?: Array<{ label?: string; sizeRange?: string }>;
  amenities?: string[];
  paymentPlan?: Array<{ label?: string; timing?: string }>;
  location?: { label?: string };
  documents?: Array<{ id: string; label?: string; description?: string }>;
};
