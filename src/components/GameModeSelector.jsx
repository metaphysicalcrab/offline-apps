import React from 'react';
import { GAME_MODES } from '../constants.js';

const modes = [
  { key: GAME_MODES.FREE_DRAW, label: 'Free Draw', icon: '🎴' },
  { key: GAME_MODES.KINGS_CUP, label: "King's Cup", icon: '👑' },
  { key: GAME_MODES.HIGH_LOW, label: 'High-Low', icon: '📈' },
];

export default function GameModeSelector({ mode, setMode, themeStyles }) {
  return (
    <div style={styles.container}>
      {modes.map((m) => (
        <button
          key={m.key}
          onClick={() => setMode(m.key)}
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
