import React from 'react';
import { PlayerSetup } from './TurnTracker.jsx';

export default function SettingsPanel({
  muted, setMuted,
  hapticsEnabled, setHapticsEnabled,
  shakeEnabled, setShakeEnabled,
  requestShakePermission,
  theme, toggleTheme,
  players, addPlayer, removePlayer,
  onResetAll,
  onEditRules,
  onClose,
  themeStyles,
}) {
  return (
    <div style={{ ...styles.overlay, ...themeStyles?.overlay }} onClick={onClose}>
      <div
        style={{ ...styles.modal, ...themeStyles?.modal }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={styles.header}>
          <span style={{ ...themeStyles?.text, fontSize: 18, fontWeight: 'bold' }}>Settings</span>
          <button onClick={onClose} style={styles.closeBtn}>×</button>
        </div>

        <div style={styles.content}>
          <ToggleRow label="Sound" value={!muted} onToggle={() => setMuted(!muted)} themeStyles={themeStyles} />
          <ToggleRow label="Haptic Feedback" value={hapticsEnabled} onToggle={() => setHapticsEnabled(!hapticsEnabled)} themeStyles={themeStyles} />
          <ToggleRow label="Shake to Shuffle" value={shakeEnabled} onToggle={() => {
            const newVal = !shakeEnabled;
            setShakeEnabled(newVal);
            if (newVal && requestShakePermission) requestShakePermission();
          }} themeStyles={themeStyles} />
          <ToggleRow label={`Theme: ${theme === 'dark' ? 'Dark' : 'Light'}`} value={theme === 'dark'} onToggle={toggleTheme} themeStyles={themeStyles} />

          <div style={styles.divider} />

          <PlayerSetup
            players={players}
            addPlayer={addPlayer}
            removePlayer={removePlayer}
            themeStyles={themeStyles}
          />

          <div style={styles.divider} />

          <button
            onClick={onEditRules}
            style={{ ...styles.fullBtn, ...themeStyles?.button }}
          >
            Edit King's Cup Rules
          </button>

          <button
            onClick={() => {
              if (confirm('Reset all data? This clears players, rules, and history.')) {
                onResetAll();
              }
            }}
            style={{ ...styles.fullBtn, ...themeStyles?.buttonDanger }}
          >
            Reset All Data
          </button>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({ label, value, onToggle, themeStyles }) {
  return (
    <div style={styles.toggleRow}>
      <span style={{ ...themeStyles?.text, fontSize: 14 }}>{label}</span>
      <button
        onClick={onToggle}
        style={{
          ...styles.toggle,
          background: value ? '#148f4b' : 'rgba(128,128,128,0.3)',
        }}
      >
        <div style={{
          ...styles.toggleKnob,
          transform: value ? 'translateX(18px)' : 'translateX(0)',
        }} />
      </button>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    animation: 'fadeIn 0.2s',
    padding: 16,
  },
  modal: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '85vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: 24,
    cursor: 'pointer',
    opacity: 0.5,
    color: 'inherit',
  },
  content: {
    padding: '0 20px 20px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  toggleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggle: {
    width: 44,
    height: 26,
    borderRadius: 13,
    border: 'none',
    padding: 4,
    cursor: 'pointer',
    position: 'relative',
    transition: 'background 0.2s',
  },
  toggleKnob: {
    width: 18,
    height: 18,
    borderRadius: 9,
    background: '#fff',
    transition: 'transform 0.2s',
  },
  divider: {
    height: 1,
    background: 'rgba(128,128,128,0.15)',
    margin: '4px 0',
  },
  fullBtn: {
    padding: '12px 16px',
    borderRadius: 12,
    border: 'none',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    width: '100%',
    textAlign: 'center',
  },
};
