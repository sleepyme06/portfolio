// components/Mascot.jsx
// Displays Arpita's exact pixel-art avatar image in the bottom-right corner.
// Hides automatically when input suggestions are open.
// Opens ContactModal pop-up window when clicked.

import { useState, useEffect } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { MASCOT_BOUNCE_MS } from '../constants/motion';

export default function Mascot({ isTyping, hasSuggestions, onClick }) {
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
    <AnimatePresence>
      {!hasSuggestions && (
        <motion.div
          key="mascot-avatar"
          animate={controls}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClick}
          title="Click to connect & download résumé"
          aria-label="Click to open profile window"
          className={bouncing ? '' : 'mascot-idle'}
          style={{
            position: 'fixed',
            bottom: '68px',
            right: '20px',
            zIndex: 100,
            cursor: 'pointer',
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
      )}
    </AnimatePresence>
  );
}