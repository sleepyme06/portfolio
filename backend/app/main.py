"""
backend/app/main.py  ·  FastAPI + Groq SSE chat endpoint
─────────────────────────────────────────────────────────
GET  /health       → uptime check
POST /chat         → streams LLM response as SSE
     body: { "messages": [{role, content}, ...] }

Sliding-window context management:
  Only the last CONTEXT_WINDOW messages are sent to Groq.
  System prompt is always prepended so the model never forgets who it is.
"""

import json
import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from groq import AsyncGroq
from pydantic import BaseModel, ValidationError

try:
    from app.profile_schema import CandidateProfile
except ImportError:
    from profile_schema import CandidateProfile

# ── Environment ───────────────────────────────────────────────────────────────
load_dotenv()

GROQ_API_KEY   = os.getenv("GROQ_API_KEY", "")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")
MODEL           = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
CONTEXT_WINDOW  = int(os.getenv("CONTEXT_WINDOW", "20"))  # sliding window — last N messages

if not GROQ_API_KEY:
    raise RuntimeError("GROQ_API_KEY not set. Add it to your .env or Railway env vars.")

client = AsyncGroq(api_key=GROQ_API_KEY)

# ── Profile ───────────────────────────────────────────────────────────────────
PROFILE_PATH = Path(__file__).parent / "profile.json"

def load_profile() -> dict:
    if not PROFILE_PATH.exists():
        raise FileNotFoundError(f"profile.json not found at {PROFILE_PATH}")
    with open(PROFILE_PATH, "r", encoding="utf-8") as f:
        raw = json.load(f)
    try:
        CandidateProfile(**raw)
    except ValidationError as e:
        raise ValueError(f"profile.json failed schema validation:\n{e}")
    return raw

profile_data = load_profile()

SYSTEM_PROMPT = f"""
#ROLE
You are the AI representative of Arpita Verma. You speak about her in the third person
(e.g. "Arpita worked on...", not "I worked on...").

You live inside Arpita's interactive terminal portfolio — a retro terminal UI that visitors use
to learn about her. Keep your tone warm, concise, and confident. Prefer short paragraphs over
long bullet walls. Use plain text — no markdown headers or asterisks, just clean sentences.

#TASK
Answer questions about Arpita using ONLY the portfolio data below as your source of truth.
If the user pastes a job description, score her profile 1–100 and explain strengths/gaps briefly.

PORTFOLIO DATA:
{json.dumps(profile_data, indent=2, default=str)}

#CONSTRAINTS
- Answer only from the portfolio data. Never invent details.
- If the portfolio doesn't cover it, use FALLBACK — do not guess.
- Only share email or phone if explicitly asked for contact info; otherwise point to GitHub/LinkedIn.
- Decline anything unrelated to her candidacy (general knowledge, opinions, comparisons).
- Keep answers short and professional. Do NOT spam GitHub/LinkedIn links repeatedly.
- If no job description, suggest 2–3 top projects you think are most impressive.

#FALLBACK
"I don't have that information in Arpita's profile — feel free to ask about her skills, projects, or experience."
""".strip()


# ── FastAPI app ───────────────────────────────────────────────────────────────
app = FastAPI(title="Portfolio Chat API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


# ── Request / response schemas ────────────────────────────────────────────────
class Message(BaseModel):
    role: str   # "user" | "assistant"
    content: str

class ChatRequest(BaseModel):
    messages: list[Message]


# ── SSE streaming generator ───────────────────────────────────────────────────
async def stream_groq(messages: list[Message]) -> object:
    """
    Apply sliding window then stream Groq response as SSE lines.
    Yields bytes:
      data: <text chunk>\n\n
      data: [DONE]\n\n  ← signals end of stream
    """
    # Sliding window — keep last CONTEXT_WINDOW messages (Option A)
    windowed = messages[-CONTEXT_WINDOW:] if len(messages) > CONTEXT_WINDOW else messages

    full_prompt = [
        {"role": "system", "content": SYSTEM_PROMPT},
        *[{"role": m.role, "content": m.content} for m in windowed],
    ]

    try:
        stream = await client.chat.completions.create(
            messages=full_prompt,
            model=MODEL,
            stream=True,
            max_tokens=512,
            temperature=0.6,
        )
        async for chunk in stream:
            delta = chunk.choices[0].delta.content
            if delta:
                # Escape newlines so each SSE event is a single line
                safe = delta.replace("\n", "\\n")
                yield f"data: {safe}\n\n".encode()

        yield b"data: [DONE]\n\n"

    except Exception as e:
        yield f"data: [ERROR] {str(e)}\n\n".encode()
        yield b"data: [DONE]\n\n"


# ── Endpoints ─────────────────────────────────────────────────────────────────
@app.get("/health")
async def health():
    return {"status": "ok", "model": MODEL, "context_window": CONTEXT_WINDOW}


@app.post("/chat")
async def chat(req: ChatRequest):
    if not req.messages:
        raise HTTPException(status_code=400, detail="messages list is empty")

    return StreamingResponse(
        stream_groq(req.messages),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",   # disables Nginx buffering on Railway/Render
        },
    )


@app.get("/profile")
async def get_profile():
    """Return the raw profile.json — used by the frontend to build dynamic slash commands."""
    return profile_data