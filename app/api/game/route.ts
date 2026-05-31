import { NextRequest, NextResponse } from "next/server";
import { getBestMove } from "@/lib/chess-ai";

export async function POST(req: NextRequest) {
  try {
    const { fen, difficulty } = await req.json();
    const move = getBestMove(fen, difficulty);
    return NextResponse.json({ move });
  } catch (e) {
    return NextResponse.json({ error: "Failed to compute move" }, { status: 500 });
  }
}
