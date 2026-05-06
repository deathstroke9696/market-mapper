import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { MarketData, BAND_COLORS } from "@/data/marketData";

interface IndiaMapProps {
  data: MarketData[];
}

const FitBounds = ({ data }: { data: MarketData[] }) => {
  const map = useMap();
  useEffect(() => {
    if (data.length === 0) return;
    const lats = data.map((d) => d.coordinates[1]);
    const lngs = data.map((d) => d.coordinates[0]);
    const bounds: [[number, number], [number, number]] = [
      [Math.min(...lats) - 0.15, Math.min(...lngs) - 0.15],
      [Math.max(...lats) + 0.15, Math.max(...lngs) + 0.15],
    ];
    map.fitBounds(bounds);
  }, [map, data]);
  return null;
};

const IndiaMap = ({ data }: IndiaMapProps) => {
  const [activeMarket, setActiveMarket] = useState<string | null>(null);

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden">
      <MapContainer
        center={[16.5, 74.4]}
        zoom={10}
        minZoom={4}
        maxZoom={18}
        scrollWheelZoom={true}
        className="w-full h-full"
        style={{ background: "hsl(220, 15%, 94%)" }}
      >
        <FitBounds data={data} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {data.map((market) => (
          <CircleMarker
            key={market.marketName}
            center={[market.coordinates[1], market.coordinates[0]]}
            radius={activeMarket === market.marketName ? 12 : 8}
            pathOptions={{
              fillColor: BAND_COLORS[market.band],
              fillOpacity: 0.85,
              color: "#fff",
              weight: 2.5,
            }}
            eventHandlers={{
              mouseover: () => setActiveMarket(market.marketName),
              mouseout: () => setActiveMarket(null),
            }}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={1}>
              <div style={{ minWidth: 180, fontFamily: "system-ui, sans-serif" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <span
                    style={{
                      width: 10, height: 10, borderRadius: "50%",
                      background: BAND_COLORS[market.band], display: "inline-block",
                    }}
                  />
                  <strong style={{ fontSize: 13 }}>{market.marketName}</strong>
                  <span
                    style={{
                      fontSize: 10, fontWeight: 600, padding: "2px 8px",
                      borderRadius: 99, marginLeft: "auto",
                      background: BAND_COLORS[market.band] + "22",
                      color: BAND_COLORS[market.band],
                    }}
                  >
                    {market.band}
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, fontSize: 11 }}>
                  <div>
                    <div style={{ color: "#888" }}>Balanced</div>
                    <div style={{ fontWeight: 600 }}>{market.balanced.toLocaleString()}</div>
                  </div>
                  <div>
                    <div style={{ color: "#888" }}>Volume</div>
                    <div style={{ fontWeight: 600 }}>{market.volume.toLocaleString()}</div>
                  </div>
                  <div>
                    <div style={{ color: "#888" }}>%</div>
                    <div style={{ fontWeight: 600 }}>{market.percentage}%</div>
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
