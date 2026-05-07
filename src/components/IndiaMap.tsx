import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, GeoJSON, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { MarketData, BAND_COLORS, STATE_COLORS } from "@/data/marketData";

interface IndiaMapProps {
  data: MarketData[];
  selectedStates?: string[];
  alwaysShowLabels?: boolean;
}

const GEOJSON_URL =
  "https://raw.githubusercontent.com/geohacker/india/master/state/india_state.geojson";

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

const MapEvents = ({ onZoomChange }: { onZoomChange: (zoom: number) => void }) => {
  const map = useMapEvents({
    zoomend: () => {
      onZoomChange(map.getZoom());
    },
  });
  useEffect(() => {
    onZoomChange(map.getZoom());
  }, [map, onZoomChange]);
  return null;
};

const normalizeStateName = (name: string) =>
  name.toLowerCase().replace(/[^a-z]/g, "");

const IndiaMap = ({ data, selectedStates = [], alwaysShowLabels = false }: IndiaMapProps) => {
  const [activeMarket, setActiveMarket] = useState<string | null>(null);
  const [geoData, setGeoData] = useState<any>(null);
  const [zoom, setZoom] = useState(5);

  const showLabels = alwaysShowLabels || (zoom >= 8 && data.length <= 80);

  useEffect(() => {
    fetch(GEOJSON_URL)
      .then((r) => r.json())
      .then(setGeoData)
      .catch(() => {});
  }, []);

  // Build per-feature color map based on selected state order
  const { filteredGeo, stateColorMap } = useMemo(() => {
    if (!geoData || selectedStates.length === 0) return { filteredGeo: null, stateColorMap: {} as Record<string, string> };
    const normalizedSelected = selectedStates.map(normalizeStateName);
    const colorMap: Record<string, string> = {};
    normalizedSelected.forEach((s, i) => {
      colorMap[s] = STATE_COLORS[i % STATE_COLORS.length];
    });

    const filtered = {
      ...geoData,
      features: geoData.features.filter((f: any) => {
        const name = normalizeStateName(f.properties?.NAME_1 || f.properties?.name || f.properties?.NAME || "");
        return normalizedSelected.some(
          (sel) => name.includes(sel) || sel.includes(name)
        );
      }),
    };
    return {
      filteredGeo: filtered.features.length > 0 ? filtered : null,
      stateColorMap: colorMap,
    };
  }, [geoData, selectedStates]);

  const geoStyle = (feature: any) => {
    const name = normalizeStateName(feature?.properties?.NAME_1 || feature?.properties?.name || feature?.properties?.NAME || "");
    const normalizedSelected = selectedStates.map(normalizeStateName);
    const matched = normalizedSelected.find((sel) => name.includes(sel) || sel.includes(name));
    const color = matched ? stateColorMap[matched] || STATE_COLORS[0] : STATE_COLORS[0];
    return {
      color,
      weight: 3,
      fillColor: color,
      fillOpacity: 0.15,
      dashArray: "6 3",
    };
  };

  return (
    <div className="leaflet-container-scoped relative w-full h-full rounded-lg overflow-hidden">
      <MapContainer
        center={[20.5, 78.9]}
        zoom={5}
        minZoom={4}
        maxZoom={18}
        scrollWheelZoom={true}
        className="w-full h-full"
        style={{ background: "hsl(220, 15%, 94%)" }}
      >
        <FitBounds data={data} />
        <MapEvents onZoomChange={setZoom} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {filteredGeo && (
          <GeoJSON
            key={selectedStates.join(",")}
            data={filteredGeo}
            style={geoStyle}
          />
        )}
        {data.map((market, idx) => (
          <CircleMarker
            key={`${market.marketName}-${idx}`}
            center={[market.coordinates[1], market.coordinates[0]]}
            radius={activeMarket === `${market.marketName}-${idx}` ? 12 : 8}
            pathOptions={{
              fillColor: BAND_COLORS[market.band],
              fillOpacity: 0.85,
              color: "#fff",
              weight: 2.5,
            }}
            eventHandlers={{
              mouseover: () => setActiveMarket(`${market.marketName}-${idx}`),
              mouseout: () => setActiveMarket(null),
            }}
          >
            {showLabels && (
              <Tooltip
                permanent
                direction="right"
                offset={[8, -4]}
                className="market-label"
              >
                {market.marketName}
              </Tooltip>
            )}
            <Tooltip direction="top" offset={[0, -10]} opacity={1}>
              <div style={{ minWidth: 160, fontFamily: "system-ui, sans-serif" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <span
                    style={{
                      width: 10, height: 10, borderRadius: "50%",
                      background: BAND_COLORS[market.band], display: "inline-block",
                    }}
                  />
                  <strong style={{ fontSize: 13 }}>{market.marketName}</strong>
                  <span style={{ fontSize: 10, color: "#888" }}>{market.state}</span>
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
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 11 }}>
                  <div>
                    <div style={{ color: "#888" }}>Vol</div>
                    <div style={{ fontWeight: 600 }}>{(market.vol ?? 0).toLocaleString()}</div>
                  </div>
                  <div>
                    <div style={{ color: "#888" }}>Vol %</div>
                    <div style={{ fontWeight: 600 }}>{market.volPercent ?? 0}%</div>
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
