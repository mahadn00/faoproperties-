import Database from "better-sqlite3";
import ExcelJS from "exceljs";
import fs from "node:fs";
import path from "node:path";
import type { LeadStatus } from "./lead-status";

// Leads live in a SQLite file (data/leads.db). This replaced data/leads.xlsx,
// which had to be read and rewritten in full for every submission — slower
// with every lead, single-writer only, and one crash mid-write away from
// corrupting the only copy. The sales team still gets a spreadsheet: the
// admin page's "Export to Excel" builds one on demand.

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "leads.db");
const LEGACY_XLSX = path.join(DATA_DIR, "leads.xlsx");

export type NewLead = {
  submittedAt: string; // ISO timestamp
  name: string;
  email: string;
  phone: string;
  projectName: string;
  documentLabel: string;
  source: string;
  message: string;
};

export type Lead = NewLead & {
  id: number;
  status: LeadStatus;
  statusUpdatedAt: string | null;
};

export type LeadQuery = {
  start?: Date | null;
  end?: Date | null;
  status?: LeadStatus | null;
};

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    submitted_at TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    project_name TEXT NOT NULL DEFAULT '',
    document_label TEXT NOT NULL DEFAULT '',
    source TEXT NOT NULL DEFAULT '',
    message TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'new',
    status_updated_at TEXT
  );
  CREATE INDEX IF NOT EXISTS leads_submitted_at ON leads (submitted_at);
  CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
`;

let dbPromise: Promise<Database.Database> | null = null;

function getDb(): Promise<Database.Database> {
  if (!dbPromise) {
    dbPromise = open().catch((err) => {
      dbPromise = null; // let the next request retry
      throw err;
    });
  }
  return dbPromise;
}

async function open(): Promise<Database.Database> {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const db = new Database(DB_FILE);
  db.pragma("journal_mode = WAL"); // readers never block the writer
  db.pragma("busy_timeout = 5000");
  db.exec(SCHEMA);
  await importLegacyWorkbook(db);
  return db;
}

/**
 * One-time move of the old spreadsheet's rows into the database, the first
 * time the site starts on this version. The .xlsx itself is left in place as
 * a backup and never written to again.
 */
async function importLegacyWorkbook(db: Database.Database) {
  if (db.prepare("SELECT 1 FROM meta WHERE key = 'legacy_xlsx_import'").get()) return;

  let imported = 0;
  if (fs.existsSync(LEGACY_XLSX)) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(LEGACY_XLSX);
    const sheet = workbook.getWorksheet("Leads");
    const rows: NewLead[] = [];
    sheet?.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // header
      const v = row.values as ExcelJS.CellValue[]; // 1-indexed, [0] is empty
      rows.push({
        submittedAt: normalizeTimestamp(cellText(v[1])),
        name: cellText(v[2]),
        email: cellText(v[3]),
        phone: cellText(v[4]),
        projectName: cellText(v[5]),
        documentLabel: cellText(v[6]),
        source: cellText(v[7]),
        message: cellText(v[8]),
      });
    });
    const insertAll = db.transaction((leads: NewLead[]) => leads.forEach((lead) => insert(db, lead)));
    insertAll(rows);
    imported = rows.length;
  }

  db.prepare("INSERT INTO meta (key, value) VALUES ('legacy_xlsx_import', ?)").run(
    JSON.stringify({ at: new Date().toISOString(), rows: imported })
  );
  if (imported > 0) console.log(`Imported ${imported} leads from data/leads.xlsx into data/leads.db`);
}

// Date filters compare ISO strings, so store every parsable timestamp in that
// one format (a hand-edited spreadsheet may hold other shapes); anything
// unparsable is kept verbatim rather than dropped.
function normalizeTimestamp(text: string): string {
  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? text : date.toISOString();
}

function cellText(value: ExcelJS.CellValue): string {
  if (value == null) return "";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object" && "text" in value) return String(value.text); // hyperlink / rich text
  return String(value);
}

function insert(db: Database.Database, lead: NewLead): number {
  const result = db
    .prepare(
      `INSERT INTO leads (submitted_at, name, email, phone, project_name, document_label, source, message)
       VALUES (@submittedAt, @name, @email, @phone, @projectName, @documentLabel, @source, @message)`
    )
    .run(lead);
  return Number(result.lastInsertRowid);
}

export async function appendLead(lead: NewLead): Promise<number> {
  return insert(await getDb(), lead);
}

type LeadRow = {
  id: number;
  submitted_at: string;
  name: string;
  email: string;
  phone: string;
  project_name: string;
  document_label: string;
  source: string;
  message: string;
  status: LeadStatus;
  status_updated_at: string | null;
};

/** Newest first. Date bounds compare ISO strings, which sort chronologically. */
export async function listLeads({ start, end, status }: LeadQuery = {}): Promise<Lead[]> {
  const where: string[] = [];
  const params: Record<string, string> = {};
  if (start) {
    where.push("submitted_at >= @start");
    params.start = start.toISOString();
  }
  if (end) {
    where.push("submitted_at <= @end");
    params.end = end.toISOString();
  }
  if (status) {
    where.push("status = @status");
    params.status = status;
  }

  const rows = (await getDb())
    .prepare(`SELECT * FROM leads ${where.length ? `WHERE ${where.join(" AND ")}` : ""} ORDER BY submitted_at DESC, id DESC`)
    .all(params) as LeadRow[];

  return rows.map((r) => ({
    id: r.id,
    submittedAt: r.submitted_at,
    name: r.name,
    email: r.email,
    phone: r.phone,
    projectName: r.project_name,
    documentLabel: r.document_label,
    source: r.source,
    message: r.message,
    status: r.status,
    statusUpdatedAt: r.status_updated_at,
  }));
}

export async function countLeads(): Promise<number> {
  const row = (await getDb()).prepare("SELECT COUNT(*) AS n FROM leads").get() as { n: number };
  return row.n;
}

export async function setLeadStatus(id: number, status: LeadStatus): Promise<void> {
  (await getDb())
    .prepare("UPDATE leads SET status = ?, status_updated_at = ? WHERE id = ?")
    .run(status, new Date().toISOString(), id);
}
