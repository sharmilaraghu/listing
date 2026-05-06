"use client";

import { useState } from "react";
import { MOCK_EVENTS, EVENT_CATEGORIES } from "@/lib/data";
import { useUserContext } from "@/lib/userContext";
import type { Event } from "@/lib/types";
import Icon from "@/components/ui/Icon";
import EventCard from "@/components/ui/EventCard";
import EventsCalendar from "@/components/EventsCalendar";

type ViewMode = "calendar" | "cards";
type SortKey = "today" | "week" | "month" | "price";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "week", label: "This Week" },
  { value: "today", label: "Today" },
  { value: "month", label: "This Month" },
  { value: "price", label: "Price" },
];

function dotColor(price: number): string {
  if (price === 0) return "#5B7F5E";
  if (price < 15) return "#5B7F5E";
  if (price < 50) return "#F0B429";
  return "#E8572A";
}

const HOOD_POS: Record<string, [number, number]> = {
  "Mission":       [42, 58],
  "SoMa":          [60, 42],
  "North Beach":   [68, 24],
  "Marina":        [28, 22],
  "Noe Valley":    [52, 64],
  "Castro":        [48, 50],
  "Hayes Valley":  [42, 36],
  "Dogpatch":      [72, 60],
  "Outer Sunset":  [12, 70],
  "Civic Center": [46, 38],
};

export default function EventsScreen() {
  const { saved } = useUserContext();
  const [view, setView] = useState<ViewMode>("calendar");
  const [catFilter, setCatFilter] = useState<string>("all");
  const [sort, setSort] = useState<SortKey>("week");
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null);

  const filtered = MOCK_EVENTS.filter((e) => {
    if (catFilter !== "all" && e.cat !== catFilter) return false;
    return true;
  }).sort((a, b) => {
    if (sort === "price") return a.price - b.price;
    return 0;
  });

  const savedEventIds = saved.filter((s) => s.type === "event").map((s) => s.itemId);
  const savedEvents = MOCK_EVENTS.filter((e) => savedEventIds.includes(e.id));

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="border-b-2 border-ink bg-paper px-4 md:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-terracotta animate-pulse" />
                <span className="font-data text-[9px] tracking-[0.35em] uppercase text-dust">
                  San Francisco · Events
                </span>
              </div>
              <h1 className="font-display font-black text-4xl text-ink leading-none">
                Discover
              </h1>
            </div>

            {/* View toggle + saved count */}
            <div className="flex items-center gap-4">
              {/* Saved indicator */}
              {savedEventIds.length > 0 && (
                <div className="flex items-center gap-1.5 font-data text-[10px] tracking-[0.15em] text-terracotta">
                  <Icon name="heart" size={12} className="fill-terracotta" />
                  {savedEventIds.length} saved
                </div>
              )}
              {/* View toggle */}
              <div className="flex border border-ink">
                <button
                  onClick={() => setView("calendar")}
                  className={`flex items-center gap-1.5 px-4 py-2 font-data text-[10px] tracking-[0.15em] uppercase transition-colors ${
                    view === "calendar" ? "bg-ink text-cream" : "text-ink hover:bg-cream"
                  }`}
                >
                  <Icon name="calendar" size={12} />
                  Calendar
                </button>
                <button
                  onClick={() => setView("cards")}
                  className={`flex items-center gap-1.5 px-4 py-2 font-data text-[10px] tracking-[0.15em] uppercase transition-colors border-l border-ink ${
                    view === "cards" ? "bg-ink text-cream" : "text-ink hover:bg-cream"
                  }`}
                >
                  <Icon name="grid" size={12} />
                  Cards
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 mt-5">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setCatFilter("all")}
                className={`shrink-0 px-3 py-1.5 font-data text-[10px] tracking-[0.2em] uppercase border transition-colors ${
                  catFilter === "all" ? "bg-ink text-cream border-ink" : "bg-transparent text-mahogany border-rule hover:border-ink"
                }`}
              >
                All
              </button>
              {EVENT_CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCatFilter(c.id)}
                  className={`shrink-0 px-3 py-1.5 font-data text-[10px] tracking-[0.2em] uppercase border transition-colors ${
                    catFilter === c.id ? "text-cream border-ink" : "text-mahogany border-rule hover:border-ink"
                  }`}
                  style={catFilter === c.id ? { backgroundColor: c.color, borderColor: c.color } : {}}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="ml-auto shrink-0 px-3 py-1.5 bg-transparent border border-rule font-data text-[10px] tracking-[0.15em] text-mahogany outline-none hover:border-ink transition-colors"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 py-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {view === "calendar" ? (
            /* ── Calendar view ── */
            <EventsCalendar events={filtered} savedEventIds={savedEventIds} />
          ) : (
            /* ── Cards + mini map ── */
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Mini map */}
              <div className="lg:w-72 xl:w-80 shrink-0">
                <div className="sticky top-24">
                  <div className="font-data text-[9px] tracking-[0.25em] uppercase text-dust mb-3 pb-2 border-b border-rule">
                    Price signals on the map
                  </div>
                  <svg
                    viewBox="0 0 100 100"
                    className="w-full"
                    style={{ filter: "drop-shadow(0 2px 8px rgba(28,16,7,0.12))" }}
                  >
                    <path
                      d="M15,20 L30,10 L55,8 L75,15 L85,25 L80,45 L70,60 L55,75 L35,80 L20,70 L10,50 Z"
                      fill="#F0B429"
                      fillOpacity="0.06"
                      stroke="#C4A882"
                      strokeWidth="0.4"
                      strokeOpacity="0.5"
                    />
                    {filtered.map((event) => {
                      const pos = HOOD_POS[event.hood] || [50, 50];
                      const isHov = hoveredEvent === event.id;
                      return (
                        <g
                          key={event.id}
                          onMouseEnter={() => setHoveredEvent(event.id)}
                          onMouseLeave={() => setHoveredEvent(null)}
                          className="cursor-pointer"
                        >
                          <circle
                            cx={pos[0]}
                            cy={pos[1]}
                            r={isHov ? 4 : 2.5}
                            fill={dotColor(event.price)}
                            fillOpacity={isHov ? 0.9 : 0.7}
                            stroke={isHov ? "#1C1007" : "rgba(28,16,7,0.3)"}
                            strokeWidth={isHov ? 0.6 : 0.3}
                            style={{ transition: "r 0.15s, fill-opacity 0.15s" }}
                          />
                          {isHov && (
                            <text
                              x={pos[0]}
                              y={pos[1] - 5}
                              fontSize="3"
                              fontFamily="var(--font-dm-mono, monospace)"
                              fill="#1C1007"
                              textAnchor="middle"
                              opacity="0.8"
                            >
                              {event.hood}
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </svg>

                  {/* Price legend */}
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-rule">
                    <span className="flex items-center gap-1 font-data text-[8px] tracking-[0.15em] text-dust">
                      <span className="w-2 h-2 rounded-full bg-[#5B7F5E] inline-block" /> Free / &lt;$15
                    </span>
                    <span className="flex items-center gap-1 font-data text-[8px] tracking-[0.15em] text-dust">
                      <span className="w-2 h-2 rounded-full bg-[#F0B429] inline-block" /> $15–50
                    </span>
                    <span className="flex items-center gap-1 font-data text-[8px] tracking-[0.15em] text-dust">
                      <span className="w-2 h-2 rounded-full bg-[#E8572A] inline-block" /> $50+
                    </span>
                  </div>
                </div>
              </div>

              {/* Cards */}
              <div className="flex-1">
                <div className="mb-4 font-data text-[10px] tracking-[0.2em] text-dust">
                  {filtered.length} event{filtered.length !== 1 ? "s" : ""}
                </div>
                {filtered.length === 0 ? (
                  <div className="py-16 text-center">
                    <p className="font-display font-black text-2xl text-dust/40 mb-2">No events</p>
                    <p className="font-body text-mahogany text-sm">Try a different filter.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map((event) => (
                      <div
                        key={event.id}
                        onMouseEnter={() => setHoveredEvent(event.id)}
                        onMouseLeave={() => setHoveredEvent(null)}
                      >
                        <EventCard event={event} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
