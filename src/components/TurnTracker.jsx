import React, { useState } from 'react';

export default function TurnTracker({
  players,
  currentPlayer,
  addPlayer,
  removePlayer,
  themeStyles,
}) {
  const [newName, setNewName] = useState('');

  const handleAdd = () => {
    if (newName.trim()) {
      addPlayer(newName);
      setNewName('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAdd();
  };

  if (players.length === 0 && !currentPlayer) {
    return null;
  }

  return (
    <div style={styles.container}>
      {currentPlayer && (
        <div style={{ ...styles.currentBadge, ...themeStyles?.playerBadge }}>
          {currentPlayer}'s turn
        </div>
      )}
      <div style={styles.playerList}>
        {players.map((p, i) => (
          <div key={i} style={{
            ...styles.playerChip,
            ...themeStyles?.button,
            ...(p === currentPlayer ? themeStyles?.modeButtonActive : {}),
          }}>
            <span style={{ fontSize: 13 }}>{p}</span>
            <button
              onClick={() => removePlayer(i)}
              style={styles.removeBtn}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PlayerSetup({ players, addPlayer, removePlayer, themeStyles }) {
  const [newName, setNewName] = useState('');

  const handleAdd = () => {
    if (newName.trim()) {
      addPlayer(newName);
      setNewName('');
    }
  };

  return (
    <div style={styles.setup}>
      <div style={{ fontSize: 14, fontWeight: 600, ...themeStyles?.text }}>Players</div>
      <div style={styles.addRow}>
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Add player..."
          style={{ ...themeStyles?.input, flex: 1 }}
        />
        <button
          onClick={handleAdd}
          style={{ ...styles.addBtn, ...themeStyles?.buttonPrimary }}
        >
          +
        </button>
      </div>
      <div style={styles.playerList}>
        {players.map((p, i) => (
          <div key={i} style={{ ...styles.playerChip, ...themeStyles?.button }}>
            <span style={{ fontSize: 13 }}>{p}</span>
            <button onClick={() => removePlayer(i)} style={styles.removeBtn}>×</button>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    padding: '4px 16px',
  },
  currentBadge: {
    padding: '6px 16px',
    borderRadius: 20,
    fontSize: 14,
    fontWeight: 600,
  },
  playerList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
  },
  playerChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 10px',
    borderRadius: 8,
    fontSize: 13,
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    color: 'inherit',
    opacity: 0.5,
    cursor: 'pointer',
    fontSize: 16,
    padding: 0,
    lineHeight: 1,
  },
  setup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  addRow: {
    display: 'flex',
    gap: 8,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    border: 'none',
    fontSize: 20,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};
