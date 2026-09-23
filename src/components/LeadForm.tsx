"use client";

import { useState, FormEvent } from "react";
import { dictionary, type Locale } from "@/lib/i18n/dictionary";
import { track } from "@/lib/analytics";
import Turnstile from "./Turnstile";

// Inlined at build time; when unset the Turnstile widget is simply not shown.
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

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
  const [turnstileToken, setTurnstileToken] = useState("");
  // Turnstile tokens are single-use: bumping this remounts the widget for a
  // fresh one after any failed attempt.
  const [turnstileKey, setTurnstileKey] = useState(0);

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

    const payload = {
      name: String(data.get("name") || ""),
      email: String(data.get("email") || ""),
      phone: String(data.get("phone") || ""),
      message: String(data.get("message") || ""),
      projectSlug,
      documentId,
      source,
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

      track("generate_lead", { lead_source: source, project: projectSlug, document: documentId });
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
      <div className="rounded-lg border border-[var(--color-gold)]/40 bg-[var(--color-gold)]/10 p-6 text-center">
        <p className="font-display text-lg text-[var(--color-text)]">{t.thankYou}</p>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          {documentId ? t.successDoc(documentLabel) : t.successGeneral}
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
          <label htmlFor="name" className="block text-xs uppercase tracking-wide text-[var(--color-text-muted)] mb-2">
            {t.fullName}
          </label>
          <input
            id="name"
            name="name"
            required
            minLength={2}
            className="w-full rounded-md border border-[var(--color-sand-line)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-gold)]"
          />
        </div>
        <div>
          <label htmlFor="phone" className="block text-xs uppercase tracking-wide text-[var(--color-text-muted)] mb-2">
            {t.phone}
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            minLength={6}
            className="w-full rounded-md border border-[var(--color-sand-line)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-gold)]"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-xs uppercase tracking-wide text-[var(--color-text-muted)] mb-2">
          {t.email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-md border border-[var(--color-sand-line)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-gold)]"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-xs uppercase tracking-wide text-[var(--color-text-muted)] mb-2">
          {t.message} {source === "general-enquiry" ? "" : t.optional}
        </label>
        <textarea
          id="message"
          name="message"
          rows={3}
          required={source === "general-enquiry"}
          className="w-full rounded-md border border-[var(--color-sand-line)] bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-gold)]"
        />
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

      {status === "error" && (
        <p className="text-sm text-red-600">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={status === "submitting" || (Boolean(TURNSTILE_SITE_KEY) && !turnstileToken)}
        className="w-full rounded-md bg-[var(--color-ink)] py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {status === "submitting" ? t.submitting : submitLabel || t.submit}
      </button>

      <p className="text-xs text-[var(--color-text-muted)] text-center">
        {t.consent}
      </p>
    </form>
  );
}
