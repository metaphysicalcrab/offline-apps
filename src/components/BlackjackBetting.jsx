import React, { useState } from 'react';
import { CHIP_DENOMINATIONS } from '../constants.js';

const CHIP_COLORS = {
  5: { bg: '#e74c3c', border: '#c0392b', label: 'white' },
  25: { bg: '#27ae60', border: '#1e8449', label: 'white' },
  100: { bg: '#2c3e50', border: '#1a252f', label: 'white' },
  500: { bg: '#8e44ad', border: '#6c3483', label: 'white' },
};

function ChipButton({ value, onTap, disabled, themeStyles }) {
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
  currentBets,
  onPlaceBet,
  onDeal,
  onClearBet,
  lastBet,
  themeStyles,
}) {
  const player = players[0]; // Single player for now
  const currentBet = player.hands[0]?.bet || 0;

  const addChip = (value) => {
    const newBet = currentBet + value;
    if (newBet <= player.chips + currentBet) {
      onPlaceBet(0, newBet);
    }
  };

  const handleQuickBet = () => {
    if (lastBet > 0 && lastBet <= player.chips) {
      onPlaceBet(0, lastBet);
    }
  };

  const handleClear = () => {
    onPlaceBet(0, 0);
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
            disabled={val > (player.chips - (currentBet > 0 ? 0 : 0)) + currentBet - currentBet || player.chips < val}
            themeStyles={themeStyles}
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
        <button
          onClick={onDeal}
          disabled={currentBet === 0}
          style={{
            ...styles.dealBtn,
            ...(currentBet > 0 ? themeStyles?.buttonPrimary : themeStyles?.button),
            opacity: currentBet === 0 ? 0.4 : 1,
            flex: 1,
          }}
        >
          Deal
        </button>
      </div>

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
};
