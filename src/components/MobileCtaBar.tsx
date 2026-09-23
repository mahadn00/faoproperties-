import { FileText, MessageCircle } from "lucide-react";

/**
 * Phone-only bar pinned to the bottom of project pages. On mobile the
 * documents box (the main conversion point) otherwise sits below the gallery,
 * description, amenities, map and FAQ — several screens down. The
 * `data-mobile-cta` attribute lets globals.css pad the footer so the bar
 * never covers it, and WhatsAppButton hides its floating bubble here.
 */
export default function MobileCtaBar({
  documentsLabel,
  whatsappLabel,
  whatsappHref,
}: {
  documentsLabel: string;
  whatsappLabel: string;
  whatsappHref: string;
}) {
  return (
    <div
      data-mobile-cta
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-sand-line)] bg-white/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur md:hidden"
    >
      <div className="mx-auto flex max-w-md gap-3">
        <a
          href="#documents"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-[var(--color-ink)] px-3 py-3 text-sm font-medium text-white"
        >
          <FileText size={16} aria-hidden="true" />
          {documentsLabel}
        </a>
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-[#25D366] px-3 py-3 text-sm font-medium text-[var(--color-ink)]"
        >
          <MessageCircle size={16} aria-hidden="true" />
          {whatsappLabel}
        </a>
      </div>
    </div>
  );
}
