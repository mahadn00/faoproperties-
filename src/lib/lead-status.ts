// Kept apart from leads-db.ts so client components (the admin status picker)
// can import these without pulling the SQLite driver into the browser bundle.

export const LEAD_STATUSES = ["new", "contacted", "qualified", "won", "lost"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  won: "Won",
  lost: "Lost",
};

export function isLeadStatus(value: unknown): value is LeadStatus {
  return typeof value === "string" && (LEAD_STATUSES as readonly string[]).includes(value);
}

// How the lead asked to be contacted and why they're buying — shown in the
// admin table, the Excel export and the sales-team email.
export const CONTACT_METHOD_LABEL: Record<string, string> = { whatsapp: "WhatsApp", call: "Phone call", email: "Email" };
export const PURPOSE_LABEL: Record<string, string> = { live: "To live in", invest: "Investment" };
