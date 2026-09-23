import type { Metadata } from "next";
import { Fraunces, Inter, Noto_Naskh_Arabic, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/constants";
import { SITE_URL, organizationJsonLd } from "@/lib/seo";
import JsonLd from "@/components/JsonLd";
import Analytics from "@/components/Analytics";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  // latin-ext covers Turkish's ç/ğ/ı/ö/ş/ü so the Turkish site doesn't fall
  // back to a system font for those glyphs.
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

// Arabic-script fonts (cover both Arabic and Persian's extended letters) —
// only loaded for the /ar and /fa route trees, but declared globally
// because only the root layout can register next/font variables.
const notoNaskhArabic = Noto_Naskh_Arabic({
  variable: "--font-arabic-display",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-arabic-body",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

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
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
    : {}),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${fraunces.variable} ${inter.variable} ${notoNaskhArabic.variable} ${notoSansArabic.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--color-sand)]">
        <JsonLd data={organizationJsonLd()} />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
