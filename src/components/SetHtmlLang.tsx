"use client";

import { useEffect } from "react";

// The root layout owns the single <html> tag and always renders
// lang="en" dir="ltr". This tiny client component corrects both on each
// non-English route tree so screen readers, browser translate features and
// (critically for Arabic/Persian) the whole page's text direction get the
// right signal — without needing a second root layout (Next.js doesn't
// allow more than one <html> per app).
export default function SetHtmlLang({ lang, dir = "ltr" }: { lang: string; dir?: "ltr" | "rtl" }) {
  useEffect(() => {
    const previousLang = document.documentElement.lang;
    const previousDir = document.documentElement.dir;
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    return () => {
      document.documentElement.lang = previousLang;
      document.documentElement.dir = previousDir;
    };
  }, [lang, dir]);

  return null;
}
