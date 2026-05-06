import { NextRequest, NextResponse } from "next/server";
import type { Listing } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { a, b } = await req.json() as { a: Listing; b: Listing };
    if (!a || !b) return NextResponse.json({ error: "Missing listings" }, { status: 400 });

    const key = process.env.GEMINI_API_KEY;
    if (!key) return NextResponse.json({ error: "No Gemini key" }, { status: 503 });

    // Build a richer prompt that analyzes listings in depth
    const prompt = `You are a sharp, honest San Francisco classifieds analyst. Compare two listings and give a clear verdict.

For each listing, extract and note: title, price, brand/model if detectable (e.g. "2015 Specialized Roubaix", "iPhone 14 Pro"), condition from description or inferable from context, seller trust score (out of 100), and neighborhood zone.

Then analyze:
- Price vs value: Is one clearly underpriced for what it is? Is one overpriced for its condition?
- Model comparison: If models can be identified, which is the higher-end spec? How do they compare?
- Condition gap: Does paying more for "excellent" vs "good" make sense here?
- Red flags: Very low trust score, missing description, vague title ("bike for sale"), price that seems too good
- Say which is the better deal and why in one sentence

Then give your overall verdict — one line, direct. Something like: "Listing A is the better deal — lower price for a higher-spec bike in similar condition." or "Both are overpriced for their condition — pass on both."

Keep it under 200 words so it reads well as spoken audio. Use a confident, clipped delivery style suitable for a city marketplace announcer. Say "This one is better" rather than staying neutral.

Listing A:
Title: ${a.title}
Price: ${a.price === 0 ? "free" : "$" + a.price}
Zone: ${a.hood}
Seller trust: ${a.seller.score}/100
Description: ${a.desc?.slice(0, 120) ?? "none"}

Listing B:
Title: ${b.title}
Price: ${b.price === 0 ? "free" : "$" + b.price}
Zone: ${b.hood}
Seller trust: ${b.seller.score}/100
Description: ${b.desc?.slice(0, 120) ?? "none"}`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 300, temperature: 0.7 },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: "Gemini error", detail: err }, { status: 502 });
    }

    const json = await res.json();
    const summary = json.candidates?.[0]?.content?.parts?.[0]?.text as string;
    if (!summary) return NextResponse.json({ error: "No summary from Gemini" }, { status: 502 });

    return NextResponse.json({ summary: summary.trim() });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}