import React from 'react';
import { getRuleForCard } from '../game/kingsCupRules.js';

export default function KingsCupOverlay({ card, kingCount, customRules, themeStyles }) {
  if (!card) return null;

  const rule = getRuleForCard(card, customRules);
  const isGameOver = kingCount >= 4;

  return (
    <div style={styles.container}>
      <div style={styles.kingCounter}>
        {[1, 2, 3, 4].map((n) => (
          <span key={n} style={{ fontSize: 20, opacity: n <= kingCount ? 1 : 0.2 }}>
            👑
          </span>
        ))}
      </div>

      {isGameOver ? (
        <div style={{ ...styles.ruleBox, ...themeStyles?.modal, textAlign: 'center' }}>
          <div style={{ fontSize: 32 }}>🍺</div>
          <div style={{ ...themeStyles?.textAccent, fontSize: 20, fontWeight: 'bold' }}>
            Game Over!
          </div>
          <div style={themeStyles?.textMuted}>
            4th King drawn — drink the King's Cup!
          </div>
        </div>
      ) : (
        <div style={{ ...styles.ruleBox, ...themeStyles?.modal, animation: 'slideUp 0.3s ease-out' }}>
          <div style={{ ...themeStyles?.textAccent, fontSize: 18, fontWeight: 'bold' }}>
            {rule.title}
          </div>
          <div style={{ ...themeStyles?.text, fontSize: 14, lineHeight: 1.5 }}>
            {rule.desc}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    padding: '0 20px',
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  kingCounter: {
    display: 'flex',
    gap: 6,
  },
  ruleBox: {
    padding: '14px 20px',
    borderRadius: 14,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
};
