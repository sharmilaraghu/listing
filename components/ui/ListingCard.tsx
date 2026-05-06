"use client";

import Link from "next/link";
import { useCompareContext } from "@/components/compare/CompareContext";
import type { Listing } from "@/lib/types";
import Badge from "./Badge";
import Icon from "./Icon";

const CAT_COLORS: Record<string, string> = {
  transit:  "#E8572A",
  shelter:  "#3D1F0E",
  gear:     "#F0B429",
  labor:    "#5B7F5E",
  free:     "#E8572A",
  audio:    "#3D1F0E",
  people:   "#5B7F5E",
  misc:     "#F0B429",
};

const CAT_LABELS: Record<string, string> = {
  transit:  "FOR WHEELS",
  shelter:  "FOR RENT",
  gear:     "FOR SALE",
  labor:    "FOR HIRE",
  free:     "FREE PICKS",
  audio:    "SOUND KIT",
  people:   "CONNECT",
  misc:     "ODDITIES",
};

interface ListingCardProps {
  listing: Listing;
  variant?: "grid" | "row";
}

function PlaceholderArt({ cat, color }: { cat: string; color: string }) {
  const c = color;
  const sw = 1.5;

  const artMap: Record<string, React.ReactNode> = {
    transit: (
      <svg width="60" height="48" viewBox="0 0 90 70" fill="none" style={{ filter: `drop-shadow(0 0 6px ${c})` }}>
        <circle cx="22" cy="50" r="17" stroke={c} strokeWidth={sw}/>
        <circle cx="68" cy="50" r="17" stroke={c} strokeWidth={sw}/>
        <path d="M22 50 L40 24 L68 50" stroke={c} strokeWidth={sw}/>
        <path d="M40 24 L48 38" stroke={c} strokeWidth={sw}/>
        <circle cx="22" cy="50" r="4" fill={c} opacity="0.4"/>
        <circle cx="68" cy="50" r="4" fill={c} opacity="0.4"/>
      </svg>
    ),
    shelter: (
      <svg width="60" height="52" viewBox="0 0 80 68" fill="none" style={{ filter: `drop-shadow(0 0 6px ${c})` }}>
        <path d="M10 38 L40 10 L70 38" stroke={c} strokeWidth={sw}/>
        <rect x="16" y="38" width="48" height="24" stroke={c} strokeWidth={sw}/>
        <rect x="30" y="44" width="20" height="18" stroke={c} strokeWidth="1.2"/>
        <rect x="20" y="42" width="10" height="8" stroke={c} strokeWidth="1"/>
        <rect x="50" y="42" width="10" height="8" stroke={c} strokeWidth="1"/>
      </svg>
    ),
    audio: (
      <svg width="72" height="44" viewBox="0 0 100 60" fill="none" style={{ filter: `drop-shadow(0 0 6px ${c})` }}>
        <rect x="4" y="4" width="92" height="52" stroke={c} strokeWidth="1" opacity="0.3"/>
        <path d="M4 30 L14 30 L20 12 L28 48 L36 12 L44 48 L52 12 L60 48 L68 12 L76 48 L82 30 L96 30" stroke={c} strokeWidth={sw} strokeLinecap="square"/>
        <line x1="4" y1="30" x2="96" y2="30" stroke={c} strokeWidth="0.6" opacity="0.25" strokeDasharray="3 3"/>
      </svg>
    ),
    gear: (
      <svg width="56" height="50" viewBox="0 0 80 72" fill="none" style={{ filter: `drop-shadow(0 0 6px ${c})` }}>
        <rect x="16" y="16" width="48" height="38" stroke={c} strokeWidth={sw}/>
        <line x1="16" y1="26" x2="64" y2="26" stroke={c} strokeWidth="0.8" opacity="0.5"/>
        <line x1="16" y1="36" x2="64" y2="36" stroke={c} strokeWidth="0.8" opacity="0.5"/>
        <line x1="16" y1="46" x2="64" y2="46" stroke={c} strokeWidth="0.8" opacity="0.5"/>
        <circle cx="23" cy="21" r="2.5" fill={c} opacity="0.7"/>
        <circle cx="30" cy="21" r="2.5" fill={c} opacity="0.35"/>
        <circle cx="37" cy="21" r="2.5" fill={c} opacity="0.7"/>
      </svg>
    ),
    labor: (
      <svg width="48" height="56" viewBox="0 0 72 80" fill="none" style={{ filter: `drop-shadow(0 0 6px ${c})` }}>
        <path d="M18 65 L54 18" stroke={c} strokeWidth="7" strokeLinecap="square"/>
        <circle cx="16" cy="60" r="12" fill="none" stroke={c} strokeWidth={sw}/>
        <circle cx="56" cy="22" r="12" fill="none" stroke={c} strokeWidth={sw}/>
      </svg>
    ),
    free: (
      <svg width="56" height="48" viewBox="0 0 80 68" fill="none" style={{ filter: `drop-shadow(0 0 6px ${c})` }}>
        <rect x="12" y="30" width="56" height="32" stroke={c} strokeWidth={sw}/>
        <rect x="9" y="20" width="62" height="13" stroke={c} strokeWidth={sw}/>
        <line x1="40" y1="20" x2="40" y2="62" stroke={c} strokeWidth={sw}/>
        <path d="M40 20 C36 14 26 12 26 17 C26 22 36 22 40 22" stroke={c} strokeWidth="1.2" fill="none"/>
        <path d="M40 20 C44 14 54 12 54 17 C54 22 44 22 40 22" stroke={c} strokeWidth="1.2" fill="none"/>
      </svg>
    ),
    people: (
      <svg width="56" height="50" viewBox="0 0 82 72" fill="none" style={{ filter: `drop-shadow(0 0 6px ${c})` }}>
        <circle cx="41" cy="16" r="9" stroke={c} strokeWidth={sw}/>
        <circle cx="14" cy="58" r="9" stroke={c} strokeWidth={sw}/>
        <circle cx="68" cy="58" r="9" stroke={c} strokeWidth={sw}/>
        <line x1="41" y1="25" x2="16" y2="49" stroke={c} strokeWidth="1.2"/>
        <line x1="41" y1="25" x2="66" y2="49" stroke={c} strokeWidth="1.2"/>
        <line x1="23" y1="58" x2="59" y2="58" stroke={c} strokeWidth="1.2"/>
      </svg>
    ),
    misc: (
      <svg width="52" height="52" viewBox="0 0 72 72" fill="none" style={{ filter: `drop-shadow(0 0 6px ${c})` }}>
        <path d="M36 8 L62 26 L54 58 L18 58 L10 26 Z" stroke={c} strokeWidth={sw} fill="none"/>
        <line x1="10" y1="26" x2="62" y2="26" stroke={c} strokeWidth="1"/>
        <circle cx="36" cy="38" r="6" fill={c} opacity="0.2" stroke={c} strokeWidth="1"/>
        <circle cx="36" cy="38" r="2" fill={c} opacity="0.6"/>
      </svg>
    ),
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {artMap[cat] || artMap.misc}
    </div>
  );
}

export default function ListingCard({ listing, variant = "grid" }: ListingCardProps) {
  const { selected, toggle } = useCompareContext();
  const isSelected = selected.some((l) => l.id === listing.id);
  const color = CAT_COLORS[listing.cat] || "#E8572A";
  const catLabel = CAT_LABELS[listing.cat] || listing.cat.toUpperCase();

  if (variant === "row") {
    return (
      <Link
        href={`/listing/${listing.id}`}
        className="group flex gap-0 bg-paper border border-rule card-lift overflow-hidden"
      >
        {/* Thumbnail */}
        <div
          className="relative shrink-0 w-36 md:w-44 h-28 overflow-hidden"
          style={{
            background: listing.imageUrl
              ? `url('${listing.imageUrl}') center/cover no-repeat`
              : `repeating-linear-gradient(45deg, rgba(0,0,0,0.03) 0 10px, rgba(0,0,0,0.01) 10px 20px), ${color}10`,
          }}
        >
          {listing.imageUrl && (
            <div className="absolute inset-0" style={{ background: `linear-gradient(to right, rgba(28,16,7,0.3), transparent)` }} />
          )}
          {!listing.imageUrl && <PlaceholderArt cat={listing.cat} color={color} />}
          {listing.badge && (
            <div className="absolute top-2 left-2 z-10">
              <Badge kind={listing.badge} compact />
            </div>
          )}
          {/* Compare checkbox */}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(listing); }}
            className={`absolute top-2 right-2 z-20 w-6 h-6 rounded-sm border flex items-center justify-center transition-all duration-200 ${
              isSelected
                ? "bg-terracotta border-terracotta text-cream"
                : "bg-cream/80 border-rule text-dust hover:border-terracotta hover:text-terracotta"
            }`}
            aria-label={isSelected ? "Remove from comparison" : "Add to comparison"}
          >
            <Icon name="check" size={11} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
          <div>
            <div className="font-data text-[9px] tracking-[0.25em] text-dust uppercase mb-1 flex items-center gap-2">
              <span>{listing.id}</span>
              <span>·</span>
              <span style={{ color }}>{catLabel}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Icon name="pin" size={9} />
                {listing.hood}
              </span>
            </div>
            <h3 className="font-body font-semibold text-ink text-base leading-snug line-clamp-2 group-hover:text-terracotta transition-colors">
              {listing.title}
            </h3>
            <p className="font-body text-mahogany text-xs leading-relaxed line-clamp-2 mt-1 hidden md:block">
              {listing.desc}
            </p>
          </div>
          <div className="flex items-center gap-3 mt-2 font-data text-[10px] text-dust">
            <span>{listing.posted}</span>
            <span>·</span>
            <span>{listing.seller.name}</span>
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px]"
              style={{
                color: listing.seller.score > 80 ? "#5B7F5E" : listing.seller.score > 50 ? "#C4A882" : "#E8572A",
                border: `1px solid`,
                borderColor: listing.seller.score > 80 ? "#5B7F5E" : listing.seller.score > 50 ? "#C4A882" : "#E8572A",
              }}
            >
              TRUST {listing.seller.score}
            </span>
          </div>
        </div>

        {/* Price */}
        <div className="shrink-0 border-l border-rule p-4 flex flex-col items-end justify-between min-w-[120px]">
          <div className="font-data text-[9px] text-dust tracking-widest uppercase">Price</div>
          <div
            className={`font-display font-bold text-2xl leading-none ${
              listing.price === 0 ? "text-sage" : "text-ink"
            }`}
          >
            {listing.price === 0 ? "FREE" : `$${listing.price.toLocaleString()}`}
          </div>
          <span className="font-data text-[10px] text-terracotta tracking-[0.15em] uppercase flex items-center gap-1">
            View <Icon name="arrow" size={10} />
          </span>
        </div>
      </Link>
    );
  }

  // Grid variant
  return (
    <Link
      href={`/listing/${listing.id}`}
      className="group block bg-paper border border-rule card-lift overflow-hidden"
    >
      {/* Image area */}
      <div
        className="relative h-48 overflow-hidden"
        style={{
          background: listing.imageUrl
            ? `url('${listing.imageUrl}') center/cover no-repeat, ${color}12`
            : `repeating-linear-gradient(45deg, rgba(0,0,0,0.03) 0 10px, rgba(0,0,0,0.01) 10px 20px), ${color}12`,
        }}
      >
        {/* Gradient overlay for text readability over photos */}
        {listing.imageUrl && (
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(to top, rgba(28,16,7,0.7) 0%, rgba(28,16,7,0.1) 60%, transparent 100%)` }}
          />
        )}
        {/* Fallback placeholder art over photos */}
        {listing.imageUrl && (
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <PlaceholderArt cat={listing.cat} color={color} />
          </div>
        )}
        {!listing.imageUrl && <PlaceholderArt cat={listing.cat} color={color} />}
        {listing.badge && (
          <div className="absolute top-3 left-3 z-10">
            <Badge kind={listing.badge} />
          </div>
        )}
        {/* Compare checkbox */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(listing); }}
          className={`absolute top-3 right-3 z-20 w-7 h-7 rounded-sm border flex items-center justify-center transition-all duration-200 ${
            isSelected
              ? "bg-terracotta border-terracotta text-cream"
              : "bg-cream/80 border-rule text-dust hover:border-terracotta hover:text-terracotta"
          }`}
          aria-label={isSelected ? "Remove from comparison" : "Add to comparison"}
        >
          <Icon name="check" size={12} />
        </button>
        <div className="absolute top-3 right-3 font-data text-[9px] text-dust bg-cream/80 px-2 py-0.5 backdrop-blur-sm z-10">
          {listing.id}
        </div>
        {/* Section label */}
        <div
          className="absolute bottom-0 left-0 right-0 px-3 py-1.5 font-data text-[9px] tracking-[0.25em] text-cream z-10"
          style={{ background: listing.imageUrl ? 'rgba(28,16,7,0.7)' : `${color}99` }}
        >
          {catLabel}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-body font-semibold text-ink text-sm leading-snug line-clamp-2 group-hover:text-terracotta transition-colors flex-1">
            {listing.title}
          </h3>
          <div
            className={`font-display font-bold text-base leading-none shrink-0 ${
              listing.price === 0 ? "text-sage" : "text-ink"
            }`}
          >
            {listing.price === 0 ? "FREE" : `$${listing.price.toLocaleString()}`}
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between font-data text-[10px] text-dust">
          <span className="flex items-center gap-1">
            <Icon name="pin" size={10} />
            {listing.hood}
          </span>
          <span>{listing.posted}</span>
        </div>
      </div>
    </Link>
  );
}
