"use client";

import { useEffect, useState } from "react";
import { useCompareContext } from "./CompareContext";
import { useVoice } from "@/hooks/useVoice";
import Icon from "@/components/ui/Icon";
import ListingCard from "@/components/ui/ListingCard";

interface ComparePoint {
  label: string;
  text: string;
  winner: 0 | 1 | "tie";
}

function buildComparisonScript(a: any, b: any): { points: ComparePoint[]; verdict: string; script: string } {
  const points: ComparePoint[] = [];
  const scriptParts: string[] = [];

  // Price
  const priceDiff = a.price - b.price;
  const priceWinner = priceDiff < 0 ? 0 : priceDiff > 0 ? 1 : "tie";
  points.push({
    label: "Price",
    text: a.price === 0 ? "Free" : `$${a.price.toLocaleString()}`,
    winner: priceWinner,
  });
  points.push({
    label: "Price",
    text: b.price === 0 ? "Free" : `$${b.price.toLocaleString()}`,
    winner: priceWinner === 0 ? 1 : priceWinner === 1 ? 0 : "tie",
  });
  scriptParts.push(
    `${a.price === 0 ? "First listing is free" : `First listing is ${a.price === 0 ? "free" : `$${a.price.toLocaleString()}`}`}. ` +
    `${b.price === 0 ? "Second is free" : `Second is $${b.price.toLocaleString()}`}.`
  );

  // Trust score
  const trustWinner = a.seller.score >= b.seller.score ? 0 : 1;
  points.push({ label: "Trust Score", text: `${a.seller.score}/100`, winner: trustWinner });
  points.push({ label: "Trust Score", text: `${b.seller.score}/100`, winner: trustWinner === 0 ? 1 : 0 });
  scriptParts.push(
    `First seller ${a.seller.name} has trust score ${a.seller.score}, member since ${a.seller.joined}. ` +
    `Second seller ${b.seller.name} has trust score ${b.seller.score}, member since ${b.seller.joined}.`
  );

  // Recency
  const recencyWinner = a.posted.localeCompare(b.posted) < 0 ? 0 : 1;
  points.push({ label: "Listed", text: a.posted, winner: recencyWinner });
  points.push({ label: "Listed", text: b.posted, winner: recencyWinner === 0 ? 1 : 0 });
  scriptParts.push(
    `First listed ${a.posted}, second listed ${b.posted}.`
  );

  // Description length as a proxy for quality
  const descWinner = a.desc.length >= b.desc.length ? 0 : 1;
  points.push({ label: "Description", text: `${a.desc.split(" ").length} words`, winner: descWinner });
  points.push({ label: "Description", text: `${b.desc.split(" ").length} words`, winner: descWinner === 0 ? 1 : 0 });

  // Badge
  const badgeA = a.badge ? a.badge.toUpperCase() : "No badge";
  const badgeB = b.badge ? b.badge.toUpperCase() : "No badge";
  points.push({ label: "Badge", text: badgeA, winner: a.badge === "rare" ? 0 : a.badge === "fire" ? 0 : "tie" });
  points.push({ label: "Badge", text: badgeB, winner: b.badge === "rare" ? 1 : b.badge === "fire" ? 1 : "tie" });

  // Verdict
  const score = [0, 1].reduce((acc, idx) => {
    const item = idx === 0 ? a : b;
    if (item.badge === "rare") acc[idx] += 1;
    if (item.seller.score >= 85) acc[idx] += 1;
    if (item.desc.length > 100) acc[idx] += 1;
    return acc;
  }, [0, 1]);

  const verdict = score[0] > score[1] ? `${a.title.split("—")[0].trim()} wins` :
    score[1] > score[0] ? `${b.title.split("—")[0].trim()} wins` :
    "Close call — depends on your priorities";

  scriptParts.push(`Overall: ${verdict}.`);

  return {
    points,
    verdict,
    script: `Comparing two listings. ${scriptParts.join(" ")} ${verdict}.`,
  };
}

export default function CompareOverlay() {
  const { selected, isComparing, stopCompare, clear } = useCompareContext();
  const { speaking, play, stop } = useVoice();
  const [activePoint, setActivePoint] = useState<number | null>(null);
  const [phase, setPhase] = useState<"idle" | "narration" | "done">("idle");

  if (!isComparing || selected.length !== 2) return null;

  const [a, b] = selected;
  const { points, verdict, script } = buildComparisonScript(a, b);
  // Split into pairs (0,1) for display
  const comparePoints = [];
  for (let i = 0; i < points.length; i += 2) {
    comparePoints.push([points[i], points[i + 1]]);
  }

  const handlePlay = () => {
    setPhase("narration");
    setActivePoint(null);
    play(script, "ATLAS");
  };

  const handleStop = () => {
    stop();
    setPhase("idle");
    setActivePoint(null);
  };

  const handleDone = () => {
    stop();
    clear();
    setPhase("idle");
    setActivePoint(null);
    stopCompare();
  };

  return (
    <div className="fixed inset-0 z-50 bg-cream/98 backdrop-blur-md flex flex-col">
      {/* Header */}
      <div className="border-b-2 border-ink bg-paper px-4 md:px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-terracotta animate-pulse" />
              <span className="font-data text-[9px] tracking-[0.35em] uppercase text-dust">
                Comparing Listings
              </span>
            </div>
            <h1 className="font-display font-black text-3xl text-ink">
              Side-by-Side
            </h1>
          </div>
          <button
            onClick={handleDone}
            className="flex items-center gap-2 px-4 py-2 border border-ink font-data text-[10px] tracking-[0.2em] uppercase text-ink hover:bg-ink hover:text-cream transition-colors"
          >
            <Icon name="close" size={14} />
            Close
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {/* Listing A */}
            <div className="bg-paper border border-rule p-5">
              <div className="font-data text-[9px] tracking-[0.3em] uppercase text-sage mb-3">Listing A</div>
              <ListingCard listing={a} />
            </div>
            {/* Listing B */}
            <div className="bg-paper border border-rule p-5">
              <div className="font-data text-[9px] tracking-[0.3em] uppercase text-sage mb-3">Listing B</div>
              <ListingCard listing={b} />
            </div>
          </div>

          {/* Play controls */}
          <div className="bg-paper border-2 border-ink p-6 mb-8">
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={speaking ? handleStop : handlePlay}
                className={`flex items-center gap-3 px-8 py-4 font-data text-[12px] tracking-[0.2em] uppercase transition-colors ${
                  speaking
                    ? "bg-terracotta/10 border border-terracotta text-terracotta"
                    : "bg-ink text-cream btn-shine hover:bg-[#2D2315]"
                }`}
              >
                <Icon name={speaking ? "pause" : "play"} size={16} />
                {speaking ? "Stop Narration" : "Play Comparison"}
              </button>
            </div>

            {/* Waveform during playback */}
            {speaking && (
              <div className="flex items-center justify-center gap-1 mt-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-terracotta rounded-full animate-wave-bar"
                    style={{
                      height: `${14 + Math.sin(i * 1.2) * 14}px`,
                      animationDelay: `${i * 0.08}s`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Comparison points */}
          <div className="bg-paper border border-rule">
            <div className="px-5 py-4 border-b border-rule flex items-center gap-3">
              <Icon name="speak" size={14} className="text-dust" />
              <span className="font-data text-[10px] tracking-[0.2em] uppercase text-dust">
                Comparison Points
              </span>
            </div>
            {comparePoints.map(([pA, pB], idx) => {
              const isActive = activePoint === idx;
              return (
                <div
                  key={idx}
                  className={`grid grid-cols-2 divide-x divide-rule border-b border-rule last:border-b-0 transition-all duration-200 ${
                    isActive ? "bg-terracotta/5" : "hover:bg-cream"
                  }`}
                >
                  {/* Listing A point */}
                  <div className={`px-5 py-4 ${pA.winner === 0 ? "border-l-2 border-l-gold" : ""}`}>
                    <div className="font-data text-[8px] tracking-[0.25em] uppercase text-dust mb-1">{pA.label}</div>
                    <div className="font-data text-sm text-ink">{pA.text}</div>
                    {pA.winner === 0 && (
                      <span className="inline-flex items-center gap-1 mt-1 font-data text-[8px] tracking-[0.2em] uppercase text-gold">
                        ✦ wins
                      </span>
                    )}
                  </div>
                  {/* Listing B point */}
                  <div className={`px-5 py-4 ${pB.winner === 1 ? "border-l-2 border-l-gold" : ""}`}>
                    <div className="font-data text-[8px] tracking-[0.25em] uppercase text-dust mb-1">{pB.label}</div>
                    <div className="font-data text-sm text-ink">{pB.text}</div>
                    {pB.winner === 1 && (
                      <span className="inline-flex items-center gap-1 mt-1 font-data text-[8px] tracking-[0.2em] uppercase text-gold">
                        ✦ wins
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Verdict */}
            <div className="px-5 py-5 bg-ink">
              <div className="flex items-center gap-3 mb-2">
                <Icon name="gem" size={14} className="text-gold" />
                <span className="font-data text-[9px] tracking-[0.3em] uppercase text-gold">Verdict</span>
              </div>
              <p className="font-display font-black text-xl text-cream">{verdict}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
