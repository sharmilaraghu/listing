import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const key = process.env.ELEVENLABS_API_KEY;
  const agentId = process.env.ELEVENLABS_AGENT_ID;

  if (!key || key.includes("your_")) {
    return NextResponse.json({ error: "No ElevenLabs API key" }, { status: 503 });
  }
  if (!agentId) {
    return NextResponse.json({ error: "No ElevenLabs Agent ID. Add ELEVENLABS_AGENT_ID to .env.local" }, { status: 503 });
  }

  try {
    const { voice = "atlas" } = await req.json().catch(() => ({}));

    const res = await fetch(
      `https://api.elevenlabs.io/v1/agents/${agentId}/sessions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": key,
        },
        body: JSON.stringify({
          agent_id: agentId,
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: "Agent error", detail: err }, { status: 502 });
    }

    const json = await res.json();
    return NextResponse.json({
      sessionId: json.session_id,
      conversationId: json.conversation_id,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const key = process.env.ELEVENLABS_API_KEY;
  const agentId = process.env.ELEVENLABS_AGENT_ID;
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");

  if (!key || !agentId || !sessionId) return NextResponse.json({ error: "Missing params" }, { status: 400 });

  try {
    await fetch(
      `https://api.elevenlabs.io/v1/agents/${agentId}/sessions/${sessionId}/end`,
      {
        method: "POST",
        headers: { "xi-api-key": key },
      }
    );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}