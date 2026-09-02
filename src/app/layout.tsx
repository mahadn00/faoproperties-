import type { Metadata } from "next";
import { Fraunces, Inter, Noto_Naskh_Arabic, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/constants";

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
  title: `${SITE_NAME} | ${SITE_TAGLINE}`,
  description: SITE_DESCRIPTION,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${fraunces.variable} ${inter.variable} ${notoNaskhArabic.variable} ${notoSansArabic.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--color-sand)]">
        {children}
      </body>
    </html>
  );
}
