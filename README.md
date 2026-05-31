# ♛ Royal Mind Arena

<div align="center">

![Royal Mind Arena](https://img.shields.io/badge/Royal%20Mind%20Arena-Chess%20%2B%20AI-7c3aed?style=for-the-badge&logo=chess&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js%2015-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

**A full-stack AI-powered chess game with Selen — your personal grandmaster AI companion**

[🎮 Play Live](https://royal-mind-arena-769c6giwx-gulsumbegam2004-6638s-projects.vercel.app) · [⭐ Star this repo](https://github.com/GulsumBegam/Royal-Mind-Arena-)

</div>

---

## ✨ What is Royal Mind Arena?

Royal Mind Arena is a **full-stack chess application** built with modern web technologies. It combines a fully functional chess engine with an AI opponent and **Selen** — an intelligent AI chess companion powered by Meta's LLaMA 3.3 model via Groq.

Whether you're a complete beginner or an experienced player, Royal Mind Arena adapts to your skill level and helps you improve through real-time coaching and analysis.

---

## 🎯 Features

### ♟️ Chess Game
- **Full chess rules** — castling, en passant, pawn promotion, check, checkmate, draw
- **Beautiful SVG pieces** — professional quality chess pieces
- **Move highlighting** — selected pieces, possible moves, last move indicators
- **Stable fixed board** — smooth, real-life chess experience
- **Sound effects** — move, capture, check, and game over sounds
- **Captured pieces display** — see what each side has taken

### 🤖 AI Opponent
- **3 difficulty levels:**
  - 🧠 **Beginner** — random moves with slight preference for captures, perfect for learning
  - 🏆 **Moderate** — 2-depth minimax with alpha-beta pruning
  - 👑 **Difficult** — 3-depth minimax with advanced evaluation, a real challenge
- **Minimax algorithm** with alpha-beta pruning for efficient move calculation
- **Material evaluation** — AI values pieces correctly (pawn=100, knight=320, bishop=330, rook=500, queen=900)

### 💬 Selen — Your AI Chess Companion
> *"The most unique feature of Royal Mind Arena"*

Selen is a real AI chess coach powered by **Meta LLaMA 3.3 70B** via **Groq API**. She is not a simple chatbot — she is a knowledgeable grandmaster-level companion who:

- 🎓 **Teaches chess strategy** — openings, middlegame, endgame principles
- 🔍 **Analyzes your position** — reads the actual board FEN and gives specific advice
- 📚 **References real chess history** — quotes Kasparov, Fischer, Magnus Carlsen, Tal
- 🗣️ **Uses proper chess terminology** — tempo, initiative, pawn structure, outpost, zugzwang
- 💪 **Encourages improvement** — celebrates good moves, gently corrects mistakes
- 🤝 **Auto-comments** — automatically analyzes the position every few moves

#### How Selen Works (Technical)
```
User sends message
       ↓
Next.js API route (/api/chat)
       ↓
Groq API → LLaMA 3.3 70B model
       ↓
System prompt: "You are Selen, an elite AI chess companion..."
Current board FEN injected into context
       ↓
AI generates grandmaster-level response
       ↓
Response streamed back to user
```

The board's **FEN (Forsyth-Edwards Notation)** is sent with every message so Selen always knows the exact current position and can give relevant, specific advice.

### 📊 Stats Dashboard
- Track **wins, losses, draws**
- **Win rate percentage** with visual progress bar
- **Total moves played** across all games
- Persistent storage via localStorage

### 📋 Move History
- Full game notation in **algebraic notation**
- Scrollable move list
- Move counter

### 🔐 Authentication
- **Register / Login** with username and password
- Passwords hashed with **bcrypt** (12 salt rounds)
- Session stored in **HTTP-only cookies** (7 days)
- Protected routes — game only accessible when logged in

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Chess Engine** | chess.js |
| **AI Companion** | Groq API + LLaMA 3.3 70B |
| **Database** | Neon PostgreSQL (Serverless) |
| **ORM** | Drizzle ORM |
| **Auth** | bcryptjs + HTTP-only cookies |
| **Deployment** | Vercel |
| **Animations** | Pure CSS (orbs, stars, shooting stars) |

---

## 🏗️ Project Structure

```
royal-mind-arena/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts      # Login API
│   │   │   ├── register/route.ts   # Register API
│   │   │   └── logout/route.ts     # Logout API
│   │   ├── chat/route.ts           # Selen AI API (Groq)
│   │   └── game/route.ts           # Chess AI move API
│   ├── game/page.tsx               # Main game page
│   ├── login/page.tsx              # Login page
│   ├── register/page.tsx           # Register page
│   ├── layout.tsx                  # Root layout + animated background
│   └── globals.css                 # Global styles + animations
├── components/
│   ├── GameClient.tsx              # Main chess game component
│   ├── ChessPiece.tsx              # SVG chess pieces
│   ├── LoginForm.tsx               # Login form
│   └── RegisterForm.tsx            # Register form
├── lib/
│   ├── db.ts                       # Neon database connection
│   ├── schema.ts                   # Drizzle schema (users, games, chat)
│   ├── auth.ts                     # Auth utilities
│   └── chess-ai.ts                 # Minimax AI engine
└── drizzle.config.ts               # Drizzle configuration
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A [Neon](https://neon.tech) account (free)
- A [Groq](https://console.groq.com) account (free)

### 1. Clone the repository
```bash
git clone https://github.com/GulsumBegam/Royal-Mind-Arena-.git
cd Royal-Mind-Arena-
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env.local` file:
```env
DATABASE_URL=postgresql://your-neon-connection-string
GROQ_API_KEY=gsk_your-groq-api-key
```

### 4. Push database schema
```bash
npm run db:push
```

### 5. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 🌐 Deployment

This app is deployed on **Vercel** with **Neon PostgreSQL**.

### Deploy your own:
1. Fork this repository
2. Create a [Neon](https://neon.tech) database and copy the connection string
3. Get a free [Groq API key](https://console.groq.com)
4. Import the repo on [Vercel](https://vercel.com)
5. Add environment variables: `DATABASE_URL` and `GROQ_API_KEY`
6. Deploy! ✅

---

## 🧠 How the Chess AI Works

The AI opponent uses the **Minimax algorithm with Alpha-Beta Pruning**:

```
For each possible move:
  → Make the move
  → Evaluate the resulting position
  → Recursively think ahead (depth 2-3 moves)
  → Choose the move that minimizes your advantage
  → Alpha-beta pruning skips branches that won't be chosen
```

**Position evaluation** is based on material count:
- ♙ Pawn = 100 points
- ♘ Knight = 320 points  
- ♗ Bishop = 330 points
- ♖ Rook = 500 points
- ♕ Queen = 900 points
- ♔ King = 20,000 points

---

## 🎨 Design

- **Dreamy animated background** — floating glowing orbs, twinkling stars, shooting stars
- **Floating chess piece decorations** in the background
- **Glass morphism cards** with backdrop blur
- **Gradient text** and glowing borders
- **Responsive design** — works on mobile and desktop
- **Purple/blue color theme** — premium chess aesthetic

---

## 👩‍💻 Author

**Gulsumrahuman**

> *"I built Royal Mind Arena to combine my love for chess with modern AI technology. Selen is the heart of this project — a real AI companion that makes chess accessible and fun for everyone."*

---

## 📄 License

MIT License — feel free to use and modify!

---

<div align="center">

**⭐ If you like this project, please give it a star!**

Made with ♟️ and 💜 by Gulsumrahuman

</div>
