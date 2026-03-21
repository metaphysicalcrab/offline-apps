import React, { useState, useEffect } from 'react';

export default function HighLowControls({
  currentCard,
  streak,
  bestStreak,
  onGuess,
  lastOutcome,
  themeStyles,
}) {
  const [flash, setFlash] = useState(null);

  useEffect(() => {
    if (!lastOutcome) return;
    setFlash(lastOutcome);
    const timer = setTimeout(() => setFlash(null), 600);
    return () => clearTimeout(timer);
  }, [lastOutcome, streak]);

  const btnBase = {
    padding: '10px 24px',
    borderRadius: 12,
    border: 'none',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    flex: 1,
    ...themeStyles?.button,
  };

  return (
    <div style={styles.container}>
      <div style={{
        ...styles.streakBar,
        animation: flash === 'correct' ? 'flashGreen 0.6s' : flash === 'wrong' ? 'flashRed 0.6s' : 'none',
      }}>
        <span style={themeStyles?.textMuted}>Streak</span>
        <span style={{ ...themeStyles?.textAccent, fontSize: 24, fontWeight: 'bold' }}>{streak}</span>
        <span style={{ ...themeStyles?.textMuted, fontSize: 12 }}>Best: {bestStreak}</span>
        {flash === 'wrong' && (
          <span style={{ color: '#e74c3c', fontSize: 12, fontWeight: 600, animation: 'slideUp 0.2s ease-out' }}>
            Streak reset!
          </span>
        )}
        {flash === 'correct' && (
          <span style={{ color: '#2ecc71', fontSize: 12, fontWeight: 600, animation: 'slideUp 0.2s ease-out' }}>
            Correct!
          </span>
        )}
      </div>
      <div style={styles.buttons}>
        <button
          style={btnBase}
          onClick={() => onGuess('higher')}
          disabled={!currentCard}
        >
          Higher
        </button>
        <button
          style={btnBase}
          onClick={() => onGuess('lower')}
          disabled={!currentCard}
        >
          Lower
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
    animation: 'slideUp 0.3s ease-out',
  },
  streakBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: '8px 16px',
    borderRadius: 12,
  },
  buttons: {
    display: 'flex',
    gap: 12,
  },
};
