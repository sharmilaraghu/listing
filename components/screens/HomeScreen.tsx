"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CATEGORIES, MOCK_LISTINGS, MOCK_EVENTS } from "@/lib/data";
import Icon from "@/components/ui/Icon";
import ListingCard from "@/components/ui/ListingCard";
import EventCard from "@/components/ui/EventCard";


export default function HomeScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const recent = MOCK_LISTINGS.slice(0, 6);
  const featuredEvents = MOCK_EVENTS.slice(0, 3);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/feed?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/feed");
    }
  };

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

          {/* Search bar */}
          <form onSubmit={handleSearch} className="max-w-xl mx-auto flex items-center gap-0 bg-paper border-2 border-ink rounded-none overflow-hidden shadow-[6px_6px_0px_rgba(28,16,7,0.15)]">
            <div className="pl-4 text-dust">
              <Icon name="search" size={20} />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search anything..."
              className="flex-1 px-4 py-4 bg-transparent font-body text-ink placeholder:text-dust/60 outline-none"
            />
            <button type="submit" className="px-6 py-4 bg-terracotta text-cream font-data text-[11px] tracking-[0.2em] uppercase btn-shine hover:bg-[#CC4A1E] transition-colors">
              Search
            </button>
          </form>

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
