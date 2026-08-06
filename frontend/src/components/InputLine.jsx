// components/InputLine.jsx — polished
// Sticky bottom input. Always focused. Handles autocomplete keyboard nav.

import { useRef, useEffect } from 'react';
import Autocomplete from './Autocomplete';

export default function InputLine({
  value,
  onChange,
  onSubmit,
  autoMatches,
  autoIdx,
  onAutoSelect,
  onKeyDown,
  disabled,
}) {
  const inputRef = useRef(null);

  // Re-focus whenever we become enabled
  useEffect(() => {
    if (!disabled) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [disabled]);

  function handleKeyDown(e) {
    onKeyDown?.(e);
    if (e.key === 'Enter' && !disabled) {
      e.preventDefault();
      if (autoMatches?.length > 0 && autoIdx >= 0) {
        onAutoSelect(autoMatches[autoIdx].command);
      } else {
        onSubmit(value);
      }
    }
  }

  return (
    <div
      className="input-bar"
      style={{
        flexShrink: 0,
        background: 'var(--color-surface)',
        borderTop: '1px solid var(--color-border)',
        boxShadow: '0 -1px 0 rgba(255,167,191,0.06)',
        padding: '10px 20px 14px',
        fontFamily: 'var(--font-mono)',
      }}
    >
      {/* Autocomplete dropdown */}
      <Autocomplete
        matches={autoMatches}
        selectedIdx={autoIdx}
        onSelect={onAutoSelect}
      />

      {/* Prompt + input */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span
          aria-hidden="true"
          style={{
            flexShrink: 0,
            color: 'var(--color-rose)',
            textShadow: '0 0 8px rgba(236,125,155,0.6)',
            fontSize: '1em',
            letterSpacing: '0.02em',
            userSelect: 'none',
          }}
        >
          arpita@portfolio:~$
        </span>
        <input
          ref={inputRef}
          id="terminal-input"
          type="text"
          aria-label="Terminal input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          placeholder={disabled ? '' : 'ask me anything, or type /help\u2026'}
          style={{
            flex: 1,
            minWidth: 0,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--color-text-user)',
            fontFamily: 'var(--font-mono)',
            fontSize: '1em',
            caretColor: 'var(--color-pink)',
            opacity: disabled ? 0.4 : 1,
            textShadow: disabled ? 'none' : '0 0 6px rgba(255,189,43,0.25)',
          }}
        />
        {/* Idle blinking block cursor after prompt when not typing */}
        {!disabled && !value && (
          <span className="cursor-block" aria-hidden="true" />
        )}
      </div>
    </div>
  );
}
