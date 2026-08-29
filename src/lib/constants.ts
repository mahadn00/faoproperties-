export const SITE_NAME = "FAO Properties";
export const SITE_TAGLINE = "Luxury Off-Plan Residences, Dubai";
export const SITE_DESCRIPTION =
  "Curated luxury off-plan residences in Dubai — explore Eltiera Views, Sky Level 1 and Terra Woods, and enquire directly with FAO Properties.";

export const CONTACT_EMAIL = "fao@faoproperties.com";

// WhatsApp number 00971585281027 in international wa.me format (digits only, no leading zeros)
export const WHATSAPP_NUMBER = "971585281027";
export const WHATSAPP_DISPLAY = "+971 58 528 1027";

export function whatsappLink(message?: string) {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
