"use client";

import Link from "next/link";
import type { Event } from "@/lib/types";
import Icon from "@/components/ui/Icon";
import FavoriteButton from "./FavoriteButton";

const CAT_COLORS: Record<string, string> = {
  music:    "#E8572A",
  food:     "#F0B429",
  arts:     "#5B7F5E",
  markets:  "#3D1F0E",
  community:"#8A6E50",
};

const CAT_ICONS: Record<string, string> = {
  music:    "wave",
  food:     "gift",
  arts:     "star",
  markets:  "cube",
  community:"users",
};

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Icon
          key={i}
          name={i < full ? "star" : i === full && half ? "star-half" : "star"}
          size={9}
          className={i < full || (i === full && half) ? "text-gold fill-gold" : "text-dust/30"}
        />
      ))}
      <span className="font-data text-[9px] text-dust ml-1">{rating.toFixed(1)}</span>
    </span>
  );
}

interface EventCardProps {
  event: Event;
  variant?: "grid" | "row";
}

function EventPlaceholderArt({ cat }: { cat: string }) {
  const color = CAT_COLORS[cat] || "#8A6E50";
  return (
    <svg width="48" height="48" viewBox="0 0 60 60" fill="none" style={{ filter: `drop-shadow(0 0 6px ${color})` }}>
      <circle cx="30" cy="30" r="26" stroke={color} strokeWidth="2" />
      <path d="M30 12 L30 32 L44 38" stroke={color} strokeWidth="2" strokeLinecap="square" />
      <circle cx="30" cy="30" r="3" fill={color} opacity="0.6" />
    </svg>
  );
}

export default function EventCard({ event, variant = "grid" }: EventCardProps) {
  const color = CAT_COLORS[event.cat] || "#8A6E50";

  if (variant === "row") {
    return (
      <div className="flex gap-0 bg-paper border border-rule overflow-hidden group hover:border-ink transition-colors">
        {/* Thumbnail */}
        <div
          className="relative shrink-0 w-28 h-24 overflow-hidden"
          style={{
            background: event.imageUrl
              ? `url('${event.imageUrl}') center/cover no-repeat`
              : `repeating-linear-gradient(45deg, rgba(0,0,0,0.03) 0 10px, rgba(0,0,0,0.01) 10px 20px), ${color}10`,
          }}
        >
          {!event.imageUrl && <div className="absolute inset-0 flex items-center justify-center"><EventPlaceholderArt cat={event.cat} /></div>}
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(to right, rgba(28,16,7,0.25), transparent)` }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-data text-[8px] tracking-[0.2em] uppercase" style={{ color }}>{event.cat}</span>
              <span className="text-dust/40">·</span>
              <span className="font-data text-[8px] text-dust flex items-center gap-1">
                <Icon name="pin" size={8} />{event.hood}
              </span>
            </div>
            <h3 className="font-display font-semibold text-ink text-xs leading-snug line-clamp-1 group-hover:text-terracotta transition-colors">
              {event.title}
            </h3>
            <p className="font-data text-[9px] text-dust mt-0.5 truncate">{event.venue}</p>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-data text-[9px] text-dust">
              <span>{event.date}</span>
              <span>·</span>
              <span>{event.time}</span>
            </div>
            <StarRating rating={event.rating} />
          </div>
        </div>

        {/* Price + save */}
        <div className="shrink-0 border-l border-rule p-3 flex flex-col items-center justify-between min-w-[72px]">
          <div className={`font-display font-bold text-sm leading-none ${event.price === 0 ? "text-sage" : "text-ink"}`}>
            {event.price === 0 ? "FREE" : `$${event.price}`}
          </div>
          <FavoriteButton type="event" itemId={event.id} size={12} />
        </div>
      </div>
    );
  }

  // Grid variant
  return (
    <div className="group block bg-paper border border-rule overflow-hidden hover:border-ink transition-colors">
      {/* Image area */}
      <div
        className="relative h-36 overflow-hidden"
        style={{
          background: event.imageUrl
            ? `url('${event.imageUrl}') center/cover no-repeat, ${color}12`
            : `repeating-linear-gradient(45deg, rgba(0,0,0,0.03) 0 10px, rgba(0,0,0,0.01) 10px 20px), ${color}12`,
        }}
      >
        {event.imageUrl && (
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(to top, rgba(28,16,7,0.65) 0%, rgba(28,16,7,0.1) 55%, transparent 100%)` }}
          />
        )}
        {!event.imageUrl && (
          <div className="absolute inset-0 flex items-center justify-center">
            <EventPlaceholderArt cat={event.cat} />
          </div>
        )}

        {/* Category + date */}
        <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5">
          <span
            className="px-2 py-0.5 font-data text-[8px] tracking-[0.2em] uppercase text-cream"
            style={{ backgroundColor: color + "cc" }}
          >
            {event.cat}
          </span>
          <span className="font-data text-[8px] text-cream/80 bg-ink/40 px-1.5 py-0.5 backdrop-blur-sm">
            {event.date}
          </span>
        </div>

        {/* Save button */}
        <div className="absolute top-2 right-2 z-10">
          <FavoriteButton type="event" itemId={event.id} size={13} />
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-display font-semibold text-ink text-sm leading-snug line-clamp-2 group-hover:text-terracotta transition-colors mb-1">
          {event.title}
        </h3>
        <div className="flex items-center gap-1 font-data text-[9px] text-dust mb-2">
          <Icon name="pin" size={9} />
          <span>{event.venue} · {event.hood}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className={`font-display font-bold text-base leading-none ${event.price === 0 ? "text-sage" : "text-ink"}`}>
            {event.price === 0 ? "FREE" : `$${event.price}`}
          </div>
          <StarRating rating={event.rating} />
        </div>
      </div>
    </div>
  );
}
