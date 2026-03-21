import React, { useState } from 'react';
import { getRuleForCard } from '../game/kingsCupRules.js';

export default function KingsCupOverlay({ card, kingCount, customRules, currentPlayer, onAddRule, themeStyles }) {
  const [ruleInput, setRuleInput] = useState('');

  if (!card) return null;

  const rule = getRuleForCard(card, customRules);
  const isGameOver = kingCount >= 4;
  const isJack = card.rank === 'J';

  const handleSubmitRule = () => {
    const text = ruleInput.trim();
    if (!text) return;
    onAddRule(text, currentPlayer);
    setRuleInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmitRule();
  };

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
          {isJack && onAddRule && (
            <div style={styles.ruleInputRow}>
              <input
                type="text"
                value={ruleInput}
                onChange={(e) => setRuleInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type the new rule..."
                style={{ ...styles.ruleInput, ...themeStyles?.input }}
              />
              <button
                onClick={handleSubmitRule}
                disabled={!ruleInput.trim()}
                style={{ ...styles.addBtn, opacity: ruleInput.trim() ? 1 : 0.4 }}
              >
                Add
              </button>
            </div>
          )}
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
  ruleInputRow: {
    display: 'flex',
    gap: 8,
    marginTop: 6,
  },
  ruleInput: {
    flex: 1,
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid rgba(128,128,128,0.3)',
    fontSize: 14,
    background: 'rgba(255,255,255,0.1)',
    color: 'inherit',
    outline: 'none',
  },
  addBtn: {
    padding: '8px 16px',
    borderRadius: 8,
    border: 'none',
    background: '#6c5ce7',
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    cursor: 'pointer',
  },
};
