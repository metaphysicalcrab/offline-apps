import React from 'react';

export default function DeckControls({
  cardsRemaining,
  canUndo,
  onDraw,
  onUndo,
  onShuffle,
  onReset,
  themeStyles,
}) {
  const btnBase = {
    padding: '12px 20px',
    borderRadius: 12,
    border: 'none',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'transform 0.1s, opacity 0.2s',
    ...themeStyles?.button,
  };

  const disabledStyle = { opacity: 0.4, cursor: 'default' };

  return (
    <div style={styles.container}>
      <div style={styles.row}>
        <button
          style={{
            ...btnBase, ...themeStyles?.buttonPrimary, flex: 2,
            ...(cardsRemaining === 0 ? disabledStyle : {}),
          }}
          onClick={onDraw}
          disabled={cardsRemaining === 0}
        >
          Draw ({cardsRemaining})
        </button>
        <button
          style={{ ...btnBase, ...(!canUndo ? disabledStyle : {}) }}
          onClick={onUndo}
          disabled={!canUndo}
        >
          Undo
        </button>
      </div>
      <div style={styles.row}>
        <button style={btnBase} onClick={onShuffle}>
          Shuffle
        </button>
        <button style={btnBase} onClick={onReset}>
          New Deck
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    padding: '0 20px',
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  row: {
    display: 'flex',
    gap: 8,
  },
};
