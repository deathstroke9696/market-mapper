import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, GeoJSON, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MarketData, BAND_COLORS } from "@/data/marketData";

const DISTRICTS_URL = "/india_districts.geojson";

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
  const [geoData, setGeoData] = useState<GeoJSON.FeatureCollection | null>(null);

  const dataMap = useMemo(() => {
    const m = new Map<string, MarketData>();
    data.forEach((d) => m.set(d.marketName.toLowerCase(), d));
    return m;
  }, [data]);

  useEffect(() => {
    fetch(DISTRICTS_URL)
      .then((res) => res.json())
      .then((json) => setGeoData(json))
      .catch(console.error);
  }, []);

  const styleFeature = (feature: GeoJSON.Feature | undefined) => {
    if (!feature) return {};
    const marketName = (feature.properties as any)?.marketName || "";
    const market = dataMap.get(marketName.toLowerCase());
    const color = market ? BAND_COLORS[market.band] : "transparent";
    return {
      fillColor: color,
      fillOpacity: 0.5,
      color: market ? BAND_COLORS[market.band] : "transparent",
      weight: 2.5,
      opacity: 0.9,
    };
  };

  const onEachFeature = (feature: GeoJSON.Feature, layer: L.Layer) => {
    const marketName = (feature.properties as any)?.marketName || "";
    const market = dataMap.get(marketName.toLowerCase());
    if (!market) return;

    const tooltipContent = `
      <div style="min-width:180px;font-family:system-ui,sans-serif;">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
          <span style="width:10px;height:10px;border-radius:50%;background:${BAND_COLORS[market.band]};display:inline-block;"></span>
          <strong style="font-size:13px;">${market.marketName}</strong>
          <span style="font-size:10px;font-weight:600;padding:2px 8px;border-radius:99px;margin-left:auto;background:${BAND_COLORS[market.band]}22;color:${BAND_COLORS[market.band]};">${market.band}</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;font-size:11px;">
          <div><div style="color:#888;">Balanced</div><div style="font-weight:600;">${market.balanced.toLocaleString()}</div></div>
          <div><div style="color:#888;">Volume</div><div style="font-weight:600;">${market.volume.toLocaleString()}</div></div>
          <div><div style="color:#888;">%</div><div style="font-weight:600;">${market.percentage}%</div></div>
        </div>
      </div>
    `;

    (layer as L.Path).bindTooltip(tooltipContent, {
      direction: "top",
      offset: [0, -10],
      opacity: 1,
      className: "market-tooltip",
    });

    (layer as L.Path).on({
      mouseover: (e) => {
        const target = e.target as L.Path;
        target.setStyle({
          weight: 4,
          fillOpacity: 0.7,
        });
        target.bringToFront();
      },
      mouseout: (e) => {
        const target = e.target as L.Path;
        target.setStyle({
          weight: 2.5,
          fillOpacity: 0.5,
        });
      },
    });
  };

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden">
      <style>{`
        .market-tooltip {
          background: white !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 8px !important;
          padding: 10px 14px !important;
          box-shadow: 0 4px 16px rgba(0,0,0,0.12) !important;
        }
        .market-tooltip::before {
          border-top-color: white !important;
        }
      `}</style>
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
        {geoData && (
          <GeoJSON
            key="districts"
            data={geoData}
            style={styleFeature}
            onEachFeature={onEachFeature}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default IndiaMap;
