import React from 'react';
import { CHIP_DENOMINATIONS } from '../constants.js';

const CHIP_COLORS = {
  5: { bg: '#e74c3c', border: '#c0392b', label: 'white' },
  25: { bg: '#27ae60', border: '#1e8449', label: 'white' },
  100: { bg: '#2c3e50', border: '#1a252f', label: 'white' },
  500: { bg: '#8e44ad', border: '#6c3483', label: 'white' },
};

function ChipButton({ value, onTap, disabled }) {
  const colors = CHIP_COLORS[value];
  return (
    <button
      onClick={() => onTap(value)}
      disabled={disabled}
      style={{
        ...styles.chip,
        background: disabled ? 'rgba(128,128,128,0.3)' : colors.bg,
        borderColor: disabled ? 'rgba(128,128,128,0.3)' : colors.border,
        opacity: disabled ? 0.4 : 1,
      }}
      aria-label={`Bet $${value}`}
    >
      <span style={styles.chipValue}>${value}</span>
    </button>
  );
}

export default function BlackjackBetting({
  players,
  onPlaceBet,
  onDeal,
  lastBet,
  localPlayerIndex = 0,
  isHost = true,
  themeStyles,
}) {
  const player = players[localPlayerIndex] || players[0];
  const currentBet = player?.hands[0]?.bet || 0;
  const allBetsPlaced = players.every(p => p.hands[0]?.bet > 0);

  const addChip = (value) => {
    const newBet = currentBet + value;
    if (newBet <= player.chips + currentBet) {
      onPlaceBet(localPlayerIndex, newBet);
    }
  };

  const handleQuickBet = () => {
    if (lastBet > 0 && lastBet <= player.chips) {
      onPlaceBet(localPlayerIndex, lastBet);
    }
  };

  const handleClear = () => {
    onPlaceBet(localPlayerIndex, 0);
  };

  return (
    <div style={styles.container}>
      <div style={{ ...themeStyles?.text, fontSize: 13, textAlign: 'center', opacity: 0.6 }}>
        PLACE YOUR BET
      </div>

      <div style={styles.betDisplay}>
        <span style={{ ...themeStyles?.textAccent, fontSize: 32, fontWeight: 700 }}>
          ${currentBet}
        </span>
      </div>

      <div style={styles.chipsRow}>
        {CHIP_DENOMINATIONS.map(val => (
          <ChipButton
            key={val}
            value={val}
            onTap={addChip}
            disabled={player.chips < val}
          />
        ))}
      </div>

      <div style={styles.actionsRow}>
        {currentBet > 0 && (
          <button
            onClick={handleClear}
            style={{ ...styles.actionBtn, ...themeStyles?.button }}
          >
            Clear
          </button>
        )}
        {lastBet > 0 && currentBet === 0 && lastBet <= player.chips && (
          <button
            onClick={handleQuickBet}
            style={{ ...styles.actionBtn, ...themeStyles?.button }}
          >
            Rebet ${lastBet}
          </button>
        )}
        {isHost ? (
          <button
            onClick={onDeal}
            disabled={!allBetsPlaced}
            style={{
              ...styles.dealBtn,
              ...(allBetsPlaced ? themeStyles?.buttonPrimary : themeStyles?.button),
              opacity: allBetsPlaced ? 1 : 0.4,
              flex: 1,
            }}
          >
            {allBetsPlaced ? 'Deal' : 'Waiting for bets...'}
          </button>
        ) : (
          <div style={{
            ...themeStyles?.textMuted,
            fontSize: 13,
            textAlign: 'center',
            flex: 1,
            padding: '14px 0',
          }}>
            {currentBet > 0 ? 'Waiting for host to deal...' : 'Place your bet'}
          </div>
        )}
      </div>

      {/* Player bet status (multiplayer) */}
      {players.length > 1 && (
        <div style={styles.betStatusRow}>
          {players.map((p, i) => (
            <div key={i} style={{
              ...styles.betStatusBadge,
              background: p.hands[0]?.bet > 0 ? 'rgba(39,174,96,0.1)' : 'rgba(255,255,255,0.05)',
              border: p.hands[0]?.bet > 0
                ? '1px solid rgba(39,174,96,0.3)'
                : '1px solid rgba(255,255,255,0.1)',
            }}>
              <span style={{ ...themeStyles?.text, fontSize: 11 }}>{p.name}</span>
              <span style={{
                fontSize: 11,
                fontWeight: 600,
                color: p.hands[0]?.bet > 0 ? '#27ae60' : '#95a5a6',
              }}>
                {p.hands[0]?.bet > 0 ? `$${p.hands[0].bet}` : '...'}
              </span>
            </div>
          ))}
        </div>
      )}

      <div style={{ ...themeStyles?.textMuted, fontSize: 12, textAlign: 'center' }}>
        Balance: ${player.chips}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    padding: '16px 20px',
    width: '100%',
  },
  betDisplay: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px 0',
  },
  chipsRow: {
    display: 'flex',
    gap: 10,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  chip: {
    width: 60,
    height: 60,
    borderRadius: '50%',
    border: '3px solid',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'transform 0.15s, opacity 0.15s',
    boxShadow: '0 3px 10px rgba(0,0,0,0.3)',
  },
  chipValue: {
    color: 'white',
    fontWeight: 700,
    fontSize: 13,
  },
  actionsRow: {
    display: 'flex',
    gap: 8,
    width: '100%',
    maxWidth: 320,
  },
  actionBtn: {
    padding: '12px 20px',
    borderRadius: 12,
    border: 'none',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
  },
  dealBtn: {
    padding: '14px 20px',
    borderRadius: 12,
    border: 'none',
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  betStatusRow: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  betStatusBadge: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    padding: '4px 10px',
    borderRadius: 8,
    minWidth: 60,
  },
};
