"use client";

import { useState } from "react";
import Link from "next/link";
import { MOCK_LISTINGS, MOCK_EVENTS } from "@/lib/data";
import { useUserContext } from "@/lib/userContext";
import ListingCard from "@/components/ui/ListingCard";
import EventCard from "@/components/ui/EventCard";
import Icon from "@/components/ui/Icon";

export default function SavedScreen() {
  const { user, saved, signOut } = useUserContext();
  const [tab, setTab] = useState<"listings" | "events">("listings");

  const savedListingIds = saved.filter((s) => s.type === "listing").map((s) => s.itemId);
  const savedEventIds = saved.filter((s) => s.type === "event").map((s) => s.itemId);
  const savedListings = MOCK_LISTINGS.filter((l) => savedListingIds.includes(l.id));
  const savedEvents = MOCK_EVENTS.filter((e) => savedEventIds.includes(e.id));

  const initials = user!.name.split(" ").map((n) => n[0]).join("").toUpperCase();

  return (
    <div className="flex flex-col min-h-screen">
      {/* ── User profile header ── */}
      <div className="border-b-2 border-ink bg-paper px-4 md:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-start gap-6 flex-wrap">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-full bg-ink flex items-center justify-center">
                <span className="font-display font-black text-3xl text-cream">{initials}</span>
              </div>
              <div
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-paper flex items-center justify-center"
                style={{ backgroundColor: user!.trustScore >= 80 ? "#5B7F5E" : user!.trustScore >= 50 ? "#F0B429" : "#E8572A" }}
              >
                <span className="font-data text-[8px] text-cream font-bold">{user!.trustScore}</span>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="font-display font-black text-3xl text-ink">{user!.name}</h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-sage/20 border border-sage text-sage font-data text-[8px] tracking-[0.2em] uppercase">
                  <Icon name="gem" size={9} />
                  Verified
                </span>
              </div>
              <p className="font-data text-[10px] tracking-[0.2em] text-dust mb-4">
                Member {user!.memberId} · Since {user!.joined}
              </p>

              {/* Stats */}
              <div className="flex items-center gap-6">
                {[
                  { label: "Orders", value: user!.ordersCount },
                  { label: "Saved", value: saved.length },
                  { label: "Reviews", value: user!.reviewsCount },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="font-display font-black text-2xl text-ink leading-none">{stat.value}</div>
                    <div className="font-data text-[8px] tracking-[0.2em] text-dust uppercase mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 shrink-0">
              <button
                onClick={signOut}
                className="px-4 py-2 border border-rule font-data text-[10px] tracking-[0.2em] uppercase text-dust hover:border-ink hover:text-ink transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="border-b border-rule bg-paper px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex gap-0">
          <button
            onClick={() => setTab("listings")}
            className={`px-6 py-4 font-data text-[11px] tracking-[0.2em] uppercase border-b-2 transition-colors ${
              tab === "listings"
                ? "border-ink text-ink"
                : "border-transparent text-dust hover:text-ink"
            }`}
          >
            Listings ({savedListings.length})
          </button>
          <button
            onClick={() => setTab("events")}
            className={`px-6 py-4 font-data text-[11px] tracking-[0.2em] uppercase border-b-2 transition-colors ${
              tab === "events"
                ? "border-ink text-ink"
                : "border-transparent text-dust hover:text-ink"
            }`}
          >
            Events ({savedEvents.length})
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 py-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {tab === "listings" && (
            savedListings.length === 0 ? (
              <EmptyState
                title="No saved listings"
                description="Heart a listing to save it here."
                href="/feed"
                cta="Browse Listings"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )
          )}

          {tab === "events" && (
            savedEvents.length === 0 ? (
              <EmptyState
                title="No saved events"
                description="Heart an event to save it here."
                href="/events"
                cta="Discover Events"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ title, description, href, cta }: { title: string; description: string; href: string; cta: string }) {
  return (
    <div className="py-20 text-center">
      <div className="font-display font-black text-5xl text-dust/20 mb-3">{title}</div>
      <p className="font-body text-mahogany mb-6">{description}</p>
      <Link
        href={href}
        className="inline-flex items-center gap-2 px-6 py-3 bg-ink text-cream font-data text-[11px] tracking-[0.2em] uppercase btn-shine hover:bg-[#2D2315] transition-colors"
      >
        {cta}
        <Icon name="arrow" size={11} />
      </Link>
    </div>
  );
}
