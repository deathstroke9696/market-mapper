import { useState, memo } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Marker,
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
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="hsl(220, 15%, 94%)"
                  stroke="hsl(220, 20%, 82%)"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { outline: "none", fill: "hsl(220, 15%, 89%)" },
                    pressed: { outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>

          {data.map((market) => (
            <Marker key={market.marketName} coordinates={market.coordinates}>
              <circle
                r={6}
                fill={BAND_COLORS[market.band]}
                stroke="hsl(0, 0%, 100%)"
                strokeWidth={1.5}
                style={{ cursor: "pointer", transition: "r 0.2s" }}
                onMouseEnter={(evt) =>
                  setTooltip({ market, x: evt.clientX, y: evt.clientY })
                }
                onMouseMove={(evt) =>
                  setTooltip((prev) =>
                    prev ? { ...prev, x: evt.clientX, y: evt.clientY } : null
                  )
                }
                onMouseLeave={() => setTooltip(null)}
              />
              <text
                textAnchor="middle"
                y={-10}
                style={{
                  fontFamily: "system-ui",
                  fontSize: 7,
                  fill: "hsl(220, 30%, 25%)",
                  fontWeight: 500,
                  pointerEvents: "none",
                }}
              >
                {market.marketName}
              </text>
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>
      {tooltip && (
        <MapTooltip market={tooltip.market} x={tooltip.x} y={tooltip.y} />
      )}
    </div>
  );
});

IndiaMap.displayName = "IndiaMap";
export default IndiaMap;
