import { useMemo } from "react";
import { MarketData, Band, BAND_COLORS } from "@/data/marketData";
import { computeBandCounts } from "@/lib/pptHelpers";

interface BandCountsLegendProps {
  data: MarketData[];
}

const BAND_ORDER: Band[] = ["Green", "Yellow", "Orange", "Red", "Blue", "Grey"];

export const BandCountsLegend = ({ data }: BandCountsLegendProps) => {
  const counts = useMemo(() => computeBandCounts(data), [data]);
  const total = data.length;

  if (total === 0) return null;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 12,
        right: 12,
        zIndex: 1000,
        background: "rgba(255,255,255,0.92)",
        borderRadius: 8,
        padding: "8px 12px",
        fontSize: 11,
        fontFamily: "system-ui, sans-serif",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        display: "flex",
        gap: 8,
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      {BAND_ORDER.map((band) =>
        counts[band] > 0 ? (
          <span key={band} style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: BAND_COLORS[band],
                display: "inline-block",
              }}
            />
            <span style={{ fontWeight: 600 }}>{counts[band]}</span>
          </span>
        ) : null
      )}
      <span style={{ fontWeight: 700, marginLeft: 4 }}>Total: {total}</span>
    </div>
  );
};
