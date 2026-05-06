"use client";

import { useState } from "react";
import type { Event } from "@/lib/types";
import Icon from "@/components/ui/Icon";
import EventCard from "@/components/ui/EventCard";
import FavoriteButton from "@/components/ui/FavoriteButton";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const CAT_COLORS: Record<string, string> = {
  music:    "#E8572A",
  food:     "#F0B429",
  arts:     "#5B7F5E",
  markets:  "#3D1F0E",
  community:"#8A6E50",
};

interface EventsCalendarProps {
  events: Event[];
  savedEventIds: string[];
}

export default function EventsCalendar({ events, savedEventIds }: EventsCalendarProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-indexed
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Map events to days of the month (parse date strings like "Fri, May 9")
  const eventsByDay: Record<number, Event[]> = {};
  const evYear = year;
  for (const ev of events) {
    // Parse date string like "Fri, May 9"
    const parts = ev.date.replace(",", "").split(" ");
    const monthName = parts[1];
    const dayNum = parseInt(parts[2]);
    const evMonthIndex = MONTHS.findIndex((m) => m === monthName);
    if (evMonthIndex === month && evYear === year) {
      if (!eventsByDay[dayNum]) eventsByDay[dayNum] = [];
      eventsByDay[dayNum].push(ev);
    }
  }

  const prevMonth = () => {
    if (month === 0) { setYear(year - 1); setMonth(11); }
    else { setMonth(month - 1); }
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (month === 11) { setYear(year + 1); setMonth(0); }
    else { setMonth(month + 1); }
    setSelectedDay(null);
  };

  const todayDay = today.getMonth() === month && today.getFullYear() === year ? today.getDate() : null;

  // Build calendar grid cells
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const selectedEvents = selectedDay ? (eventsByDay[selectedDay] || []) : [];

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* ── Calendar grid ── */}
      <div className="flex-1 min-w-0">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="p-2 hover:bg-paper rounded transition-colors">
            <Icon name="back" size={14} className="text-ink" />
          </button>
          <div className="text-center">
            <div className="font-display font-black text-2xl text-ink">{MONTHS[month]}</div>
            <div className="font-data text-[10px] tracking-[0.2em] text-dust">{year}</div>
          </div>
          <button onClick={nextMonth} className="p-2 hover:bg-paper rounded transition-colors">
            <Icon name="arrow" size={14} className="text-ink" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAYS.map((d) => (
            <div key={d} className="text-center font-data text-[9px] tracking-[0.2em] uppercase text-dust py-1 border-b border-rule">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar cells */}
        <div className="grid grid-cols-7 gap-px bg-rule">
          {cells.map((day, idx) => {
            const dayEvents = day ? (eventsByDay[day] || []) : [];
            const isToday = day === todayDay;
            const isSelected = day === selectedDay;
            const hasEvents = dayEvents.length > 0;

            return (
              <button
                key={idx}
                onClick={() => day && setSelectedDay(isSelected ? null : day)}
                className={`
                  relative min-h-[72px] p-1 flex flex-col gap-0.5 transition-colors
                  ${!day ? "bg-cream/30" : isSelected ? "bg-terracotta/10" : "bg-paper hover:bg-cream"}
                `}
                disabled={!day}
              >
                {/* Day number */}
                {day && (
                  <span className={`
                    font-data text-[11px] font-bold leading-none mt-1 ml-1
                    ${isToday ? "w-6 h-6 rounded-full bg-ink text-cream flex items-center justify-center" : ""}
                    ${isSelected ? "text-terracotta" : "text-ink"}
                  `}>
                    {day}
                  </span>
                )}

                {/* Event pills */}
                {hasEvents && dayEvents.slice(0, 3).map((ev) => (
                  <div
                    key={ev.id}
                    className="mx-0.5 rounded-sm overflow-hidden"
                    style={{ height: "4px" }}
                  >
                    <div
                      className="w-full h-full"
                      style={{ backgroundColor: CAT_COLORS[ev.cat] || "#8A6E50" }}
                    />
                  </div>
                ))}
                {hasEvents && dayEvents.length > 3 && (
                  <span className="font-data text-[7px] text-dust ml-1">+{dayEvents.length - 3}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-rule">
          {Object.entries(CAT_COLORS).map(([cat, color]) => (
            <span key={cat} className="flex items-center gap-1.5 font-data text-[8px] tracking-[0.15em] uppercase text-dust">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
              {cat}
            </span>
          ))}
        </div>
      </div>

      {/* ── Day detail panel ── */}
      <div className="lg:w-80 xl:w-96 shrink-0">
        {selectedDay ? (
          <div className="bg-paper border border-rule p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-display font-black text-xl text-ink">
                  {MONTHS[month]} {selectedDay}
                </div>
                <div className="font-data text-[9px] tracking-[0.2em] text-dust uppercase">
                  {selectedEvents.length} event{selectedEvents.length !== 1 ? "s" : ""}
                </div>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="text-dust hover:text-ink transition-colors"
              >
                <Icon name="close" size={14} />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {selectedEvents.map((ev) => (
                <div key={ev.id} className="bg-cream border border-rule p-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span
                          className="px-1.5 py-0.5 font-data text-[7px] tracking-[0.15em] uppercase text-cream"
                          style={{ backgroundColor: CAT_COLORS[ev.cat] }}
                        >
                          {ev.cat}
                        </span>
                        <span className="font-data text-[8px] text-dust">{ev.time}</span>
                      </div>
                      <h4 className="font-display font-semibold text-sm text-ink leading-snug line-clamp-2">
                        {ev.title}
                      </h4>
                      <p className="font-data text-[9px] text-dust mt-0.5 flex items-center gap-1">
                        <Icon name="pin" size={8} />
                        {ev.venue} · {ev.hood}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className={`font-display font-bold text-sm ${ev.price === 0 ? "text-sage" : "text-ink"}`}>
                        {ev.price === 0 ? "FREE" : `$${ev.price}`}
                      </div>
                      <FavoriteButton type="event" itemId={ev.id} size={12} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-paper border border-rule p-6 text-center">
            <div className="w-10 h-10 rounded-full bg-rule/30 flex items-center justify-center mx-auto mb-3">
              <Icon name="calendar" size={20} className="text-dust" />
            </div>
            <p className="font-display font-semibold text-ink mb-1">Select a day</p>
            <p className="font-data text-[10px] tracking-[0.15em] text-dust">
              Click any date to see events
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
