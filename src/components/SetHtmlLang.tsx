"use client";

import { useEffect } from "react";

// The root layout owns the single <html> tag and always renders lang="en".
// This tiny client component corrects it on the Serbian route tree so screen
// readers and browser translate features get the right language signal,
// without needing a second root layout (which Next.js doesn't allow).
export default function SetHtmlLang({ lang }: { lang: string }) {
  useEffect(() => {
    const previous = document.documentElement.lang;
    document.documentElement.lang = lang;
    return () => {
      document.documentElement.lang = previous;
    };
  }, [lang]);

  return null;
}
