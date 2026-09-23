import { Fraunces, Inter, Noto_Naskh_Arabic, Noto_Sans_Arabic } from "next/font/google";

// Shared by the two root layouts ([locale] and admin) and the global 404.
// Weights are trimmed to what the markup actually uses: display headings are
// only ever set in the regular weight, body text uses 400/500/700 (Inter is a
// variable font, so it's one file whatever the weights).

export const fraunces = Fraunces({
  variable: "--font-fraunces",
  // latin-ext covers Turkish's ç/ğ/ı/ö/ş/ü so the Turkish site doesn't fall
  // back to a system font for those glyphs.
  subsets: ["latin", "latin-ext"],
  weight: ["400"],
});

export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

// Arabic-script fonts (cover both Arabic and Persian's extended letters). Not
// preloaded: globals.css only switches to them under html[dir="rtl"], so the
// browser fetches them on /ar and /fa and never on the other languages.
export const notoNaskhArabic = Noto_Naskh_Arabic({
  variable: "--font-arabic-display",
  subsets: ["arabic"],
  weight: ["400"],
  preload: false,
});

export const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-arabic-body",
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
  preload: false,
});

export const fontVariables = `${fraunces.variable} ${inter.variable} ${notoNaskhArabic.variable} ${notoSansArabic.variable}`;
