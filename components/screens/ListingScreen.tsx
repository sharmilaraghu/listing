"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MOCK_LISTINGS } from "@/lib/data";
import Icon from "@/components/ui/Icon";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import VoiceButton from "@/components/voice/VoiceButton";

function SignalRing({ score }: { score: number }) {
  const r = 26;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 80 ? "#5B7F5E" : score >= 50 ? "#F0B429" : "#E8572A";

  return (
    <div className="relative w-16 h-16">
      <svg viewBox="0 0 60 60" className="w-full h-full -rotate-90">
        <circle cx="30" cy="30" r={r} fill="none" stroke="rgba(28,16,7,0.08)" strokeWidth="4" />
        <circle
          cx="30" cy="30" r={r} fill="none"
          stroke={color}
          strokeWidth="4"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-data text-sm font-bold text-ink leading-none">{score}</span>
        <span className="font-data text-[7px] tracking-[0.15em] text-dust uppercase">Trust</span>
      </div>
    </div>
  );
}

export default function ListingScreen({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const listing = MOCK_LISTINGS.find((l) => l.id === id);

  if (!listing) notFound();

  const related = MOCK_LISTINGS.filter((l) => l.cat === listing.cat && l.id !== listing.id).slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b border-rule bg-paper px-4 md:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-2 font-data text-[10px] tracking-[0.2em] text-dust">
          <Link href="/" className="hover:text-terracotta transition-colors">Home</Link>
          <span>/</span>
          <Link href="/feed" className="hover:text-terracotta transition-colors">Browse</Link>
          <span>/</span>
          <Link href={`/feed?cat=${listing.cat}`} className="hover:text-terracotta transition-colors uppercase">
            {listing.cat}
          </Link>
          <span>/</span>
          <span className="text-ink">{listing.id}</span>
        </div>
      </div>

      <div className="flex-1 py-10 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Main content */}
            <div className="lg:col-span-2 flex flex-col gap-8">
              {/* Header */}
              <div>
                <div className="flex items-start gap-3 mb-4">
                  {listing.badge && <Badge kind={listing.badge} />}
                  <div className="font-data text-[10px] tracking-[0.2em] text-dust uppercase">
                    {listing.cat} · {listing.hood}
                  </div>
                </div>
                <h1 className="font-display font-black text-4xl md:text-5xl text-ink leading-tight mb-4">
                  {listing.title}
                </h1>
                <div className="flex items-baseline gap-4">
                  <span className={`font-display font-black text-5xl ${listing.badge === "fire" ? "text-terracotta" : "text-ink"}`}>
                    {listing.price === 0 ? "FREE" : `$${listing.price.toLocaleString()}`}
                  </span>
                  <span className="font-data text-[11px] tracking-[0.2em] text-dust">
                    Listed {listing.posted}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="bg-paper border border-rule p-8">
                <h2 className="font-display font-black text-xl text-ink mb-4">Description</h2>
                <p className="font-body text-lg text-mahogany leading-relaxed">{listing.desc}</p>
              </div>

              {/* Seller */}
              <div className="bg-paper border border-rule p-8">
                <h2 className="font-display font-black text-xl text-ink mb-4">Seller</h2>
                <div className="flex items-center gap-6">
                  <SignalRing score={listing.seller.score} />
                  <div>
                    <div className="font-display font-black text-lg text-ink">{listing.seller.name}</div>
                    <div className="font-data text-[10px] tracking-[0.2em] text-dust mt-1">
                      Member since {listing.seller.joined}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      {listing.seller.score >= 80 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-sage/20 text-sage font-data text-[9px] tracking-[0.2em] uppercase">
                          <Icon name="check" size={10} /> Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="flex flex-col gap-5">
              {/* Voice narration CTA */}
              <div className="bg-paper border-2 border-ink p-6">
                <h3 className="font-display font-black text-lg text-ink mb-1">Listen to this listing</h3>
                <p className="font-body text-sm text-dust mb-4">
                  AI narration reads the full description aloud
                </p>
                <VoiceButton text={`${listing.title}. ${listing.desc}`} />
              </div>

              {/* Quick actions */}
              <div className="flex flex-col gap-2">
                <Button variant="primary" className="w-full justify-center">
                  <Icon name="mail" size={14} />
                  Contact Seller
                </Button>
                <Button variant="outline" className="w-full justify-center">
                  <Icon name="bookmark" size={14} />
                  Save Listing
                </Button>
              </div>

              {/* Location */}
              <div className="bg-paper border border-rule p-5">
                <h3 className="font-display font-black text-sm text-ink mb-3">Location</h3>
                <div className="flex items-center gap-2 font-data text-[11px] tracking-[0.15em] text-mahogany">
                  <Icon name="pin" size={12} />
                  {listing.hood}, San Francisco
                </div>
              </div>
            </div>
          </div>

          {/* Related */}
          {related.length > 0 && (
            <div className="mt-16 pt-10 border-t border-rule">
              <h2 className="font-display font-black text-3xl text-ink mb-6">Similar Listings</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {related.map((l) => (
                  <a key={l.id} href={`/listing/${l.id}`} className="group">
                    <div className="bg-paper border border-rule p-5 card-lift">
                      <div className="font-display text-base text-ink leading-tight mb-2 group-hover:text-terracotta transition-colors">
                        {l.title}
                      </div>
                      <div className="font-data text-[11px] tracking-[0.15em] text-dust">
                        {l.hood} · ${l.price.toLocaleString()}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
