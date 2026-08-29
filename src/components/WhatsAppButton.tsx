"use client";

import { whatsappLink } from "@/lib/constants";

export default function WhatsAppButton({
  message,
  ariaLabel = "Chat with us on WhatsApp",
}: {
  message?: string;
  ariaLabel?: string;
}) {
  return (
    <a
      href={whatsappLink(message)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg shadow-black/20 transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-gold)]"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 32 32"
        className="h-7 w-7 fill-white"
      >
        <path d="M16.004 3C9.376 3 4 8.373 4 15c0 2.362.694 4.566 1.89 6.415L4 29l7.78-1.84A11.94 11.94 0 0 0 16.004 27C22.63 27 28 21.627 28 15S22.63 3 16.004 3Zm0 21.6c-1.96 0-3.79-.55-5.35-1.5l-.384-.23-4.62 1.093 1.12-4.51-.25-.394A9.55 9.55 0 0 1 5.4 15c0-5.85 4.76-10.6 10.604-10.6S26.6 9.15 26.6 15 21.85 24.6 16.004 24.6Zm5.83-7.94c-.318-.16-1.88-.93-2.172-1.036-.29-.107-.503-.16-.714.16-.212.318-.82 1.036-1.005 1.248-.185.212-.37.238-.688.08-.318-.16-1.343-.495-2.558-1.578-.945-.843-1.584-1.885-1.77-2.203-.185-.318-.02-.49.14-.65.144-.144.318-.37.478-.556.16-.185.212-.318.318-.53.106-.212.053-.397-.027-.556-.08-.16-.714-1.72-.978-2.356-.257-.617-.518-.534-.714-.544l-.608-.011c-.212 0-.556.08-.847.397-.29.318-1.11 1.085-1.11 2.646 0 1.56 1.137 3.068 1.296 3.28.16.212 2.238 3.42 5.424 4.796.758.327 1.35.522 1.812.668.762.242 1.454.208 2.002.126.61-.091 1.88-.769 2.146-1.512.265-.742.265-1.378.186-1.512-.08-.133-.29-.212-.608-.371Z" />
      </svg>
    </a>
  );
}
