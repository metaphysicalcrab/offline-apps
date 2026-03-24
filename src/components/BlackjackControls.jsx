import React from 'react';
import { BLACKJACK_ACTIONS } from '../constants.js';

const ACTION_CONFIG = {
  [BLACKJACK_ACTIONS.HIT]: { label: 'Hit', icon: '👆', color: '#27ae60' },
  [BLACKJACK_ACTIONS.STAND]: { label: 'Stand', icon: '✋', color: '#3498db' },
  [BLACKJACK_ACTIONS.DOUBLE]: { label: 'Double', icon: '⏫', color: '#f39c12' },
  [BLACKJACK_ACTIONS.SPLIT]: { label: 'Split', icon: '✌️', color: '#9b59b6' },
  [BLACKJACK_ACTIONS.SURRENDER]: { label: 'Surrender', icon: '🏳️', color: '#95a5a6' },
};

export default function BlackjackControls({
  availableActions,
  onAction,
  hint,
  showHint,
  themeStyles,
}) {
  return (
    <div style={styles.container}>
      {showHint && hint && (
        <div style={styles.hintBar}>
          <span style={{ fontSize: 12, color: '#f1c40f' }}>
            Suggested: {ACTION_CONFIG[hint.action]?.label} — {hint.explanation}
          </span>
        </div>
      )}
      <div style={styles.actionsRow}>
        {availableActions.map(action => {
          const cfg = ACTION_CONFIG[action];
          if (!cfg) return null;
          const isHinted = showHint && hint?.action === action;
          return (
            <button
              key={action}
              onClick={() => onAction(action)}
              style={{
                ...styles.btn,
                ...themeStyles?.button,
                ...(isHinted ? styles.hintedBtn : {}),
                flex: action === BLACKJACK_ACTIONS.HIT || action === BLACKJACK_ACTIONS.STAND ? 2 : 1,
              }}
              aria-label={cfg.label}
            >
              <span style={{ fontSize: 18 }}>{cfg.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{cfg.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    padding: '8px 16px 16px',
    width: '100%',
  },
  hintBar: {
    textAlign: 'center',
    padding: '6px 12px',
    background: 'rgba(241,196,0,0.1)',
    borderRadius: 8,
    border: '1px solid rgba(241,196,0,0.2)',
  },
  actionsRow: {
    display: 'flex',
    gap: 8,
    width: '100%',
  },
  btn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    padding: '12px 8px',
    borderRadius: 12,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.15s',
    minHeight: 56,
  },
  hintedBtn: {
    boxShadow: '0 0 0 2px rgba(241,196,0,0.5)',
    background: 'rgba(241,196,0,0.1)',
  },
};
