import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { MarketData, BAND_COLORS } from "@/data/marketData";

interface IndiaMapProps {
  data: MarketData[];
}

const FitIndia = () => {
  const map = useMap();
  useEffect(() => {
    map.setView([22.5, 82], 5);
  }, [map]);
  return null;
};

const IndiaMap = ({ data }: IndiaMapProps) => {
  const [activeMarket, setActiveMarket] = useState<string | null>(null);

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden">
      <MapContainer
        center={[22.5, 82]}
        zoom={5}
        minZoom={4}
        maxZoom={18}
        scrollWheelZoom={true}
        className="w-full h-full"
        style={{ background: "hsl(220, 15%, 94%)" }}
      >
        <FitIndia />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {data.map((market) => (
          <CircleMarker
            key={market.marketName}
            center={[market.coordinates[1], market.coordinates[0]]}
            radius={activeMarket === market.marketName ? 10 : 7}
            pathOptions={{
              fillColor: BAND_COLORS[market.band],
              fillOpacity: 0.9,
              color: "#fff",
              weight: 2,
            }}
            eventHandlers={{
              mouseover: () => setActiveMarket(market.marketName),
              mouseout: () => setActiveMarket(null),
            }}
          >
            <Tooltip direction="top" offset={[0, -8]} opacity={1}>
              <div className="min-w-[180px]">
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ backgroundColor: BAND_COLORS[market.band] }}
                  />
                  <span className="font-semibold text-sm">{market.marketName}</span>
                  <span
                    className="text-[10px] font-medium px-1.5 py-0.5 rounded-full ml-auto"
                    style={{
                      backgroundColor: BAND_COLORS[market.band] + "22",
                      color: BAND_COLORS[market.band],
                    }}
                  >
                    {market.band}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <div className="text-gray-500">Balanced</div>
                    <div className="font-semibold">{market.balanced.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">Volume</div>
                    <div className="font-semibold">{market.volume.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-gray-500">%</div>
                    <div className="font-semibold">{market.percentage}%</div>
                  </div>
                </div>
              </div>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
};

export default IndiaMap;
