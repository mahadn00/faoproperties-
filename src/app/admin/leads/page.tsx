import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { listLeads } from "@/lib/leads-store";
import {
  dubaiDateEndFromInput,
  dubaiDateStartFromInput,
  formatDubai,
  startOfMonthDubai,
  startOfWeekDubai,
} from "@/lib/date-utils";
import LeadsFilterBar from "@/components/LeadsFilterBar";

export default async function AdminLeadsPage({
  searchParams,
}: PageProps<"/admin/leads">) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const params = await searchParams;
  const range = typeof params?.range === "string" ? params.range : "all";
  const fromInput = typeof params?.from === "string" ? params.from : "";
  const toInput = typeof params?.to === "string" ? params.to : "";

  let rangeStart: Date | null = null;
  let rangeEnd: Date | null = null;
  let rangeDescription = "All leads";

  if (range === "week") {
    rangeStart = startOfWeekDubai();
    rangeDescription = "This week (Mon–today, Dubai time)";
  } else if (range === "month") {
    rangeStart = startOfMonthDubai();
    rangeDescription = "This month (Dubai time)";
  } else if (range === "custom") {
    rangeStart = fromInput ? dubaiDateStartFromInput(fromInput) : null;
    rangeEnd = toInput ? dubaiDateEndFromInput(toInput) : null;
    if (rangeStart || rangeEnd) {
      rangeDescription = `${fromInput || "…"} to ${toInput || "…"} (Dubai time)`;
    } else {
      rangeDescription = "All leads";
    }
  }

  const allLeads = await listLeads();

  const leads = allLeads.filter((lead) => {
    if (!rangeStart && !rangeEnd) return true;
    const submitted = new Date(lead.submittedAt);
    if (Number.isNaN(submitted.getTime())) return true; // never hide legacy/unparsable rows
    if (rangeStart && submitted < rangeStart) return false;
    if (rangeEnd && submitted > rangeEnd) return false;
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="font-display text-2xl">Leads</div>
          <p className="mt-1 text-sm text-[var(--color-text-on-dark-muted)]">
            {leads.length} of {allLeads.length} total — {rangeDescription}
          </p>
        </div>
        <form action="/api/admin/logout" method="POST">
          <button
            type="submit"
            className="rounded-md border border-[var(--color-navy-line)] px-4 py-2 text-sm hover:border-[var(--color-gold)] transition-colors"
          >
            Sign out
          </button>
        </form>
      </div>

      <LeadsFilterBar activeRange={range} from={fromInput} to={toInput} />

      <div className="overflow-x-auto rounded-lg border border-[var(--color-navy-line)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--color-navy)] text-left text-xs uppercase tracking-wide text-[var(--color-text-on-dark-muted)]">
              <th className="px-4 py-3">Submitted</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Project</th>
              <th className="px-4 py-3">Document</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Message</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-[var(--color-text-on-dark-muted)]">
                  No leads in this range.
                </td>
              </tr>
            )}
            {leads.map((lead, i) => (
              <tr key={i} className="border-t border-[var(--color-navy-line)] align-top">
                <td className="px-4 py-3 whitespace-nowrap">{formatDubai(lead.submittedAt)}</td>
                <td className="px-4 py-3 whitespace-nowrap">{lead.name}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <a href={`mailto:${lead.email}`} className="hover:text-[var(--color-gold)]">
                    {lead.email}
                  </a>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">{lead.phone}</td>
                <td className="px-4 py-3 whitespace-nowrap">{lead.projectName}</td>
                <td className="px-4 py-3 whitespace-nowrap">{lead.documentLabel || "—"}</td>
                <td className="px-4 py-3 whitespace-nowrap">{lead.source}</td>
                <td className="px-4 py-3 max-w-xs">{lead.message || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
