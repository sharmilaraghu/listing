"use client";

import Link from "next/link";
import { CATEGORIES, MOCK_LISTINGS, TICKER_ITEMS } from "@/lib/data";
import Icon from "@/components/ui/Icon";
import ListingCard from "@/components/ui/ListingCard";

// Inline SF Skyline SVG — chrome silhouette with shimmer
function SFSkyline() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ bottom: 0, top: "auto", height: "280px" }}
    >
      <svg
        viewBox="0 0 1200 220"
        preserveAspectRatio="xMidYMax slice"
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[140%] h-full"
        style={{ opacity: 0.12, animation: "skyline-drift 80s linear infinite" }}
      >
        <defs>
          {/* Warm chrome gradient — amber to gold to cream */}
          <linearGradient id="skyline-chrome" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F0B429" stopOpacity="1" />
            <stop offset="25%" stopColor="#E8572A" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#C4A882" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#5B7F5E" stopOpacity="0.8" />
          </linearGradient>
          {/* Horizontal chrome sheen — travels across buildings */}
          <linearGradient id="chrome-sheen" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="40%" stopColor="white" stopOpacity="0" />
            <stop offset="50%" stopColor="white" stopOpacity="0.25" />
            <stop offset="60%" stopColor="white" stopOpacity="0" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <clipPath id="skyline-clip">
            <path d="
              M0,220 L0,200 L100,200 L100,160 L105,160 L105,155 L110,155 L110,160 L115,160 L115,145
              L120,145 L120,130 L125,130 L125,140 L130,140 L130,150 L135,150 L135,130
              L140,130 L140,110 L145,110 L145,125 L150,125 L150,135 L155,135 L155,120
              L160,120 L160,130 L165,130 L165,145 L170,145 L170,110 L175,110 L175,95
              L178,95 L178,80 L185,80 L185,95 L190,95 L190,110 L200,110 L200,120
              L210,120 L210,100 L215,100 L215,85 L220,85 L220,100 L225,100 L225,115
              L230,115 L230,130 L240,130 L240,105 L245,105 L245,90 L250,90 L250,70
              L253,70 L253,55 L256,55 L256,35 L260,35 L260,55 L263,55 L263,70 L270,70
              L270,55 L275,55 L275,40 L278,40 L278,20 L282,20 L282,40 L285,40 L285,55
              L290,55 L290,70 L300,70 L300,50 L305,50 L305,30 L310,30 L310,10 L315,10
              L315,5 L318,5 L318,0 L322,0 L322,5 L325,5 L325,10 L330,10 L330,30 L335,30
              L335,50 L340,50 L340,70 L350,70 L350,55 L355,55 L355,40 L360,40 L360,25
              L362,25 L362,15 L365,15 L365,25 L368,25 L368,40 L370,40 L370,55 L375,55
              L375,45 L378,45 L378,30 L380,30 L380,15 L385,15 L385,5 L388,5 L388,0 L392,0
              L392,5 L395,5 L395,15 L398,15 L398,30 L400,30 L400,45 L405,45 L405,55
              L415,55 L415,45 L420,45 L420,30 L422,30 L422,15 L425,15 L425,5 L428,5
              L428,15 L430,15 L430,30 L435,30 L435,45 L440,45 L440,55 L450,55 L450,40
              L455,40 L455,25 L458,25 L458,10 L462,10 L462,25 L465,25 L465,40 L470,40
              L470,55 L480,55 L480,40 L485,40 L485,20 L488,20 L488,5 L492,5 L492,20
              L495,20 L495,40 L500,40 L500,55 L510,55 L510,45 L515,45 L515,30 L520,30
              L520,45 L525,45 L525,60 L530,60 L530,75 L535,75 L535,90 L540,90 L540,75
              L545,75 L545,60 L550,60 L550,75 L555,75 L555,90 L560,90 L560,100 L565,100
              L565,115 L570,115 L570,90 L575,90 L575,75 L580,75 L580,90 L585,90 L585,100
              L590,100 L590,115 L595,115 L595,130 L600,130 L600,115 L605,115 L605,100
              L610,100 L610,90 L615,90 L615,100 L620,100 L620,110 L630,110 L630,120
              L640,120 L640,110 L645,110 L645,100 L650,100 L650,90 L660,90 L660,100
              L665,100 L665,110 L670,110 L670,120 L680,120 L680,100 L685,100 L685,90
              L690,90 L690,100 L695,100 L695,110 L700,110 L700,120 L710,120 L710,110
              L715,110 L715,95 L720,95 L720,80 L725,80 L725,95 L730,95 L730,110 L740,110
              L740,95 L745,95 L745,75 L750,75 L750,60 L755,60 L755,75 L760,75 L760,95
              L765,95 L765,110 L775,110 L775,95 L780,95 L780,75 L785,75 L785,60 L790,60
              L790,75 L795,75 L795,95 L800,95 L800,110 L810,110 L810,100 L815,100 L815,85
              L820,85 L820,100 L825,100 L825,110 L835,110 L835,100 L840,100 L840,110
              L850,110 L850,120 L860,120 L860,130 L870,130 L870,140 L880,140 L880,150
              L890,150 L890,160 L900,160 L900,170 L910,170 L910,180 L920,180 L920,190
              L930,190 L930,200 L1200,200 L1200,220 Z
            "/>
          </clipPath>
        </defs>

        {/* Golden Gate Bridge */}
        <g>
          <rect x="40" y="100" width="4" height="90" fill="url(#skyline-chrome)" opacity="0.7" />
          <rect x="70" y="100" width="4" height="90" fill="url(#skyline-chrome)" opacity="0.7" />
          <rect x="40" y="100" width="34" height="3" fill="url(#skyline-chrome)" opacity="0.8" />
          <rect x="40" y="130" width="34" height="2" fill="url(#skyline-chrome)" opacity="0.6" />
          <rect x="40" y="155" width="34" height="2" fill="url(#skyline-chrome)" opacity="0.6" />
          <rect x="40" y="180" width="34" height="2" fill="url(#skyline-chrome)" opacity="0.6" />
          <path d="M40 100 Q55 85 70 100" fill="none" stroke="#F0B429" strokeWidth="1.5" opacity="0.8" />
          <path d="M40 130 Q55 115 70 130" fill="none" stroke="#E8572A" strokeWidth="1" opacity="0.6" />
          <path d="M40 155 Q55 140 70 155" fill="none" stroke="#E8572A" strokeWidth="1" opacity="0.6" />
          <path d="M40 180 Q55 165 70 180" fill="none" stroke="#E8572A" strokeWidth="1" opacity="0.6" />
        </g>

        {/* Main city skyline — base chrome fill */}
        <path
          fill="url(#skyline-chrome)"
          d="
            M100,200 L100,160 L105,160 L105,155 L110,155 L110,160 L115,160 L115,145
            L120,145 L120,130 L125,130 L125,140 L130,140 L130,150 L135,150 L135,130
            L140,130 L140,110 L145,110 L145,125 L150,125 L150,135 L155,135 L155,120
            L160,120 L160,130 L165,130 L165,145 L170,145 L170,110 L175,110 L175,95
            L178,95 L178,80 L185,80 L185,95 L190,95 L190,110 L200,110 L200,120
            L210,120 L210,100 L215,100 L215,85 L220,85 L220,100 L225,100 L225,115
            L230,115 L230,130 L240,130 L240,105 L245,105 L245,90 L250,90 L250,70
            L253,70 L253,55 L256,55 L256,35 L260,35 L260,55 L263,55 L263,70 L270,70
            L270,55 L275,55 L275,40 L278,40 L278,20 L282,20 L282,40 L285,40 L285,55
            L290,55 L290,70 L300,70 L300,50 L305,50 L305,30 L310,30 L310,10 L315,10
            L315,5 L318,5 L318,0 L322,0 L322,5 L325,5 L325,10 L330,10 L330,30 L335,30
            L335,50 L340,50 L340,70 L350,70 L350,55 L355,55 L355,40 L360,40 L360,25
            L362,25 L362,15 L365,15 L365,25 L368,25 L368,40 L370,40 L370,55 L375,55
            L375,45 L378,45 L378,30 L380,30 L380,15 L385,15 L385,5 L388,5 L388,0 L392,0
            L392,5 L395,5 L395,15 L398,15 L398,30 L400,30 L400,45 L405,45 L405,55
            L415,55 L415,45 L420,45 L420,30 L422,30 L422,15 L425,15 L425,5 L428,5
            L428,15 L430,15 L430,30 L435,30 L435,45 L440,45 L440,55 L450,55 L450,40
            L455,40 L455,25 L458,25 L458,10 L462,10 L462,25 L465,25 L465,40 L470,40
            L470,55 L480,55 L480,40 L485,40 L485,20 L488,20 L488,5 L492,5 L492,20
            L495,20 L495,40 L500,40 L500,55 L510,55 L510,45 L515,45 L515,30 L520,30
            L520,45 L525,45 L525,60 L530,60 L530,75 L535,75 L535,90 L540,90 L540,75
            L545,75 L545,60 L550,60 L550,75 L555,75 L555,90 L560,90 L560,100 L565,100
            L565,115 L570,115 L570,90 L575,90 L575,75 L580,75 L580,90 L585,90 L585,100
            L590,100 L590,115 L595,115 L595,130 L600,130 L600,115 L605,115 L605,100
            L610,100 L610,90 L615,90 L615,100 L620,100 L620,110 L630,110 L630,120
            L640,120 L640,110 L645,110 L645,100 L650,100 L650,90 L660,90 L660,100
            L665,100 L665,110 L670,110 L670,120 L680,120 L680,100 L685,100 L685,90
            L690,90 L690,100 L695,100 L695,110 L700,110 L700,120 L710,120 L710,110
            L715,110 L715,95 L720,95 L720,80 L725,80 L725,95 L730,95 L730,110 L740,110
            L740,95 L745,95 L745,75 L750,75 L750,60 L755,60 L755,75 L760,75 L760,95
            L765,95 L765,110 L775,110 L775,95 L780,95 L780,75 L785,75 L785,60 L790,60
            L790,75 L795,75 L795,95 L800,95 L800,110 L810,110 L810,100 L815,100 L815,85
            L820,85 L820,100 L825,100 L825,110 L835,110 L835,100 L840,100 L840,110
            L850,110 L850,120 L860,120 L860,130 L870,130 L870,140 L880,140 L880,150
            L890,150 L890,160 L900,160 L900,170 L910,170 L910,180 L920,180 L920,190
            L930,190 L930,200 L1100,200 Z
          "
        />

        {/* Chrome sheen overlay — travels across the silhouette */}
        <rect
          x="-400"
          y="0"
          width="600"
          height="220"
          fill="url(#chrome-sheen)"
          style={{ animation: "chrome-shimmer 8s ease-in-out infinite" }}
        />

        {/* Transamerica Pyramid — gold highlight */}
        <path
          fill="#F0B429"
          opacity="0.9"
          d="M375,200 L375,90 L378,90 L378,75 L380,75 L380,55 L382,55 L382,75 L385,75 L385,90 L388,90 L388,200 Z"
        />

        {/* Salesforce Tower — terracotta highlight */}
        <path
          fill="#E8572A"
          opacity="0.9"
          d="M455,200 L455,90 L458,90 L458,60 L460,60 L460,40 L462,40 L462,60 L465,60 L465,90 L470,90 L470,200 Z"
        />

        {/* Coit Tower — sage */}
        <path
          fill="#5B7F5E"
          opacity="0.8"
          d="M840,200 L840,120 L842,120 L842,115 L844,115 L844,110 L846,110 L846,105 L848,105 L848,90 L850,90 L850,120 L852,120 L852,200 Z"
        />

        {/* Ferry Building clock tower — gold */}
        <path
          fill="#C4A882"
          opacity="0.85"
          d="M580,200 L580,75 L582,75 L582,70 L584,70 L584,65 L586,65 L586,70 L588,70 L588,75 L590,75 L590,200 Z"
        />
        <rect x="578" y="68" width="14" height="4" fill="#F0B429" opacity="0.9" />

        {/* Bay Bridge towers */}
        <g opacity="0.6">
          <rect x="620" y="110" width="4" height="90" fill="url(#skyline-chrome)" />
          <rect x="635" y="110" width="4" height="90" fill="url(#skyline-chrome)" />
          <rect x="620" y="110" width="19" height="3" fill="url(#skyline-chrome)" />
          <path d="M620 113 Q627 100 635 113" fill="none" stroke="#E8572A" strokeWidth="1.5" opacity="0.8" />
        </g>
      </svg>

      <style>{`
        @keyframes skyline-drift {
          0%   { transform: translateX(-50%) translateX(0); }
          100% { transform: translateX(-50%) translateX(-12%); }
        }
        @keyframes chrome-shimmer {
          0%   { transform: translateX(-400px); }
          100% { transform: translateX(1600px); }
        }
      `}</style>
    </div>
  );
}

export default function HomeScreen() {
  const recent = MOCK_LISTINGS.slice(0, 6);

  return (
    <div className="flex flex-col">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-16 pb-12 px-4 md:px-8 bg-cream">
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

        {/* SF Skyline silhouette */}
        <SFSkyline />

        <div className="max-w-7xl mx-auto text-center relative">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 bg-paper border border-rule">
            <div className="w-1.5 h-1.5 rounded-full bg-sage animate-pulse" />
            <span className="font-data text-[9px] tracking-[0.35em] uppercase text-dust">
              San Francisco · Live Classifieds
            </span>
          </div>

          {/* Chrome headline */}
          <h1 className="font-display font-black text-6xl md:text-8xl lg:text-9xl tracking-tight leading-none mb-3">
            <span className="chrome-text">LISTING</span>
          </h1>
          <p className="font-display text-xl md:text-2xl text-mahogany italic mb-10">
            the city&apos;s live marketplace
          </p>

          {/* Search bar */}
          <div className="max-w-xl mx-auto flex items-center gap-0 bg-paper border-2 border-ink rounded-none overflow-hidden shadow-[6px_6px_0px_rgba(28,16,7,0.15)]">
            <div className="pl-4 text-dust">
              <Icon name="search" size={20} />
            </div>
            <input
              type="text"
              placeholder="Search anything..."
              className="flex-1 px-4 py-4 bg-transparent font-body text-ink placeholder:text-dust/60 outline-none"
            />
            <button className="px-6 py-4 bg-terracotta text-cream font-data text-[11px] tracking-[0.2em] uppercase btn-shine hover:bg-[#CC4A1E] transition-colors">
              Search
            </button>
          </div>
        </div>
      </section>

      {/* ── Ticker ── */}
      <div className="relative border-t-2 border-b border-rule bg-paper">
        {/* Live Activity header */}
        <div className="absolute left-0 top-0 bottom-0 flex items-center">
          <div className="flex items-center gap-0 -skew-x-12">
            <div className="flex items-center gap-2 pl-4 pr-6 py-1 bg-ink">
              <div className="w-1.5 h-1.5 rounded-full bg-terracotta animate-pulse" />
              <span className="font-data text-[9px] tracking-[0.3em] uppercase text-cream">
                Live
              </span>
            </div>
            <div className="w-px h-3 bg-rule" />
          </div>
        </div>

        {/* Scrolling track */}
        <div className="pl-32 overflow-hidden">
          <div className="ticker-track flex items-center gap-10 whitespace-nowrap py-3">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span key={i} className="flex items-center gap-3 font-data text-[10px] tracking-[0.2em] text-mahogany">
                <span className="w-1 h-1 rounded-full bg-terracotta shrink-0" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

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
