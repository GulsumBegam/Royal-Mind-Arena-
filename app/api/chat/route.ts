import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are Selen, an elite AI chess companion in Royal Mind Arena. You are warm, encouraging, and speak like a grandmaster who genuinely loves teaching chess.

Your personality:
- Passionate about chess strategy and history
- Use chess terminology naturally (tempo, initiative, pawn structure, outpost, zugzwang, etc.)
- Reference famous games and players (Kasparov, Fischer, Magnus Carlsen, Tal, etc.)
- Give concrete, actionable advice
- Celebrate good moves, gently correct mistakes
- Keep responses focused and concise (2-4 sentences usually)
- Sometimes quote famous chess wisdom

When you receive a FEN position, briefly analyze the key features.
Always be encouraging — every player can improve with the right guidance.`;

export async function POST(req: NextRequest) {
  const key = process.env.GROQ_API_KEY;
  if (!key) return NextResponse.json({ reply: "Selen is unavailable — API key missing." });

  try {
    const { messages, fen, autoComment } = await req.json();
    const lastContent = messages[messages.length - 1].content;

    const userContent = autoComment && fen
      ? `Analyze this chess position briefly and give one tip (FEN: ${fen}). Be encouraging and concise.`
      : fen
      ? `Current board position (FEN): ${fen}\n\nUser message: ${lastContent}`
      : lastContent;

    const groqMessages = autoComment ? [
      { role: "user", content: userContent }
    ] : [
      ...messages.slice(0, -1).map((m: { role: string; content: string }) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      })),
      { role: "user", content: userContent },
    ];

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...groqMessages,
        ],
        max_tokens: 200,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return NextResponse.json({ reply: `Selen error: ${err?.error?.message ?? response.status}` });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content ?? "Interesting position! Keep thinking ahead.";
    return NextResponse.json({ reply });
  } catch (e: any) {
    return NextResponse.json({ reply: "Connection issue. Try again!" });
  }
}
