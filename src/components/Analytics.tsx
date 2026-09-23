"use client";

import { useEffect } from "react";
import Script from "next/script";
import { track } from "@/lib/analytics";

// GA4 measurement ID, inlined at build time. Unset → nothing loads at all.
// Validated so a malformed env value can't break out of the inline script.
const GA_ID = /^G-[A-Z0-9]+$/.test(process.env.NEXT_PUBLIC_GA_ID ?? "") ? process.env.NEXT_PUBLIC_GA_ID : undefined;

/**
 * Loads GA4 and reports the contact actions the sales team cares about. Lead
 * form submissions are tracked in LeadForm ("generate_lead"); WhatsApp and
 * email link clicks are caught here with one delegated listener, because most
 * of those links live in server components that can't take onClick.
 */
export default function Analytics() {
  useEffect(() => {
    if (!GA_ID) return;
    const onClick = (e: MouseEvent) => {
      const link = e.target instanceof Element ? e.target.closest("a[href]") : null;
      const href = link?.getAttribute("href") ?? "";
      if (href.startsWith("https://wa.me/")) track("whatsapp_click", { page_path: window.location.pathname });
      else if (href.startsWith("mailto:")) track("email_click", { page_path: window.location.pathname });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  if (!GA_ID) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
      </Script>
    </>
  );
}
