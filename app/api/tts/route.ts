import { NextRequest, NextResponse } from "next/server";

const VOICE_MAP: Record<string, string> = {
  ATLAS: "pNInz6obpgDQGcFmaJgB",
  ECHO: "21m00Tcm4TlvDq8ikWAM",
};

export async function POST(req: NextRequest) {
  try {
    const { text, voice = "ATLAS" } = await req.json();
    if (!text) return NextResponse.json({ error: "No text" }, { status: 400 });

    const key = process.env.ELEVENLABS_API_KEY ?? req.headers.get("x-el-key");
    if (!key) {
      return NextResponse.json({ error: "No API key" }, { status: 503 });
    }

    const voiceId = VOICE_MAP[voice];
    if (!voiceId) {
      return NextResponse.json({ error: "Invalid voice" }, { status: 400 });
    }

    const elRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?optimize_for_streaming=true`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": key,
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_turbo_v2_5",
          voice_settings: {
            stability: 0.42,
            similarity_boost: 0.78,
          },
        }),
      }
    );

    if (!elRes.ok) {
      return NextResponse.json({ error: "ElevenLabs error" }, { status: 503 });
    }

    return new Response(elRes.body, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
