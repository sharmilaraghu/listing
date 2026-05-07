"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CATEGORIES } from "@/lib/data";
import ListingCard from "@/components/ui/ListingCard";
import Icon from "@/components/ui/Icon";
import VoiceSearchInput from "@/components/voice/VoiceSearchInput";
import MapOverlay from "@/components/MapOverlay";
import type { ListingCategory } from "@/lib/types";
import type { Listing } from "@/lib/types";
import { useListings } from "@/hooks/useListings";
import { useCityContext } from "@/lib/cityContext";
import { SkeletonGrid } from "@/components/ui/Skeleton";

const NEIGHBORHOODS = [
  "Mission", "SoMa", "North Beach", "Castro", "Hayes Valley",
  "Outer Sunset", "Inner Richmond", "Dogpatch", "Noe Valley",
  "Pacific Heights", "Bayview", "Excelsior", "Glen Park", "Civic Center",
];

const SORT_OPTIONS = [
  { value: "recent", label: "Most Recent" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "trust", label: "Seller Trust" },
];

function FeedContent() {
  const searchParams = useSearchParams();
  const initialCat = (searchParams.get("cat") as ListingCategory) || "all";
  const initialHood = searchParams.get("hood") || "";
  const initialQuery = searchParams.get("q") || "";
  const initialMap = searchParams.get("map") === "true";

  const [cat, setCat] = useState<ListingCategory | "all">(initialCat);
  const [hood, setHood] = useState(initialHood);
  const [searchQuery] = useState(initialQuery);
  const [priceMax, setPriceMax] = useState<number | null>(null);
  const [sort, setSort] = useState("recent");
  const [view, setView] = useState<"grid" | "row">("grid");
  const [showHoodFilter, setShowHoodFilter] = useState(false);
  const [showMap, setShowMap] = useState(initialMap);
  const { city } = useCityContext();

  const { listings: rawListings, isLoading, source } = useListings({ cat, q: searchQuery, hood });

  const filtered = rawListings.filter((l) => {
    if (priceMax !== null && l.price > priceMax) return false;
    return true;
  }).sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    if (sort === "trust") return b.seller.score - a.seller.score;
    return 0;
  });

  const handleVoiceSearch = (filters: { cat: ListingCategory | "all"; hood: string; priceMax: number | null; timeFilter: string | null }) => {
    setCat(filters.cat);
    setHood(filters.hood);
    setPriceMax(filters.priceMax);
  };

  const FLOAT_ICONS = [
    { path: "M10 20 L30 5 L50 20 L47 40 L13 40 Z", delay: "0s", left: "5%", top: "15%" },
    { path: "M25 5 A15 15 0 1 1 25 35 A15 15 0 1 1 25 5 M20 20 L30 20 M25 15 L25 25", delay: "2.5s", left: "88%", top: "25%" },
    { path: "M5 30 L25 5 L45 30 M15 30 L35 30 M20 30 L20 45 L30 45 L30 30", delay: "5s", left: "15%", top: "55%" },
    { path: "M10 10 L40 10 L40 35 L10 35 Z M10 18 L40 18 M22 10 L22 35", delay: "7s", left: "80%", top: "60%" },
    { path: "M25 8 A5 5 0 1 1 25 18 M15 40 Q10 25 25 18 Q40 25 35 40", delay: "4s", left: "50%", top: "70%" },
    { path: "M5 25 L15 10 L25 25 M35 25 L45 10 L55 25 M5 45 L15 30 L25 45 M35 45 L45 30 L55 45", delay: "9s", left: "70%", top: "10%" },
  ];

  return (
    <div className="relative flex flex-col min-h-screen">
      {/* Floating icon silhouettes */}
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {FLOAT_ICONS.map((icon, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{ left: icon.left, top: icon.top, animationDelay: icon.delay, opacity: 0.04 }}
          >
            <svg width="80" height="80" viewBox="0 0 60 60" fill="none">
              <path d={icon.path} stroke="#3D1F0E" strokeWidth="1.5" strokeLinecap="square" />
            </svg>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="border-b border-rule bg-paper px-4 md:px-8 sticky top-24 z-30">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4 py-4">
          {/* Category pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setCat("all")}
              className={`shrink-0 px-3 py-1.5 font-data text-[10px] tracking-[0.2em] uppercase border transition-colors ${
                cat === "all"
                  ? "bg-ink text-cream border-ink"
                  : "bg-transparent text-mahogany border-rule hover:border-ink"
              }`}
            >
              All
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setCat(c.id)}
                className={`shrink-0 px-3 py-1.5 font-data text-[10px] tracking-[0.2em] uppercase border transition-colors ${
                  cat === c.id
                    ? "bg-ink text-cream border-ink"
                    : "bg-transparent text-mahogany border-rule hover:border-ink"
                }`}
              >
                {c.label}
              </button>
            ))}

            {/* Neighborhood filter */}
            <div className="relative">
              <button
                onClick={() => setShowHoodFilter(!showHoodFilter)}
                className={`shrink-0 px-3 py-1.5 font-data text-[10px] tracking-[0.2em] uppercase border transition-colors flex items-center gap-1.5 ${
                  hood ? "bg-terracotta text-cream border-terracotta" : "bg-transparent text-mahogany border-rule hover:border-ink"
                }`}
              >
                <Icon name="pin" size={10} />
                {hood || "Zone"}
                {hood && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setHood(""); }}
                    className="ml-1 hover:opacity-70"
                  >
                    <Icon name="close" size={8} />
                  </button>
                )}
              </button>
              {showHoodFilter && (
                <div className="absolute top-full left-0 mt-1 bg-paper border border-ink shadow-[2px_2px_0px_#1C1007] z-50 w-48 max-h-64 overflow-y-auto no-scrollbar">
                  {NEIGHBORHOODS.map((h) => (
                    <button
                      key={h}
                      onClick={() => { setHood(h); setShowHoodFilter(false); }}
                      className="block w-full text-left px-3 py-2 font-data text-[10px] tracking-[0.15em] uppercase text-mahogany hover:bg-cream hover:text-ink transition-colors"
                    >
                      {h}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="ml-auto flex items-center gap-3 shrink-0">
            {/* Voice search */}
            <VoiceSearchInput onSearch={handleVoiceSearch} allListings={filtered} />

            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-1.5 bg-transparent border border-rule font-data text-[10px] tracking-[0.15em] text-mahogany outline-none hover:border-ink transition-colors"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            {/* Map overlay toggle */}
            <button
              onClick={() => setShowMap(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 font-data text-[10px] tracking-[0.15em] uppercase border border-rule text-mahogany hover:border-ink transition-colors"
            >
              <Icon name="map" size={12} />
              <span className="hidden sm:inline">Map</span>
            </button>

            {/* View toggle */}
            <div className="flex items-center border border-rule">
              <button
                onClick={() => setView("grid")}
                className={`p-1.5 ${view === "grid" ? "bg-ink text-cream" : "text-mahogany hover:bg-paper"} transition-colors`}
              >
                <Icon name="grid" size={14} />
              </button>
              <button
                onClick={() => setView("row")}
                className={`p-1.5 ${view === "row" ? "bg-ink text-cream" : "text-mahogany hover:bg-paper"} transition-colors`}
              >
                <Icon name="list" size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 py-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex items-center gap-3 flex-wrap">
            <span className="font-data text-[10px] tracking-[0.2em] text-mahogany">
              {isLoading ? "Loading..." : `${filtered.length} results`}
            </span>
            <span className={`font-data text-[9px] tracking-[0.2em] uppercase px-1.5 py-0.5 ${
              source === "craigslist"
                ? "text-sage border border-sage"
                : "text-dust border border-rule"
            }`}>
              {source === "craigslist" ? "● live" : "mock"}
            </span>
            <span className="font-data text-[9px] tracking-[0.2em] text-dust uppercase">{city.label}</span>
            {searchQuery && (
              <span className="font-data text-[10px] tracking-[0.2em] text-terracotta">
                "{searchQuery}"
              </span>
            )}
            {cat !== "all" && (
              <span className="font-data text-[10px] tracking-[0.2em] text-dust">
                · {CATEGORIES.find((c) => c.id === cat)?.label}
              </span>
            )}
            {hood && <span className="font-data text-[10px] tracking-[0.2em] text-dust">· {hood}</span>}
            {priceMax !== null && (
              <span className="font-data text-[10px] tracking-[0.2em] text-gold">
                · under ${priceMax.toLocaleString()}
              </span>
            )}
          </div>

          {isLoading ? (
            <SkeletonGrid count={6} />
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-6xl mb-4">🔍</div>
              <p className="font-display text-2xl text-mahogany">No listings found</p>
              <p className="font-body text-dust mt-2">Try a different category or search term</p>
            </div>
          ) : view === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filtered.map((listing) => (
                <ListingCard key={listing.id} listing={listing} variant={"row"} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Map overlay */}
      {showMap && (
        <MapOverlay
          onClose={() => setShowMap(false)}
          onSelectHood={setHood}
          selectedHood={hood}
        />
      )}
    </div>
  );
}

export default function FeedScreen() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream" />}>
      <FeedContent />
    </Suspense>
  );
}
