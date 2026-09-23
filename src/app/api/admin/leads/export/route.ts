import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { listLeads } from "@/lib/leads-db";
import { parseLeadFilters } from "@/lib/lead-filters";
import { LEAD_STATUS_LABEL } from "@/lib/lead-status";
import { formatDubaiSortable } from "@/lib/date-utils";

// "Export to Excel" on /admin/leads: the leads currently in view (same
// filters as the page) as a fresh .xlsx, built on demand from the database.
export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const filters = parseLeadFilters(request.nextUrl.searchParams);
  const leads = await listLeads(filters);

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Leads", { views: [{ state: "frozen", ySplit: 1 }] });
  sheet.columns = [
    { header: "Submitted (Dubai time)", key: "submitted", width: 20 },
    { header: "Status", key: "status", width: 12 },
    { header: "Name", key: "name", width: 24 },
    { header: "Email", key: "email", width: 30 },
    { header: "Phone", key: "phone", width: 18 },
    { header: "Project", key: "project", width: 30 },
    { header: "Requested Document", key: "document", width: 26 },
    { header: "Source", key: "source", width: 16 },
    { header: "Message", key: "message", width: 50 },
  ];
  sheet.getRow(1).font = { bold: true };
  for (const lead of leads) {
    sheet.addRow({
      submitted: formatDubaiSortable(lead.submittedAt),
      status: LEAD_STATUS_LABEL[lead.status],
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      project: lead.projectName,
      document: lead.documentLabel,
      source: lead.source,
      message: lead.message,
    });
  }
  sheet.autoFilter = { from: "A1", to: "I1" };

  const buffer = await workbook.xlsx.writeBuffer();
  const today = formatDubaiSortable(new Date().toISOString()).slice(0, 10);
  return new NextResponse(new Uint8Array(buffer as ArrayBuffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="fao-leads-${today}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
