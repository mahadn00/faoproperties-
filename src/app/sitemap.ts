import type { MetadataRoute } from "next";
import { LOCALES } from "@/lib/i18n/dictionary";
import { projects } from "@/lib/projects";
import { absoluteUrl, localizedPath, languageAlternates } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    entries.push({
      url: absoluteUrl(localizedPath(locale, "/")),
      changeFrequency: "weekly",
      priority: 1,
      alternates: { languages: languageAlternates("/") },
    });

    entries.push({
      url: absoluteUrl(localizedPath(locale, "/privacy")),
      changeFrequency: "yearly",
      priority: 0.2,
      alternates: { languages: languageAlternates("/privacy") },
    });

    for (const project of projects) {
      const path = `/projects/${project.slug}`;
      entries.push({
        url: absoluteUrl(localizedPath(locale, path)),
        changeFrequency: "weekly",
        priority: 0.8,
        alternates: { languages: languageAlternates(path) },
      });
    }
  }

  return entries;
}
