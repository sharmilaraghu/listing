import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { transcript } = await req.json() as { transcript: string };
    if (!transcript?.trim()) return NextResponse.json({ error: "No transcript" }, { status: 400 });

    const key = process.env.GEMINI_API_KEY;
    if (!key) return NextResponse.json({ error: "No Gemini key" }, { status: 503 });

    const prompt = `Parse this spoken listing description into a JSON object. The speech may have recognition errors — infer intent.

Return ONLY valid JSON, no markdown, no explanation, no preamble:
{"cat":"gear","title":"iPhone 12 screen damage","price":50,"desc":"Screen has damage, selling as-is","hood":"","email":"","phone":""}

Categories: transit (bikes/cars/scooters), shelter (apartments/rooms/sublets), gear (electronics/furniture/items), labor (services/jobs), free (giveaways), audio (instruments/speakers), people (partners/roommates), misc (everything else)

Speech: "${transcript}"

Rules:
- Fix speech recognition errors (e.g. "billing to salad" → "willing to sell", "estamage" → "damage")
- title: 3-8 words, clean product name
- price: number only, 0 if free or not mentioned
- desc: clean summary of what was said
- hood: SF neighborhood if mentioned, else empty string
- email/phone: extract if mentioned, else empty string`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: 300,
            temperature: 0.1,
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

    // Gemini 2.5 may return thinking parts first — find the text part
    const parts = json.candidates?.[0]?.content?.parts ?? [];
    const rawText = parts
      .filter((p: any) => !p.thought && typeof p.text === "string")
      .map((p: any) => p.text)
      .join("") as string;

    if (!rawText) return NextResponse.json({ error: "No parse result" }, { status: 502 });

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return NextResponse.json({ error: "Could not extract JSON" }, { status: 422 });

    const parsed = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      cat:   parsed.cat   || "misc",
      title: parsed.title || "",
      price: Number(parsed.price) || 0,
      desc:  (parsed.desc || "").slice(0, 300),
      hood:  parsed.hood  || "",
      email: parsed.email || "",
      phone: parsed.phone || "",
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
