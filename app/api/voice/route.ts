import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key || key.includes("your_")) {
    return NextResponse.json({
      status: "missing",
      message: "No ElevenLabs API key configured. Add ELEVENLABS_API_KEY to .env",
    });
  }

  const voiceId = "pNInz6obpgDQGcFmaJgB"; // ATLAS
  const text = "This is a test of the Atlas voice on LISTING. If you can hear this, your ElevenLabs integration is working.";

  try {
    const res = await fetch(
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
          voice_settings: { stability: 0.42, similarity_boost: 0.78 },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({
        status: "error",
        message: "ElevenLabs returned an error",
        detail: err,
        code: res.status,
      });
    }

    return new Response(res.body, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    return NextResponse.json({
      status: "error",
      message: "Failed to connect to ElevenLabs",
      detail: e?.message,
    });
  }
}