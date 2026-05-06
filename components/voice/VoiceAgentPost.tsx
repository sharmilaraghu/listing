"use client";

import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/Icon";
import { playTTS } from "@/lib/voice";

interface Message {
  id: string;
  role: "agent" | "user";
  text: string;
}

interface VoiceAgentPostProps {
  onSubmit: (data: {
    title: string;
    price: string;
    desc: string;
    hood: string;
    cat: string;
    email: string;
    phone: string;
  }) => void;
  onClose: () => void;
}

type Phase = "idle" | "connecting" | "ready" | "listening" | "speaking" | "complete" | "error";

const AGENT_WELCOME = "Hi! I'm your posting assistant. What are you selling or offering today?";

// Web Speech API types
interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

// Extend Window for webkit prefix
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function VoiceAgentPost({ onSubmit, onClose }: VoiceAgentPostProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>("");
  const [isSpeaking, setIsSpeaking] = useState(false);

  const recognitionRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const speakingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setError("Speech recognition not supported in this browser");
      setPhase("error");
      return;
    }

    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = async (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setMessages((prev) => [...prev, { id: Date.now().toString(), role: "user", text: transcript }]);
      setPhase("speaking");
      await sendToAgent(transcript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error !== "aborted") {
        setError(`Speech error: ${event.error}`);
        setPhase("error");
      }
    };

    recognition.onend = () => {
      if (phase === "listening") {
        setPhase("ready");
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (speakingTimeoutRef.current) {
        clearTimeout(speakingTimeoutRef.current);
      }
    };
  }, []);

  const startCall = async () => {
    setPhase("connecting");
    setError("");

    try {
      // Request microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      // Create agent session
      const res = await fetch("/api/agent/post", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to start session");
      }

      setSessionId(data.sessionId);

      // Agent welcome message (simulated - in real agent flow, first message comes from agent)
      setMessages([{ id: "welcome", role: "agent", text: AGENT_WELCOME }]);
      setPhase("ready");

      // Speak welcome
      speak(AGENT_WELCOME);
    } catch (e: any) {
      setError(e.message || "Failed to connect");
      setPhase("error");
    }
  };

  const sendToAgent = async (text: string) => {
    if (!sessionId) {
      setError("No active session");
      setPhase("error");
      return;
    }

    try {
      const res = await fetch("/api/agent/post/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, text }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Agent error");
      }

      if (data.agentMessage) {
        setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "agent", text: data.agentMessage }]);
        await speak(data.agentMessage);
      }

      if (data.isComplete && data.formData) {
        setPhase("complete");
        speakingTimeoutRef.current = setTimeout(() => {
          onSubmit({
            title: data.formData.title || "",
            price: data.formData.price ? String(data.formData.price) : "",
            desc: data.formData.desc || "",
            hood: data.formData.hood || "",
            cat: data.formData.cat || "",
            email: data.formData.email || "",
            phone: data.formData.phone || "",
          });
        }, 1500);
      } else {
        setPhase("ready");
      }
    } catch (e: any) {
      setError(e.message || "Failed to get agent response");
      setPhase("error");
    }
  };

  const speak = async (text: string) => {
    setIsSpeaking(true);
    setPhase("speaking");
    await playTTS(text);
    setIsSpeaking(false);
    if (phase !== "complete" && phase !== "error") {
      setPhase("ready");
    }
  };

  const startListening = () => {
    if (!recognitionRef.current || phase === "speaking" || phase === "connecting") return;
    setPhase("listening");
    recognitionRef.current.start();
  };

  const endCall = async () => {
    if (sessionId) {
      await fetch(`/api/agent/post?sessionId=${sessionId}`, { method: "DELETE" }).catch(() => {});
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    onClose();
  };

  const isListenDisabled = phase === "speaking" || phase === "connecting";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 bg-paper border border-rule shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-rule">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-terracotta/20 flex items-center justify-center">
              <Icon name="wave" size={20} className="text-terracotta" />
            </div>
            <div>
              <h3 className="font-display font-black text-lg text-ink">Voice Post</h3>
              <p className="font-data text-[10px] tracking-[0.15em] uppercase text-dust">
                {phase === "idle" || phase === "error" ? "Ready" :
                 phase === "connecting" ? "Connecting..." :
                 phase === "listening" ? "Listening..." :
                 phase === "speaking" ? "Speaking..." :
                 phase === "complete" ? "Complete!" : "Connected"}
              </p>
            </div>
          </div>
          <button
            onClick={endCall}
            className="w-8 h-8 rounded-full border border-rule flex items-center justify-center text-dust hover:border-ink hover:text-ink transition-colors"
          >
            <Icon name="x" size={14} />
          </button>
        </div>

        {/* Messages */}
        <div className="h-80 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && phase !== "error" && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 rounded-full bg-sage/20 flex items-center justify-center mb-4">
                <Icon name="mic" size={28} className="text-sage" />
              </div>
              <p className="font-body text-mahogany">
                {phase === "idle" ? "Start a voice call to post your listing" :
                 phase === "connecting" ? "Connecting to assistant..." :
                 phase === "ready" ? "Assistant ready — tap to speak" :
                 phase === "speaking" ? "Assistant is speaking..." :
                 "..."}
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-ink text-cream rounded-2xl rounded-br-md"
                    : "bg-cream border border-rule text-ink rounded-2xl rounded-bl-md"
                }`}
              >
                <p className="font-body text-sm">{msg.text}</p>
              </div>
            </div>
          ))}

          {error && (
            <div className="flex justify-center">
              <div className="max-w-[90%] px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl">
                <p className="font-body text-sm">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Waveform indicator */}
        {isSpeaking && (
          <div className="px-6 py-3 border-t border-rule bg-cream/50">
            <div className="flex items-center justify-center gap-1">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <span
                  key={i}
                  className="w-1 bg-terracotta rounded-full animate-wave-bar"
                  style={{
                    height: `${Math.random() * 16 + 8}px`,
                    animationDelay: `${i * 0.05}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="p-6 border-t border-rule">
          {phase === "idle" || phase === "error" ? (
            <button
              onClick={startCall}
              className="w-full py-4 bg-ink text-cream font-data text-[11px] tracking-[0.2em] uppercase flex items-center justify-center gap-3 hover:bg-ink/90 transition-colors"
            >
              <Icon name="phone" size={16} />
              Start Voice Call
            </button>
          ) : phase === "connecting" ? (
            <div className="w-full py-4 bg-dust/20 text-dust font-data text-[11px] tracking-[0.2em] uppercase flex items-center justify-center gap-3">
              <span className="flex gap-1">
                {[1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 bg-dust rounded-full animate-wave-bar"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </span>
              Connecting...
            </div>
          ) : phase === "complete" ? (
            <div className="w-full py-4 bg-sage text-cream font-data text-[11px] tracking-[0.2em] uppercase flex items-center justify-center gap-3">
              <Icon name="check" size={16} />
              Ready to Submit!
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <button
                onClick={endCall}
                className="px-6 py-4 border border-rule text-mahogany font-data text-[11px] tracking-[0.2em] uppercase flex items-center gap-2 hover:border-ink hover:text-ink transition-colors"
              >
                <Icon name="x" size={14} />
                End
              </button>
              <button
                onClick={startListening}
                disabled={isListenDisabled}
                className={`flex-1 py-4 font-data text-[11px] tracking-[0.2em] uppercase flex items-center justify-center gap-3 transition-colors ${
                  phase === "speaking"
                    ? "bg-dust/20 text-dust"
                    : phase === "listening"
                    ? "bg-terracotta text-cream animate-pulse"
                    : "bg-terracotta text-cream hover:bg-terracotta/90"
                }`}
              >
                {phase === "speaking" ? (
                  <>
                    <span className="flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <span
                          key={i}
                          className="w-0.5 bg-dust rounded-full animate-wave-bar"
                          style={{ height: 10, animationDelay: `${i * 0.08}s` }}
                        />
                      ))}
                    </span>
                    Speaking...
                  </>
                ) : phase === "listening" ? (
                  <>
                    <Icon name="wave" size={16} />
                    Listening...
                  </>
                ) : (
                  <>
                    <Icon name="mic" size={16} />
                    Speak
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
