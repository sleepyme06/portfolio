# Living Terminal Portfolio — Frontend Build Brief

## Scope
**Frontend only.** No backend, no API calls, no deployment. Chat responses are hardcoded/mocked for now. Backend + LLM integration handled separately, later.

## Concept summary
The entire site is **one full-viewport terminal window** — there is no laptop graphic, no desktop-with-icons, no draggable window manager. On load, a short boot sequence plays, then a prompt appears. Visitors either type free-text questions or use `/slash` commands to navigate the portfolio (about, projects, skills, resume, contact). Responses type out with a typewriter effect. The personality lives in the *presentation* (boot sequence, cursor, easter-egg commands, subtle animated mascot) — the actual content stays clean and professional.

**Why this shape:** zero external image assets (avoids the fragile-image-generation problem), no multi-window drag/z-index state (avoids the fragile-animation problem), single component tree, easy to make responsive since there's only ever one "window."

Stack: **React (Vite) + Tailwind + Framer Motion** (Framer Motion only for small transitions — cursor blink, typewriter, mascot reactions — not for a big choreographed scale animation).

---

## Visual identity

**Color palette** (reuse from prior brief, still valid):
| Role | Hex |
|---|---|
| Background base (light) | `#f2eef1` |
| Primary pink | `#ffa7bf` |
| Secondary rose | `#ec7d9b` |
| Accent red-pink | `#e64667` |
| Deep magenta | `#a02552` |
| Deep plum (dark bg) | `#75024d` |
| Near-black purple (darkest bg / text) | `#2c0f30` |
| Orange accent | `#e18434` |
| Amber accent | `#ffa01b` |
| Amber-yellow highlight | `#ffbd2b` |

Default state: dark terminal (`#2c0f30` background, light text). Optional `/theme` command can flip to a light variant using `#f2eef1` as background — nice-to-have, not required for v1.

**Typography:**
- Pixel/mono font for all terminal text — pick **VT323** (best readability at small sizes for a text-heavy terminal; avoid Press Start 2P here since it's a body-text-heavy interface, not just labels).
- **Caveat** or **Patrick Hand** (handwritten) used sparingly — e.g. a signed one-line welcome note that appears once after boot, or the `/whoami` easter egg. Not used for terminal body text.

**Aesthetic:** retro terminal, but warm/pink-toned rather than green-on-black hacker cliché — this is what keeps it "fun" rather than "generic dev terminal." Chunky pixel cursor block, subtle scanline/CRT flicker is fine here (unlike the old brief) since there's no image to clash with it — keep it very subtle (low opacity, slow).

---

## Screen-by-screen flow

### 1. Landing — Boot Sequence
- Full viewport, dark background, terminal text starts typing immediately (no click required to start, but make it **skippable** — click/keypress jumps straight to prompt).
- 3–5 lines, e.g.:
  ```
  booting portfolio-os v1.0...
  loading resume.exe [OK]
  loading personality.dll [OK]
  connecting to human...
  ```
- Ends with prompt: `> ask me anything, or type /help`
- Blinking pixel-block cursor after the prompt at all times.

### 2. Main Terminal Interface
- Scrollable message log (grows downward like a real terminal/chat), input line pinned at bottom, always focused.
- User input and system responses are visually distinct (color, not bubbles — reads more terminal-native) — e.g. user line prefixed `> `, response lines in a contrasting accent color.
- Responses type out with the typewriter effect (reuse `useTypewriter(text, speedMs)` hook idea from before).
- Simple "thinking..." indicator (three pixel-dots or `...` animating) before a response starts typing.

### 3. Slash Commands
- Typing `/` triggers an autocomplete dropdown above the input, pixel-bordered, listing matching commands.
- Core commands: `/about`, `/projects`, `/skills`, `/resume`, `/contact`, `/help`.
- Fun/easter-egg commands (optional, low effort, high delight): `/whoami`, `/coffee`, `/theme`, `/sudo hire-me`.
- Commands and free-text both route through the same mocked response system for now (see tech notes).

### 4. Optional mascot
- A small (32–48px) pixel-sprite in a corner of the screen that idles (blink loop) and reacts (e.g. bounces) when a new response starts typing. Pure CSS-sprite or a tiny inline SVG — not an imported photo/graphic, to avoid the earlier asset problem. Treat as a stretch goal, not blocking.

---

## Explicitly avoid
- No laptop/monitor image assets — the viewport itself is the terminal.
- No draggable multi-window system.
- No heavy scale/power-on choreography — boot sequence text is the only "intro," and it must be skippable and respect `prefers-reduced-motion`.
- Keep scanline/flicker effects very subtle if used at all — this should read as warm/playful, not hacker-green-CRT.

---

## Tech notes for the agent
- Single top-level `Terminal.jsx` owns state: message log array, current input, autocomplete matches, typing/thinking status. No reducer needed yet — plain `useState` is enough at this scope.
- `commands.js` — config list of `{ command, description, response }` so `/help` and autocomplete can be generated from one source of truth.
- `mockResponses.js` — canned responses for free-text input (simple keyword matching is fine for now; real LLM swap-in comes later).
- `useTypewriter(text, speedMs)` — one reusable hook for all typed-out text (boot lines + responses).
- Autoscroll the message log to bottom on new content.
- Respect `prefers-reduced-motion`: skip typewriter/flicker, show text instantly.
- Keep animation timing constants in one `motion.js` file (cursor blink rate, typewriter speed, thinking-dot cadence).
- Mobile: this layout is inherently responsive (single column, no windows) — just cap font-size scaling and make sure the input stays reachable above the mobile keyboard (`position: sticky` bottom bar).

## Suggested folder mapping (fits your current structure)
```
src/
  components/
    Terminal.jsx          # main component, owns state
    MessageLog.jsx
    InputLine.jsx
    Autocomplete.jsx
    ThinkingIndicator.jsx
    Mascot.jsx             # optional, stretch goal
  config/
    commands.js
    mockResponses.js
  constants/
    motion.js               # animation timing constants
  hooks/
    useTypewriter.js
  styles/
    global.css              # palette tokens, font-face imports (VT323, Caveat)
```

## Build order
1. Static layout: boot lines (static, no typewriter yet) → prompt → static message log with a couple of hardcoded exchanges. No interactivity yet. Verify `npm run dev` renders correctly.
2. Wire real input: typing works, Enter submits, message log updates, autoscroll works.
3. Typewriter + thinking indicator: responses type out, "thinking" shows briefly first.
4. Slash commands: `/` triggers autocomplete, selecting/typing a full command returns its mocked response.
5. Polish: boot sequence skip, `prefers-reduced-motion` fallback, cursor blink, palette pass, optional mascot/theme easter eggs, mobile input handling.