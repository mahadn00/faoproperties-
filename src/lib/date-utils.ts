// Dubai (Asia/Dubai) is a fixed UTC+4 offset with no DST, so boundary math
// can safely use a constant offset instead of full timezone-aware libraries.
const DUBAI_OFFSET_MS = 4 * 60 * 60 * 1000;

export function formatDubai(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso; // fall back to raw value for legacy/unparsable rows
  return (
    date.toLocaleString("en-GB", {
      timeZone: "Asia/Dubai",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }) + " (Dubai time)"
  );
}

/** "2026-09-23 18:40" in Dubai time — sorts correctly as text, for spreadsheets. */
export function formatDubaiSortable(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Date(date.getTime() + DUBAI_OFFSET_MS).toISOString().slice(0, 16).replace("T", " ");
}

/** Start of the current ISO week (Monday 00:00) in Dubai local time, as a UTC instant. */
export function startOfWeekDubai(): Date {
  const dubaiMs = Date.now() + DUBAI_OFFSET_MS;
  const dubai = new Date(dubaiMs);
  const day = dubai.getUTCDay(); // 0 = Sunday ... 6 = Saturday, in shifted "local" time
  const diffToMonday = (day + 6) % 7;
  const localMidnightUtcMs = Date.UTC(
    dubai.getUTCFullYear(),
    dubai.getUTCMonth(),
    dubai.getUTCDate() - diffToMonday
  );
  return new Date(localMidnightUtcMs - DUBAI_OFFSET_MS);
}

/** Start of the current calendar month in Dubai local time, as a UTC instant. */
export function startOfMonthDubai(): Date {
  const dubaiMs = Date.now() + DUBAI_OFFSET_MS;
  const dubai = new Date(dubaiMs);
  const localMidnightUtcMs = Date.UTC(dubai.getUTCFullYear(), dubai.getUTCMonth(), 1);
  return new Date(localMidnightUtcMs - DUBAI_OFFSET_MS);
}

/** Parses a "yyyy-mm-dd" date-input value as Dubai-local midnight, returned as a UTC instant. */
export function dubaiDateStartFromInput(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [, y, m, d] = match;
  const localMidnightUtcMs = Date.UTC(Number(y), Number(m) - 1, Number(d));
  return new Date(localMidnightUtcMs - DUBAI_OFFSET_MS);
}

/** Same as above but returns the end of that Dubai-local day (23:59:59.999), as a UTC instant. */
export function dubaiDateEndFromInput(value: string): Date | null {
  const start = dubaiDateStartFromInput(value);
  if (!start) return null;
  return new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
}
