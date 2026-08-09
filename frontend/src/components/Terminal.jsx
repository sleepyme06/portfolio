// components/Terminal.jsx — polished version
// Main terminal component — owns all state.

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageLog from './MessageLog';
import InputLine from './InputLine';
import Mascot from './Mascot';
import ContactModal from './ContactModal';
import { buildCommands, fetchProfile, STATIC_COMMANDS, BOSS_FIGHT_MOVES, EXIT_SEQUENCE } from '../config/commands';
import { TYPEWRITER_SPEED, THINKING_DELAY_MS } from '../constants/motion';
import { streamChat } from '../api/chat';

// ── Boot lines ────────────────────────────────────────────────────────────────
const bootSequence = [
  { raw: 'initializing...', delay: 0 },
  { raw: 'checking questionable life choices... [OK]', delay: 300 },
  { raw: 'loading things-that-should-not-work... [OK]', delay: 600 },
  { raw: 'compiling random ideas... [OK]', delay: 900 },
  { raw: 'finding something worth building... [FOUND]', delay: 1200 },
  { raw: '', delay: 1450 },
  { raw: '✦  welcome. type /help or just talk to me  ✦', delay: 1650 },
];

// Build help response from a commands list
function buildHelpResponse(cmds) {
  const visible = cmds.filter(c => c.description !== null);
  const lines = [
    'Available commands:\n',
    ...visible.map(c => `  ${c.command.padEnd(18)} — ${c.description}`),
    "\nYou can also ask me anything in plain text — I'll do my best.",
    'Easter eggs exist. 🌸',
  ];
  return lines.join('\n');
}

// Unique ID helper
const uid = () => `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

export default function Terminal() {
  // ── State ────────────────────────────────────────────────────────────────
  const [messages,    setMessages]    = useState([]);
  const clearHistory = useCallback(() => setMessages([]), []);
  const [commands,    setCommands]    = useState(STATIC_COMMANDS); // live-updated from /profile
  const [input,       setInput]       = useState('');
  const [isThinking,  setIsThinking]  = useState(false);
  const [isTyping,    setIsTyping]    = useState(false);
  const [bootDone,    setBootDone]    = useState(false);
  const [bootSkipped, setBootSkipped] = useState(false);
  const [theme,       setTheme]       = useState('dark');
  const [autoIdx,     setAutoIdx]     = useState(-1);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [awaitingBossFightChoice, setAwaitingBossFightChoice] = useState(false);
  const [exitAttempts, setExitAttempts] = useState(0);

  // Mounted ref — reset to true on every mount so StrictMode remount works
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // ── Fetch live profile from backend → rebuild commands ──────────────────
  useEffect(() => {
    fetchProfile()
      .then(profile => setCommands(buildCommands(profile)))
      .catch(() => {
        // Backend offline — STATIC_COMMANDS already set as default, nothing to do
        console.info('Profile fetch failed — using static fallback commands.');
      });
  }, []);

  // ── Theme ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // ── Boot sequence ─────────────────────────────────────────────────────────
  const skipBoot = useCallback(() => {
    if (bootDone || bootSkipped) return;
    setBootSkipped(true);
    setBootDone(true);
    // Show all boot lines instantly when skipped
    setMessages(
      bootSequence.map(b => ({
        id: uid(),
        type: 'boot',
        text: b.raw,
      }))
    );
  }, [bootDone, bootSkipped]);

  useEffect(() => {
    if (bootSkipped) return;

    const timers = bootSequence.map(line =>
      setTimeout(() => {
        if (!mountedRef.current) return;
        setMessages(prev => [...prev, { id: uid(), type: 'boot', text: line.raw }]);
      }, line.delay)
    );

    const doneTimer = setTimeout(() => {
      if (!mountedRef.current) return;
      setBootDone(true);
    }, bootSequence[bootSequence.length - 1].delay + 200);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(doneTimer);
    };
  }, [bootSkipped]); // eslint-disable-line react-hooks/exhaustive-deps

  // Skip boot on any keypress or click
  useEffect(() => {
    if (bootDone) return;
    const handler = () => skipBoot();
    window.addEventListener('keydown', handler, { once: true });
    window.addEventListener('click',   handler, { once: true });
    return () => {
      window.removeEventListener('keydown', handler);
      window.removeEventListener('click',   handler);
    };
  }, [bootDone, skipBoot]);

  // ── Autocomplete matches ──────────────────────────────────────────────────
  const autoMatches = input.startsWith('/')
    ? commands.filter(c =>
        c.command.startsWith(input) ||
        (input.startsWith('/sudo') && c.command === '/sudo hire-me')
      )
    : [];

  // ── Typewriter response engine (Static / Slash commands) ─────────────────
  const runResponse = useCallback((text) => {
    setIsThinking(true);
    const thinkId = uid();
    setMessages(prev => [...prev, { id: thinkId, type: 'thinking', text: '' }]);

    setTimeout(() => {
      if (!mountedRef.current) return;
      setMessages(prev => prev.filter(m => m.id !== thinkId));
      setIsThinking(false);

      const respId = uid();
      setMessages(prev => [...prev, { id: respId, type: 'system', text: '', isTyping: true }]);
      setIsTyping(true);

      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) {
        setMessages(prev => prev.map(m =>
          m.id === respId ? { ...m, text, isTyping: false } : m
        ));
        setIsTyping(false);
        return;
      }

      let index = 0;
      function tick() {
        if (!mountedRef.current) return;
        if (index < text.length) {
          index++;
          setMessages(prev => prev.map(m =>
            m.id === respId ? { ...m, text: text.slice(0, index) } : m
          ));
          setTimeout(tick, TYPEWRITER_SPEED);
        } else {
          setMessages(prev => prev.map(m =>
            m.id === respId ? { ...m, isTyping: false } : m
          ));
          setIsTyping(false);
        }
      }
      setTimeout(tick, TYPEWRITER_SPEED);
    }, THINKING_DELAY_MS);
  }, [setMessages]);

  // ── Streaming LLM Response Engine (Free-text input) ──────────────────────
  const runStreamResponse = useCallback(async (currentHistory) => {
    setIsThinking(true);
    const thinkId = uid();
    setMessages(prev => [...prev, { id: thinkId, type: 'thinking', text: '' }]);

    const respId = uid();
    let accumulatedText = '';

    await streamChat(
      currentHistory,
      // onChunk: stream received text
      (chunk) => {
        if (!mountedRef.current) return;
        setIsThinking(false);
        setIsTyping(true);
        accumulatedText += chunk;

        setMessages(prev => {
          const filtered = prev.filter(m => m.id !== thinkId);
          const exists = filtered.some(m => m.id === respId);
          if (exists) {
            return filtered.map(m =>
              m.id === respId ? { ...m, text: accumulatedText, isTyping: true } : m
            );
          } else {
            return [...filtered, { id: respId, type: 'system', text: accumulatedText, isTyping: true }];
          }
        });
      },
      // onError: show clean connection error if backend is offline
      (err) => {
        console.warn('Backend unavailable:', err);
        setMessages(prev => prev.filter(m => m.id !== thinkId));
        setIsThinking(false);
        runResponse(
          '⚠️ Connection Error: LLM backend is offline.\n' +
          'Please ensure the backend server is running on http://localhost:8000 (local) or check your deployment.'
        );
      }
    );

    if (mountedRef.current) {
      setMessages(prev => prev.map(m =>
        m.id === respId ? { ...m, isTyping: false } : m
      ));
      setIsTyping(false);
    }
  }, [setMessages, runResponse]);

  // ── Submit handler ────────────────────────────────────────────────────────
  const handleSubmit = useCallback((raw) => {
    const text = raw.trim();
    if (!text || isThinking || isTyping || !bootDone) return;

    const userMsg = { id: uid(), type: 'user', text };
    const nextMessages = [...messages, userMsg];

    setMessages(nextMessages);
    setInput('');
    setAutoIdx(-1);

    // If mid boss-fight, treat this input as a move choice, not a normal command
    if (awaitingBossFightChoice) {
      const move = BOSS_FIGHT_MOVES[text];
      if (move) {
        setAwaitingBossFightChoice(false);
        runResponse(move.text);
        // auto-chain into the real command's response after a beat
        if (move.followUp) {
          const followCmd = commands.find(c => c.command === `/${move.followUp}`);
          if (followCmd) {
            setTimeout(() => {
              if (mountedRef.current) runResponse(followCmd.response);
            }, THINKING_DELAY_MS + move.text.length * TYPEWRITER_SPEED + 500);
          }
        }
      } else {
        runResponse('Invalid move. Choose [1] [2] [3] or [4].');
      }
      return;
    }

    if (text === '/help') { runResponse(buildHelpResponse(commands)); return; }

    if (text === '/clear') {
      clearHistory();
      setExitAttempts(0);
      return;
    }

    if (text === '/theme') {
      setTheme(t => t === 'dark' ? 'light' : 'dark');
      runResponse('Theme toggled ✨  (tip: /theme again to switch back)');
      return;
    }

    if (text === '/resume') {
      window.open('/resume/arpita-verma-resume.pdf', '_blank');
      runResponse('Opening résumé... 📄');
      return;
    }

    if (text === '/exit') {
      const index = Math.min(exitAttempts, EXIT_SEQUENCE.length - 1);
      runResponse(EXIT_SEQUENCE[index]);
      setExitAttempts(prev => prev + 1);
      return;
    }

    const matched = commands.find(c => c.command === text);
    if (matched) {
      runResponse(matched.response);
      if (matched.action === 'boss-fight') {
        setAwaitingBossFightChoice(true);
      }
      return;
    }

    // Free text → route to FastAPI streaming LLM backend
    runStreamResponse(nextMessages);
  }, [isThinking, isTyping, bootDone, commands, messages, setMessages, clearHistory, runResponse, runStreamResponse, awaitingBossFightChoice, exitAttempts]);

  // ── Autocomplete keyboard nav ─────────────────────────────────────────────
  const handleKeyDown = useCallback((e) => {
    if (!autoMatches.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setAutoIdx(i => Math.min(i + 1, autoMatches.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setAutoIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Escape') {
      setAutoIdx(-1);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const pick = autoMatches[autoIdx >= 0 ? autoIdx : 0];
      if (pick) { setInput(pick.command); setAutoIdx(-1); }
    }
  }, [autoMatches, autoIdx]);

  const handleAutoSelect = (cmd) => {
    setInput(cmd);
    setAutoIdx(-1);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* CRT scanlines overlay */}
      <div className="scanlines" aria-hidden="true" />

      {/* Ambient glow blobs */}
      <div
        className="ambient-blob"
        style={{
          width: 500, height: 500,
          top: '-120px', left: '-80px',
          background: 'var(--blob-a)',
        }}
        aria-hidden="true"
      />
      <div
        className="ambient-blob"
        style={{
          width: 380, height: 380,
          bottom: '-60px', right: '-60px',
          background: 'var(--blob-b)',
        }}
        aria-hidden="true"
      />

      {/* Main terminal container */}
      <div
        id="terminal-root"
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: 'var(--font-mono)',
        }}
      >
        {/* ── Header bar ── */}
        <div
          id="terminal-header"
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 18px',
            background: 'var(--color-surface)',
            borderBottom: '1px solid var(--color-border)',
            boxShadow: '0 1px 0 rgba(255,167,191,0.06)',
          }}
        >
          {/* Traffic lights */}
          <span style={{ width: 11, height: 11, borderRadius: '50%', background: 'var(--color-accent)',  display: 'inline-block', boxShadow: '0 0 5px var(--color-accent)' }} />
          <span style={{ width: 11, height: 11, borderRadius: '50%', background: 'var(--color-amber)',   display: 'inline-block', boxShadow: '0 0 5px var(--color-amber)' }} />
          <span style={{ width: 11, height: 11, borderRadius: '50%', background: 'var(--color-magenta)', display: 'inline-block', boxShadow: '0 0 5px var(--color-magenta)' }} />

          <span
            style={{
              marginLeft: '14px',
              color: 'var(--color-text-dim)',
              fontSize: '0.82em',
              letterSpacing: '0.06em',
              fontFamily: 'var(--font-mono)',
            }}
          >
            arpita@portfolio — bash 
          </span>

          {/* Handwritten welcome note — fades in after boot */}
          <AnimatePresence>
            {bootDone && (
              <motion.span
                key="welcome"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
                style={{
                  marginLeft: 'auto',
                  fontFamily: 'var(--font-hand)',
                  fontSize: '1.1em',
                  color: 'var(--color-rose)',
                  fontStyle: 'italic',
                  textShadow: '0 0 10px rgba(236,125,155,0.4)',
                }}
              >
                made by Arpita 🎀✨
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* ── Message log ── */}
        <MessageLog messages={messages} />

        {/* ── Input bar ── */}
        <InputLine
          value={input}
          onChange={(v) => { setInput(v); setAutoIdx(-1); }}
          onSubmit={handleSubmit}
          autoMatches={autoMatches}
          autoIdx={autoIdx}
          onAutoSelect={handleAutoSelect}
          onKeyDown={handleKeyDown}
          disabled={!bootDone || isThinking || isTyping}
        />

        {/* ── Pixel mascot ── */}
        <Mascot
          isTyping={isTyping}
          hasSuggestions={autoMatches.length > 0}
          onClick={() => setIsContactModalOpen(true)}
        />

        {/* ── Contact modal pop-up ── */}
        <ContactModal
          isOpen={isContactModalOpen}
          onClose={() => setIsContactModalOpen(false)}
        />
      </div>
    </>
  );
}