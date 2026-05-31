import { Chess } from "chess.js";

type Difficulty = "beginner" | "moderate" | "difficult";

function evaluateBoard(chess: Chess): number {
  const pieceValues: Record<string, number> = {
    p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000,
  };
  let score = 0;
  const board = chess.board();
  for (const row of board) {
    for (const sq of row) {
      if (!sq) continue;
      const val = pieceValues[sq.type] ?? 0;
      score += sq.color === "w" ? val : -val;
    }
  }
  return score;
}

function minimax(chess: Chess, depth: number, alpha: number, beta: number, maximizing: boolean): number {
  if (depth === 0 || chess.isGameOver()) return evaluateBoard(chess);
  const moves = chess.moves();
  if (maximizing) {
    let best = -Infinity;
    for (const move of moves) {
      chess.move(move);
      best = Math.max(best, minimax(chess, depth - 1, alpha, beta, false));
      chess.undo();
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const move of moves) {
      chess.move(move);
      best = Math.min(best, minimax(chess, depth - 1, alpha, beta, true));
      chess.undo();
      beta = Math.min(beta, best);
      if (beta <= alpha) break;
    }
    return best;
  }
}

export function getBestMove(fen: string, difficulty: Difficulty): string | null {
  const chess = new Chess(fen);
  const moves = chess.moves();
  if (!moves.length) return null;

  if (difficulty === "beginner") {
    // Random move with slight preference for captures
    const captures = moves.filter(m => m.includes("x"));
    const pool = captures.length > 0 && Math.random() > 0.5 ? captures : moves;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  const depth = difficulty === "moderate" ? 2 : 3;
  let bestMove = moves[0];
  let bestScore = Infinity;

  for (const move of moves) {
    chess.move(move);
    const score = minimax(chess, depth - 1, -Infinity, Infinity, true);
    chess.undo();
    if (score < bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }
  return bestMove;
}
