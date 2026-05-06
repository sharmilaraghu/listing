"use client";

import useSWR from "swr";
import type { Listing, ListingCategory } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface UseListingsOptions {
  cat?: ListingCategory | "all";
  q?: string;
  hood?: string;
}

export function useListings({ cat = "all", q = "", hood = "" }: UseListingsOptions = {}) {
  const params = new URLSearchParams();
  if (cat !== "all") params.set("cat", cat);
  if (q) params.set("q", q);
  if (hood) params.set("hood", hood);

  const url = `/api/listings${params.toString() ? `?${params}` : ""}`;

  const { data, error, isLoading } = useSWR(url, fetcher, {
    fallbackData: { listings: [], source: "mock" },
  });

  return {
    listings: (data?.listings ?? []) as Listing[],
    source: data?.source ?? "mock",
    isLoading,
    isError: !!error,
  };
}
