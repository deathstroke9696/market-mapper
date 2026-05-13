import { toPng } from "html-to-image";
import { Filters, FILTER_FIELDS, MarketData, Band } from "@/data/marketData";

export function buildFilterSummary(filters: Filters): string[] {
  const summary: string[] = [];
  for (const { key, label } of FILTER_FIELDS) {
    if (filters[key].length > 0) {
      summary.push(`${label}: ${filters[key].join(", ")}`);
    }
  }
  return summary;
}

export function computeBandCounts(data: MarketData[]): Record<Band, number> {
  const counts: Record<Band, number> = {
    Green: 0, Yellow: 0, Orange: 0, Red: 0, Blue: 0, Grey: 0,
  };
  for (const d of data) {
    if (counts[d.band] !== undefined) counts[d.band]++;
  }
  return counts;
}

export async function captureMapAsDataUrl(
  elementId: string,
  scale = 2
): Promise<string> {
  const el = document.getElementById(elementId);
  if (!el) throw new Error("Map element not found");
  return toPng(el, {
    pixelRatio: scale,
    cacheBust: true,
  });
}

export function suggestSlideTitle(filters: Filters): string {
  const parts: string[] = [];
  if (filters.state.length > 0) parts.push(filters.state.join(", "));
  if (filters.solution.length > 0) parts.push(filters.solution.join(", "));
  if (filters.structure.length > 0) parts.push(filters.structure.join(", "));
  if (filters.branch.length > 0) parts.push(filters.branch.join(", "));
  if (parts.length === 0) {
    const active = FILTER_FIELDS.filter(({ key }) => filters[key].length > 0);
    if (active.length > 0) {
      return active.map(({ key }) => filters[key].join(", ")).join(" — ");
    }
    return "All Markets";
  }
  return parts.join(" — ");
}
