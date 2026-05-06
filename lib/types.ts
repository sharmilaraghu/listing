export type ListingCategory =
  | "transit"
  | "shelter"
  | "gear"
  | "labor"
  | "free"
  | "audio"
  | "people"
  | "misc";

export type ListingBadge = "fire" | "rare" | "risk";

export interface Seller {
  name: string;
  score: number; // 0–100 trust score
  joined: string; // year: '2019'
}

export interface Listing {
  id: string;
  title: string;
  price: number; // 0 = free
  cat: ListingCategory;
  hood: string;
  posted: string; // relative: '12 min ago'
  badge: ListingBadge | null;
  desc: string;
  seller: Seller;
  coords: [number, number]; // [lat, lon]
  imageUrl?: string;
}

export interface Category {
  id: ListingCategory;
  label: string;   // display label: 'FOR WHEELS'
  icon: string;    // icon name
  count: number;
  color: string;   // hex accent
}

export type VoiceKey = "ATLAS" | "ECHO";

export interface Voice {
  id: string;
  label: string;
  desc: string;
}

export interface User {
  id: string;
  name: string;
  memberId: string;
  joined: string;
  trustScore: number;
  ordersCount: number;
  reviewsCount: number;
  savedCount: number;
}

export type EventCategory = "music" | "food" | "arts" | "markets" | "community";

export interface Event {
  id: string;
  title: string;
  venue: string;
  hood: string;
  date: string;
  time: string;
  price: number;
  rating: number;
  cat: EventCategory;
  desc: string;
  imageUrl?: string;
}

export type SavedType = "listing" | "event";
