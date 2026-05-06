import { useState, memo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { MarketData, BAND_COLORS, Band } from "@/data/marketData";
import { MapTooltip } from "./MapTooltip";

const INDIA_TOPO_JSON =
  "https://cdn.jsdelivr.net/npm/india-topojson@1.0.0/india.json";

interface IndiaMapProps {
  data: MarketData[];
}

const IndiaMap = memo(({ data }: IndiaMapProps) => {
  const [tooltip, setTooltip] = useState<{
    market: MarketData;
    x: number;
    y: number;
  } | null>(null);

  const dataMap = new Map(data.map((d) => [d.marketName.toLowerCase(), d]));

  const getMarketData = (geoName: string): MarketData | undefined => {
    const name = geoName.toLowerCase();
    return dataMap.get(name);
  };

  const getFillColor = (geoName: string): string => {
    const market = getMarketData(geoName);
    if (market) return BAND_COLORS[market.band];
    return "hsl(220, 10%, 90%)";
  };

  return (
    <div className="relative w-full h-full">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 1000,
          center: [82, 22],
        }}
        className="w-full h-full"
      >
        <ZoomableGroup>
          <Geographies geography={INDIA_TOPO_JSON}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const name = geo.properties.NAME_1 || geo.properties.name || "";
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={getFillColor(name)}
                    stroke="hsl(220, 30%, 98%)"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none" },
                      hover: {
                        outline: "none",
                        filter: "brightness(0.85)",
                        cursor: "pointer",
                      },
                      pressed: { outline: "none" },
                    }}
                    onMouseEnter={(evt) => {
                      const market = getMarketData(name);
                      if (market) {
                        setTooltip({
                          market,
                          x: evt.clientX,
                          y: evt.clientY,
                        });
                      }
                    }}
                    onMouseMove={(evt) => {
                      if (tooltip) {
                        setTooltip((prev) =>
                          prev
                            ? { ...prev, x: evt.clientX, y: evt.clientY }
                            : null
                        );
                      }
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
      {tooltip && <MapTooltip market={tooltip.market} x={tooltip.x} y={tooltip.y} />}
    </div>
  );
});

IndiaMap.displayName = "IndiaMap";
export default IndiaMap;
