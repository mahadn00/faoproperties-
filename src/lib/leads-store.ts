import ExcelJS from "exceljs";
import path from "node:path";
import fs from "node:fs";

const DATA_DIR = path.join(process.cwd(), "data");
const LEADS_FILE = path.join(DATA_DIR, "leads.xlsx");

const HEADERS = [
  "Submitted At",
  "Name",
  "Email",
  "Phone",
  "Project",
  "Requested Document",
  "Source",
  "Message",
] as const;

export type LeadRecord = {
  submittedAt: string;
  name: string;
  email: string;
  phone: string;
  projectName: string;
  documentLabel: string;
  source: string;
  message: string;
};

// Serialize reads/writes so concurrent submissions don't corrupt the file.
let queue: Promise<unknown> = Promise.resolve();
function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.catch(() => undefined);
  return run;
}

async function ensureFile(): Promise<ExcelJS.Workbook> {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const workbook = new ExcelJS.Workbook();

  if (fs.existsSync(LEADS_FILE)) {
    await workbook.xlsx.readFile(LEADS_FILE);
    if (!workbook.getWorksheet("Leads")) {
      const sheet = workbook.addWorksheet("Leads");
      sheet.addRow([...HEADERS]);
    }
  } else {
    const sheet = workbook.addWorksheet("Leads");
    sheet.addRow([...HEADERS]);
    sheet.getRow(1).font = { bold: true };
    sheet.columns.forEach((col) => {
      col.width = 24;
    });
  }

  return workbook;
}

export function appendLead(lead: LeadRecord): Promise<void> {
  return enqueue(async () => {
    const workbook = await ensureFile();
    const sheet = workbook.getWorksheet("Leads")!;
    sheet.addRow([
      lead.submittedAt,
      lead.name,
      lead.email,
      lead.phone,
      lead.projectName,
      lead.documentLabel,
      lead.source,
      lead.message,
    ]);
    await workbook.xlsx.writeFile(LEADS_FILE);
  });
}

export function listLeads(): Promise<LeadRecord[]> {
  return enqueue(async () => {
    if (!fs.existsSync(LEADS_FILE)) return [];
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(LEADS_FILE);
    const sheet = workbook.getWorksheet("Leads");
    if (!sheet) return [];

    const rows: LeadRecord[] = [];
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // header
      const values = row.values as unknown[]; // 1-indexed, [0] is empty
      rows.push({
        submittedAt: String(values[1] ?? ""),
        name: String(values[2] ?? ""),
        email: String(values[3] ?? ""),
        phone: String(values[4] ?? ""),
        projectName: String(values[5] ?? ""),
        documentLabel: String(values[6] ?? ""),
        source: String(values[7] ?? ""),
        message: String(values[8] ?? ""),
      });
    });

    return rows.reverse(); // newest first
  });
}
