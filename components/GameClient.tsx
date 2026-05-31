"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Chess, Square } from "chess.js";
import { useRouter } from "next/navigation";
import ChessPiece from "./ChessPiece";

type Difficulty = "beginner" | "moderate" | "difficult";
type ChatMsg = { role: "user" | "assistant"; content: string; time: string };
type GameStats = { wins: number; losses: number; draws: number; totalMoves: number };

function getTime() {
  if (typeof window === "undefined") return "";
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function playSound(type: "move" | "capture" | "check" | "gameOver") {
  if (typeof window === "undefined") return;
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    const configs: Record<string, [number, number, number, string]> = {
      move:    [520, 0.08, 0.12, "sine"],
      capture: [200, 0.15, 0.2,  "sawtooth"],
      check:   [700, 0.15, 0.25, "square"],
      gameOver:[150, 0.2,  0.9,  "sine"],
    };
    const [freq, vol, dur, wave] = configs[type];
    o.type = wave as OscillatorType;
    o.frequency.setValueAtTime(freq, ctx.currentTime);
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    o.start(); o.stop(ctx.currentTime + dur);
  } catch {}
}

export default function GameClient({ user }: { user: { id: string; username: string } }) {
  const router = useRouter();
  const [chess] = useState(() => new Chess());
  const [fen, setFen] = useState(chess.fen());
  const [selected, setSelected] = useState<Square | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<Square[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>("moderate");
  const [status, setStatus] = useState("Your Turn (White)");
  const [gameOver, setGameOver] = useState(false);
  const [gameResult, setGameResult] = useState("");
  const [aiThinking, setAiThinking] = useState(false);
  const [lastMove, setLastMove] = useState<[Square, Square] | null>(null);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [capturedByAI, setCapturedByAI] = useState<string[]>([]);
  const [capturedByYou, setCapturedByYou] = useState<string[]>([]);
  const [tab, setTab] = useState<"game" | "chat" | "stats">("game");
  const [stats, setStats] = useState<GameStats>({ wins: 0, losses: 0, draws: 0, totalMoves: 0 });
  const [messages, setMessages] = useState<ChatMsg[]>([{
    role: "assistant",
    content: "Welcome to Royal Mind Arena! ✨ I am Selen, your AI chess companion. Make your first move and I'll guide you!",
    time: "",
  }]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const aiThinkingRef = useRef(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const moveHistoryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    try { const s = localStorage.getItem("rma-stats"); if (s) setStats(JSON.parse(s)); } catch {}
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { if (moveHistoryRef.current) moveHistoryRef.current.scrollTop = moveHistoryRef.current.scrollHeight; }, [moveHistory]);

  function saveStats(s: GameStats) {
    setStats(s);
    try { localStorage.setItem("rma-stats", JSON.stringify(s)); } catch {}
  }

  // Sync all state from chess instance — single source of truth
  function syncFromChess(lastFrom?: Square, lastTo?: Square) {
    setFen(chess.fen());
    setMoveHistory([...chess.history()]);
    if (lastFrom && lastTo) setLastMove([lastFrom, lastTo]);

    // Captured pieces
    const count: Record<string, number> = {};
    chess.board().flat().forEach(sq => {
      if (sq) count[sq.color + sq.type] = (count[sq.color + sq.type] || 0) + 1;
    });
    const initial: Record<string, number> = { p: 8, n: 2, b: 2, r: 2, q: 1 };
    const cByAI: string[] = [], cByYou: string[] = [];
    Object.entries(initial).forEach(([t, max]) => {
      for (let i = 0; i < max - (count[`w${t}`] || 0); i++) cByAI.push(`w${t}`);
      for (let i = 0; i < max - (count[`b${t}`] || 0); i++) cByYou.push(`b${t}`);
    });
    setCapturedByAI(cByAI);
    setCapturedByYou(cByYou);

    // Status
    if (chess.isCheckmate()) {
      const youWin = chess.turn() === "b";
      setStatus(youWin ? "🎉 You Win by Checkmate!" : "💀 AI Wins by Checkmate!");
      setGameResult(youWin ? "🎉 You Win!" : "😔 AI Wins");
      setGameOver(true);
      playSound("gameOver");
      const ns = { ...stats, [youWin ? "wins" : "losses"]: stats[youWin ? "wins" : "losses"] + 1, totalMoves: stats.totalMoves + chess.history().length };
      saveStats(ns);
      setMessages(m => [...m, {
        role: "assistant",
        content: youWin ? "🏆 Brilliant! You defeated the AI — a true grandmaster performance!" : "Well fought! Study this game and you'll come back even stronger! 💪",
        time: getTime()
      }]);
    } else if (chess.isDraw()) {
      setStatus("🤝 Game is a Draw!");
      setGameResult("🤝 Draw!");
      setGameOver(true);
      playSound("gameOver");
      saveStats({ ...stats, draws: stats.draws + 1, totalMoves: stats.totalMoves + chess.history().length });
    } else if (chess.isCheck()) {
      setStatus(chess.turn() === "w" ? "⚠️ You are in Check!" : "⚠️ AI is in Check!");
      playSound("check");
    } else {
      setStatus(chess.turn() === "w" ? "Your Turn (White)" : "AI is Thinking...");
    }
  }

  // AI move
  const makeAiMove = useCallback(async () => {
    if (aiThinkingRef.current) return;
    if (chess.turn() !== "b" || chess.isGameOver()) return;
    aiThinkingRef.current = true;
    setAiThinking(true);
    await new Promise(r => setTimeout(r, 500 + Math.random() * 600));
    try {
      const res = await fetch("/api/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fen: chess.fen(), difficulty }),
      });
      const data = await res.json();
      if (data.move) {
        const move = chess.move(data.move);
        if (move) {
          playSound(move.captured ? "capture" : "move");
          syncFromChess(move.from as Square, move.to as Square);
        }
      }
    } catch {
      const moves = chess.moves();
      if (moves.length) {
        const move = chess.move(moves[Math.floor(Math.random() * moves.length)]);
        if (move) syncFromChess(move.from as Square, move.to as Square);
      }
    }
    aiThinkingRef.current = false;
    setAiThinking(false);
  }, [chess, difficulty]);

  // Handle square click — pure logic, no re-render side effects
  function handleSquareClick(sq: Square) {
    if (chess.turn() !== "w" || gameOver || aiThinkingRef.current) return;

    if (selected === sq) {
      // Deselect
      setSelected(null);
      setPossibleMoves([]);
      return;
    }

    if (selected && possibleMoves.includes(sq)) {
      // Make the move
      const isCapture = !!chess.get(sq);
      const move = chess.move({ from: selected, to: sq, promotion: "q" });
      if (move) {
        playSound(isCapture ? "capture" : "move");
        setSelected(null);
        setPossibleMoves([]);
        syncFromChess(move.from as Square, move.to as Square);
        if (!chess.isGameOver()) {
          setTimeout(() => makeAiMove(), 300);
        }
      }
      return;
    }

    // Select a white piece
    const piece = chess.get(sq);
    if (piece && piece.color === "w") {
      setSelected(sq);
      const moves = chess.moves({ square: sq, verbose: true }) as any[];
      setPossibleMoves(moves.map(m => m.to as Square));
    } else {
      setSelected(null);
      setPossibleMoves([]);
    }
  }

  function resetGame() {
    chess.reset();
    aiThinkingRef.current = false;
    setFen(chess.fen());
    setSelected(null);
    setPossibleMoves([]);
    setLastMove(null);
    setGameOver(false);
    setGameResult("");
    setAiThinking(false);
    setMoveHistory([]);
    setCapturedByAI([]);
    setCapturedByYou([]);
    setStatus("Your Turn (White)");
    setMessages([{ role: "assistant", content: "New game! ✨ What opening will you choose?", time: getTime() }]);
  }

  async function sendChat() {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg: ChatMsg = { role: "user", content: chatInput.trim(), time: getTime() };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setChatInput("");
    setChatLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMsgs.map(m => ({ role: m.role, content: m.content })), fen: chess.fen() }),
      });
      const d = await res.json();
      setMessages(m => [...m, { role: "assistant", content: d.reply, time: getTime() }]);
    } catch {
      setMessages(m => [...m, { role: "assistant", content: "Connection error. Try again!", time: getTime() }]);
    }
    setChatLoading(false);
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  // Derive board from FEN — stable, no flicker
  const currentChess = new Chess(fen);
  const boardState = currentChess.board();

  const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
  const ranks = [8, 7, 6, 5, 4, 3, 2, 1];
  const winRate = (stats.wins + stats.losses + stats.draws) > 0
    ? Math.round(stats.wins / (stats.wins + stats.losses + stats.draws) * 100) : 0;

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="header-glow px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="crown-float text-2xl">♛</span>
          <div>
            <h1 className="font-bold text-lg leading-none"
              style={{ background: "linear-gradient(90deg,#c4b5fd,#f9a8d4,#93c5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Royal Mind Arena
            </h1>
            <p className="text-purple-400 text-xs">✦ Experience Chess Like Never Before ✦</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 card-glow rounded-full px-3 py-1.5">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: "linear-gradient(135deg,#7c3aed,#2563eb)" }}>
              {user.username[0].toUpperCase()}
            </div>
            <span className="text-white text-sm">{user.username}</span>
            <span className="text-yellow-400 text-xs font-semibold">🏆 {stats.wins}W</span>
          </div>
          <button onClick={logout} className="btn-ghost text-sm py-1.5 px-3">Sign Out</button>
        </div>
      </header>

      {/* Mobile Tabs */}
      <div className="sm:hidden flex border-b border-purple-900/50" style={{ background: "rgba(10,6,24,0.8)" }}>
        {(["game", "chat", "stats"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-sm font-medium transition-all ${tab === t ? "text-white border-b-2 border-purple-400" : "text-purple-500"}`}>
            {t === "chat" ? "💬 Selen" : t === "stats" ? "📊 Stats" : "♟️ Game"}
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col sm:flex-row gap-3 p-2 sm:p-4 max-w-7xl mx-auto w-full">

        {/* ===== LEFT: BOARD ===== */}
        <div className={`flex-1 flex flex-col gap-3 ${tab !== "game" ? "hidden sm:flex" : "flex"}`}>

          {/* Status */}
          <div className="card-glow rounded-xl px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-white font-semibold text-sm">Chess Board</p>
              <p className="text-purple-400 text-xs">Click a piece → click destination</p>
            </div>
            <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${
              gameOver ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40" :
              aiThinking ? "bg-blue-500/20 text-blue-300 border border-blue-500/40" :
              chess.isCheck() ? "bg-red-500/20 text-red-300 border border-red-500/40" :
              "bg-green-500/20 text-green-300 border border-green-500/40"
            }`}>
              {aiThinking ? "⟳ AI Thinking..." : status}
            </div>
          </div>

          {/* Difficulty */}
          <div className="flex gap-2">
            {(["beginner", "moderate", "difficult"] as Difficulty[]).map(d => (
              <button key={d} onClick={() => { setDifficulty(d); resetGame(); }}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${difficulty === d ? "text-white" : "card-glass text-purple-300 hover:text-white"}`}
                style={difficulty === d ? { background: "linear-gradient(135deg,#7c3aed,#2563eb)", boxShadow: "0 4px 20px rgba(124,58,237,0.4)" } : {}}>
                {d === "beginner" ? "🧠 Beginner" : d === "moderate" ? "🏆 Moderate" : "👑 Difficult"}
              </button>
            ))}
          </div>

          {/* AI Captured */}
          <div className="card-glass rounded-lg px-3 py-2 flex items-center gap-1 flex-wrap" style={{ minHeight: "38px" }}>
            <span className="text-purple-400 text-xs mr-1 shrink-0">AI took:</span>
            {capturedByAI.map((p, i) => <div key={i} className="w-5 h-5"><ChessPiece type={p} /></div>)}
          </div>

          {/* ===== CHESS BOARD — FIXED SIZE, NEVER SHIFTS ===== */}
          <div className="card-glow rounded-2xl p-3 flex justify-center">
            <div className="relative" style={{ userSelect: "none" }}>
              {/* Rank labels */}
              <div className="absolute top-0 flex flex-col" style={{ left: "-20px", height: "100%" }}>
                {ranks.map(r => (
                  <div key={r} className="flex items-center justify-center text-purple-400 text-xs font-mono" style={{ height: "12.5%" }}>{r}</div>
                ))}
              </div>

              {/* Board — fixed 400x400, each square 50x50 */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(8, 50px)",
                gridTemplateRows: "repeat(8, 50px)",
                borderRadius: "10px",
                overflow: "hidden",
                boxShadow: "0 0 50px rgba(124,58,237,0.35), 0 0 100px rgba(37,99,235,0.15)",
                border: "2px solid rgba(124,58,237,0.4)",
                width: "400px",
                height: "400px",
              }}>
                {ranks.map((rank, ri) =>
                  files.map((file, fi) => {
                    const sq = `${file}${rank}` as Square;
                    const isLight = (ri + fi) % 2 === 1;
                    const piece = boardState[ri][fi];
                    const isSel = selected === sq;
                    const isPoss = possibleMoves.includes(sq);
                    const isLast = lastMove && (lastMove[0] === sq || lastMove[1] === sq);

                    let bg = isLight ? "#f0d9b5" : "#b58863";
                    if (isSel) bg = isLight ? "#aee86a" : "#8fc43a";
                    else if (isLast) bg = isLight ? "#f6f669" : "#d4d44a";

                    return (
                      <div
                        key={sq}
                        onClick={() => handleSquareClick(sq)}
                        style={{
                          width: "50px",
                          height: "50px",
                          background: bg,
                          position: "relative",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: (piece?.color === "w" || isPoss) ? "pointer" : "default",
                          flexShrink: 0,
                        }}
                      >
                        {/* Possible move dot */}
                        {isPoss && !piece && (
                          <div style={{
                            position: "absolute",
                            width: "32%", height: "32%",
                            borderRadius: "50%",
                            background: "rgba(0,0,0,0.25)",
                            zIndex: 2,
                            pointerEvents: "none",
                          }} />
                        )}
                        {/* Possible capture ring */}
                        {isPoss && piece && (
                          <div style={{
                            position: "absolute",
                            inset: 0,
                            borderRadius: "0",
                            border: "4px solid rgba(0,0,0,0.3)",
                            zIndex: 2,
                            pointerEvents: "none",
                          }} />
                        )}
                        {/* Chess piece */}
                        {piece && (
                          <div style={{ width: "44px", height: "44px", position: "relative", zIndex: 3 }}>
                            <ChessPiece type={piece.color + piece.type} />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* File labels */}
              <div className="flex mt-1" style={{ width: "400px" }}>
                {files.map(f => (
                  <div key={f} className="text-center text-purple-400 text-xs font-mono" style={{ width: "50px" }}>{f}</div>
                ))}
              </div>

              {/* Game Over Overlay */}
              {gameOver && (
                <div style={{
                  position: "absolute", inset: 0, borderRadius: "10px",
                  background: "rgba(0,0,0,0.82)", backdropFilter: "blur(6px)",
                  display: "flex", alignItems: "center", justifyContent: "center", zIndex: 20,
                }}>
                  <div className="text-center px-6">
                    <div style={{ fontSize: "3rem" }}>{gameResult.split(" ")[0]}</div>
                    <div className="text-white font-bold text-2xl mt-1">{gameResult.split(" ").slice(1).join(" ")}</div>
                    <div className="text-purple-300 text-sm mt-1">{status}</div>
                    <button onClick={resetGame} className="btn-primary mt-4">Play Again</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* You Captured */}
          <div className="card-glass rounded-lg px-3 py-2 flex items-center gap-1 flex-wrap" style={{ minHeight: "38px" }}>
            <span className="text-purple-400 text-xs mr-1 shrink-0">You took:</span>
            {capturedByYou.map((p, i) => <div key={i} className="w-5 h-5"><ChessPiece type={p} /></div>)}
          </div>

          <button onClick={resetGame} className="btn-ghost w-full">⟳ New Game</button>
        </div>

        {/* ===== MIDDLE: Move History (desktop) ===== */}
        <div className="hidden lg:flex flex-col gap-3 w-36">
          <div className="card-glass rounded-xl p-3 flex-1 flex flex-col" style={{ minHeight: 0 }}>
            <p className="text-white text-xs font-semibold mb-2 text-center">📋 Moves</p>
            <div ref={moveHistoryRef} className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
              {Array.from({ length: Math.ceil(moveHistory.length / 2) }).map((_, i) => (
                <div key={i} className="flex gap-1 text-xs py-0.5 border-b border-white/5">
                  <span className="text-purple-600 w-5 shrink-0 font-mono">{i + 1}.</span>
                  <span className="text-white flex-1 font-mono">{moveHistory[i * 2] || ""}</span>
                  <span className="text-purple-300 flex-1 font-mono">{moveHistory[i * 2 + 1] || ""}</span>
                </div>
              ))}
              {moveHistory.length === 0 && <p className="text-purple-600 text-xs text-center mt-4">No moves yet</p>}
            </div>
            <div className="mt-2 pt-2 border-t border-white/10 text-xs text-purple-400 text-center font-mono">
              {moveHistory.length} moves
            </div>
          </div>
        </div>

        {/* ===== RIGHT: Chat ===== */}
        <div className={`w-full sm:w-72 lg:w-80 flex flex-col gap-3 ${tab === "game" ? "hidden sm:flex" : tab === "stats" ? "hidden" : "flex"}`}>
          <div className="card-glow rounded-2xl flex flex-col overflow-hidden" style={{ height: "580px" }}>
            <div className="px-4 py-3 border-b border-purple-900/50 flex items-center gap-2"
              style={{ background: "linear-gradient(135deg,rgba(124,58,237,0.15),rgba(37,99,235,0.1))" }}>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg"
                style={{ background: "linear-gradient(135deg,#7c3aed,#2563eb)" }}>♟</div>
              <div className="flex-1">
                <p className="text-white font-bold text-sm">Selen AI</p>
                <p className="text-purple-400 text-xs">Your chess grandmaster</p>
              </div>
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse-slow" />
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                  <div className={`max-w-[88%] text-xs leading-relaxed ${m.role === "assistant" ? "chat-bubble-ai text-purple-100" : "chat-bubble-user text-white"}`}>
                    {m.content}
                  </div>
                  {m.time && <span className="text-purple-600 text-xs mt-0.5">{m.time}</span>}
                </div>
              ))}
              {chatLoading && (
                <div className="flex items-start">
                  <div className="chat-bubble-ai"><span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" /></div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="p-2 border-t border-purple-900/50 flex gap-2">
              <input className="input-royal text-xs py-2" placeholder="Ask Selen anything..."
                value={chatInput} onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendChat()} />
              <button onClick={sendChat} disabled={chatLoading || !chatInput.trim()}
                className="btn-primary py-2 px-3 text-xs disabled:opacity-40">Send</button>
            </div>
          </div>
        </div>

        {/* ===== STATS ===== */}
        <div className={`w-full flex flex-col gap-3 ${tab !== "stats" ? "hidden sm:hidden" : "flex"}`}>
          <div className="card-glow rounded-2xl p-5">
            <h3 className="text-white font-bold mb-5 text-center text-lg">📊 Your Statistics</h3>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {([["Wins", stats.wins, "#4ade80"], ["Losses", stats.losses, "#f87171"], ["Draws", stats.draws, "#facc15"]] as const).map(([l, v, c]) => (
                <div key={l} className="stat-card">
                  <div className="text-3xl font-bold" style={{ color: c }}>{v}</div>
                  <div className="text-xs text-purple-400 mt-1">{l}</div>
                </div>
              ))}
            </div>
            <div className="stat-card mb-3">
              <div className="text-2xl font-bold text-purple-300 mb-1">{winRate}%</div>
              <div className="text-xs text-purple-400 mb-2">Win Rate</div>
              <div className="bg-white/10 rounded-full h-2.5 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${winRate}%`, background: "linear-gradient(90deg,#7c3aed,#22c55e)" }} />
              </div>
            </div>
            <div className="stat-card mb-4">
              <div className="text-2xl font-bold text-blue-400">{stats.totalMoves}</div>
              <div className="text-xs text-purple-400 mt-1">Total Moves Played</div>
            </div>
            <button onClick={() => saveStats({ wins: 0, losses: 0, draws: 0, totalMoves: 0 })}
              className="btn-ghost w-full text-sm py-2">Reset Stats</button>
          </div>
        </div>

      </div>
    </div>
  );
}
