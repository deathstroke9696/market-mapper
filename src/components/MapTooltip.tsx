import { MarketData, BAND_COLORS } from "@/data/marketData";

interface MapTooltipProps {
  market: MarketData;
  x: number;
  y: number;
}

export const MapTooltip = ({ market, x, y }: MapTooltipProps) => (
  <div
    className="fixed z-50 pointer-events-none bg-card border border-border rounded-lg shadow-lg px-4 py-3 min-w-[200px]"
    style={{ left: x + 12, top: y - 10 }}
  >
    <div className="flex items-center gap-2 mb-2">
      <span
        className="w-3 h-3 rounded-full inline-block"
        style={{ backgroundColor: BAND_COLORS[market.band] }}
      />
      <span className="font-semibold text-card-foreground text-sm">
        {market.marketName}
      </span>
      <span
        className="text-xs font-medium px-2 py-0.5 rounded-full"
        style={{
          backgroundColor: BAND_COLORS[market.band] + "22",
          color: BAND_COLORS[market.band],
        }}
      >
        {market.band}
      </span>
    </div>
    <div className="grid grid-cols-3 gap-3 text-xs">
      <div>
        <div className="text-muted-foreground">Balanced</div>
        <div className="font-semibold text-card-foreground">{market.balanced.toLocaleString()}</div>
      </div>
      <div>
        <div className="text-muted-foreground">Volume</div>
        <div className="font-semibold text-card-foreground">{market.volume.toLocaleString()}</div>
      </div>
      <div>
        <div className="text-muted-foreground">%</div>
        <div className="font-semibold text-card-foreground">{market.percentage}%</div>
      </div>
    </div>
  </div>
);
