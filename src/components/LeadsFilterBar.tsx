const PRESETS = [
  { value: "all", label: "All Time" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
] as const;

export default function LeadsFilterBar({
  activeRange,
  from,
  to,
}: {
  activeRange: string;
  from: string;
  to: string;
}) {
  return (
    <form
      method="get"
      action="/admin/leads"
      className="mb-8 flex flex-wrap items-end gap-3 rounded-lg border border-[var(--color-navy-line)] bg-[var(--color-navy)] p-4"
    >
      <div className="flex gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.value}
            type="submit"
            name="range"
            value={preset.value}
            className={`rounded-md px-4 py-2 text-sm transition-colors ${
              activeRange === preset.value
                ? "bg-[var(--color-gold)] text-[var(--color-ink)]"
                : "border border-[var(--color-navy-line)] text-[var(--color-text-on-dark-muted)] hover:border-[var(--color-gold)] hover:text-white"
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="mx-2 hidden h-8 w-px bg-[var(--color-navy-line)] sm:block" />

      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm">
          <span className="mb-1 block text-xs uppercase tracking-wide text-[var(--color-text-on-dark-muted)]">
            From
          </span>
          <input
            type="date"
            name="from"
            defaultValue={from}
            className="rounded-md border border-[var(--color-navy-line)] bg-[var(--color-navy-2)] px-3 py-2 text-sm text-white outline-none focus:border-[var(--color-gold)]"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-xs uppercase tracking-wide text-[var(--color-text-on-dark-muted)]">
            To
          </span>
          <input
            type="date"
            name="to"
            defaultValue={to}
            className="rounded-md border border-[var(--color-navy-line)] bg-[var(--color-navy-2)] px-3 py-2 text-sm text-white outline-none focus:border-[var(--color-gold)]"
          />
        </label>
        <button
          type="submit"
          name="range"
          value="custom"
          className={`rounded-md px-4 py-2 text-sm transition-colors ${
            activeRange === "custom"
              ? "bg-[var(--color-gold)] text-[var(--color-ink)]"
              : "border border-[var(--color-navy-line)] text-[var(--color-text-on-dark-muted)] hover:border-[var(--color-gold)] hover:text-white"
          }`}
        >
          Apply Range
        </button>
      </div>
    </form>
  );
}
