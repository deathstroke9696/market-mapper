import { BAND_COLORS, Band } from "@/data/marketData";

const bands: Band[] = ["Green", "Yellow", "Orange", "Red", "Blue", "Grey"];

export const BandLegend = () => (
  <div className="flex flex-wrap gap-4 items-center">
    {bands.map((band) => (
      <div key={band} className="flex items-center gap-1.5">
        <span
          className="w-3.5 h-3.5 rounded-sm inline-block border border-border"
          style={{ backgroundColor: BAND_COLORS[band] }}
        />
        <span className="text-xs text-muted-foreground font-medium">{band}</span>
      </div>
    ))}
  </div>
);
