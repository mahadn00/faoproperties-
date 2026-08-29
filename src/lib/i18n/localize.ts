import { projects, type Project } from "@/lib/projects";
import { projectTranslationsSr, type ProjectTranslationSr } from "./projects.sr";
import type { Locale } from "./dictionary";

// Merges a base (English) Project with its Serbian translation overlay.
// Any field left out of the overlay falls back to the English original, so a
// project added to projects.ts before it has a Serbian translation still
// renders correctly on the Serbian site instead of breaking.
function applyTranslation(project: Project, translation?: ProjectTranslationSr): Project {
  if (!translation) return project;

  return {
    ...project,
    tagline: translation.tagline ?? project.tagline,
    summary: translation.summary ?? project.summary,
    description: translation.description ?? project.description,
    community: translation.community ?? project.community,
    startingPrice: translation.startingPrice ?? project.startingPrice,
    startingPriceNote: translation.startingPriceNote ?? project.startingPriceNote,
    totalUnits: translation.totalUnits ?? project.totalUnits,
    handover: translation.handover ?? project.handover,
    apartmentTypes: project.apartmentTypes.map((type, i) => ({
      ...type,
      label: translation.apartmentTypes?.[i]?.label ?? type.label,
      sizeRange: translation.apartmentTypes?.[i]?.sizeRange ?? type.sizeRange,
    })),
    amenities: translation.amenities ?? project.amenities,
    paymentPlan: project.paymentPlan?.map((milestone, i) => ({
      ...milestone,
      label: translation.paymentPlan?.[i]?.label ?? milestone.label,
      timing: translation.paymentPlan?.[i]?.timing ?? milestone.timing,
    })),
    location: translation.location?.label
      ? { ...project.location, label: translation.location.label }
      : project.location,
    documents: project.documents.map((doc) => {
      const docTranslation = translation.documents?.find((d) => d.id === doc.id);
      return docTranslation
        ? {
            ...doc,
            label: docTranslation.label ?? doc.label,
            description: docTranslation.description ?? doc.description,
          }
        : doc;
    }),
  };
}

export function localizeProjects(locale: Locale): Project[] {
  if (locale === "en") return projects;
  return projects.map((p) => applyTranslation(p, projectTranslationsSr[p.slug]));
}

export function getLocalizedProjectBySlug(slug: string, locale: Locale): Project | undefined {
  const project = projects.find((p) => p.slug === slug);
  if (!project) return undefined;
  if (locale === "en") return project;
  return applyTranslation(project, projectTranslationsSr[project.slug]);
}
