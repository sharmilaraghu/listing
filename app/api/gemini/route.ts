import { NextRequest, NextResponse } from "next/server";
import type { Listing } from "@/lib/types";

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/#{1,6}\s*/g, "")
    .replace(/^\s*[-•]\s+/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export async function POST(req: NextRequest) {
  try {
    const { a, b } = await req.json() as { a: Listing; b: Listing };
    if (!a || !b) return NextResponse.json({ error: "Missing listings" }, { status: 400 });

    const key = process.env.GEMINI_API_KEY;
    if (!key) return NextResponse.json({ error: "No Gemini key" }, { status: 503 });

    const prompt = `You are a blunt San Francisco classifieds analyst. Compare these two listings and give a verdict.

RULES: No markdown. No asterisks. No bullet points. No preamble. No "alright" or "let's". Start immediately with your analysis. Plain sentences only. Under 150 words. End with one clear verdict sentence starting with "Verdict:".

Analyze: price vs value, specs/model quality, condition, seller trust score (low score = red flag), any red flags in the description.

Listing A — ${a.title}
Price: ${a.price === 0 ? "free" : "$" + a.price} | Zone: ${a.hood} | Seller trust: ${a.seller.score}/100
${a.desc?.slice(0, 150) ?? "No description"}

Listing B — ${b.title}
Price: ${b.price === 0 ? "free" : "$" + b.price} | Zone: ${b.hood} | Seller trust: ${b.seller.score}/100
${b.desc?.slice(0, 150) ?? "No description"}`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: 500,
            temperature: 0.5,
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: "Gemini error", detail: err }, { status: 502 });
    }

    const json = await res.json();
    const raw = json.candidates?.[0]?.content?.parts?.[0]?.text as string;
    if (!raw) return NextResponse.json({ error: "No summary from Gemini" }, { status: 502 });

    return NextResponse.json({ summary: stripMarkdown(raw) });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
