"use client";

import { useState, useCallback, useRef } from "react";
import Icon from "@/components/ui/Icon";

interface UseVoiceReturn {
  speaking: boolean;
  error: string | null;
  play: (text: string, voice?: "ATLAS" | "ECHO") => Promise<void>;
  stop: () => void;
}

export function useVoice(): UseVoiceReturn {
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = useCallback(async (text: string, voice: "ATLAS" | "ECHO" = "ATLAS") => {
    setError(null);
    setSpeaking(true);
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice }),
      });
      if (!res.ok) throw new Error("TTS request failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        setSpeaking(false);
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => {
        setError("Playback failed");
        setSpeaking(false);
        URL.revokeObjectURL(url);
      };
      await audio.play();
    } catch {
      setError("Voice unavailable — try again");
      setSpeaking(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setSpeaking(false);
  }, []);

  return { speaking, error, play, stop };
}

interface VoiceButtonProps {
  text: string;
}

export default function VoiceButton({ text }: VoiceButtonProps) {
  const { speaking, error, play, stop } = useVoice();

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={speaking ? stop : () => play(text)}
        className={`flex items-center justify-center gap-2 w-full py-3 px-4 border font-data text-[11px] tracking-[0.2em] uppercase transition-all ${
          speaking
            ? "bg-terracotta/10 border-terracotta text-terracotta"
            : "border-ink bg-ink text-cream hover:bg-[#2D2315]"
        }`}
      >
        {speaking ? (
          <>
            <Icon name="pause" size={14} />
            Stop
          </>
        ) : (
          <>
            <Icon name="speak" size={14} />
            Read This Listing
          </>
        )}
      </button>

      {/* Waveform bars */}
      {speaking && (
        <div className="flex items-center justify-center gap-1 py-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="w-1 bg-terracotta animate-wave-bar"
              style={{ height: `${16 + i * 4}px`, animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      )}

      {error && (
        <p className="font-data text-[10px] tracking-[0.15em] text-terracotta text-center">
          {error}
        </p>
      )}
    </div>
  );
}
