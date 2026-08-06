// components/ThinkingIndicator.jsx — polished

export default function ThinkingIndicator() {
  return (
    <div
      aria-label="Thinking"
      aria-live="polite"
      style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: '1px',
        color: 'var(--color-rose)',
        fontFamily: 'var(--font-mono)',
        marginTop: '4px',
        marginLeft: '14px',
        textShadow: '0 0 8px rgba(236,125,155,0.5)',
        fontSize: '0.95em',
      }}
    >
      <span>thinking</span>
      <span className="thinking-dot">.</span>
      <span className="thinking-dot">.</span>
      <span className="thinking-dot">.</span>
    </div>
  );
}
