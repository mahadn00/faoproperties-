import {
  dubaiDateEndFromInput,
  dubaiDateStartFromInput,
  startOfMonthDubai,
  startOfWeekDubai,
} from "./date-utils";
import { isLeadStatus, LEAD_STATUS_LABEL, type LeadStatus } from "./lead-status";

// The admin leads filters (?range=week|month|custom&from=&to=&status=), parsed
// once here so the leads page and the Excel export always agree on what's in
// view.

export type LeadFilters = {
  range: string;
  from: string;
  to: string;
  status: LeadStatus | null;
  start: Date | null;
  end: Date | null;
  description: string;
};

type Params = URLSearchParams | Record<string, string | string[] | undefined>;

function read(params: Params, key: string): string {
  const value = params instanceof URLSearchParams ? params.get(key) : params[key];
  return typeof value === "string" ? value : "";
}

export function parseLeadFilters(params: Params): LeadFilters {
  const range = read(params, "range") || "all";
  const from = read(params, "from");
  const to = read(params, "to");
  const statusParam = read(params, "status");
  const status = isLeadStatus(statusParam) ? statusParam : null;

  let start: Date | null = null;
  let end: Date | null = null;
  let description = "All leads";

  if (range === "week") {
    start = startOfWeekDubai();
    description = "This week (Mon–today, Dubai time)";
  } else if (range === "month") {
    start = startOfMonthDubai();
    description = "This month (Dubai time)";
  } else if (range === "custom") {
    start = from ? dubaiDateStartFromInput(from) : null;
    end = to ? dubaiDateEndFromInput(to) : null;
    if (start || end) description = `${from || "…"} to ${to || "…"} (Dubai time)`;
  }

  if (status) description += ` · ${LEAD_STATUS_LABEL[status]} only`;

  return { range, from, to, status, start, end, description };
}

/** The same filters as a query string, e.g. for the export link. */
export function leadFiltersQuery(filters: LeadFilters): string {
  const q = new URLSearchParams();
  if (filters.range !== "all") q.set("range", filters.range);
  if (filters.range === "custom" && filters.from) q.set("from", filters.from);
  if (filters.range === "custom" && filters.to) q.set("to", filters.to);
  if (filters.status) q.set("status", filters.status);
  const s = q.toString();
  return s ? `?${s}` : "";
}
