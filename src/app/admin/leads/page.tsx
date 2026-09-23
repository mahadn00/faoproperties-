import { redirect } from "next/navigation";
import { Download } from "lucide-react";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { countLeads, listLeads } from "@/lib/leads-db";
import { leadFiltersQuery, parseLeadFilters } from "@/lib/lead-filters";
import { formatDubai } from "@/lib/date-utils";
import LeadsFilterBar from "@/components/LeadsFilterBar";
import LeadStatusSelect from "@/components/LeadStatusSelect";

export default async function AdminLeadsPage({
  searchParams,
}: PageProps<"/admin/leads">) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const filters = parseLeadFilters(await searchParams);
  const [leads, total] = await Promise.all([listLeads(filters), countLeads()]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="font-display text-2xl">Leads</div>
          <p className="mt-1 text-sm text-[var(--color-text-on-dark-muted)]">
            {leads.length} of {total} total — {filters.description}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`/api/admin/leads/export${leadFiltersQuery(filters)}`}
            className="inline-flex items-center gap-2 rounded-md bg-[var(--color-gold)] px-4 py-2 text-sm font-medium text-[var(--color-ink)] transition-opacity hover:opacity-90"
          >
            <Download size={16} aria-hidden="true" />
            Export to Excel
          </a>
          <form action="/api/admin/logout" method="POST">
            <button
              type="submit"
              className="rounded-md border border-[var(--color-navy-line)] px-4 py-2 text-sm hover:border-[var(--color-gold)] transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>

      <LeadsFilterBar activeRange={filters.range} from={filters.from} to={filters.to} status={filters.status} />

      <div className="overflow-x-auto rounded-lg border border-[var(--color-navy-line)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--color-navy)] text-left text-xs uppercase tracking-wide text-[var(--color-text-on-dark-muted)]">
              <th className="px-4 py-3 text-start">Submitted</th>
              <th className="px-4 py-3 text-start">Status</th>
              <th className="px-4 py-3 text-start">Name</th>
              <th className="px-4 py-3 text-start">Email</th>
              <th className="px-4 py-3 text-start">Phone</th>
              <th className="px-4 py-3 text-start">Project</th>
              <th className="px-4 py-3 text-start">Document</th>
              <th className="px-4 py-3 text-start">Source</th>
              <th className="px-4 py-3 text-start">Message</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-[var(--color-text-on-dark-muted)]">
                  No leads in this range.
                </td>
              </tr>
            )}
            {leads.map((lead) => (
              <tr key={lead.id} className="border-t border-[var(--color-navy-line)] align-top">
                <td className="px-4 py-3 whitespace-nowrap">{formatDubai(lead.submittedAt)}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <LeadStatusSelect id={lead.id} status={lead.status} />
                </td>
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
