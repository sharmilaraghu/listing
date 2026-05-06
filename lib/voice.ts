import type { Listing } from "./types";

export function formatListingForVoice(listing: {
  title: string;
  price: number;
  hood: string;
  desc?: string;
  cat?: string;
}): string {
  const priceText =
    listing.price === 0
      ? "is free"
      : `is $${listing.price.toLocaleString()}`;
  const locationText = listing.hood ? ` in ${listing.hood}` : "";
  const descText = listing.desc
    ? `. ${listing.desc.slice(0, 120)}${listing.desc.length > 120 ? "..." : ""}`
    : "";

  return `${listing.title}, ${priceText}${locationText}.${descText}`;
}

export function formatStepNarration(step: number, total: number): string {
  const descriptions: Record<number, string> = {
    1: "Choose a category",
    2: "Add listing details",
    3: "Add location and contact",
    4: "Review and publish",
  };
  return `Step ${step} of ${total}: ${descriptions[step] ?? ""}`;
}

export function formatFilterConfirmation(filters: {
  cat?: string;
  hood?: string;
  priceMax?: number | null;
}): string {
  const parts: string[] = ["Got it."];

  const CAT_LABELS: Record<string, string> = {
    transit: "wheels",
    shelter: "rentals",
    gear: "items for sale",
    labor: "services",
    free: "free items",
    audio: "audio gear",
    people: "connections",
    misc: "oddities",
  };

  if (filters.cat && filters.cat !== "all") {
    const catLabel = CAT_LABELS[filters.cat] ?? filters.cat;
    parts.push(`Showing ${catLabel}`);
  } else {
    parts.push("Showing all listings");
  }

  if (filters.hood) {
    parts.push(`in ${filters.hood}`);
  }

  if (filters.priceMax) {
    parts.push(`under $${filters.priceMax}`);
  }

  return parts.join(" ") + ".";
}

export async function playTTS(text: string, voice = "ATLAS"): Promise<void> {
  const res = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, voice }),
  });
  if (!res.ok) return;
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  audio.play();
  audio.onended = () => URL.revokeObjectURL(url);
}