import { useMemo } from "react";
import { Filters } from "@/data/marketData";
import { buildFilterSummary } from "@/lib/pptHelpers";

interface FilterSummaryOverlayProps {
  filters: Filters;
}

export const FilterSummaryOverlay = ({ filters }: FilterSummaryOverlayProps) => {
  const chips = useMemo(() => buildFilterSummary(filters), [filters]);

  return (
    <div
      style={{
        position: "absolute",
        top: 8,
        left: 8,
        zIndex: 30,
        background: "rgba(255,255,255,0.92)",
        borderRadius: 8,
        padding: "6px 10px",
        fontSize: 12,
        fontFamily: "system-ui, sans-serif",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        maxWidth: 280,
        display: "flex",
        flexWrap: "wrap",
        gap: 4,
      }}
    >
      {chips.length === 0 ? (
        <span style={{ color: "#888", fontWeight: 500 }}>All markets</span>
      ) : (
        chips.map((chip) => {
          const colonIdx = chip.indexOf(":");
          const label = colonIdx > -1 ? chip.slice(0, colonIdx + 1) : chip;
          const value = colonIdx > -1 ? chip.slice(colonIdx + 1) : "";
          return (
            <span
              key={chip}
              style={{
                background: "rgba(0,0,0,0.06)",
                borderRadius: 4,
                padding: "2px 6px",
                lineHeight: 1.4,
              }}
            >
              <span style={{ fontWeight: 600 }}>{label}</span>
              <span style={{ fontWeight: 400 }}>{value}</span>
            </span>
          );
        })
      )}
    </div>
  );
};
