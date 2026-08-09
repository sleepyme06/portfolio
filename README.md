# 🌸 Living Terminal Portfolio — Arpita Verma

A retro-modern interactive terminal portfolio built with **React, Tailwind CSS, Framer Motion, FastAPI, and Groq Llama-3.3-70B**.

![Living Terminal Portfolio](frontend/public/avatar.png)

---

## ✨ Key Features

- **Interactive Terminal UI**: Fully responsive retro terminal with custom color themes (Cyber Neon & Vintage Pastel), typewriter animations, and custom keyboard autocomplete.
- **AI Representative (FastAPI + Groq)**: Powered by Llama-3.3-70B with streaming SSE responses. Knows Arpita's experience, projects, skills, and open-source contributions.
- **Sliding-Window Context Management**: Bounded token context window (last 20 messages) preventing token bloat during long chats.
- **localStorage Persistence**: Chat history persists across page reloads with a `/clear` command to reset.
- **Interactive Avatar & Modal**: Clickable pixel art avatar with profile details, direct links (GitHub, LeetCode, Twitter/X, LinkedIn), and PDF résumé download.

---

## 📁 Repository Structure

```text
portfolio/
├── frontend/                 # React + Vite Frontend
│   ├── src/
│   │   ├── api/             # SSE streaming API client (chat.js)
│   │   ├── components/      # Terminal, InputLine, Mascot, ContactModal, etc.
│   │   ├── config/          # Slash commands & mock response fallbacks
│   │   ├── hooks/           # useChatHistory & useTypewriter hooks
│   │   └── styles/          # Design system & theme tokens (global.css)
│   ├── public/              # Avatar image & PDF résumé
│   ├── vercel.json          # Vercel SPA routing fallback
│   └── package.json
│
├── backend/                  # FastAPI Backend
│   ├── app/
│   │   ├── main.py          # FastAPI server (/health & /chat SSE stream)
│   │   ├── profile.json     # Knowledge base data
│   │   └── profile_schema.py# Pydantic schema validation
│   ├── Procfile             # Railway / Render start command
│   ├── pyproject.toml       # Python dependencies (uv / pip)
│   └── .env.example
│
└── README.md                 # Project Overview & Setup Guide
```

---

## 🚀 Quick Start (Local Setup)

### 1. Backend Setup (FastAPI)

```bash
cd backend

# Create virtual environment & install dependencies (using uv or pip)
uv sync
# OR: python -m venv .venv && source .venv/bin/activate && pip install -r pyproject.toml

# Copy environment template & add your Groq API Key
cp .env.example .env
```

Edit `backend/.env`:
```env
GROQ_API_KEY=gsk_your_groq_api_key_here
```

Start backend server:
```bash
uv run uvicorn app.main:app --port 8000 --reload
```

### 2. Frontend Setup (React + Vite)

In a new terminal tab:
```bash
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

Open `http://localhost:5173/` in your browser!

---

## 🛠️ Slash Commands

| Command | Description |
|---|---|
| `/about` | Overview of Arpita's background & focus |
| `/projects` | Key projects & repository links |
| `/skills` | Tech stack breakdown |
| `/resume` | Download PDF résumé |
| `/contact` | Social links & email |
| `/theme` | Toggle between Cyber Neon & Vintage Pastel themes |
| `/clear` | Reset chat log & clear localStorage |
| `/help` | List all available commands |

---

## 🌐 Production Deployment

- **Frontend**: Deploy `frontend/` folder to **Vercel** with env var `VITE_API_URL=https://your-railway-backend.up.railway.app`.
- **Backend**: Deploy `backend/` folder to **Railway** or **Render** with env var `GROQ_API_KEY=gsk_...`.
