"use client";

import { useVoice } from "@/hooks/useVoice";
import Icon from "@/components/ui/Icon";

const GUIDE_TEXT = `Welcome to LISTING, San Francisco's live classifieds. Browse wheels, shelter, gear, and more across the city. Use the map scanner to find deals near you. Tap any listing to hear it read aloud. Post your own listing in just minutes. LISTING. The city's live marketplace.`;

export default function AudioGuide() {
  const { speaking, play, stop } = useVoice();

  return (
    <button
      onClick={speaking ? stop : () => play(GUIDE_TEXT, "ECHO")}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 font-data text-[10px] tracking-[0.2em] uppercase transition-colors ${
        speaking ? "text-terracotta" : "text-dust hover:text-ink"
      }`}
      title="Audio Guide"
    >
      <Icon name="speak" size={13} />
      <span className="hidden lg:inline">Audio Guide</span>
      {speaking && (
        <span className="flex items-center gap-0.5 ml-1">
          {[1, 2, 3].map((i) => (
            <span
              key={i}
              className="w-0.5 bg-terracotta animate-wave-bar"
              style={{ height: 8, animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </span>
      )}
    </button>
  );
}
