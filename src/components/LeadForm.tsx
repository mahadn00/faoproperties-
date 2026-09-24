"use client";

import { useMemo, useState, useSyncExternalStore, FormEvent } from "react";
import Link from "next/link";
import { dictionary, type Locale } from "@/lib/i18n/dictionary";
import { localizedPath } from "@/lib/i18n/paths";
import { DEFAULT_REGION, DIAL_COUNTRIES, withDialCode } from "@/lib/phone-countries";
import { track } from "@/lib/analytics";
import Turnstile from "./Turnstile";

// Inlined at build time; when unset the Turnstile widget is simply not shown.
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

const CONTACT_METHODS = ["whatsapp", "call", "email"] as const;
const PURPOSES = ["live", "invest"] as const;
type Purpose = (typeof PURPOSES)[number];

type Props = {
  source: "gated-download" | "general-enquiry";
  projectSlug?: string;
  projectName?: string;
  documentId?: string;
  documentLabel?: string;
  submitLabel?: string;
  locale?: Locale;
};

type Status = "idle" | "submitting" | "success" | "error";

// False while server-rendering and hydrating, true afterwards — for values
// only the browser can produce without a hydration mismatch.
const noSubscribe = () => () => {};
function useIsClient() {
  return useSyncExternalStore(noSubscribe, () => true, () => false);
}

const fieldClass =
  "w-full rounded-md border border-[var(--color-sand-line)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-gold)]";
const labelClass = "mb-2 block text-xs uppercase tracking-wide text-[var(--color-text-muted)]";

export default function LeadForm({
  source,
  projectSlug,
  projectName,
  documentId,
  documentLabel,
  submitLabel,
  locale = "en",
}: Props) {
  const t = dictionary[locale].leadForm;
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [region, setRegion] = useState(DEFAULT_REGION[locale]);
  const [purpose, setPurpose] = useState<Purpose | null>(null);
  const [success, setSuccess] = useState<{ emailed: boolean; email: string } | null>(null);
  const [turnstileToken, setTurnstileToken] = useState("");
  // Turnstile tokens are single-use: bumping this remounts the widget for a
  // fresh one after any failed attempt.
  const [turnstileKey, setTurnstileKey] = useState(0);

  // Country names in the visitor's language (English until the browser takes over).
  const isClient = useIsClient();
  const regionNames = useMemo(
    () => (isClient ? new Intl.DisplayNames([locale], { type: "region" }) : null),
    [isClient, locale]
  );

  const resetTurnstile = () => {
    setTurnstileToken("");
    setTurnstileKey((k) => k + 1);
  };

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const form = e.currentTarget;
    const data = new FormData(form);
    const email = String(data.get("email") || "");

    const payload = {
      name: String(data.get("name") || ""),
      email,
      phone: withDialCode(region, String(data.get("phone") || "")),
      contactMethod: String(data.get("contactMethod") || "whatsapp"),
      purpose: purpose ?? undefined,
      message: String(data.get("message") || ""),
      projectSlug,
      documentId,
      source,
      locale,
      leave_blank: String(data.get("leave_blank") || ""),
      turnstileToken: turnstileToken || undefined,
    };

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok || !json.ok) {
        setStatus("error");
        setErrorMessage(
          json.code === "rate_limited"
            ? t.rateLimited
            : json.code === "verification_failed"
              ? t.verificationFailed
              : json.error || t.genericError
        );
        if (TURNSTILE_SITE_KEY) resetTurnstile();
        return;
      }

      track("generate_lead", {
        lead_source: source,
        project: projectSlug,
        document: documentId,
        contact_method: payload.contactMethod,
      });
      setSuccess({ emailed: Boolean(json.emailed), email });
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
      setErrorMessage(t.networkError);
      if (TURNSTILE_SITE_KEY) resetTurnstile();
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-lg border border-[var(--color-gold)]/40 bg-[var(--color-gold)]/10 p-6 text-center" role="status">
        <p className="font-display text-lg text-[var(--color-text)]">{t.thankYou}</p>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          {!documentId
            ? t.successGeneral
            : success?.emailed
              ? t.successDocSent(documentLabel ?? "", success.email)
              : t.successDoc(documentLabel)}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative space-y-4">
      {(projectName || documentLabel) && (
        <p className="text-sm text-[var(--color-text-muted)]">
          {documentLabel ? `${t.requesting}: ${documentLabel}` : null}
          {documentLabel && projectName ? " — " : null}
          {projectName}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelClass}>
            {t.fullName}
          </label>
          <input id="name" name="name" required minLength={2} autoComplete="name" className={fieldClass} />
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>
            {t.email}
          </label>
          <input id="email" name="email" type="email" required autoComplete="email" className={fieldClass} />
        </div>
      </div>

      <div>
        <label htmlFor="phone" className={labelClass}>
          {t.phone}
        </label>
        <div className="flex gap-2">
          <select
            aria-label={t.countryCode}
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-28 shrink-0 rounded-md border border-[var(--color-sand-line)] bg-white px-2 py-3 text-sm outline-none focus:border-[var(--color-gold)] sm:w-36"
          >
            {DIAL_COUNTRIES.map((c) => (
              <option key={c.region} value={c.region}>
                {c.dial} {regionNames?.of(c.region) ?? c.name}
              </option>
            ))}
          </select>
          {/* dir="ltr": phone numbers read left to right on the Arabic and Persian sites too. */}
          <input
            id="phone"
            name="phone"
            type="tel"
            dir="ltr"
            required
            minLength={6}
            autoComplete="tel-national"
            className={`${fieldClass} min-w-0 flex-1`}
          />
        </div>
      </div>

      <fieldset>
        <legend className={labelClass}>{t.contactVia}</legend>
        <div className="flex flex-wrap gap-2">
          {CONTACT_METHODS.map((method) => (
            <label key={method} className="cursor-pointer">
              <input
                type="radio"
                name="contactMethod"
                value={method}
                defaultChecked={method === "whatsapp"}
                className="peer sr-only"
              />
              <span className="inline-block rounded-full border border-[var(--color-sand-line)] bg-white px-4 py-1.5 text-sm text-[var(--color-text)] transition-colors peer-checked:border-[var(--color-ink)] peer-checked:bg-[var(--color-ink)] peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--color-gold)]">
                {t.contactOptions[method]}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <p className={labelClass} id="purpose-label">
          {t.purposeLabel}
        </p>
        {/* Toggle buttons rather than radios, so the choice can be left empty. */}
        <div className="flex flex-wrap gap-2" role="group" aria-labelledby="purpose-label">
          {PURPOSES.map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={purpose === p}
              onClick={() => setPurpose((current) => (current === p ? null : p))}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                purpose === p
                  ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-white"
                  : "border-[var(--color-sand-line)] bg-white text-[var(--color-text)] hover:border-[var(--color-ink)]"
              }`}
            >
              {t.purposeOptions[p]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="message" className={labelClass}>
          {t.message} {t.optional}
        </label>
        <textarea id="message" name="message" rows={3} className={fieldClass} />
      </div>

      {/* Honeypot — visually hidden and skipped by keyboard and screen readers,
          so only bots fill it in. Deliberately not named like a real field, so
          browser autofill leaves it alone. */}
      <div aria-hidden="true" className="sr-only">
        <label>
          Leave this field empty
          <input type="text" name="leave_blank" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      {TURNSTILE_SITE_KEY && (
        <Turnstile key={turnstileKey} siteKey={TURNSTILE_SITE_KEY} language={locale} onToken={setTurnstileToken} />
      )}

      {status === "error" && <p className="text-sm text-red-600">{errorMessage}</p>}

      <button
        type="submit"
        disabled={status === "submitting" || (Boolean(TURNSTILE_SITE_KEY) && !turnstileToken)}
        className="w-full rounded-md bg-[var(--color-ink)] py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {status === "submitting" ? t.submitting : submitLabel || t.submit}
      </button>

      <p className="text-center text-xs text-[var(--color-text-muted)]">
        {t.consent}{" "}
        <Link href={localizedPath(locale, "/privacy")} className="underline underline-offset-2 hover:text-[var(--color-text)]">
          {dictionary[locale].footer.privacy}
        </Link>
      </p>
    </form>
  );
}
