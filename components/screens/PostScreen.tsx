"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/ui/Icon";
import { usePostStore } from "@/lib/postStore";

const CATEGORIES = [
  { id: "transit", label: "Wheels",  icon: "bike" },
  { id: "shelter", label: "Rent",    icon: "home" },
  { id: "gear",    label: "Sale",    icon: "cube" },
  { id: "labor",   label: "Hire",    icon: "wrench" },
  { id: "free",    label: "Free",    icon: "gift" },
  { id: "audio",   label: "Audio",   icon: "wave" },
  { id: "people",  label: "Connect", icon: "users" },
  { id: "misc",    label: "Misc",    icon: "star" },
];

const HOODS = [
  "Mission","SoMa","North Beach","Castro","Hayes Valley",
  "Outer Sunset","Inner Richmond","Dogpatch","Noe Valley",
  "Pacific Heights","Bayview","Excelsior","Glen Park","Civic Center",
];

declare global { interface Window { SpeechRecognition: any; webkitSpeechRecognition: any; } }

// ── Success ──────────────────────────────────────────────────────────────────
function SuccessScreen() {
  return (
    <div className="fixed inset-0 bg-ink flex flex-col items-center justify-center z-50">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-full bg-sage/20 flex items-center justify-center">
          <Icon name="check" size={36} className="text-sage" />
        </div>
        <span className="absolute -top-2 -right-2 text-gold text-2xl animate-starburst">✦</span>
      </div>
      <h2 className="font-display font-black text-5xl text-cream mb-2">Posted.</h2>
      <p className="font-data text-[10px] tracking-[0.3em] uppercase text-dust">Live on listing now</p>
    </div>
  );
}

// ── Voice mode ───────────────────────────────────────────────────────────────
function VoiceMode({ onDone, onSwitch }: { onDone: () => void; onSwitch: () => void }) {
  const { addPost } = usePostStore();
  type Phase = "idle" | "listening" | "parsing" | "preview" | "error";
  const [phase, setPhase]       = useState<Phase>("idle");
  const [transcript, setTranscript] = useState("");
  const [parsed, setParsed]     = useState<Record<string,any> | null>(null);
  const [error, setError]       = useState("");
  const recRef = useRef<any>(null);

  const start = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setError("Use Chrome for voice"); setPhase("error"); return; }
    const rec = new SR();
    rec.continuous = true; rec.interimResults = true; rec.lang = "en-US";
    recRef.current = rec;
    rec.onresult = (e: any) => {
      let t = ""; for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
      setTranscript(t);
    };
    rec.onerror = () => { setPhase("error"); setError("Mic error. Check permissions."); };
    rec.start(); setPhase("listening"); setTranscript(""); setError("");
  };

  const stop = async () => {
    recRef.current?.stop();
    if (!transcript.trim()) { setPhase("idle"); return; }
    setPhase("parsing");
    try {
      const res = await fetch("/api/post/parse-voice", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript }),
      });
      if (!res.ok) throw new Error();
      setParsed(await res.json());
      setPhase("preview");
    } catch {
      setError("Parse failed. Try again or switch to Type mode.");
      setPhase("error");
    }
  };

  const publish = () => {
    if (!parsed) return;
    addPost({ cat: parsed.cat||"misc", title: parsed.title||"", price: String(parsed.price||0),
              desc: parsed.desc||"", hood: parsed.hood||"", email: parsed.email||"", phone: parsed.phone||"" });
    onDone();
  };

  return (
    <div className="flex-1 bg-ink flex flex-col relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 70% 50% at 50% 60%, rgba(232,87,42,0.08) 0%, transparent 70%)" }} />

      {/* Scan lines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,1) 3px, rgba(255,255,255,1) 4px)" }} />

      {/* Switch mode */}
      <div className="relative z-10 flex justify-end px-6 pt-5">
        <button onClick={onSwitch}
          className="flex items-center gap-2 px-3 py-1.5 border border-dust/30 text-dust hover:text-cream hover:border-dust/60 font-data text-[9px] tracking-[0.2em] uppercase transition-colors">
          <Icon name="wrench" size={11} />
          Switch to Type
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8 relative z-10">

        {/* idle / listening / error */}
        {(phase === "idle" || phase === "listening" || phase === "error") && (
          <div className="flex flex-col items-center gap-6 w-full max-w-md">
            <div className="text-center">
              <h2 className="font-display font-black text-4xl text-cream leading-none">
                {phase === "listening" ? "Listening" : "Speak it"}
              </h2>
              <p className="font-data text-[9px] tracking-[0.25em] text-dust/60 uppercase mt-2">
                {phase === "listening" ? "Describe price, condition, location" : "Tap mic — describe your listing"}
              </p>
            </div>

            {/* Mic orb */}
            <div className="relative my-2">
              {phase === "listening" && (
                <>
                  <div className="absolute inset-0 rounded-full bg-terracotta/25 animate-ping" style={{ animationDuration: "1.3s" }} />
                  <div className="absolute -inset-6 rounded-full border border-terracotta/15 animate-ping" style={{ animationDuration: "2s", animationDelay: "0.4s" }} />
                </>
              )}
              <button onClick={phase === "listening" ? stop : start}
                className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                  phase === "listening"
                    ? "bg-terracotta shadow-[0_0_48px_rgba(232,87,42,0.6)]"
                    : "bg-cream/10 border border-cream/20 hover:bg-cream/20"
                }`}>
                <Icon name={phase === "listening" ? "pause" : "mic"} size={32} className="text-cream" />
              </button>
            </div>

            {/* Waveform */}
            {phase === "listening" && (
              <div className="flex items-end gap-1 h-8">
                {Array.from({ length: 20 }, (_, i) => (
                  <div key={i} className="w-1 bg-terracotta/70 rounded-full animate-wave-bar"
                    style={{ height: `${6 + Math.abs(Math.sin(i * 0.6)) * 18}px`, animationDelay: `${i * 0.04}s` }} />
                ))}
              </div>
            )}

            {/* Live transcript */}
            {transcript && (
              <div className="w-full border border-cream/10 bg-cream/5 px-5 py-4 text-center">
                <p className="font-display text-lg text-cream/80 italic leading-snug">"{transcript}"</p>
              </div>
            )}

            {phase === "listening" && transcript && (
              <button onClick={stop}
                className="px-8 py-3 bg-terracotta text-cream font-data text-[10px] tracking-[0.25em] uppercase hover:bg-[#CC4A1E] transition-colors btn-shine">
                Done — Parse It
              </button>
            )}

            {!transcript && phase !== "listening" && (
              <p className="font-data text-[8px] tracking-[0.2em] text-dust/40 uppercase text-center max-w-xs">
                Try: "iPhone 12, screen damage, selling for 50 bucks, willing to go lower"
              </p>
            )}

            {error && (
              <div className="flex flex-col items-center gap-3">
                <p className="font-body text-sm text-terracotta/80 text-center">{error}</p>
                <button onClick={() => { setPhase("idle"); setError(""); setTranscript(""); }}
                  className="px-5 py-2 border border-terracotta/40 text-terracotta font-data text-[9px] tracking-[0.2em] uppercase hover:bg-terracotta/10 transition-colors">
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}

        {/* Parsing */}
        {phase === "parsing" && (
          <div className="flex flex-col items-center gap-5">
            <div className="flex gap-1.5">
              {[1,2,3,4,5].map(i => (
                <span key={i} className="w-2 h-2 bg-terracotta rounded-full animate-wave-bar"
                  style={{ animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
            <p className="font-data text-[10px] tracking-[0.3em] uppercase text-dust">Parsing with AI</p>
            <p className="font-display text-base text-cream/30 italic max-w-xs text-center">"{transcript}"</p>
          </div>
        )}

        {/* Preview */}
        {phase === "preview" && parsed && (
          <div className="w-full max-w-md flex flex-col gap-5">
            <div>
              <p className="font-data text-[9px] tracking-[0.3em] uppercase text-terracotta mb-1">Parsed</p>
              <h2 className="font-display font-black text-3xl text-cream">Looks right?</h2>
            </div>

            <div className="border border-cream/10 bg-cream/5 divide-y divide-cream/10">
              {[
                { k: "Title",    v: parsed.title },
                { k: "Category", v: (parsed.cat||"").toUpperCase() },
                { k: "Price",    v: parsed.price === 0 || !parsed.price ? "FREE" : `$${parsed.price}` },
                { k: "Location", v: parsed.hood },
                { k: "Contact",  v: parsed.email || parsed.phone },
                { k: "Details",  v: parsed.desc },
              ].filter(r => r.v).map(row => (
                <div key={row.k} className="flex items-start gap-4 px-4 py-3">
                  <span className="font-data text-[8px] tracking-[0.2em] uppercase text-dust/60 w-16 shrink-0 mt-0.5">{row.k}</span>
                  <span className="font-body text-sm text-cream/80">{row.v}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setPhase("idle"); setTranscript(""); setParsed(null); }}
                className="flex-1 py-3 border border-cream/20 text-dust font-data text-[9px] tracking-[0.2em] uppercase hover:border-cream/40 transition-colors">
                Redo
              </button>
              <button onClick={publish}
                className="flex-1 py-3 bg-terracotta text-cream font-data text-[10px] tracking-[0.2em] uppercase btn-shine hover:bg-[#CC4A1E] transition-colors">
                Publish
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Type mode ─────────────────────────────────────────────────────────────────
function TypeMode({ onDone, onSwitch }: { onDone: () => void; onSwitch: () => void }) {
  const { addPost } = usePostStore();
  const [form, setForm] = useState({ cat:"", title:"", price:"", desc:"", hood:"", email:"", phone:"" });

  const set = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }));
  const filled  = Object.values(form).filter(Boolean).length;
  const power   = Math.round((filled / 7) * 100);
  const canPost = !!(form.cat && form.title);

  const publish = () => {
    if (!canPost) return;
    addPost(form);
    onDone();
  };

  return (
    <div className="flex-1 bg-paper flex flex-col">
      {/* Switch */}
      <div className="flex justify-end px-6 pt-4">
        <button onClick={onSwitch}
          className="flex items-center gap-2 px-3 py-1.5 border border-rule text-dust hover:text-ink hover:border-ink font-data text-[9px] tracking-[0.2em] uppercase transition-colors">
          <Icon name="mic" size={11} />
          Switch to Voice
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-8">
        <div className="max-w-2xl mx-auto flex flex-col gap-6">

          {/* Category — compact grid */}
          <div>
            <label className="block font-data text-[9px] tracking-[0.25em] uppercase text-dust mb-2">Category</label>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-1.5">
              {CATEGORIES.map(c => (
                <button key={c.id} onClick={() => set("cat", c.id)}
                  className={`flex flex-col items-center gap-1 py-2.5 border transition-colors text-center ${
                    form.cat === c.id ? "border-ink bg-ink text-cream" : "border-rule hover:border-ink text-mahogany"
                  }`}>
                  <Icon name={c.icon} size={16} />
                  <span className="font-data text-[7px] tracking-[0.1em] uppercase leading-none">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title + Price */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block font-data text-[9px] tracking-[0.25em] uppercase text-dust mb-1.5">Title</label>
              <input value={form.title} onChange={e => set("title", e.target.value)}
                placeholder="What are you selling?"
                className="w-full px-3 py-2.5 bg-cream border border-rule font-body text-sm text-ink placeholder:text-dust/50 outline-none focus:border-ink transition-colors" />
            </div>
            <div>
              <label className="block font-data text-[9px] tracking-[0.25em] uppercase text-dust mb-1.5">Price</label>
              <input type="number" value={form.price} onChange={e => set("price", e.target.value)}
                placeholder="$0 = free" min="0"
                className="w-full px-3 py-2.5 bg-cream border border-rule font-body text-sm text-ink placeholder:text-dust/50 outline-none focus:border-ink transition-colors" />
            </div>
          </div>

          {/* Desc */}
          <div>
            <label className="block font-data text-[9px] tracking-[0.25em] uppercase text-dust mb-1.5">Description</label>
            <textarea value={form.desc} onChange={e => set("desc", e.target.value)}
              placeholder="Condition, specs, what's included..."
              rows={3}
              className="w-full px-3 py-2.5 bg-cream border border-rule font-body text-sm text-ink placeholder:text-dust/50 outline-none focus:border-ink transition-colors resize-none" />
          </div>

          {/* Location + contact */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-data text-[9px] tracking-[0.25em] uppercase text-dust mb-1.5">Neighborhood</label>
              <select value={form.hood} onChange={e => set("hood", e.target.value)}
                className="w-full px-3 py-2.5 bg-cream border border-rule font-body text-sm text-ink outline-none focus:border-ink transition-colors">
                <option value="">Select...</option>
                {HOODS.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-data text-[9px] tracking-[0.25em] uppercase text-dust mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={e => set("email", e.target.value)}
                placeholder="you@email.com"
                className="w-full px-3 py-2.5 bg-cream border border-rule font-body text-sm text-ink placeholder:text-dust/50 outline-none focus:border-ink transition-colors" />
            </div>
            <div>
              <label className="block font-data text-[9px] tracking-[0.25em] uppercase text-dust mb-1.5">Phone</label>
              <input type="tel" value={form.phone} onChange={e => set("phone", e.target.value)}
                placeholder="Optional"
                className="w-full px-3 py-2.5 bg-cream border border-rule font-body text-sm text-ink placeholder:text-dust/50 outline-none focus:border-ink transition-colors" />
            </div>
          </div>

          {/* Signal + publish */}
          <div className="flex items-center gap-4 pt-2">
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span className="font-data text-[8px] tracking-[0.2em] uppercase text-dust">Signal</span>
                <span className="font-data text-[8px] tracking-[0.2em] uppercase text-dust">{power}%</span>
              </div>
              <div className="h-1 bg-rule">
                <div className="h-full bg-terracotta transition-all duration-500" style={{ width: `${power}%` }} />
              </div>
            </div>
            <button onClick={publish} disabled={!canPost}
              className={`px-8 py-2.5 font-data text-[10px] tracking-[0.2em] uppercase transition-all whitespace-nowrap ${
                canPost ? "bg-ink text-cream btn-shine hover:bg-ink/80" : "bg-rule text-dust cursor-not-allowed"
              }`}>
              Publish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function PostScreen() {
  const router = useRouter();
  const [mode, setMode]   = useState<"voice"|"type">("voice");
  const [posted, setPosted] = useState(false);

  const handleDone = () => {
    setPosted(true);
    setTimeout(() => router.push("/feed"), 2200);
  };

  if (posted) return <SuccessScreen />;

  return (
    <div className="flex flex-col" style={{ minHeight: "calc(100vh - 96px)" }}>
      {/* Compact header — mode label only */}
      <div className={`flex items-center justify-between px-6 py-3 border-b border-rule ${mode === "voice" ? "bg-ink" : "bg-paper"}`}>
        <div className="flex items-center gap-3">
          <span className={`font-data text-[9px] tracking-[0.3em] uppercase ${mode === "voice" ? "text-terracotta" : "text-dust"}`}>
            {mode === "voice" ? "● Voice post" : "Type post"}
          </span>
        </div>
        {/* Mode toggle */}
        <div className={`flex items-center border ${mode === "voice" ? "border-cream/20" : "border-rule"}`}>
          <button onClick={() => setMode("voice")}
            className={`flex items-center gap-1.5 px-3 py-1.5 font-data text-[9px] tracking-[0.15em] uppercase transition-colors ${
              mode === "voice"
                ? "bg-terracotta text-cream"
                : "text-dust hover:text-mahogany"
            }`}>
            <Icon name="mic" size={11} />
            Speak
          </button>
          <button onClick={() => setMode("type")}
            className={`flex items-center gap-1.5 px-3 py-1.5 font-data text-[9px] tracking-[0.15em] uppercase transition-colors border-l ${
              mode === "type"
                ? "bg-ink text-cream border-ink"
                : mode === "voice"
                  ? "text-dust/50 hover:text-cream/70 border-cream/20"
                  : "text-dust hover:text-mahogany border-rule"
            }`}>
            <Icon name="wrench" size={11} />
            Type
          </button>
        </div>
      </div>

      {mode === "voice"
        ? <VoiceMode onDone={handleDone} onSwitch={() => setMode("type")} />
        : <TypeMode  onDone={handleDone} onSwitch={() => setMode("voice")} />}
    </div>
  );
}
