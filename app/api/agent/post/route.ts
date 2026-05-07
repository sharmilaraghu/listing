import { NextRequest, NextResponse } from "next/server";

export async function POST(_req: NextRequest) {
  const key = process.env.ELEVENLABS_API_KEY;
  const agentId = process.env.ELEVENLABS_AGENT_ID;

  if (!key) return NextResponse.json({ error: "No ElevenLabs API key" }, { status: 503 });
  if (!agentId) return NextResponse.json({ error: "No ELEVENLABS_AGENT_ID" }, { status: 503 });

  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
      { headers: { "xi-api-key": key } }
    );

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: "ElevenLabs error", detail: err }, { status: 502 });
    }

    const { signed_url } = await res.json();
    return NextResponse.json({ signedUrl: signed_url });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest) {
  return NextResponse.json({ ok: true });
}
