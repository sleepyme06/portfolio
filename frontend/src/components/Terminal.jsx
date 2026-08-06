// components/Terminal.jsx — polished version
// Main terminal component — owns all state.

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MessageLog from './MessageLog';
import InputLine from './InputLine';
import Mascot from './Mascot';
import { COMMANDS, PUBLIC_COMMANDS } from '../config/commands';
import { getResponse } from '../config/mockResponses';
import { TYPEWRITER_SPEED, THINKING_DELAY_MS } from '../constants/motion';

// ── Boot lines ────────────────────────────────────────────────────────────────
const BOOT_LINES = [
  { raw: 'portfolio-os v1.0 — booting...', delay: 0 },
  { raw: 'loading resume.exe         [OK]', delay: 340 },
  { raw: 'loading personality.dll    [OK]', delay: 660 },
  { raw: 'loading projects.tar.gz    [OK]', delay: 960 },
  { raw: 'connecting to human...     [OK]', delay: 1240 },
  { raw: '', delay: 1520 },
  { raw: '✦  type /help to see all commands, or just ask me anything  ✦', delay: 1700 },
];

// Build help response from PUBLIC_COMMANDS list
function buildHelpResponse() {
  const lines = [
    'Available commands:\n',
    ...PUBLIC_COMMANDS.map(c => `  ${c.command.padEnd(18)} — ${c.description}`),
    "\nYou can also ask me anything in plain text — I'll do my best.",
    'Easter eggs exist. 🌸',
  ];
  return lines.join('\n');
}

// Unique ID counter
let _id = 0;
const uid = () => `m${++_id}`;

export default function Terminal() {
  // ── State ────────────────────────────────────────────────────────────────
  const [messages,    setMessages]    = useState([]);
  const [input,       setInput]       = useState('');
  const [isThinking,  setIsThinking]  = useState(false);
  const [isTyping,    setIsTyping]    = useState(false);
  const [bootDone,    setBootDone]    = useState(false);
  const [bootSkipped, setBootSkipped] = useState(false);
  const [theme,       setTheme]       = useState('dark');
  const [autoIdx,     setAutoIdx]     = useState(-1);

  // Mounted ref — reset to true on every mount so StrictMode remount works
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // ── Theme ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // ── Boot sequence ─────────────────────────────────────────────────────────
  const skipBoot = useCallback(() => {
    if (bootDone) return;
    const bootMessages = BOOT_LINES
      .filter(l => l.raw !== '')
      .map(l => ({ id: uid(), type: 'boot', text: l.raw }));
    setMessages(bootMessages);
    setBootDone(true);
    setBootSkipped(true);
  }, [bootDone]);

  useEffect(() => {
    if (bootSkipped) return;
    const timers = [];
    BOOT_LINES.forEach((line, i) => {
      const t = setTimeout(() => {
        if (!mountedRef.current) return;
        if (line.raw !== '') {
          setMessages(prev => [...prev, { id: uid(), type: 'boot', text: line.raw }]);
        }
        if (i === BOOT_LINES.length - 1) setBootDone(true);
      }, line.delay);
      timers.push(t);
    });
    return () => timers.forEach(clearTimeout);
  }, [bootSkipped]);

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
    ? COMMANDS.filter(c =>
        c.command.startsWith(input) ||
        (input.startsWith('/sudo') && c.command === '/sudo hire-me')
      )
    : [];

  // ── Typewriter response engine ────────────────────────────────────────────
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
  }, []);

  // ── Submit handler ────────────────────────────────────────────────────────
  const handleSubmit = useCallback((raw) => {
    const text = raw.trim();
    if (!text || isThinking || isTyping || !bootDone) return;

    setMessages(prev => [...prev, { id: uid(), type: 'user', text }]);
    setInput('');
    setAutoIdx(-1);

    if (text === '/help') { runResponse(buildHelpResponse()); return; }

    if (text === '/theme') {
      setTheme(t => t === 'dark' ? 'light' : 'dark');
      runResponse('Theme toggled \u2728  (tip: /theme again to switch back)');
      return;
    }

    if (text === '/resume') {
      window.open('/resume/arpita-verma-resume.pdf', '_blank');
      runResponse('Opening r\u00e9sum\u00e9... \uD83D\uDCC4\nDrop your PDF in /public/resume/ and update the path in commands.js.');
      return;
    }

    const matched = COMMANDS.find(c => c.command === text);
    if (matched) { runResponse(matched.response); return; }

    runResponse(getResponse(text));
  }, [isThinking, isTyping, bootDone, runResponse]);

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
        <Mascot isTyping={isTyping} />
      </div>
    </>
  );
}
