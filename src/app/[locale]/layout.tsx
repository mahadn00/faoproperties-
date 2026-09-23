import type { Metadata } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import { fontVariables } from "../fonts";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/constants";
import { dictionary, isLocale, isRtlLocale, LOCALES } from "@/lib/i18n/dictionary";
import { SITE_URL, organizationJsonLd } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import Analytics from "@/components/Analytics";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

// Root layout for the public site, one static tree per language. English is
// served without a prefix ("/", "/projects/…") via rewrites in next.config.ts;
// the other languages live at /sr, /tr, /ar and /fa.
//
// dynamicParams = false (inherited by the project pages): only the prerendered
// languages × projects exist, and any other URL gets app/global-not-found.tsx
// without rendering anything. Allowing on-demand renders instead would write
// a cache entry to disk for every random URL a bot probes.
export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    siteName: SITE_NAME,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
    : {}),
};

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = dictionary[locale];

  // lang/dir are rendered on the server, so Arabic and Persian arrive
  // right-to-left (and are announced as such to search engines and screen
  // readers) instead of being flipped by script after load.
  return (
    <html lang={locale} dir={isRtlLocale(locale) ? "rtl" : "ltr"} className={`${fontVariables} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[var(--color-sand)]">
        <JsonLd data={organizationJsonLd()} />
        <Header locale={locale} />
        <main className="flex-1">{children}</main>
        <Footer locale={locale} />
        <WhatsAppButton message={t.whatsapp.defaultMessage} ariaLabel={t.whatsapp.ariaLabel} />
        <Analytics />
      </body>
    </html>
  );
}
