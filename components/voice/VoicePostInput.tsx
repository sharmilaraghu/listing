"use client";

import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/Icon";

interface VoicePostInputProps {
  onSubmit: (transcript: string) => void;
  onClose: () => void;
}

export default function VoicePostInput({ onSubmit, onClose }: VoicePostInputProps) {
  const [transcript, setTranscript] = useState("");
  const [listening, setListening] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Your browser doesn't support voice input. Try Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let text = "";
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }
      setTranscript(text);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.onerror = (event: any) => {
      setListening(false);
      if (event.error !== "no-speech") {
        setError("Microphone error. Please try again.");
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
    setError(null);

    return () => {
      recognition.stop();
    };
  }, []);

  const handleSubmit = () => {
    if (!transcript.trim()) return;
    setProcessing(true);
    onSubmit(transcript.trim());
  };

  const handleRestart = () => {
    setTranscript("");
    setError(null);
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.onresult = (event: any) => {
      let text = "";
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }
      setTranscript(text);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(251,247,240,0.96)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg bg-paper border-2 border-ink shadow-[6px_6px_0px_#1C1007]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-rule">
          <div>
            <div className="font-display font-black text-xl text-ink">Talk it through</div>
            <div className="font-data text-[9px] tracking-[0.2em] text-dust uppercase mt-0.5">Describe your listing</div>
          </div>
          <button onClick={onClose} className="text-dust hover:text-ink transition-colors">
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* Mic visual */}
        <div className="py-10 flex flex-col items-center">
          <div className="relative mb-8">
            {listening && (
              <div className="absolute inset-0 rounded-full bg-terracotta/15 animate-ping" style={{ animationDuration: "1.2s" }} />
            )}
            <div
              className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-colors ${
                listening ? "bg-terracotta" : error ? "bg-dust/30" : "bg-ink"
              }`}
            >
              <Icon name="mic" size={36} className="text-cream" />
            </div>
          </div>

          {/* Live waveform */}
          {listening && (
            <div className="flex items-center gap-1 mb-6 h-8">
              {[1,2,3,4,5,6,7,8,9,10,11,12].map((i) => (
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
          )}

          {/* Transcript */}
          <div className="px-8 w-full text-center min-h-[80px]">
            {error ? (
              <p className="font-body text-sm text-terracotta">{error}</p>
            ) : transcript ? (
              <p className="font-display text-xl text-ink italic leading-snug">"{transcript}"</p>
            ) : listening ? (
              <p className="font-body text-dust animate-pulse">Listening... go ahead</p>
            ) : (
              <p className="font-body text-dust">Tap to start speaking</p>
            )}
          </div>

          {/* Tip */}
          {!transcript && !error && (
            <p className="font-data text-[9px] tracking-[0.2em] text-dust/60 uppercase mt-4">
              Try: "I'm selling a bike for 850 in the mission"
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-rule flex items-center gap-3">
          <button
            onClick={handleRestart}
            disabled={processing}
            className="px-4 py-2 font-data text-[10px] tracking-[0.2em] uppercase border border-rule text-dust hover:border-ink hover:text-ink transition-colors disabled:opacity-40"
          >
            Start over
          </button>
          <button
            onClick={handleSubmit}
            disabled={!transcript.trim() || processing}
            className="ml-auto flex items-center gap-2 px-6 py-3 bg-terracotta text-cream font-data text-[11px] tracking-[0.2em] uppercase btn-shine hover:bg-[#CC4A1E] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {processing ? (
              <>
                <span className="flex gap-px">
                  {[1,2,3].map(i => (
                    <span key={i} className="w-0.5 h-3 bg-cream rounded-full animate-wave-bar" style={{ animationDelay: `${i * 0.1}s` }} />
                  ))}
                </span>
                Parsing...
              </>
            ) : (
              <>
                <Icon name="check" size={13} />
                Post it
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}