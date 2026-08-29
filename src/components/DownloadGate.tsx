"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import Modal from "./Modal";
import LeadForm from "./LeadForm";
import type { ProjectDocument } from "@/lib/projects";
import { dictionary, type Locale } from "@/lib/i18n/dictionary";

export default function DownloadGate({
  projectSlug,
  projectName,
  document,
  locale = "en",
}: {
  projectSlug: string;
  projectName: string;
  document: ProjectDocument;
  locale?: Locale;
}) {
  const t = dictionary[locale].downloadGate;
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-between gap-3 rounded-md border border-[var(--color-sand-line)] bg-white px-5 py-4 text-left transition-colors hover:border-[var(--color-gold)]"
      >
        <span>
          <span className="block text-sm font-medium text-[var(--color-text)]">
            {document.label}
          </span>
          <span className="block text-xs text-[var(--color-text-muted)] mt-0.5">
            {document.description}
          </span>
        </span>
        <Send size={20} className="shrink-0 text-[var(--color-gold-deep)]" />
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={t.request(document.label)}>
        <p className="mb-6 text-sm text-[var(--color-text-muted)]">
          {t.shareDetails(document.label, projectName)}
        </p>
        <LeadForm
          source="gated-download"
          projectSlug={projectSlug}
          projectName={projectName}
          documentId={document.id}
          documentLabel={document.label}
          submitLabel={t.request(document.label)}
          locale={locale}
        />
      </Modal>
    </>
  );
}
