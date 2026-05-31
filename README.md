# ♛ Royal Mind Arena

A beautiful AI-powered chess game with Selen, your personal chess companion.

**Stack:** Next.js 15 · Neon PostgreSQL · Tailwind CSS · Anthropic AI

---

## 🚀 Deploy to Vercel (Step by Step)

### Step 1 — Get your API keys

**Neon Database (free):**
1. Go to neon.tech → Sign up free
2. Click "New Project" → name it `royal-mind-arena`
3. Copy the **Connection String** (starts with `postgresql://...`)

**Anthropic API (for Selen AI):**
1. Go to console.anthropic.com → Sign up
2. Go to "API Keys" → "Create Key"
3. Copy the key (starts with `sk-ant-...`)

---

### Step 2 — Push to GitHub

Open this folder in VS Code, then open the terminal (Ctrl + backtick):

```bash
git init
git add .
git commit -m "Royal Mind Arena - initial commit"
```

Go to github.com:
1. Click **"+"** → **"New repository"**
2. Name: `royal-mind-arena`
3. Click **"Create repository"**
4. Run the commands GitHub shows you:

```bash
git remote add origin https://github.com/YOUR_USERNAME/royal-mind-arena.git
git branch -M main
git push -u origin main
```

---

### Step 3 — Deploy on Vercel

1. Go to **vercel.com** → Login with GitHub
2. Click **"Add New Project"**
3. Select `royal-mind-arena` from your repos
4. In **Environment Variables**, add:

| Name | Value |
|------|-------|
| `DATABASE_URL` | your Neon connection string |
| `ANTHROPIC_API_KEY` | your Anthropic API key |

5. Click **"Deploy"** ✅

---

### Step 4 — Set up the database

After Vercel deploys, run this once on your local machine:

```bash
npm install
DATABASE_URL="your-neon-connection-string" npm run db:push
```

This creates the users and game_history tables.

---

### Step 5 — Done! 🎉

Your app is live at `https://royal-mind-arena-xxx.vercel.app`

Every time you push to GitHub, Vercel auto-deploys.

---

## 💻 Local Development

```bash
npm install
cp .env.example .env.local
# Fill in your DATABASE_URL and ANTHROPIC_API_KEY in .env.local
npm run db:push
npm run dev
```

Open http://localhost:3000
