// components/Mascot.jsx
// Displays Arpita's exact pixel-art avatar image in the bottom-right corner.
// Gentle idle floating animation, bounces when a response is being typed out.

import { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { MASCOT_BOUNCE_MS } from '../constants/motion';

export default function Mascot({ isTyping }) {
  const controls = useAnimation();
  const [bouncing, setBouncing] = useState(false);

  // Bounce animation when a new response starts typing
  useEffect(() => {
    if (isTyping && !bouncing) {
      setBouncing(true);
      controls
        .start({
          y: [0, -14, 3, -6, 0],
          transition: { duration: MASCOT_BOUNCE_MS / 1000, ease: 'easeOut' },
        })
        .then(() => setBouncing(false));
    }
  }, [isTyping]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.div
      animate={controls}
      title="Arpita — Pixel Avatar"
      aria-hidden="true"
      className={bouncing ? '' : 'mascot-idle'}
      style={{
        position: 'fixed',
        bottom: '68px',
        right: '20px',
        zIndex: 100,
        cursor: 'default',
        userSelect: 'none',
        lineHeight: 0,
      }}
    >
      {/* Exact Pixel Avatar Image */}
      <img
        src="/avatar.png"
        alt="Arpita Verma — Pixel Art Avatar"
        style={{
          height: '145px',
          width: 'auto',
          imageRendering: 'pixelated',
          display: 'block',
          filter: 'drop-shadow(0 0 10px var(--glow-rose))',
        }}
      />
    </motion.div>
  );
}