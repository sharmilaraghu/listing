import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { transcript } = await req.json() as { transcript: string };
    if (!transcript?.trim()) return NextResponse.json({ error: "No transcript" }, { status: 400 });

    const key = process.env.GEMINI_API_KEY;
    if (!key) return NextResponse.json({ error: "No Gemini key" }, { status: 503 });

    const prompt = `You are a San Francisco classifieds assistant. Parse this speech into a structured posting form. Return ONLY a JSON object with these fields:
- cat: one of transit, shelter, gear, labor, free, audio, people, misc
- title: string (what they are selling/offering)
- price: number (0 for free)
- desc: string (description, max 300 chars)
- hood: string (SF neighborhood, one of: Mission, SoMa, North Beach, Castro, Hayes Valley, Outer Sunset, Inner Richmond, Dogpatch, Noe Valley, Pacific Heights, Bayview, Excelsior, Glen Park, Civic Center)
- email: string or empty
- phone: string or empty

Speech to parse: "${transcript}"

Rules:
- Infer category from context (bike/scooter → transit, apartment/room → shelter, etc.)
- Extract price if mentioned, default to 0 for free items
- Extract email if mentioned (look for @ and domain)
- Extract phone if mentioned
- Extract neighborhood if mentioned, otherwise leave empty
- title should be concise, 3-8 words
- desc should capture key details from the speech
- Return ONLY valid JSON, no markdown, no explanation`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 400, temperature: 0.3 },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: "Gemini error", detail: err }, { status: 502 });
    }

    const json = await res.json();
    const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text as string;
    if (!rawText) return NextResponse.json({ error: "No parse result" }, { status: 502 });

    // Extract JSON from response
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return NextResponse.json({ error: "Could not parse fields" }, { status: 422 });

    const parsed = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      cat: parsed.cat || "misc",
      title: parsed.title || "",
      price: Number(parsed.price) || 0,
      desc: (parsed.desc || "").slice(0, 300),
      hood: parsed.hood || "",
      email: parsed.email || "",
      phone: parsed.phone || "",
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}