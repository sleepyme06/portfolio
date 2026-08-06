// components/Mascot.jsx — polished
// Tiny inline-SVG pixel cat. Blinks on idle loop. Bounces when response starts.

import { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { MASCOT_BOUNCE_MS } from '../constants/motion';

export default function Mascot({ isTyping }) {
  const controls = useAnimation();
  const [blink, setBlink] = useState(false);
  const [bouncing, setBouncing] = useState(false);

  // Idle blink loop
  useEffect(() => {
    const interval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 130);
    }, 3000 + Math.random() * 1000);
    return () => clearInterval(interval);
  }, []);

  // Bounce when typing starts
  useEffect(() => {
    if (isTyping && !bouncing) {
      setBouncing(true);
      controls
        .start({
          y: [0, -10, 2, -5, 0],
          transition: { duration: MASCOT_BOUNCE_MS / 1000, ease: 'easeOut' },
        })
        .then(() => setBouncing(false));
    }
  }, [isTyping]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.div
      animate={controls}
      title="Pip — Arpita's pixel companion"
      aria-hidden="true"
      className={bouncing ? '' : 'mascot-idle'}
      style={{
        position: 'fixed',
        bottom: '68px',
        right: '18px',
        zIndex: 100,
        cursor: 'default',
        userSelect: 'none',
        lineHeight: 0,
      }}
    >
      {/* 10×11 grid pixel cat — all inline, no assets needed */}
      <svg
        width="44"
        height="48"
        viewBox="0 0 10 11"
        xmlns="http://www.w3.org/2000/svg"
        style={{ imageRendering: 'pixelated', display: 'block' }}
      >
        {/* Ears */}
        <rect x="1" y="0" width="2" height="2" fill="var(--color-plum)" />
        <rect x="7" y="0" width="2" height="2" fill="var(--color-plum)" />
        <rect x="1" y="0" width="1" height="1" fill="var(--color-pink)" />
        <rect x="8" y="0" width="1" height="1" fill="var(--color-pink)" />

        {/* Head */}
        <rect x="1" y="2" width="8" height="5" fill="var(--color-bg)" />
        <rect x="0" y="3" width="1" height="3" fill="var(--color-bg)" />
        <rect x="9" y="3" width="1" height="3" fill="var(--color-bg)" />

        {/* Eyes */}
        {blink ? (
          <>
            <rect x="2" y="4" width="2" height="1" fill="var(--color-rose)" />
            <rect x="6" y="4" width="2" height="1" fill="var(--color-rose)" />
          </>
        ) : (
          <>
            <rect x="2" y="3" width="2" height="2" fill="var(--color-pink)" />
            <rect x="6" y="3" width="2" height="2" fill="var(--color-pink)" />
            {/* Pupils */}
            <rect x="3" y="4" width="1" height="1" fill="var(--color-bg)" />
            <rect x="7" y="4" width="1" height="1" fill="var(--color-bg)" />
            {/* Gleam */}
            <rect x="2" y="3" width="1" height="1" fill="var(--color-yellow)" />
            <rect x="6" y="3" width="1" height="1" fill="var(--color-yellow)" />
          </>
        )}

        {/* Nose */}
        <rect x="4" y="5" width="2" height="1" fill="var(--color-accent)" />
        {/* Whisker dots */}
        <rect x="1" y="6" width="1" height="1" fill="var(--color-plum)" />
        <rect x="8" y="6" width="1" height="1" fill="var(--color-plum)" />

        {/* Body */}
        <rect x="2" y="7" width="6" height="3" fill="var(--color-surface)" />
        <rect x="1" y="8" width="1" height="2" fill="var(--color-surface)" />
        <rect x="8" y="8" width="1" height="2" fill="var(--color-surface)" />

        {/* Belly */}
        <rect x="3" y="8" width="4" height="2" fill="var(--color-border)" />

        {/* Paws */}
        <rect x="1" y="10" width="2" height="1" fill="var(--color-magenta)" />
        <rect x="7" y="10" width="2" height="1" fill="var(--color-magenta)" />
      </svg>
    </motion.div>
  );
}
