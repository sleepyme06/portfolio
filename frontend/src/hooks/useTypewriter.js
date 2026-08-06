// hooks/useTypewriter.js
// Reusable typewriter hook used by boot sequence and all responses.

import { useState, useEffect, useRef } from 'react';
import { TYPEWRITER_SPEED } from '../constants/motion';

/**
 * useTypewriter(text, speedMs?, onComplete?)
 *
 * Returns { displayed, isDone }
 * - displayed: the portion of `text` typed so far
 * - isDone:    true when typing is complete
 *
 * Respects prefers-reduced-motion: if user prefers reduced motion,
 * the entire text is returned immediately.
 */
export function useTypewriter(text, speedMs = TYPEWRITER_SPEED, onComplete = null) {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const [displayed, setDisplayed] = useState(prefersReduced ? text : '');
  const [isDone, setIsDone]       = useState(prefersReduced);
  const indexRef                  = useRef(prefersReduced ? text.length : 0);
  const timerRef                  = useRef(null);

  useEffect(() => {
    if (prefersReduced) {
      setDisplayed(text);
      setIsDone(true);
      onComplete?.();
      return;
    }

    // Reset when text changes
    indexRef.current = 0;
    setDisplayed('');
    setIsDone(false);

    function tick() {
      if (indexRef.current < text.length) {
        indexRef.current += 1;
        setDisplayed(text.slice(0, indexRef.current));
        timerRef.current = setTimeout(tick, speedMs);
      } else {
        setIsDone(true);
        onComplete?.();
      }
    }

    timerRef.current = setTimeout(tick, speedMs);
    return () => clearTimeout(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return { displayed, isDone };
}
