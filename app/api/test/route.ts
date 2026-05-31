import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: "Say hello in one word" }],
        max_tokens: 10,
      }),
    });
    const data = await response.json();
    return NextResponse.json({ 
      status: response.status,
      hasKey: !!process.env.GROQ_API_KEY,
      keyPreview: process.env.GROQ_API_KEY?.slice(0, 10) + "...",
      data 
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
