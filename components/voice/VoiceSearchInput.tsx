"use client";

import { useState } from "react";
import { useVoiceSearch } from "@/hooks/useVoiceSearch";
import Icon from "@/components/ui/Icon";
import type { ListingCategory } from "@/lib/types";
import type { Listing } from "@/lib/types";
import { playTTS, formatFilterConfirmation } from "@/lib/voice";

interface VoiceSearchInputProps {
  onSearch: (filters: {
    cat: ListingCategory | "all";
    hood: string;
    priceMax: number | null;
    timeFilter: string | null;
  }) => void;
  allListings: Listing[];
}

const FILTER_LABELS: Record<string, string> = {
  transit: "FOR WHEELS",
  shelter: "FOR RENT",
  gear: "FOR SALE",
  labor: "FOR HIRE",
  free: "FREE PICKS",
  audio: "SOUND KIT",
  people: "CONNECT",
  misc: "ODDITIES",
};

export default function VoiceSearchInput({ onSearch, allListings }: VoiceSearchInputProps) {
  const { state, transcript, parsed, error, startListening, stopListening, reset } = useVoiceSearch();
  const [showResults, setShowResults] = useState(false);

  const handleSearch = () => {
    onSearch({
      cat: (parsed.category as ListingCategory) || "all",
      hood: parsed.hood || "",
      priceMax: parsed.priceMax,
      timeFilter: parsed.timeFilter,
    });
    const confirmation = formatFilterConfirmation({
      cat: parsed.category || undefined,
      hood: parsed.hood || undefined,
      priceMax: parsed.priceMax,
    });
    playTTS(confirmation).catch(() => {});
    setShowResults(true);
  };

  const removeFilter = (key: keyof typeof parsed) => {
    const newParsed = { ...parsed, [key]: null, rawQuery: parsed.rawQuery };
    setShowResults(false);
    // The parent will re-run this — but we need to update the search
    onSearch({
      cat: (newParsed.category as ListingCategory) || "all",
      hood: newParsed.hood || "",
      priceMax: newParsed.priceMax,
      timeFilter: newParsed.timeFilter,
    });
  };

  const hasFilters = parsed.category || parsed.hood || parsed.priceMax || parsed.timeFilter;

  if (state === "listening") {
    return (
      <div className="fixed inset-0 z-50 glass flex flex-col items-center justify-center p-8" style={{ background: "rgba(251,247,240,0.88)" }}>
        {/* Pulsing mic */}
        <div className="relative mb-12">
          <div className="absolute inset-0 rounded-full bg-terracotta/20 animate-ping" style={{ animationDuration: "1.5s" }} />
          <div className="relative w-28 h-28 rounded-full bg-terracotta flex items-center justify-center">
            <Icon name="mic" size={40} className="text-cream" />
          </div>
        </div>

        {/* Live waveform */}
        <div className="flex items-center gap-1 mb-8 h-12">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
            <div
              key={i}
              className="w-1.5 bg-terracotta rounded-full animate-wave-bar"
              style={{
                height: `${12 + Math.sin(i * 0.8) * 16 + Math.random() * 8}px`,
                animationDelay: `${i * 0.07}s`,
                animationDuration: "0.6s",
              }}
            />
          ))}
        </div>

        {/* Transcript */}
        <div className="max-w-md text-center mb-8">
          <p className="font-display text-2xl text-ink italic leading-snug min-h-[60px]">
            {transcript || "Listening..."}
          </p>
        </div>

        {/* Stop button */}
        <button
          onClick={stopListening}
          className="flex items-center gap-2 px-6 py-3 bg-ink text-cream font-data text-[11px] tracking-[0.2em] uppercase"
        >
          <Icon name="pause" size={14} />
          Done
        </button>
      </div>
    );
  }

  if (state === "processing") {
    return (
      <div className="fixed inset-0 z-50 glass flex flex-col items-center justify-center" style={{ background: "rgba(251,247,240,0.88)" }}>
        <div className="flex items-center gap-3 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-terracotta animate-wave-bar" style={{ animationDelay: `${i * 0.15}s`, height: "8px" }} />
          ))}
        </div>
        <p className="font-display text-xl text-mahogany italic">Analyzing...</p>
      </div>
    );
  }

  if (showResults && hasFilters) {
    return (
      <div className="mb-4">
        {/* Filter summary */}
        <div className="bg-paper border-2 border-ink p-4 mb-4 shadow-[3px_3px_0px_#1C1007]">
          <div className="flex items-center justify-between mb-3">
            <span className="font-data text-[9px] tracking-[0.3em] uppercase text-dust">Voice Search Active</span>
            <button onClick={() => { reset(); setShowResults(false); }} className="font-data text-[9px] tracking-[0.2em] uppercase text-dust hover:text-terracotta">
              Clear all ×
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {parsed.category && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-ink text-cream font-data text-[10px] tracking-[0.15em] uppercase">
                {FILTER_LABELS[parsed.category]}
                <button onClick={() => removeFilter("category")} className="ml-1 opacity-70 hover:opacity-100">×</button>
              </span>
            )}
            {parsed.hood && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-terracotta text-cream font-data text-[10px] tracking-[0.15em] uppercase">
                {parsed.hood}
                <button onClick={() => removeFilter("hood")} className="ml-1 opacity-70 hover:opacity-100">×</button>
              </span>
            )}
            {parsed.priceMax && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gold text-ink font-data text-[10px] tracking-[0.15em] uppercase">
                Under ${parsed.priceMax.toLocaleString()}
                <button onClick={() => removeFilter("priceMax")} className="ml-1 opacity-70 hover:opacity-100">×</button>
              </span>
            )}
            {parsed.timeFilter && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sage text-cream font-data text-[10px] tracking-[0.15em] uppercase">
                {parsed.timeFilter}
                <button onClick={() => removeFilter("timeFilter")} className="ml-1 opacity-70 hover:opacity-100">×</button>
              </span>
            )}
          </div>

          {parsed.rawQuery && (
            <p className="font-body text-xs text-dust mt-3 italic">
              &ldquo;{parsed.rawQuery}&rdquo;
            </p>
          )}
        </div>

        {/* Modify search */}
        <button
          onClick={() => { startListening(); setShowResults(false); }}
          className="flex items-center gap-2 font-data text-[10px] tracking-[0.2em] uppercase text-dust hover:text-terracotta"
        >
          <Icon name="mic" size={12} />
          Refine search
        </button>
      </div>
    );
  }

  // Idle state — mic button in filter bar
  return (
    <button
      onClick={startListening}
      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 border border-rule hover:border-ink transition-colors"
      title="Voice search"
    >
      <Icon name="mic" size={13} className="text-mahogany" />
      <span className="font-data text-[10px] tracking-[0.15em] uppercase text-mahogany hidden sm:inline">Voice</span>
    </button>
  );
}
