import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const key = process.env.ELEVENLABS_API_KEY;
  const agentId = process.env.ELEVENLABS_AGENT_ID;

  if (!key || key.includes("your_")) {
    return NextResponse.json({ error: "No ElevenLabs API key" }, { status: 503 });
  }
  if (!agentId) {
    return NextResponse.json({ error: "No ELEVENLABS_AGENT_ID configured" }, { status: 503 });
  }

  try {
    const { sessionId, text } = await req.json();

    const res = await fetch(
      `https://api.elevenlabs.io/v1/agents/${agentId}/sessions/${sessionId}/ converse`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": key,
        },
        body: JSON.stringify({
          text,
          model: "text",
          language: "en",
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: "Agent error", detail: err }, { status: 502 });
    }

    const json = await res.json();

    // Parse agent response — text output and any tool calls
    const agentText = json?.output?.text || json?.messages?.[0]?.text || "";
    const parsed = parseAgentResponse(agentText);

    return NextResponse.json({
      agentMessage: parsed.text,
      formData: parsed.formData,
      isComplete: parsed.isComplete,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

function parseAgentResponse(text: string): { text: string; formData: Record<string, string>; isComplete: boolean } {
  // Agent returns a structured message — try to extract form data
  // Pattern: the agent might say "Got it — a bike in Mission for $850. Ready to publish!"
  // and then we parse the data from the conversation history

  const isComplete = text.toLowerCase().includes("ready to publish") ||
                     text.toLowerCase().includes("all set");

  return {
    text: text || "I'm here to help you post a listing. What are you selling?",
    formData: {},
    isComplete,
  };
}