"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { MOCK_LISTINGS } from "@/lib/data";

interface GeoJSON {
  type: "FeatureCollection";
  features: Feature[];
}

interface Feature {
  type: "Feature";
  properties: { nhood: string };
  geometry: { type: "MultiPolygon"; coordinates: number[][][][] };
}

const LON_MIN = -122.514;
const LON_MAX = -122.357;
const LAT_MIN = 37.708;
const LAT_MAX = 37.832;

const NEIGHBORHOOD_MAP: Record<string, string> = {
  Mission: "Mission",
  SoMa: "South of Market",
  "South of Market": "South of Market",
  "North Beach": "North Beach",
  Castro: "Castro/Upper Market",
  "Castro/Upper Market": "Castro/Upper Market",
  "Hayes Valley": "Hayes Valley",
  "Outer Sunset": "Sunset/Parkside",
  "Inner Richmond": "Inner Richmond",
  Dogpatch: "Mission Bay",
  "Mission Bay": "Mission Bay",
  "Noe Valley": "Noe Valley",
  "Pacific Heights": "Pacific Heights",
  Bayview: "Bayview Hunters Point",
  "Bayview Hunters Point": "Bayview Hunters Point",
  Excelsior: "Excelsior",
  "Glen Park": "Glen Park",
  "Civic Center": "Tenderloin",
  Tenderloin: "Tenderloin",
  Presidio: "Presidio",
  "Financial District": "Financial District/South Beach",
  "South Beach": "Financial District/South Beach",
  "Inner Sunset": "Inner Sunset",
  Haight: "Haight Ashbury",
  "Haight Ashbury": "Haight Ashbury",
  Marina: "Marina",
  "Nob Hill": "Nob Hill",
  "Russian Hill": "Russian Hill",
  "Potrero Hill": "Potrero Hill",
  "Bernal Heights": "Bernal Heights",
  Chinatown: "Chinatown",
  "Lincoln Park": "Lincoln Park",
  "Seacliff": "Seacliff",
  "Treasure Island": "Treasure Island",
  "Twin Peaks": "Twin Peaks",
  "Lakeshore": "Lakeshore",
  "Outer Mission": "Outer Mission",
  Portola: "Portola",
  "Western Addition": "Western Addition",
  "McLaren Park": "McLaren Park",
  "Oceanview": "Oceanview/Merced/Ingleside",
  "Lone Mountain": "Lone Mountain/USF",
  "Presidio Heights": "Presidio Heights",
  Japantown: "Japantown",
  "Golden Gate Park": "Golden Gate Park",
};

const REVERSE_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(NEIGHBORHOOD_MAP).map(([k, v]) => [v.toLowerCase(), k])
);

const KIND_STYLES: Record<string, { fill: string; label: string }> = {
  high:     { fill: "#E8572A", label: "HIGH" },
  trending: { fill: "#F0B429", label: "TRENDING" },
  low:      { fill: "#5B7F5E", label: "LOW" },
};

function project(lon: number, lat: number): [number, number] {
  const x = ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * 100;
  const y = 100 - ((lat - LAT_MIN) / (LAT_MAX - LAT_MIN)) * 100;
  return [x, y];
}

function polygonPath(coords: number[][][]): string {
  return coords.map((ring) =>
    ring.map(([lon, lat]) => {
      const [x, y] = project(lon, lat);
      return `${x},${y}`;
    }).join(" L")
  ).join(" Z ");
}

function multipolygonPath(coords: number[][][][]): string {
  return coords.map((polygon) => `M${polygonPath(polygon)}`).join(" ");
}

function zoneKind(sfName: string): "high" | "trending" | "low" {
  const count = MOCK_LISTINGS.filter((l) => {
    return (NEIGHBORHOOD_MAP[l.hood] || l.hood).toLowerCase() === sfName.toLowerCase();
  }).length;
  return count > 8 ? "high" : count > 3 ? "trending" : "low";
}

function zoneStats(sfName: string) {
  const zoneLs = MOCK_LISTINGS.filter((l) => {
    return (NEIGHBORHOOD_MAP[l.hood] || l.hood).toLowerCase() === sfName.toLowerCase();
  });
  const count = zoneLs.length;
  const prices = zoneLs.map((l) => l.price).filter((p) => p > 0);
  const avg = prices.length ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;
  return { count, avg };
}

interface MapOverlayProps {
  onClose: () => void;
  onSelectHood: (hood: string) => void;
  selectedHood?: string | null;
}

export default function MapOverlay({ onClose, onSelectHood, selectedHood }: MapOverlayProps) {
  const [geojson, setGeojson] = useState<GeoJSON | null>(null);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    fetch("/geo/sf-neighborhoods.json")
      .then((r) => r.json())
      .then((data: GeoJSON) => setGeojson(data))
      .catch(() => setMapError(true));
  }, []);

  const handleZoneClick = useCallback(
    (sfName: string) => {
      const listingHood = REVERSE_MAP[sfName.toLowerCase()] || sfName;
      onSelectHood(listingHood);
      onClose();
    },
    [onSelectHood, onClose]
  );

  return (
    <div className="fixed inset-0 z-50 bg-cream/98 backdrop-blur-md flex flex-col">
      {/* Header */}
      <div className="border-b-2 border-ink bg-paper px-4 md:px-8 py-5">
        <div className="max-w-5xl mx-auto flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-terracotta animate-pulse" />
              <span className="font-data text-[9px] tracking-[0.35em] uppercase text-dust">
                Signal Map · San Francisco
              </span>
            </div>
            <h1 className="font-display font-black text-3xl md:text-4xl text-ink leading-none">
              Browse by Zone
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4 font-data text-[10px] tracking-[0.15em] text-dust">
              {Object.entries(KIND_STYLES).map(([kind, s]) => (
                <span key={kind} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: s.fill }} />
                  {s.label}
                </span>
              ))}
            </div>
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2 border border-ink font-data text-[10px] tracking-[0.2em] uppercase text-ink hover:bg-ink hover:text-cream transition-colors"
            >
              <Icon name="close" size={14} />
              Close
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row">
        {/* Map */}
        <div className="flex-1 relative flex items-center justify-center p-6 md:p-8 overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle, rgba(28,16,7,0.07) 1px, transparent 1px)`,
              backgroundSize: "18px 18px",
            }}
          />

          {mapError ? (
            <div className="text-center text-dust font-data text-sm tracking-widest uppercase">
              Map unavailable
            </div>
          ) : geojson ? (
            <svg
              viewBox="0 0 100 100"
              className="w-full max-w-xl drop-shadow-lg"
              style={{ filter: "drop-shadow(0 4px 12px rgba(28,16,7,0.15))" }}
            >
              {geojson.features.map((feature) => {
                const sfName = feature.properties.nhood;
                if (!sfName) return null;
                const kind = zoneKind(sfName);
                const isHovered = hoveredZone === sfName;
                const isSelected = selectedHood &&
                  (NEIGHBORHOOD_MAP[selectedHood] || selectedHood).toLowerCase() === sfName.toLowerCase();
                const s = KIND_STYLES[kind];

                return (
                  <path
                    key={sfName}
                    d={multipolygonPath(feature.geometry.coordinates)}
                    fill={s.fill}
                    fillOpacity={isHovered ? 0.85 : isSelected ? 0.9 : 0.55}
                    stroke={isHovered || isSelected ? "#1C1007" : "rgba(28,16,7,0.25)"}
                    strokeWidth={isHovered || isSelected ? 0.6 : 0.3}
                    onClick={() => handleZoneClick(sfName)}
                    onMouseEnter={() => setHoveredZone(sfName)}
                    onMouseLeave={() => setHoveredZone(null)}
                    style={{ cursor: "pointer", transition: "fill-opacity 0.15s, stroke 0.15s" }}
                  />
                );
              })}
            </svg>
          ) : (
            <div className="flex flex-col items-center gap-3 text-dust">
              <div className="w-8 h-8 border-2 border-dust border-t-transparent rounded-full animate-spin" />
              <span className="font-data text-[10px] tracking-[0.2em] uppercase">Loading map</span>
            </div>
          )}
        </div>

        {/* Zone sidebar — shown when a zone is hovered */}
        {hoveredZone && (
          <div className="md:w-64 border-t md:border-t-0 md:border-l border-rule bg-paper p-5">
            <div className="font-data text-[9px] tracking-[0.3em] uppercase text-dust mb-2">
              {hoveredZone}
            </div>
            <div className="space-y-2 font-data text-[11px] text-ink">
              <div className="flex justify-between">
                <span className="text-dust">Listings</span>
                <span className="font-black text-base">{zoneStats(hoveredZone).count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-dust">Avg price</span>
                <span className="font-black text-base">
                  {zoneStats(hoveredZone).avg > 0 ? `$${zoneStats(hoveredZone).avg.toLocaleString()}` : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-dust">Signal</span>
                <span
                  className="font-black text-base uppercase"
                  style={{ color: KIND_STYLES[zoneKind(hoveredZone)].fill }}
                >
                  {KIND_STYLES[zoneKind(hoveredZone)].label}
                </span>
              </div>
            </div>
            <button
              onClick={() => handleZoneClick(hoveredZone)}
              className="mt-4 w-full px-4 py-2.5 bg-terracotta text-cream font-data text-[10px] tracking-[0.2em] uppercase btn-shine hover:bg-[#CC4A1E] transition-colors"
            >
              Filter Feed →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}