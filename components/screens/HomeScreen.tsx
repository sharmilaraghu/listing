"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CATEGORIES, MOCK_LISTINGS, MOCK_EVENTS } from "@/lib/data";
import Icon from "@/components/ui/Icon";
import ListingCard from "@/components/ui/ListingCard";
import EventCard from "@/components/ui/EventCard";

// Minimal voice parser — mirrors useVoiceSearch logic
const CAT_KEYWORDS: Record<string, string> = {
  bike: "transit", bicycle: "transit", car: "transit", motorcycle: "transit", scooter: "transit",
  apartment: "shelter", studio: "shelter", flat: "shelter", room: "shelter", sublet: "shelter", rent: "shelter",
  synth: "audio", guitar: "audio", speaker: "audio", headphones: "audio", keyboard: "audio",
  laptop: "gear", phone: "gear", camera: "gear", desk: "gear", furniture: "gear", computer: "gear",
  plumber: "labor", handyman: "labor", mover: "labor", cleaning: "labor",
  free: "free", giveaway: "free",
};
const HOOD_ALIASES: Record<string, string> = {
  soma: "SoMa", mission: "Mission", castro: "Castro", noe: "Noe Valley",
  sunset: "Outer Sunset", richmond: "Inner Richmond", bayview: "Bayview",
  hayes: "Hayes Valley", pacific: "Pacific Heights", dogpatch: "Dogpatch",
};

function parseVoice(text: string): { cat?: string; hood?: string; priceMax?: number } {
  const lower = text.toLowerCase();
  let cat: string | undefined;
  let hood: string | undefined;
  let priceMax: number | undefined;
  for (const [kw, c] of Object.entries(CAT_KEYWORDS)) { if (lower.includes(kw)) { cat = c; break; } }
  for (const [alias, h] of Object.entries(HOOD_ALIASES)) { if (lower.includes(alias)) { hood = h; break; } }
  const pm = lower.match(/under\s*\$?([\d,]+)|less\s*than\s*\$?([\d,]+)|\$\s*([\d,]+)/);
  if (pm) priceMax = parseInt((pm[1] || pm[2] || pm[3]).replace(/,/g, ""), 10);
  return { cat, hood, priceMax };
}

declare global { interface Window { SpeechRecognition: any; webkitSpeechRecognition: any; } }

export default function HomeScreen() {
  const router = useRouter();
  const [query, setQuery]           = useState("");
  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const recRef = useRef<any>(null);
  const recent = MOCK_LISTINGS.slice(0, 6);
  const featuredEvents = MOCK_EVENTS.slice(0, 3);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/feed?q=${encodeURIComponent(q)}` : "/feed");
  };

  const startVoice = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";
    recRef.current = rec;
    setVoiceActive(true);
    setVoiceTranscript("");

    rec.onresult = (e: any) => {
      let txt = "";
      for (let i = 0; i < e.results.length; i++) txt += e.results[i][0].transcript;
      setVoiceTranscript(txt);
      setQuery(txt);
    };

    rec.onend = () => {
      setVoiceActive(false);
      const final = recRef.current?._lastTranscript || voiceTranscript;
      if (!final.trim()) return;
      const { cat, hood, priceMax } = parseVoice(final);
      const params = new URLSearchParams();
      if (final.trim()) params.set("q", final.trim());
      if (cat) params.set("cat", cat);
      if (hood) params.set("hood", hood);
      if (priceMax) params.set("priceMax", String(priceMax));
      router.push(`/feed?${params.toString()}`);
    };

    rec.start();
  }, [router, voiceTranscript]);

  const stopVoice = useCallback(() => {
    if (recRef.current) {
      recRef.current._lastTranscript = voiceTranscript;
      recRef.current.stop();
    }
    setVoiceActive(false);
  }, [voiceTranscript]);

  return (
    <div className="flex flex-col">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-24 pb-12 px-4 md:px-8 bg-cream">
        {/* Subtle diagonal texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `repeating-linear-gradient(
              -45deg,
              transparent,
              transparent 20px,
              rgba(28,16,7,1) 20px,
              rgba(28,16,7,1) 21px
            )`,
          }}
        />

        {/* Warm ambient glow — breathes slowly */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none animate-fog"
          style={{
            background: `radial-gradient(ellipse 60% 70% at 50% 50%, rgba(232,87,42,0.07) 0%, rgba(240,180,41,0.04) 45%, transparent 75%)`,
          }}
        />

        {/* Signal broadcast rings — emanate from center */}
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            aria-hidden="true"
            className="animate-ring pointer-events-none absolute rounded-full"
            style={{
              width: 320,
              height: 320,
              top: "50%",
              left: "50%",
              border: `1px solid rgba(232,87,42,${0.14 - i * 0.02})`,
              animationDelay: `${i * 1.25}s`,
            }}
          />
        ))}

        <div className="max-w-7xl mx-auto text-center relative">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 bg-paper border border-rule">
            <div className="w-1.5 h-1.5 rounded-full bg-sage animate-pulse" />
            <span className="font-data text-[9px] tracking-[0.35em] uppercase text-mahogany">
              US Classifieds · Live
            </span>
          </div>

          {/* Chrome headline */}
          <h1 className="font-display font-black text-6xl md:text-8xl lg:text-9xl tracking-tight leading-none mb-3">
            <span className="chrome-text">LISTING</span>
          </h1>
          <p className="font-display text-xl md:text-2xl text-mahogany italic mb-10">
            classifieds. still alive.
          </p>

          {/* Search bar + voice */}
          <form onSubmit={handleSearch}
            className={`max-w-xl mx-auto flex items-center gap-0 bg-paper border-2 rounded-none overflow-hidden shadow-[6px_6px_0px_rgba(28,16,7,0.15)] transition-all duration-300 ${
              voiceActive ? "border-terracotta shadow-[6px_6px_0px_rgba(232,87,42,0.25),0_0_0_3px_rgba(232,87,42,0.12)]" : "border-ink"
            }`}>
            <div className="pl-4 text-dust shrink-0">
              <Icon name="search" size={20} />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); if (voiceActive) stopVoice(); }}
              placeholder={voiceActive ? "Listening…" : "Search anything…"}
              className={`flex-1 px-4 py-4 bg-transparent font-body placeholder:text-dust/60 outline-none transition-colors ${
                voiceActive ? "text-terracotta placeholder:text-terracotta/50" : "text-ink"
              }`}
            />

            {/* Mic button */}
            <button
              type="button"
              onClick={voiceActive ? stopVoice : startVoice}
              className={`relative px-4 py-4 transition-all duration-200 border-l border-rule shrink-0 ${
                voiceActive ? "bg-terracotta/10 text-terracotta" : "text-dust hover:text-terracotta hover:bg-terracotta/5"
              }`}
              title={voiceActive ? "Stop listening" : "Search by voice"}
            >
              {voiceActive ? (
                <span className="flex items-end gap-px h-5">
                  {[1,2,3,4].map(i => (
                    <span key={i} className="w-1 bg-terracotta rounded-full animate-wave-bar"
                      style={{ height: `${6 + i * 3}px`, animationDelay: `${i * 0.08}s` }} />
                  ))}
                </span>
              ) : (
                <Icon name="mic" size={18} />
              )}
              {voiceActive && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-terracotta animate-pulse" />
              )}
            </button>

            <button type="submit"
              className="px-6 py-4 bg-terracotta text-cream font-data text-[11px] tracking-[0.2em] uppercase btn-shine hover:bg-[#CC4A1E] transition-colors shrink-0">
              Search
            </button>
          </form>

          {/* Voice hint */}
          {voiceActive && voiceTranscript && (
            <p className="mt-3 font-display text-sm text-terracotta italic opacity-80">
              "{voiceTranscript}"
            </p>
          )}
          {!voiceActive && (
            <p className="mt-3 font-data text-[9px] tracking-[0.2em] text-dust/50 uppercase">
              Tap <Icon name="mic" size={9} className="inline mx-1 text-dust/50" /> to search by voice
            </p>
          )}

                  </div>
      </section>

      {/* ── Categories ── */}
      <section className="py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex items-baseline gap-4">
            <h2 className="font-display font-black text-4xl text-ink">Today&apos;s Sections</h2>
            <div className="flex-1 h-px bg-rule" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={`/feed?cat=${cat.id}`}
                className="group relative flex flex-col p-5 bg-paper border border-rule card-lift hover:border-ink"
              >
                <div
                  className="mb-4 w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: cat.color + "18", color: cat.color }}
                >
                  <Icon name={cat.icon} size={22} />
                </div>
                <div className="font-display font-black text-lg text-ink leading-tight mb-1">
                  {cat.label}
                </div>
                <div className="font-data text-[10px] tracking-[0.2em] text-dust">
                  {cat.count.toLocaleString()} listings
                </div>
                <div
                  className="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-500"
                  style={{ backgroundColor: cat.color }}
                />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Upcoming Events ── */}
      <section className="py-16 px-4 md:px-8 bg-cream border-t border-rule">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex items-baseline gap-4">
            <div>
              <h2 className="font-display font-black text-4xl text-ink">Upcoming Events</h2>
              <p className="font-data text-[10px] tracking-[0.2em] text-dust mt-1">San Francisco · This Week</p>
            </div>
            <div className="flex-1 h-px bg-rule" />
            <Link
              href="/events"
              className="group flex items-center gap-2 font-data text-[11px] tracking-[0.2em] uppercase text-terracotta hover:underline underline-offset-4"
            >
              See all events
              <Icon name="arrow" size={11} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Recent Listings ── */}
      <section className="py-16 px-4 md:px-8 bg-paper border-t border-rule">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex items-baseline gap-6">
            <h2 className="font-display font-black text-4xl text-ink">Just Posted</h2>
            <div className="flex-1 h-px bg-rule align-middle mt-2" />
            <Link
              href="/feed"
              className="group flex items-center gap-2 font-data text-[11px] tracking-[0.2em] uppercase text-terracotta hover:underline underline-offset-4"
            >
              Browse all
              <Icon name="arrow" size={11} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recent.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust banner ── */}
      <section className="border-t border-rule bg-cream py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-paper border-2 border-ink p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="gem" size={16} className="text-gold" />
                <span className="font-data text-[9px] tracking-[0.3em] uppercase text-gold">Verified</span>
              </div>
              <h3 className="font-display font-black text-2xl text-ink mb-1">Every seller is vetted.</h3>
              <p className="font-body text-mahogany">
                Trust scores are real. Scammers don&apos;t last. LISTING is for people who actually live here.
              </p>
            </div>
            <div className="flex items-center gap-6">
              {[
                { score: "92", label: "Avg Trust Score" },
                { score: "0", label: "Scam Reports" },
                { score: "100%", label: "Human Verified" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="font-display font-black text-3xl text-ink leading-none">{stat.score}</div>
                  <div className="font-data text-[9px] tracking-[0.2em] text-dust uppercase mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
