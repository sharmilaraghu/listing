"use client";

import { useState, useCallback, useRef } from "react";

interface ParsedFilters {
  category: string | null;
  hood: string | null;
  priceMax: number | null;
  timeFilter: string | null;
  rawQuery: string;
}

type VoiceState = "idle" | "listening" | "processing" | "error";

interface UseVoiceSearchReturn {
  state: VoiceState;
  transcript: string;
  parsed: ParsedFilters;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  reset: () => void;
}

const CATEGORY_KEYWORDS: Record<string, string> = {
  bike: "transit", bicycle: "transit", car: "transit", motorcycle: "transit", wheels: "transit",
  apartment: "shelter", studio: "shelter", flat: "shelter", room: "shelter", sublet: "shelter", rent: "shelter", house: "shelter",
  synth: "audio", speaker: "audio", headphones: "audio", guitar: "audio", equipment: "audio", gear: "audio", audio: "audio",
  desk: "gear", furniture: "gear", chair: "gear", computer: "gear", laptop: "gear", camera: "gear", phone: "gear",
  plumber: "labor", painter: "labor", cleaning: "labor", mover: "labor", handyman: "labor", job: "labor", work: "labor",
  free: "free", giveaway: "free",
  partner: "people", friend: "people", roommate: "people",
  antique: "misc", vintage: "misc", collectible: "misc", odd: "misc",
};

const HOOD_ALIASES: Record<string, string> = {
  "so-ma": "SoMa", soma: "SoMa", south: "SoMa",
  mission: "Mission", "the mission": "Mission",
  castro: "Castro", "Noe": "Noe Valley", noe: "Noe Valley",
  sunset: "Outer Sunset", richmond: "Inner Richmond",
  bayview: "Bayview", excelsior: "Excelsior",
  "glen park": "Glen Park", glen: "Glen Park",
  hayes: "Hayes Valley", haight: "Haight Ashbury",
  pacific: "Pacific Heights",
};

const TIME_ALIASES: Record<string, string> = {
  today: "today",
  "this week": "week", week: "week",
  "this month": "month", month: "month",
};

function parseVoiceQuery(text: string): ParsedFilters {
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/);

  let category: string | null = null;
  let hood: string | null = null;
  let priceMax: number | null = null;
  let timeFilter: string | null = null;

  // Extract category
  for (const [keyword, cat] of Object.entries(CATEGORY_KEYWORDS)) {
    if (lower.includes(keyword)) {
      category = cat;
      break;
    }
  }

  // Extract neighborhood
  for (const [alias, normalized] of Object.entries(HOOD_ALIASES)) {
    if (lower.includes(alias)) {
      hood = normalized;
      break;
    }
  }

  // Extract price (under X, less than X, under $X, etc.)
  const pricePatterns = [
    /under\s*\$?([\d,]+)/,
    /less\s*than\s*\$?([\d,]+)/,
    /under\s*(\d+)\s*dollars/,
    /budget\s*\$?([\d,]+)/,
    /around\s*\$?([\d,]+)/,
    /(\d+)\s*dollars?/,
    /\$\s*([\d,]+)/,
  ];
  for (const pattern of pricePatterns) {
    const m = lower.match(pattern);
    if (m) {
      priceMax = parseInt(m[1].replace(/,/g, ""), 10);
      break;
    }
  }

  // Extract time
  for (const [phrase, time] of Object.entries(TIME_ALIASES)) {
    if (lower.includes(phrase)) {
      timeFilter = time;
      break;
    }
  }

  return { category, hood, priceMax, timeFilter, rawQuery: text };
}

export function useVoiceSearch(): UseVoiceSearchReturn {
  const [state, setState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState("");
  const [parsed, setParsed] = useState<ParsedFilters>({ category: null, hood: null, priceMax: null, timeFilter: null, rawQuery: "" });
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const startListening = useCallback(() => {
    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setError("Speech recognition not supported in this browser");
      setState("error");
      return;
    }

    setState("listening");
    setTranscript("");
    setError(null);

    const recognition = new SpeechRecognitionAPI();
    recognitionRef.current = recognition;
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += t;
        } else {
          interim += t;
        }
      }
      setTranscript(final + (interim ? ` ${interim}` : ""));
    };

    recognition.onerror = (event: any) => {
      setState("error");
      setError(event.error === "no-speech" ? "No speech detected — try again" : "Couldn't access microphone");
    };

    recognition.onend = () => {
      if (state === "listening") {
        setState("processing");
        const result = parseVoiceQuery(transcript);
        setParsed(result);
        setState("idle");
      }
    };

    recognition.start();
  }, [state, transcript]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (state === "listening") {
      setState("processing");
      const result = parseVoiceQuery(transcript);
      setParsed(result);
      setState("idle");
    }
  }, [state, transcript]);

  const reset = useCallback(() => {
    setState("idle");
    setTranscript("");
    setParsed({ category: null, hood: null, priceMax: null, timeFilter: null, rawQuery: "" });
    setError(null);
  }, []);

  return { state, transcript, parsed, error, startListening, stopListening, reset };
}
