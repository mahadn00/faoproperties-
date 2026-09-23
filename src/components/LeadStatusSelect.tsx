"use client";

import { updateLeadStatus } from "@/app/admin/leads/actions";
import { LEAD_STATUSES, LEAD_STATUS_LABEL, type LeadStatus } from "@/lib/lead-status";

const STATUS_STYLE: Record<LeadStatus, string> = {
  new: "border-[var(--color-gold)] text-[var(--color-gold)]",
  contacted: "border-sky-400/60 text-sky-300",
  qualified: "border-violet-400/60 text-violet-300",
  won: "border-emerald-400/60 text-emerald-300",
  lost: "border-white/20 text-[var(--color-text-on-dark-muted)]",
};

/** Saves as soon as a new status is picked (the Save button is for no-JS). */
export default function LeadStatusSelect({ id, status }: { id: number; status: LeadStatus }) {
  return (
    <form action={updateLeadStatus} className="flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <select
        name="status"
        defaultValue={status}
        aria-label="Lead status"
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        className={`rounded-md border bg-[var(--color-navy-2)] px-2 py-1 text-xs outline-none focus:border-[var(--color-gold)] ${STATUS_STYLE[status]}`}
      >
        {LEAD_STATUSES.map((s) => (
          <option key={s} value={s}>
            {LEAD_STATUS_LABEL[s]}
          </option>
        ))}
      </select>
      <noscript>
        <button type="submit" className="text-xs underline">
          Save
        </button>
      </noscript>
    </form>
  );
}
