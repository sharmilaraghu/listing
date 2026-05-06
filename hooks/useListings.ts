"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import type { Listing, ListingCategory } from "@/lib/types";
import { MOCK_LISTINGS } from "@/lib/data";

const POSTS_KEY = "listing-posts";
const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useListings({ cat = "all", q = "", hood = "" }: { cat?: ListingCategory | "all"; q?: string; hood?: string } = {}) {
  const [postedListings, setPostedListings] = useState<Listing[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(POSTS_KEY);
      if (stored) setPostedListings(JSON.parse(stored));
    } catch {}
  }, []);

  const { data, error, isLoading } = useSWR(
    `/api/listings?cat=${cat}&q=${q}&hood=${hood}&source=mock`,
    fetcher,
    { fallbackData: { listings: [], source: "mock" } }
  );

  const apiListings = (data?.listings ?? []) as Listing[];

  // Merge posted listings with API/mock listings, dedup by id
  const postedIds = new Set(postedListings.map((p) => p.id));
  const merged = [
    ...postedListings,
    ...apiListings.filter((l) => !postedIds.has(l.id)),
  ];

  // Filter by q, cat, hood client-side
  const filtered = merged.filter((l) => {
    if (cat !== "all" && l.cat !== cat) return false;
    if (q && !l.title.toLowerCase().includes(q.toLowerCase()) && !l.desc.toLowerCase().includes(q.toLowerCase())) return false;
    if (hood && l.hood !== hood) return false;
    return true;
  });

  return {
    listings: filtered,
    source: postedListings.length > 0 ? "post+mock" : "mock",
    isLoading,
    isError: !!error,
  };
}