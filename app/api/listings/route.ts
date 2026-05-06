import { NextRequest, NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";
import { MOCK_LISTINGS } from "@/lib/data";
import type { Listing } from "@/lib/types";

const CAT_MAP: Record<string, string> = {
  transit:  "cta+bia",
  shelter:  "apa",
  gear:     "eee+sss",
  labor:    "jjj",
  free:     "zip",
  audio:    "msa",
  people:   "com",
  misc:     "sss",
};

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim();
}

function extractPrice(title: string) {
  const m = title.match(/\$[\d,]+/);
  if (!m) return null;
  return parseInt(m[0].replace(/\D/g, ""), 10);
}

function assignBadge(listing: Listing) {
  const prices = MOCK_LISTINGS.filter((l) => l.cat === listing.cat).map((l) => l.price);
  const avg = prices.reduce((a, b) => a + b, 0) / prices.length || 1;
  if (listing.price < avg * 0.3) return "fire";
  return null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cat = searchParams.get("cat") || "all";
  const q = searchParams.get("q") || "";
  const hood = searchParams.get("hood") || "";

  try {
    if (cat === "all" && !q) {
      return NextResponse.json({ listings: MOCK_LISTINGS, source: "mock" });
    }

    const codes = cat === "all" ? "sss" : CAT_MAP[cat] || "sss";
    const url = new URL(`https://sfbay.craigslist.org/search/${codes}`);
    url.searchParams.set("format", "rss");
    if (q) url.searchParams.set("query", q);
    if (hood) url.searchParams.set("neighborhood", hood);

    const res = await fetch(url.toString(), {
      next: { revalidate: 300 },
    });

    if (!res.ok) throw new Error("Craigslist fetch failed");

    const xml = await res.text();
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" });
    const parsed = parser.parse(xml);
    const items: any[] = Array.isArray(parsed.rss?.channel?.item)
      ? parsed.rss.channel.item
      : [parsed.rss?.channel?.item].filter(Boolean);

    const listings: Listing[] = items
      .map((item: any) => {
        const title = stripHtml(item.title || "");
        const price = item["enc:price"] || extractPrice(title) || 0;
        return {
          id: String(item.guid || item.link || "").split("/").pop() || "",
          title,
          price,
          cat: cat as any,
          hood: stripHtml(item["cl:neighborhood"] || ""),
          posted: item.pubDate
            ? new Date(item.pubDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
            : "Recently",
          badge: null,
          desc: stripHtml(item.description || "").slice(0, 500),
          seller: { name: "Anonymous", score: 50, joined: "2024" },
          coords: [0, 0] as [number, number],
        };
      })
      .filter((l) => l.id);

    // assign fire badge to underpriced
    return NextResponse.json({ listings, source: "craigslist" });
  } catch (e) {
    return NextResponse.json({ listings: MOCK_LISTINGS, source: "mock" });
  }
}
