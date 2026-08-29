// Parses strings like "AED 1.7M" or "AED 993,945" into a plain number so
// homepage stats can stay accurate as projects are added, without hand-editing
// them every time. Returns null for non-numeric prices ("Price on application").
export function parseAedValue(price: string): number | null {
  const match = price.match(/AED\s*([\d,.]+)\s*(M)?/i);
  if (!match) return null;
  const num = parseFloat(match[1].replace(/,/g, ""));
  if (Number.isNaN(num)) return null;
  return match[2] ? num * 1_000_000 : num;
}

export function formatAedShort(value: number): string {
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    return `AED ${millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1)}M`;
  }
  return `AED ${Math.round(value / 1000)}K`;
}
