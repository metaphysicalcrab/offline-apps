import React from 'react';
import { GAME_MODES } from '../constants.js';

const modes = [
  { key: GAME_MODES.FREE_DRAW, label: 'Free Draw', icon: '🎴' },
  { key: GAME_MODES.KINGS_CUP, label: "King's Cup", icon: '👑' },
  { key: GAME_MODES.HIGH_LOW, label: 'High-Low', icon: '📈' },
  { key: GAME_MODES.BLACKJACK, label: 'Blackjack', icon: '🃏' },
];

export default function GameModeSelector({ mode, setMode, hasActiveState, themeStyles }) {
  const handleModeChange = (newMode) => {
    if (newMode === mode) return;
    if (hasActiveState && !confirm('Switch mode? This will reset your current progress.')) return;
    setMode(newMode);
  };

  return (
    <div style={styles.container} role="tablist" aria-label="Game mode">
      {modes.map((m) => (
        <button
          key={m.key}
          onClick={() => handleModeChange(m.key)}
          role="tab"
          aria-selected={mode === m.key}
          style={{
            ...styles.button,
            ...(mode === m.key ? themeStyles?.modeButtonActive : themeStyles?.modeButton),
          }}
        >
          <span style={{ fontSize: 16 }}>{m.icon}</span>
          <span style={{ fontSize: 12 }}>{m.label}</span>
        </button>
      ))}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    gap: 6,
  },
  button: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    padding: '6px 12px',
    borderRadius: 10,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};
