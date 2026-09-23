import type { Locale } from "./i18n/dictionary";

export type DialCountry = { region: string; dial: string; name: string };

// Country codes offered next to the phone field — where the agency's buyers
// mostly come from, Gulf first. `name` is the English fallback; the form
// swaps in each country's name in the visitor's language once it's running
// in the browser. Anyone else can type a full number starting with "+".
export const DIAL_COUNTRIES: DialCountry[] = [
  { region: "AE", dial: "+971", name: "United Arab Emirates" },
  { region: "SA", dial: "+966", name: "Saudi Arabia" },
  { region: "QA", dial: "+974", name: "Qatar" },
  { region: "KW", dial: "+965", name: "Kuwait" },
  { region: "BH", dial: "+973", name: "Bahrain" },
  { region: "OM", dial: "+968", name: "Oman" },
  { region: "EG", dial: "+20", name: "Egypt" },
  { region: "JO", dial: "+962", name: "Jordan" },
  { region: "LB", dial: "+961", name: "Lebanon" },
  { region: "IQ", dial: "+964", name: "Iraq" },
  { region: "IR", dial: "+98", name: "Iran" },
  { region: "TR", dial: "+90", name: "Türkiye" },
  { region: "AZ", dial: "+994", name: "Azerbaijan" },
  { region: "RS", dial: "+381", name: "Serbia" },
  { region: "BA", dial: "+387", name: "Bosnia and Herzegovina" },
  { region: "ME", dial: "+382", name: "Montenegro" },
  { region: "HR", dial: "+385", name: "Croatia" },
  { region: "MK", dial: "+389", name: "North Macedonia" },
  { region: "GB", dial: "+44", name: "United Kingdom" },
  { region: "DE", dial: "+49", name: "Germany" },
  { region: "FR", dial: "+33", name: "France" },
  { region: "IT", dial: "+39", name: "Italy" },
  { region: "NL", dial: "+31", name: "Netherlands" },
  { region: "CH", dial: "+41", name: "Switzerland" },
  { region: "RU", dial: "+7", name: "Russia" },
  { region: "KZ", dial: "+7", name: "Kazakhstan" },
  { region: "IN", dial: "+91", name: "India" },
  { region: "PK", dial: "+92", name: "Pakistan" },
  { region: "CN", dial: "+86", name: "China" },
  { region: "US", dial: "+1", name: "United States" },
  { region: "CA", dial: "+1", name: "Canada" },
];

// Pre-selected code per site language (a guess the visitor can change).
export const DEFAULT_REGION: Record<Locale, string> = { en: "AE", sr: "RS", tr: "TR", ar: "AE", fa: "IR" };

/**
 * "050 123 4567" + UAE -> "+971 50 123 4567". A number typed with its own
 * "+" or "00" prefix is kept as the visitor wrote it.
 */
export function withDialCode(region: string, number: string): string {
  const trimmed = number.trim();
  if (trimmed.startsWith("+")) return trimmed;
  if (trimmed.startsWith("00")) return `+${trimmed.slice(2)}`;
  const dial = DIAL_COUNTRIES.find((c) => c.region === region)?.dial ?? "";
  return `${dial} ${trimmed.replace(/^0+/, "")}`.trim();
}
