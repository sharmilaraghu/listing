"use client";

import { useState } from "react";
import Link from "next/link";
import { useCompareContext } from "@/components/compare/CompareContext";
import { playTTS } from "@/lib/voice";
import Icon from "@/components/ui/Icon";
import ListingCard from "@/components/ui/ListingCard";
import type { Listing } from "@/lib/types";

const CAT_COLORS: Record<string, string> = {
  transit: "#E8572A", shelter: "#3D1F0E", gear: "#F0B429",
  labor: "#5B7F5E", free: "#E8572A", audio: "#3D1F0E",
  people: "#5B7F5E", misc: "#F0B429",
};

function formatComparisonFallback(a: Listing, b: Listing): string {
  const priceCompare = a.price === b.price
    ? `both listed at $${a.price === 0 ? "free" : a.price}`
    : a.price === 0 ? `${b.title} is free, ${a.title} is priced`
    : b.price === 0 ? `${a.title} is free, ${b.title} is priced`
    : `prices are $${a.price} vs $${b.price}`;
  return `${a.title} versus ${b.title}. ${priceCompare}. Both in ${a.hood === b.hood ? a.hood : a.hood + " and " + b.hood}. Seller trust: ${a.seller.name} at ${a.seller.score}, ${b.seller.name} at ${b.seller.score}.`;
}

interface ComparisonRowProps {
  label: string;
  a: React.ReactNode;
  b: React.ReactNode;
  highlight?: boolean;
}

function ComparisonRow({ label, a, b, highlight }: ComparisonRowProps) {
  return (
    <div className={`grid grid-cols-3 border-b border-rule last:border-0 ${highlight ? "bg-cream" : ""}`}>
      <div className="px-4 py-3 flex items-center">
        <span className="font-data text-[9px] tracking-[0.2em] uppercase text-dust">{label}</span>
      </div>
      <div className={`px-4 py-3 border-x border-rule ${highlight ? "bg-terracotta/5" : ""}`}>
        {a}
      </div>
      <div className="px-4 py-3">
        {b}
      </div>
    </div>
  );
}

export default function CompareScreen() {
  const { selected, stopCompare, clear } = useCompareContext();
  const [speaking, setSpeaking] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [geminiSummary, setGeminiSummary] = useState<string | null>(null);
  const a = selected[0];
  const b = selected[1];

  const hearComparison = async () => {
    if (speaking || !a || !b) return;
    setThinking(true);
    setGeminiSummary(null);

    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ a, b }),
      });
      if (!res.ok) throw new Error("Gemini failed");
      const data = await res.json();
      setGeminiSummary(data.summary);
      setSpeaking(true);
      await playTTS(data.summary);
    } catch {
      const fallback = formatComparisonFallback(a, b);
      setGeminiSummary(fallback);
      setSpeaking(true);
      await playTTS(fallback);
    } finally {
      setThinking(false);
      setSpeaking(false);
    }
  };

  if (!a || !b) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-8">
        <div className="font-display font-black text-4xl text-dust/40 mb-4">Nothing to compare</div>
        <p className="font-body text-mahogany mb-8">Select two listings from the feed to compare them.</p>
        <Link href="/feed" className="px-6 py-3 bg-ink text-cream font-data text-[11px] tracking-[0.2em] uppercase btn-shine">
          Browse Listings
        </Link>
      </div>
    );
  }

  const colorA = CAT_COLORS[a.cat] || "#E8572A";
  const colorB = CAT_COLORS[b.cat] || "#E8572A";

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="border-b-2 border-ink bg-paper px-4 md:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-data text-[9px] tracking-[0.35em] uppercase text-dust">Comparison</span>
              </div>
              <h1 className="font-display font-black text-4xl text-ink">Compare Listings</h1>
              <p className="font-data text-[10px] tracking-[0.2em] text-dust mt-1">
                {a.hood === b.hood ? a.hood : `${a.hood} vs ${b.hood}`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Hear comparison */}
              <button
                onClick={hearComparison}
                disabled={thinking || speaking}
                className={`flex items-center gap-2 px-5 py-3 font-data text-[11px] tracking-[0.2em] uppercase border-2 border-ink transition-colors ${
                  thinking
                    ? "bg-gold/20 border-gold text-gold"
                    : speaking
                    ? "bg-terracotta/10 border-terracotta text-terracotta"
                    : "bg-ink text-cream hover:bg-[#2D2315]"
                }`}
              >
                {thinking ? (
                  <>
                    <span className="flex gap-px">
                      {[1,2,3,4,5].map(i => (
                        <span
                          key={i}
                          className="w-0.5 bg-gold rounded-full animate-wave-bar"
                          style={{ height: 12, animationDelay: `${i * 0.08}s` }}
                        />
                      ))}
                    </span>
                    Analysing...
                  </>
                ) : speaking ? (
                  <>
                    <span className="flex items-center gap-0.5">
                      {[1,2,3,4].map(i => (
                        <span
                          key={i}
                          className="w-0.5 bg-terracotta rounded-full animate-wave-bar"
                          style={{ height: 10, animationDelay: `${i * 0.08}s` }}
                        />
                      ))}
                    </span>
                    Playing...
                  </>
                ) : (
                  <>
                    <Icon name="speak" size={13} />
                    Hear Comparison
                  </>
                )}
              </button>

              <Link
                href="/feed"
                onClick={() => { stopCompare(); clear(); }}
                className="px-4 py-2 font-data text-[10px] tracking-[0.2em] uppercase border border-rule text-dust hover:border-ink hover:text-ink transition-colors"
              >
                Back to Feed
              </Link>
            </div>
          </div>

          {/* Gemini summary preview */}
          {geminiSummary && !thinking && !speaking && (
            <div className="mt-4 bg-cream border border-rule p-4 max-w-2xl">
              <div className="font-data text-[9px] tracking-[0.3em] uppercase text-dust mb-2">Gemini Summary</div>
              <p className="font-body text-sm text-mahogany italic leading-relaxed">"{geminiSummary}"</p>
            </div>
          )}
        </div>
      </div>

      {/* Comparison table */}
      <div className="flex-1 py-10 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Listing headers */}
          <div className="grid grid-cols-3 border-2 border-ink mb-0">
            <div className="p-0" />
            <div className="border-x-2 border-ink p-4 bg-cream">
              <div className="font-data text-[9px] tracking-[0.3em] uppercase text-dust mb-2">Listing A</div>
              <h2 className="font-display font-black text-xl text-ink leading-tight mb-1">{a.title}</h2>
              <div className="font-data text-[10px] tracking-[0.15em] uppercase" style={{ color: colorA }}>{a.cat}</div>
            </div>
            <div className="p-4 bg-cream">
              <div className="font-data text-[9px] tracking-[0.3em] uppercase text-dust mb-2">Listing B</div>
              <h2 className="font-display font-black text-xl text-ink leading-tight mb-1">{b.title}</h2>
              <div className="font-data text-[10px] tracking-[0.15em] uppercase" style={{ color: colorB }}>{b.cat}</div>
            </div>
          </div>

          {/* Rows */}
          <ComparisonRow
            label="Price"
            highlight
            a={<span className="font-display font-black text-2xl text-ink">{a.price === 0 ? "FREE" : `$${a.price}`}</span>}
            b={<span className="font-display font-black text-2xl text-ink">{b.price === 0 ? "FREE" : `$${b.price}`}</span>}
          />
          <ComparisonRow
            label="Zone"
            a={<span className="font-display text-sm text-ink">{a.hood}</span>}
            b={<span className="font-display text-sm text-ink">{b.hood}</span>}
          />
          <ComparisonRow
            label="Category"
            a={<span className="inline-block px-2 py-0.5 font-data text-[9px] tracking-[0.15em] uppercase text-cream" style={{ backgroundColor: colorA }}>{a.cat}</span>}
            b={<span className="inline-block px-2 py-0.5 font-data text-[9px] tracking-[0.15em] uppercase text-cream" style={{ backgroundColor: colorB }}>{b.cat}</span>}
          />
          <ComparisonRow
            label="Trust Score"
            a={<span className="font-data text-sm font-bold" style={{ color: a.seller.score >= 80 ? "#5B7F5E" : a.seller.score >= 50 ? "#C4A882" : "#E8572A" }}>{a.seller.score}/100 · {a.seller.name}</span>}
            b={<span className="font-data text-sm font-bold" style={{ color: b.seller.score >= 80 ? "#5B7F5E" : b.seller.score >= 50 ? "#C4A882" : "#E8572A" }}>{b.seller.score}/100 · {b.seller.name}</span>}
          />
          <ComparisonRow
            label="Listed"
            a={<span className="font-data text-sm text-mahogany">{a.posted}</span>}
            b={<span className="font-data text-sm text-mahogany">{b.posted}</span>}
          />
          <ComparisonRow
            label="Description"
            a={<p className="font-body text-xs text-mahogany leading-relaxed line-clamp-3">{a.desc}</p>}
            b={<p className="font-body text-xs text-mahogany leading-relaxed line-clamp-3">{b.desc}</p>}
          />

          {/* Full cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div>
              <div className="font-data text-[9px] tracking-[0.3em] uppercase text-dust mb-3 pb-2 border-b border-rule">Full Card A</div>
              <ListingCard listing={a} variant="row" />
            </div>
            <div>
              <div className="font-data text-[9px] tracking-[0.3em] uppercase text-dust mb-3 pb-2 border-b border-rule">Full Card B</div>
              <ListingCard listing={b} variant="row" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}