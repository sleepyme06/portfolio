// components/Autocomplete.jsx — polished
// Dropdown above input line for slash command completion.

export default function Autocomplete({ matches, selectedIdx, onSelect }) {
  if (!matches || matches.length === 0) return null;

  return (
    <div
      role="listbox"
      aria-label="Command suggestions"
      className="pixel-border"
      style={{
        background: 'var(--color-surface)',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.92em',
        marginBottom: '6px',
        overflow: 'hidden',
      }}
    >
      {matches.map((cmd, i) => {
        const isSelected = i === selectedIdx;
        return (
          <div
            key={cmd.command}
            role="option"
            aria-selected={isSelected}
            className={`autocomplete-item${isSelected ? ' selected' : ''}`}
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '1ch',
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              onSelect(cmd.command);
            }}
          >
            <span
              style={{
                color: 'var(--color-text-cmd)',
                textShadow: isSelected ? '0 0 8px rgba(255,160,27,0.5)' : 'none',
                transition: 'text-shadow 0.1s',
              }}
            >
              {cmd.command}
            </span>
            {cmd.description && (
              <span style={{ color: 'var(--color-text-dim)', fontSize: '0.9em' }}>
                \u2014 {cmd.description}
              </span>
            )}
          </div>
        );
      })}

      {/* Hint line */}
      <div
        style={{
          padding: '2px 14px 4px',
          color: 'var(--color-text-dim)',
          fontSize: '0.78em',
          borderTop: '1px solid var(--color-border)',
          marginTop: '2px',
          opacity: 0.7,
        }}
      >
        \u2191\u2193 navigate \u00b7 Tab to complete \u00b7 Esc to close
      </div>
    </div>
  );
}
