// components/MessageLog.jsx — polished
// Scrollable terminal message log with per-type styling.

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ThinkingIndicator from './ThinkingIndicator';

function MessageLine({ msg }) {
  // ── Boot lines: dim / muted ──
  if (msg.type === 'boot') {
    const isHighlight = msg.text.startsWith('✦');
    return (
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          color: isHighlight ? 'var(--color-rose)' : 'var(--color-text-dim)',
          letterSpacing: isHighlight ? '0.04em' : '0.02em',
          textShadow: isHighlight ? '0 0 8px rgba(236,125,155,0.5)' : 'none',
          marginTop: isHighlight ? '4px' : 0,
        }}
      >
        {msg.text}
      </div>
    );
  }

  // ── Thinking indicator ──
  if (msg.type === 'thinking') return <ThinkingIndicator />;

  // ── User input line ──
  if (msg.type === 'user') {
    return (
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          color: 'var(--color-text-user)',
          marginTop: '10px',
          textShadow: '0 0 6px rgba(255,189,43,0.3)',
        }}
      >
        <span
          style={{
            color: 'var(--color-rose)',
            marginRight: '6px',
            textShadow: '0 0 6px rgba(236,125,155,0.5)',
          }}
        >
          &gt;
        </span>
        {msg.text}
      </div>
    );
  }

  // ── System / response ──
  return (
    <div
      style={{
        fontFamily: 'var(--font-mono)',
        color: 'var(--color-text-primary)',
        whiteSpace: 'pre-wrap',
        borderLeft: '2px solid var(--color-border)',
        paddingLeft: '12px',
        marginTop: '3px',
        marginBottom: '8px',
        textShadow: '0 0 6px rgba(255,167,191,0.2)',
        lineHeight: 1.6,
      }}
    >
      {msg.text}
      {msg.isTyping && <span className="cursor-block" />}
    </div>
  );
}

export default function MessageLog({ messages }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div
      id="message-log"
      role="log"
      aria-live="polite"
      aria-label="Terminal output"
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '18px 24px 6px',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
      }}
    >
      <AnimatePresence initial={false}>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
          >
            <MessageLine msg={msg} />
          </motion.div>
        ))}
      </AnimatePresence>
      <div ref={bottomRef} />
    </div>
  );
}
