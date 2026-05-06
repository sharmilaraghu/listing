"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MOCK_LISTINGS } from "@/lib/data";
import Icon from "@/components/ui/Icon";

interface SFNeighborhood {
  name: string;
  id: string;
  kind: "high" | "trending" | "low";
}

interface FeatureProperties {
  nhood: string;
}

interface Feature {
  type: "Feature";
  properties: FeatureProperties;
  geometry: {
    type: "MultiPolygon";
    coordinates: number[][][][];
  };
}

interface GeoJSON {
  type: "FeatureCollection";
  features: Feature[];
  crs?: { type: string; properties: { name: string } };
}

// SF bounding box from the GeoJSON data
const LON_MIN = -122.514;
const LON_MAX = -122.357;
const LAT_MIN = 37.708;
const LAT_MAX = 37.832;

// Map our listing neighborhood names → official SF names
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
  "Portola": "Portola",
  "Western Addition": "Western Addition",
  "McLaren Park": "McLaren Park",
  "Oceanview": "Oceanview/Merced/Ingleside",
  "Lone Mountain": "Lone Mountain/USF",
  "Presidio Heights": "Presidio Heights",
  "Japantown": "Japantown",
  "Golden Gate Park": "Golden Gate Park",
};

// Reverse lookup
const REVERSE_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(NEIGHBORHOOD_MAP).map(([k, v]) => [v.toLowerCase(), k])
);

const KIND_STYLES: Record<string, { fill: string; stroke: string; glow: string; label: string }> = {
  high:     { fill: "#E8572A", stroke: "#B3401A", glow: "rgba(232,87,42,0.4)", label: "HIGH ACTIVITY" },
  trending: { fill: "#F0B429", stroke: "#C49010", glow: "rgba(240,180,41,0.35)", label: "TRENDING" },
  low:      { fill: "#5B7F5E", stroke: "#3D5A3D", glow: "rgba(91,127,94,0.3)", label: "LOW ACTIVITY" },
};

// Project GeoJSON [lon, lat] → SVG [x, y]
function project(lon: number, lat: number): [number, number] {
  const x = ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * 100;
  const y = 100 - ((lat - LAT_MIN) / (LAT_MAX - LAT_MIN)) * 100;
  return [x, y];
}

function polygonPath(coords: number[][][]): string {
  const pts = coords.map((ring) =>
    ring.map(([lon, lat]) => {
      const [x, y] = project(lon, lat);
      return `${x},${y}`;
    }).join(" L")
  );
  return pts.map((p, i) => (i === 0 ? `M${p}` : `M${p}`)).join(" ");
}

function multipolygonPath(coords: number[][][][]): string {
  return coords.map((polygon) => polygonPath(polygon)).join(" ");
}

export default function ScannerScreen() {
  const router = useRouter();
  const [geojson, setGeojson] = useState<GeoJSON | null>(null);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    fetch("/geo/sf-neighborhoods.json")
      .then((r) => r.json())
      .then((data: GeoJSON) => {
        setGeojson(data);
      })
      .catch(() => setMapError(true));
  }, []);

  const handleZoneClick = useCallback(
    (sfName: string) => {
      setSelectedZone((prev) => {
        const next = prev === sfName ? null : sfName;
        const listingHood = next ? (REVERSE_MAP[sfName.toLowerCase()] || sfName) : "";
        router.replace(listingHood ? `/feed?hood=${encodeURIComponent(listingHood)}` : "/feed");
        return next;
      });
    },
    [router]
  );

  // Zone listings
  const zoneListings = MOCK_LISTINGS.filter((l) => {
    if (!selectedZone) return true;
    const sfName = NEIGHBORHOOD_MAP[l.hood] || l.hood;
    return sfName.toLowerCase() === selectedZone.toLowerCase();
  });

  // Zone stats
  const zoneStats = (sfName: string) => {
    const listingHood = REVERSE_MAP[sfName.toLowerCase()] || sfName;
    const zoneLs = MOCK_LISTINGS.filter((l) => {
      return (NEIGHBORHOOD_MAP[l.hood] || l.hood).toLowerCase() === sfName.toLowerCase();
    });
    const count = zoneLs.length;
    const prices = zoneLs.map((l) => l.price).filter((p) => p > 0);
    const avg = prices.length ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;
    const signal = count > 8 ? "HIGH" : count > 4 ? "MED" : "LOW";
    return { count, avg, signal };
  };

  // Assign kind to each neighborhood based on listing count
  const zoneKind = (sfName: string): "high" | "trending" | "low" => {
    const count = MOCK_LISTINGS.filter((l) => {
      return (NEIGHBORHOOD_MAP[l.hood] || l.hood).toLowerCase() === sfName.toLowerCase();
    }).length;
    return count > 8 ? "high" : count > 3 ? "trending" : "low";
  };

  const allZones = geojson?.features.map((f) => f.properties.nhood).filter(Boolean) || [];

  return (
    <div className="flex flex-col min-h-screen bg-cream">
      {/* Header */}
      <div className="border-b-2 border-ink bg-paper px-4 md:px-8 py-5">
        <div className="max-w-7xl mx-auto flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-terracotta animate-pulse" />
              <span className="font-data text-[9px] tracking-[0.35em] uppercase text-dust">
                Live Signal Map · San Francisco
              </span>
            </div>
            <h1 className="font-display font-black text-4xl md:text-5xl text-ink leading-none">
              Scanner
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-5 font-data text-[10px] tracking-[0.15em] text-dust">
            {Object.entries(KIND_STYLES).map(([kind, s]) => (
              <span key={kind} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: s.fill }} />
                {s.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* ── Map ── */}
        <div className="flex-1 relative flex items-center justify-center p-6 md:p-8 bg-cream overflow-hidden">
          {/* Dot grid background */}
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
          ) : (
            <div className="relative w-full max-w-2xl">
              {/* SF Map SVG */}
              <svg
                viewBox="0 0 100 100"
                className="w-full h-auto"
                style={{ filter: "drop-shadow(0 6px 20px rgba(28,16,7,0.12))" }}
              >
                {/* Base water / bay tint */}
                <rect x="0" y="0" width="100" height="100" fill="rgba(245,237,216,0.6)" />

                {/* Neighborhood polygons */}
                {geojson?.features.map((feature) => {
                  const sfName = feature.properties.nhood;
                  const kind = zoneKind(sfName);
                  const style = KIND_STYLES[kind];
                  const isSelected = selectedZone === sfName;
                  const isHovered = hoveredZone === sfName;
                  const path = multipolygonPath(feature.geometry.coordinates);

                  return (
                    <g key={sfName}>
                      <path
                        d={path}
                        fill={style.fill}
                        fillOpacity={isSelected ? 0.5 : isHovered ? 0.3 : 0.15}
                        stroke={isSelected ? style.stroke : isHovered ? style.fill : "rgba(28,16,7,0.2)"}
                        strokeWidth={isSelected ? 0.6 : isHovered ? 0.45 : 0.25}
                        className="transition-all duration-200 cursor-pointer"
                        onClick={() => handleZoneClick(sfName)}
                        onMouseEnter={() => setHoveredZone(sfName)}
                        onMouseLeave={() => setHoveredZone(null)}
                      />
                      {/* Pulse ring on selected */}
                      {isSelected && (
                        <path
                          d={path}
                          fill="none"
                          stroke={style.fill}
                          strokeWidth="0.8"
                          strokeOpacity="0.5"
                          className="animate-pulse-ring"
                        />
                      )}
                    </g>
                  );
                })}

                {/* Listing pins */}
                {MOCK_LISTINGS.slice(0, 20).map((listing) => {
                  const [lon, lat] = listing.coords;
                  const isValidCoord = lon < -122 && lat > 37;
                  if (!isValidCoord) return null;
                  const [x, y] = project(lon, lat);
                  const badgeColor =
                    listing.badge === "fire" ? "#E8572A" :
                    listing.badge === "rare" ? "#F0B429" : "#5B7F5E";
                  return (
                    <a key={listing.id} href={`/listing/${listing.id}`} style={{ pointerEvents: "all" }}>
                      <circle
                        cx={x}
                        cy={y}
                        r="1.3"
                        fill={badgeColor}
                        stroke="#FBF7F0"
                        strokeWidth="0.5"
                        opacity="0.9"
                      />
                    </a>
                  );
                })}
              </svg>

              {/* Hover tooltip */}
              {hoveredZone && (
                <div
                  className="absolute top-3 right-3 bg-paper border-2 border-ink p-4 shadow-[4px_4px_0px_#1C1007] min-w-[170px] z-10"
                  style={{ pointerEvents: "none" }}
                >
                  <div className="font-display font-black text-base text-ink mb-2 leading-tight">
                    {hoveredZone}
                  </div>
                  {(() => {
                    const s = zoneStats(hoveredZone);
                    const kind = s.signal === "HIGH" ? "high" : s.signal === "MED" ? "trending" : "low";
                    return (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-6">
                          <span className="font-data text-[9px] tracking-[0.2em] text-dust uppercase">Listings</span>
                          <span className="font-data text-sm font-bold text-ink">{s.count}</span>
                        </div>
                        {s.avg > 0 && (
                          <div className="flex items-center justify-between gap-6">
                            <span className="font-data text-[9px] tracking-[0.2em] text-dust uppercase">Avg</span>
                            <span className="font-data text-sm text-ink">${s.avg.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between gap-6">
                          <span className="font-data text-[9px] tracking-[0.2em] text-dust uppercase">Signal</span>
                          <span
                            className={`font-data text-sm font-bold ${
                              s.signal === "HIGH" ? "text-terracotta" : s.signal === "MED" ? "text-gold" : "text-sage"
                            }`}
                          >
                            {s.signal}
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Selected zone highlight label */}
              {selectedZone && (
                <div className="absolute bottom-3 left-3 bg-paper border border-ink px-3 py-2 shadow-[3px_3px_0px_#1C1007]">
                  <span className="font-data text-[9px] tracking-[0.25em] uppercase text-dust">
                    Selected:
                  </span>
                  <span className="font-display font-black text-sm text-ink ml-2">
                    {REVERSE_MAP[selectedZone.toLowerCase()] || selectedZone}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div className="lg:w-80 border-t lg:border-t-0 lg:border-l-2 border-ink bg-paper flex flex-col">
          <div className="p-5 border-b-2 border-ink">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-sage animate-pulse" />
              <span className="font-data text-[9px] tracking-[0.3em] uppercase text-dust">Live Feed</span>
            </div>
            <h2 className="font-display font-black text-xl text-ink">
              {selectedZone ? (REVERSE_MAP[selectedZone.toLowerCase()] || selectedZone) : "All SF"}
            </h2>
            <p className="font-data text-[10px] tracking-[0.15em] text-dust mt-0.5">
              {zoneListings.length} listings detected
            </p>
          </div>

          {/* Clear zone */}
          {selectedZone && (
            <button
              onClick={() => {
                setSelectedZone(null);
                router.replace("/feed");
              }}
              className="flex items-center gap-2 px-5 py-2.5 border-b border-rule font-data text-[9px] tracking-[0.2em] uppercase text-dust hover:text-terracotta hover:border-terracotta transition-colors"
            >
              <Icon name="close" size={10} />
              Clear zone
            </button>
          )}

          {/* Listing feed */}
          <div
            className="flex-1 overflow-y-auto no-scrollbar divide-y divide-rule"
            style={{ maxHeight: "calc(100vh - 240px)" }}
          >
            {zoneListings.length === 0 ? (
              <div className="p-6 text-center">
                <p className="font-display text-base text-dust">No listings here yet</p>
                <p className="font-data text-[9px] tracking-[0.15em] text-dust/60 mt-1 uppercase">
                  Check back soon
                </p>
              </div>
            ) : (
              zoneListings.map((listing) => {
                const badgeColor =
                  listing.badge === "fire" ? "#E8572A" :
                  listing.badge === "rare" ? "#F0B429" : "#5B7F5E";
                return (
                  <a
                    key={listing.id}
                    href={`/listing/${listing.id}`}
                    className="flex items-start gap-3 p-4 hover:bg-cream transition-colors group"
                  >
                    <div className="mt-1 w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: badgeColor }} />
                    <div className="min-w-0 flex-1">
                      <div className="font-display text-sm text-ink leading-tight truncate group-hover:text-terracotta transition-colors">
                        {listing.title}
                      </div>
                      <div className="font-data text-[10px] tracking-[0.12em] text-dust mt-1 flex items-center gap-2 flex-wrap">
                        <span>{listing.hood}</span>
                        <span>·</span>
                        <span className={listing.price === 0 ? "text-sage" : "text-ink font-bold"}>
                          {listing.price === 0 ? "FREE" : `$${listing.price.toLocaleString()}`}
                        </span>
                      </div>
                    </div>
                  </a>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="border-t-2 border-ink px-5 py-3">
            <div className="flex items-center gap-2">
              <Icon name="sat" size={12} className="text-dust" />
              <span className="font-data text-[9px] tracking-[0.2em] text-dust uppercase flex-1">
                {allZones.length} neighborhoods · {MOCK_LISTINGS.length} total
              </span>
              <span className="font-data text-[9px] tracking-[0.1em] text-sage">● LIVE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
