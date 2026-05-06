"use client";

import { useState } from "react";
import type { ListingBadge } from "@/lib/types";

interface BadgeProps {
  kind: ListingBadge;
  compact?: boolean;
}

const CONFIG = {
  fire: {
    label: "UNDERPRICED",
    emoji: "🔥",
    bg: "bg-terracotta",
    text: "text-cream",
    border: "border-terracotta",
  },
  rare: {
    label: "RARE FIND",
    emoji: "✦",
    bg: "bg-gold",
    text: "text-ink",
    border: "border-gold",
  },
  risk: {
    label: "CAUTION",
    emoji: "⚠",
    bg: "bg-mahogany",
    text: "text-paper",
    border: "border-mahogany",
  },
} as const;

export default function Badge({ kind, compact = false }: BadgeProps) {
  const [showSparkle, setShowSparkle] = useState(false);
  const c = CONFIG[kind];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 font-data text-[10px] tracking-widest uppercase ${c.bg} ${c.text} border ${c.border} select-none`}
      onMouseEnter={() => { if (kind === "rare") setShowSparkle(true); }}
      onMouseLeave={() => setShowSparkle(false)}
    >
      <span className={showSparkle ? "sparkle" : ""}>
        {c.emoji}
      </span>
      {!compact && <span>{c.label}</span>}
    </span>
  );
}
