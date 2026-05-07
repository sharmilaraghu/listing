"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Icon from "@/components/ui/Icon";

interface VoiceAgentPostProps {
  onSubmit: (data: {
    title: string; price: string; desc: string;
    hood: string; cat: string; email: string; phone: string;
  }) => void;
  onClose: () => void;
}

type Phase = "idle" | "connecting" | "active" | "complete" | "error";

const FIELD_DEFAULTS = { title: "", price: "", desc: "", hood: "", cat: "", email: "", phone: "" };

declare global {
  interface Window { SpeechRecognition: any; webkitSpeechRecognition: any; }
}

export default function VoiceAgentPost({ onSubmit, onClose }: VoiceAgentPostProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [transcript, setTranscript] = useState<{ role: "agent" | "user"; text: string }[]>([]);
  const [error, setError] = useState("");
  const [agentSpeaking, setAgentSpeaking] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioQueueRef = useRef<ArrayBuffer[]>([]);
  const playingRef = useRef(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  const playNextAudio = useCallback(async () => {
    if (playingRef.current || audioQueueRef.current.length === 0) return;
    playingRef.current = true;
    setAgentSpeaking(true);

    const buffer = audioQueueRef.current.shift()!;
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
      const decoded = await audioCtxRef.current.decodeAudioData(buffer.slice(0));
      const source = audioCtxRef.current.createBufferSource();
      source.buffer = decoded;
      source.connect(audioCtxRef.current.destination);
      source.onended = () => {
        playingRef.current = false;
        if (audioQueueRef.current.length > 0) {
          playNextAudio();
        } else {
          setAgentSpeaking(false);
        }
      };
      source.start();
    } catch {
      playingRef.current = false;
      setAgentSpeaking(false);
      playNextAudio();
    }
  }, []);

  const startCall = async () => {
    setPhase("connecting");
    setError("");
    setTranscript([]);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const res = await fetch("/api/agent/post", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to get session");

      const ws = new WebSocket(data.signedUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setPhase("active");
        // Stream mic via MediaRecorder (no deprecated ScriptProcessorNode)
        const recorder = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = async (e) => {
          if (ws.readyState !== WebSocket.OPEN || e.data.size === 0) return;
          const buf = await e.data.arrayBuffer();
          const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
          ws.send(JSON.stringify({ user_audio_chunk: b64 }));
        };

        recorder.start(100); // chunk every 100ms
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === "audio") {
            const binary = atob(msg.audio_event?.audio_base_64 || "");
            if (!binary) return;
            const buf = new ArrayBuffer(binary.length);
            const view = new Uint8Array(buf);
            for (let i = 0; i < binary.length; i++) view[i] = binary.charCodeAt(i);
            audioQueueRef.current.push(buf);
            playNextAudio();
          }

          if (msg.type === "agent_response" && msg.agent_response_event?.agent_response) {
            setTranscript(prev => [...prev, { role: "agent", text: msg.agent_response_event.agent_response }]);
          }

          if (msg.type === "user_transcript" && msg.user_transcription_event?.user_transcript) {
            setTranscript(prev => [...prev, { role: "user", text: msg.user_transcription_event.user_transcript }]);
          }

          if (msg.type === "client_tool_call") {
            const { tool_name, parameters } = msg.client_tool_call_event || {};
            if (tool_name === "submit_listing") {
              setPhase("complete");
              setTimeout(() => {
                onSubmit({
                  title: parameters?.title || "",
                  price: parameters?.price ? String(parameters.price) : "",
                  desc: parameters?.description || parameters?.desc || "",
                  hood: parameters?.neighborhood || parameters?.hood || "",
                  cat: parameters?.category || parameters?.cat || "",
                  email: parameters?.email || "",
                  phone: parameters?.phone || "",
                });
              }, 1200);
            }
          }
        } catch {}
      };

      ws.onerror = () => {
        setError("Connection error");
        setPhase("error");
      };

      ws.onclose = (e) => {
        if (phase === "active") {
          setError(`Disconnected (${e.code})`);
          setPhase("error");
        }
      };
    } catch (e: any) {
      setError(e.message || "Failed to connect");
      setPhase("error");
    }
  };

  const endCall = () => {
    wsRef.current?.close();
    mediaRecorderRef.current?.stop();
    mediaStreamRef.current?.getTracks().forEach(t => t.stop());
    audioCtxRef.current?.close();
    audioQueueRef.current = [];
    onClose();
  };

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
              <h3 className="font-display font-black text-lg text-ink">Voice Post Agent</h3>
              <p className="font-data text-[10px] tracking-[0.15em] uppercase text-dust">
                {phase === "idle" ? "Ready" :
                 phase === "connecting" ? "Connecting..." :
                 phase === "active" ? agentSpeaking ? "Agent speaking..." : "Listening..." :
                 phase === "complete" ? "Done!" : "Error"}
              </p>
            </div>
          </div>
          <button onClick={endCall} className="w-8 h-8 flex items-center justify-center text-dust hover:text-ink transition-colors">
            <Icon name="x" size={14} />
          </button>
        </div>

        {/* Transcript */}
        <div ref={scrollRef} className="h-72 overflow-y-auto p-6 space-y-3">
          {transcript.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-14 h-14 rounded-full bg-sage/20 flex items-center justify-center mb-3">
                <Icon name="mic" size={24} className="text-sage" />
              </div>
              <p className="font-body text-mahogany text-sm">
                {phase === "idle" ? "Start voice call — describe your listing aloud" :
                 phase === "connecting" ? "Connecting to agent..." : "Speak now"}
              </p>
            </div>
          )}
          {transcript.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] px-4 py-2.5 font-body text-sm ${
                msg.role === "user"
                  ? "bg-ink text-cream rounded-2xl rounded-br-sm"
                  : "bg-cream border border-rule text-ink rounded-2xl rounded-bl-sm"
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {error && (
            <div className="text-center">
              <p className="font-body text-sm text-terracotta border border-terracotta/30 bg-terracotta/5 px-4 py-3 rounded">
                {error}
              </p>
            </div>
          )}
        </div>

        {/* Waveform */}
        {agentSpeaking && (
          <div className="px-6 py-2 border-t border-rule bg-cream/40">
            <div className="flex items-center justify-center gap-1">
              {Array.from({ length: 8 }, (_, i) => (
                <span key={i} className="w-1 bg-terracotta rounded-full animate-wave-bar"
                  style={{ height: `${8 + Math.sin(i * 1.2) * 8}px`, animationDelay: `${i * 0.06}s` }} />
              ))}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="p-6 border-t border-rule">
          {phase === "idle" || phase === "error" ? (
            <button onClick={startCall}
              className="w-full py-4 bg-ink text-cream font-data text-[11px] tracking-[0.2em] uppercase flex items-center justify-center gap-3 hover:bg-ink/90 transition-colors">
              <Icon name="phone" size={16} />
              Start Voice Call
            </button>
          ) : phase === "connecting" ? (
            <div className="w-full py-4 bg-dust/10 text-dust font-data text-[11px] tracking-[0.2em] uppercase flex items-center justify-center gap-3">
              <span className="flex gap-1">{[1,2,3].map(i => (
                <span key={i} className="w-1.5 h-1.5 bg-dust rounded-full animate-wave-bar" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}</span>
              Connecting...
            </div>
          ) : phase === "complete" ? (
            <div className="w-full py-4 bg-sage text-cream font-data text-[11px] tracking-[0.2em] uppercase flex items-center justify-center gap-3">
              <Icon name="check" size={16} />
              Filling your form...
            </div>
          ) : (
            <button onClick={endCall}
              className="w-full py-3 border border-rule text-mahogany font-data text-[11px] tracking-[0.2em] uppercase flex items-center justify-center gap-2 hover:border-ink hover:text-ink transition-colors">
              <Icon name="x" size={14} />
              End Call
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
