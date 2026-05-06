import { useState, memo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { MarketData, BAND_COLORS } from "@/data/marketData";
import { MapTooltip } from "./MapTooltip";

const INDIA_GEO_URL = "/india.geojson";

interface IndiaMapProps {
  data: MarketData[];
}

const IndiaMap = memo(({ data }: IndiaMapProps) => {
  const [tooltip, setTooltip] = useState<{
    market: MarketData;
    x: number;
    y: number;
  } | null>(null);

  const dataMap = new Map<string, MarketData>();
  data.forEach((d) => {
    dataMap.set(d.marketName.toLowerCase(), d);
  });

  const normalize = (name: string) => name.toLowerCase().replace(/&/g, "and").replace(/\s+/g, " ").trim();

  const getMarketData = (geoName: string): MarketData | undefined => {
    const n = normalize(geoName);
    for (const [key, val] of dataMap) {
      if (normalize(key) === n) return val;
    }
    return undefined;
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
          <Geographies geography={INDIA_GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const name = geo.properties.ST_NM || "";
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
                      setTooltip((prev) =>
                        prev
                          ? { ...prev, x: evt.clientX, y: evt.clientY }
                          : null
                      );
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
