import React, { useState } from 'react';
import { getRuleForCard } from '../game/kingsCupRules.js';

export default function KingsCupOverlay({ card, kingCount, customRules, currentPlayer, onAddRule, themeStyles }) {
  const [ruleInput, setRuleInput] = useState('');
  const [ruleAdded, setRuleAdded] = useState(false);

  if (!card) return null;

  const rule = getRuleForCard(card, customRules);
  const isGameOver = kingCount >= 4;
  const isJack = card.rank === 'J';

  const handleSubmitRule = () => {
    const text = ruleInput.trim();
    if (!text) return;
    onAddRule(text, currentPlayer);
    setRuleInput('');
    setRuleAdded(true);
    setTimeout(() => setRuleAdded(false), 1500);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmitRule();
  };

  return (
    <div style={styles.container}>
      <div style={styles.kingCounter} aria-label={`${kingCount} of 4 Kings drawn`}>
        {[1, 2, 3, 4].map((n) => (
          <span key={n} style={{ fontSize: 20, opacity: n <= kingCount ? 1 : 0.2 }}>
            👑
          </span>
        ))}
        <span style={{ ...themeStyles?.textMuted, fontSize: 12, marginLeft: 4 }}>
          {kingCount}/4
        </span>
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
          <div style={{ ...themeStyles?.textAccent, fontSize: 18, fontWeight: 600 }}>
            {rule.title}
          </div>
          <div style={{ ...themeStyles?.text, fontSize: 14, lineHeight: 1.5 }}>
            {rule.desc}
          </div>
          {isJack && onAddRule && (
            <>
              <div style={styles.addRow}>
                <input
                  type="text"
                  value={ruleInput}
                  onChange={(e) => setRuleInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type the new rule..."
                  aria-label="New rule text"
                  style={{ ...themeStyles?.input, flex: 1 }}
                />
                <button
                  onClick={handleSubmitRule}
                  disabled={!ruleInput.trim()}
                  aria-label="Add rule"
                  style={{
                    ...styles.addBtn,
                    ...themeStyles?.buttonPrimary,
                    opacity: ruleInput.trim() ? 1 : 0.4,
                  }}
                >
                  +
                </button>
              </div>
              {ruleAdded && (
                <div style={{ ...themeStyles?.textAccent, fontSize: 13, fontWeight: 600, animation: 'slideUp 0.2s ease-out' }}>
                  Rule added!
                </div>
              )}
            </>
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
  addRow: {
    display: 'flex',
    gap: 8,
    marginTop: 4,
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
