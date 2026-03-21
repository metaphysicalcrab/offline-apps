import React, { useEffect } from 'react';
import { PlayerSetup } from './TurnTracker.jsx';
import { CardBackPreview } from './Card.jsx';
import { CARD_BACK_COLORS, CARD_BACK_STYLES, FONT_OPTIONS } from '../hooks/useAppearance.js';

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
  appearance,
}) {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div style={{ ...styles.overlay, ...themeStyles?.overlay }} onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
        style={{ ...styles.modal, ...themeStyles?.modal }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={styles.header}>
          <span style={{ ...themeStyles?.text, fontSize: 18, fontWeight: 'bold' }}>Settings</span>
          <button onClick={onClose} style={styles.closeBtn} aria-label="Close settings">×</button>
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

          {appearance && (
            <>
              <div style={{ fontSize: 14, fontWeight: 600, ...themeStyles?.text }}>Appearance</div>

              <div>
                <div style={{ ...themeStyles?.textMuted, fontSize: 12, marginBottom: 6 }}>Card Back Color</div>
                <div style={styles.colorRow}>
                  {CARD_BACK_COLORS.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => appearance.setCardBackColor(c.value)}
                      aria-label={c.label}
                      style={{
                        ...styles.colorSwatch,
                        background: c.value,
                        outline: appearance.cardBackColor === c.value ? '2px solid' : '2px solid transparent',
                        outlineColor: appearance.cardBackColor === c.value ? (themeStyles?.textAccent?.color || '#d4a843') : 'transparent',
                        outlineOffset: 2,
                      }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <div style={{ ...themeStyles?.textMuted, fontSize: 12, marginBottom: 6 }}>Card Back Style</div>
                <div style={styles.styleRow}>
                  {CARD_BACK_STYLES.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => appearance.setCardBackStyle(s.value)}
                      style={{
                        ...styles.styleBtn,
                        ...themeStyles?.button,
                        ...(appearance.cardBackStyle === s.value ? themeStyles?.modeButtonActive : {}),
                      }}
                    >
                      <div style={{ width: 70, height: 105, overflow: 'hidden' }}>
                        <CardBackPreview color={appearance.cardBackColor} style={s.value} />
                      </div>
                      <span style={{ fontSize: 11 }}>{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ ...themeStyles?.textMuted, fontSize: 12, marginBottom: 6 }}>Font</div>
                <div style={styles.fontRow}>
                  {FONT_OPTIONS.map((f) => (
                    <button
                      key={f.label}
                      onClick={() => appearance.setFontFamily(f.value)}
                      style={{
                        ...styles.fontBtn,
                        ...themeStyles?.button,
                        ...(appearance.fontFamily === f.value ? themeStyles?.modeButtonActive : {}),
                        fontFamily: f.value,
                      }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={styles.divider} />
            </>
          )}

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
        role="switch"
        aria-checked={value}
        aria-label={label}
        style={{
          ...styles.toggle,
          background: value ? (themeStyles?.toggleActive || '#148f4b') : 'rgba(128,128,128,0.3)',
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
  colorRow: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
  },
  colorSwatch: {
    width: 36,
    height: 36,
    borderRadius: 10,
    border: 'none',
    cursor: 'pointer',
    transition: 'outline-color 0.2s',
  },
  styleRow: {
    display: 'flex',
    gap: 8,
  },
  styleBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    padding: 6,
    borderRadius: 10,
    border: 'none',
    cursor: 'pointer',
    flex: 1,
  },
  fontRow: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap',
  },
  fontBtn: {
    padding: '8px 12px',
    borderRadius: 10,
    border: 'none',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    flex: 1,
    textAlign: 'center',
    minWidth: 70,
  },
};
