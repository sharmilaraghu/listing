import { NextRequest, NextResponse } from "next/server";
import { MOCK_LISTINGS } from "@/lib/data";
import type { Listing } from "@/lib/types";

type EbayPrice = { value: string; currency: string };
type EbayImage = { imageUrl: string };
type EbayItem = {
  itemId: string;
  title: string;
  price?: EbayPrice;
  condition?: string;
  location?: { city?: string; country?: string };
  image?: EbayImage;
  seller?: { username?: string };
  itemHref?: string;
};

const CAT_MAP: Record<string, string> = {
  transit: "6000",
  shelter: "6030",
  gear:    "293",
  labor:   "50875",
  audio:   "20348",
  misc:    "200",
};

const CL_CAT_MAP: Record<string, string> = {
  transit:  "cta+bia",
  shelter:  "apa",
  gear:     "eee+sss",
  labor:    "jjj",
  free:     "zip",
  audio:    "msa",
  people:   "com",
  misc:     "sss",
};

async function getEbayToken(): Promise<string | null> {
  const clientId = process.env.EBAY_CLIENT_ID;
  const clientSecret = process.env.EBAY_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  try {
    const res = await fetch("https://api.ebay.com/identity/v1/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        scope: "https://api.ebay.com/oauth/api_scope",
      }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.access_token as string;
  } catch {
    return null;
  }
}

function conditionLabel(c: string | undefined): string {
  if (!c) return "Used";
  if (c.includes("NEW")) return "New";
  if (c.includes("OPEN BOX")) return "Open Box";
  return "Used";
}

function parseEbayPrice(p: EbayPrice | undefined): number {
  if (!p) return 0;
  return parseFloat(p.value.replace(/[^0-9.]/g, "")) || 0;
}

async function fetchEbayListings(q: string, cat: string): Promise<Listing[] | null> {
  const token = await getEbayToken();
  if (!token) return null;

  try {
    const params = new URLSearchParams({ q, limit: "24" });
    if (cat !== "all" && CAT_MAP[cat]) {
      params.set("category_ids", CAT_MAP[cat]);
    }

    const res = await fetch(
      `https://api.ebay.com/buy/browse/v1/item_summary/search?${params}`,
      {
        headers: {
          "Authorization": `Bearer ${token}`,
          "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
        },
        next: { revalidate: 300 },
      }
    );

    if (!res.ok) return null;
    const data = await res.json();
    const items: EbayItem[] = data.itemSummaries || [];

    return items.map((item): Listing => ({
      id: item.itemId,
      title: item.title,
      price: parseEbayPrice(item.price),
      cat: (cat as any) || "misc",
      hood: item.location?.city || "",
      posted: "Recently",
      badge: null,
      desc: "",
      seller: {
        name: item.seller?.username || "eBay Seller",
        score: 85,
        joined: "2020",
      },
      coords: [0, 0] as [number, number],
      imageUrl: item.image?.imageUrl,
    }));
  } catch {
    return null;
  }
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").trim();
}

async function fetchCraigslistListings(cat: string, q: string, hood: string, city: string): Promise<Listing[]> {
  const codes = cat === "all" ? "sss" : CL_CAT_MAP[cat] || "sss";
  const url = new URL(`https://${city}.craigslist.org/search/${codes}`);
  url.searchParams.set("format", "rss");
  if (q) url.searchParams.set("query", q);
  if (hood) url.searchParams.set("neighborhood", hood);

  const res = await fetch(url.toString(), {
    next: { revalidate: 300 },
    headers: { "User-Agent": "Mozilla/5.0 (compatible; listing-app/1.0)" },
  });

  if (!res.ok) throw new Error(`Craigslist ${res.status}`);

  const xml = await res.text();
  const { XMLParser } = await import("fast-xml-parser");
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" });
  const parsed = parser.parse(xml);
  const items: any[] = Array.isArray(parsed.rss?.channel?.item)
    ? parsed.rss.channel.item
    : [parsed.rss?.channel?.item].filter(Boolean);

  return items
    .map((item: any) => {
      const title = stripHtml(item.title || "");
      const extractPrice = (t: string) => {
        const m = t.match(/\$[\d,]+/);
        return m ? parseInt(m[0].replace(/\D/g, ""), 10) : 0;
      };
      const price = item["enc:price"] || extractPrice(title);
      const rawImageUrl = item.enclosure?.url || item["media:content"]?.url || undefined;
      const imageUrl = rawImageUrl
        ? rawImageUrl.replace("_300x300.", "_600x450.")
        : undefined;

      return {
        id: String(item.guid || item.link || "").split("/").pop() || "",
        title,
        price,
        cat: cat as any,
        hood: stripHtml(item["cl:neighborhood"] || ""),
        posted: item.pubDate
          ? new Date(item.pubDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
          : "Recently",
        badge: price > 0 && price < 50 ? "fire" as const : null,
        desc: stripHtml(item.description || "").slice(0, 500),
        seller: { name: "Anonymous", score: 50, joined: "2024" },
        coords: [0, 0] as [number, number],
        imageUrl,
      };
    })
    .filter((l: Listing) => l.id);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cat = searchParams.get("cat") || "all";
  const q = searchParams.get("q") || "";
  const hood = searchParams.get("hood") || "";
  const city = searchParams.get("city") || "sfbay";
  const source = searchParams.get("source") || "auto";

  // Try eBay first
  if (source === "auto" || source === "ebay") {
    const ebayListings = await fetchEbayListings(q, cat);
    if (ebayListings && ebayListings.length > 0) {
      return NextResponse.json({ listings: ebayListings, source: "ebay" });
    }
  }

  // Fall back to Craigslist
  if (source === "auto" || source === "craigslist") {
    try {
      const cl = await fetchCraigslistListings(cat, q, hood, city);
      if (cl.length > 0) {
        return NextResponse.json({ listings: cl, source: "craigslist" });
      }
    } catch {
      // fall through
    }
  }

  // Final fallback to mock — filter by q if provided
  const filtered = MOCK_LISTINGS.filter((l) => {
    if (q && !l.title.toLowerCase().includes(q.toLowerCase()) && !l.desc.toLowerCase().includes(q.toLowerCase())) return false;
    if (hood && l.hood !== hood) return false;
    return true;
  });
  return NextResponse.json({ listings: filtered, source: "mock" });
}