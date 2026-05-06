import { NextRequest, NextResponse } from "next/server";
import type { Listing } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { a, b } = await req.json() as { a: Listing; b: Listing };
    if (!a || !b) return NextResponse.json({ error: "Missing listings" }, { status: 400 });

    const key = process.env.GEMINI_API_KEY;
    if (!key) return NextResponse.json({ error: "No Gemini key" }, { status: 503 });

    const prompt = `You are a San Francisco classifieds voice announcer. Summarize a comparison between two listings for spoken audio output. Keep it under 180 words, conversational, natural pacing. Include price, location, and key differences.

Listing A: ${a.title}. Price: ${a.price === 0 ? "free" : "$" + a.price}. Zone: ${a.hood}. ${a.desc?.slice(0, 80) ?? ""}
Listing B: ${b.title}. Price: ${b.price === 0 ? "free" : "$" + b.price}. Zone: ${b.hood}. ${b.desc?.slice(0, 80) ?? ""}`;

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