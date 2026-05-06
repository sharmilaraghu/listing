"use client";

import useSWR from "swr";
import type { Listing, ListingCategory } from "@/lib/types";
import { useCityContext } from "@/lib/cityContext";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface UseListingsOptions {
  cat?: ListingCategory | "all";
  q?: string;
  hood?: string;
}

export function useListings({ cat = "all", q = "", hood = "" }: UseListingsOptions = {}) {
  const { city } = useCityContext();
  const params = new URLSearchParams();
  params.set("city", city.id);
  if (cat !== "all") params.set("cat", cat);
  if (q) params.set("q", q);
  if (hood) params.set("hood", hood);

  const url = `/api/listings?${params}`;

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
