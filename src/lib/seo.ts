import type { Metadata } from "next";
import { LOCALES, dictionary, type Locale } from "./i18n/dictionary";
import { localizedPath } from "./i18n/paths";
import { SITE_NAME, CONTACT_EMAIL, WHATSAPP_NUMBER } from "./constants";
import { startingPriceAed, type Project } from "./projects";

// Falls back to a placeholder so local/staging builds don't crash, but every
// production deploy must set this so canonical URLs, the sitemap and OG tags
// point at the real domain.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://faoproperties.com").replace(/\/+$/, "");

export const OG_LOCALE: Record<Locale, string> = {
  en: "en_US",
  sr: "sr_RS",
  tr: "tr_TR",
  ar: "ar_AE",
  fa: "fa_IR",
};

const BUSINESS_ADDRESS = {
  "@type": "PostalAddress",
  streetAddress: "i Rise Tower, TECOM",
  addressLocality: "Dubai",
  addressCountry: "AE",
} as const;

export { localizedPath };

/**
 * The 1200×630 share image (Open Graph / WhatsApp / X link previews) for a
 * project slug, or "home" for the homepage. These are generated from each
 * project's heroImage by scripts/generate-og-images.mjs, which runs before
 * every `npm run build` — the raw heroes are 1–2 MB, too heavy for WhatsApp
 * previews and not actually 1200×630 as declared below.
 */
export function shareImagePath(slug: string): string {
  return `/og/${slug}.jpg`;
}

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** `alternates.languages` entries for every locale variant of a path, plus x-default -> en. */
export function languageAlternates(path: string): Record<string, string> {
  const entries: Record<string, string> = {};
  for (const locale of LOCALES) {
    entries[locale] = absoluteUrl(localizedPath(locale, path));
  }
  entries["x-default"] = absoluteUrl(localizedPath("en", path));
  return entries;
}

export function buildPageMetadata({
  locale,
  path,
  title,
  description,
  image,
}: {
  locale: Locale;
  path: string;
  title: string;
  description: string;
  image?: string;
}): Metadata {
  const url = absoluteUrl(localizedPath(locale, path));
  const ogImage = absoluteUrl(image || shareImagePath("home"));

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: languageAlternates(path),
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: OG_LOCALE[locale],
      type: "website",
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: SITE_NAME,
    url: SITE_URL,
    email: CONTACT_EMAIL,
    telephone: `+${WHATSAPP_NUMBER}`,
    address: BUSINESS_ADDRESS,
    areaServed: { "@type": "City", name: "Dubai" },
  };
}

export function projectJsonLd(project: Project, locale: Locale) {
  const url = absoluteUrl(localizedPath(locale, `/projects/${project.slug}`));
  const price = startingPriceAed(project.slug);
  const images = [project.heroImage, ...project.gallery.slice(0, 4).map((g) => g.src)].map(absoluteUrl);

  const json: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "ApartmentComplex",
    name: project.name,
    description: project.summary,
    url,
    image: images,
    address: {
      "@type": "PostalAddress",
      addressLocality: project.community,
      addressCountry: "AE",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: project.location.embedLat,
      longitude: project.location.embedLng,
    },
  };

  if (project.developer) {
    json.developer = { "@type": "Organization", name: project.developer };
  }

  if (price !== null) {
    json.offers = {
      "@type": "Offer",
      priceCurrency: "AED",
      price,
      availability: "https://schema.org/PreOrder",
      url,
    };
  }

  return json;
}

export type FaqItem = { question: string; answer: string };

/**
 * Builds a small set of Q&A pairs from data already on the project — the
 * facts AI answer engines (and Google's AI Overviews) most often need to
 * quote directly: price, location, unit types, developer, handover, payment
 * plan. Fields the project doesn't have (e.g. no confirmed handover date)
 * are simply skipped rather than guessed.
 */
export function projectFaqs(project: Project, locale: Locale): FaqItem[] {
  const f = dictionary[locale].faq;
  const items: FaqItem[] = [];

  items.push({
    question: f.priceQ(project.name),
    answer: f.priceA(project.name, project.startingPrice),
  });

  items.push({
    question: f.locationQ(project.name),
    answer: f.locationA(project.name, project.community),
  });

  if (project.apartmentTypes.length > 0) {
    const types = project.apartmentTypes.map((t) => t.label).join(", ");
    items.push({ question: f.typesQ(project.name), answer: f.typesA(project.name, types) });
  }

  if (project.developer) {
    items.push({
      question: f.developerQ(project.name),
      answer: f.developerA(project.name, project.developer),
    });
  }

  if (project.handover) {
    items.push({
      question: f.handoverQ(project.name),
      answer: f.handoverA(project.name, project.handover),
    });
  }

  if (project.paymentPlan && project.paymentPlan.length >= 2) {
    const down = project.paymentPlan[0].percentage;
    const final = project.paymentPlan[project.paymentPlan.length - 1].percentage;
    items.push({
      question: f.paymentPlanQ(project.name),
      answer: f.paymentPlanA(project.name, down, final),
    });
  }

  return items;
}

export function faqJsonLd(faqs: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
