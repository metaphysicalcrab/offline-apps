import React, { useState } from 'react';
import { RANKS, DEFAULT_KINGS_CUP_RULES } from '../constants.js';

export default function RulesEditor({ customRules, onSave, onReset, onClose, themeStyles }) {
  const [editedRules, setEditedRules] = useState(() => {
    const rules = {};
    for (const rank of RANKS) {
      rules[rank] = {
        title: customRules[rank]?.title || DEFAULT_KINGS_CUP_RULES[rank].title,
        desc: customRules[rank]?.desc || DEFAULT_KINGS_CUP_RULES[rank].desc,
      };
    }
    return rules;
  });

  const updateRule = (rank, field, value) => {
    setEditedRules((prev) => ({
      ...prev,
      [rank]: { ...prev[rank], [field]: value },
    }));
  };

  const handleSave = () => {
    onSave(editedRules);
    onClose();
  };

  const handleReset = () => {
    const defaults = {};
    for (const rank of RANKS) {
      defaults[rank] = { ...DEFAULT_KINGS_CUP_RULES[rank] };
    }
    setEditedRules(defaults);
    onReset();
  };

  const btnBase = {
    padding: '10px 16px',
    borderRadius: 10,
    border: 'none',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  };

  return (
    <div style={{ ...styles.overlay, ...themeStyles?.overlay }} onClick={onClose}>
      <div
        style={{ ...styles.modal, ...themeStyles?.modal }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={styles.header}>
          <span style={{ ...themeStyles?.text, fontSize: 18, fontWeight: 'bold' }}>
            Edit Rules
          </span>
          <button onClick={onClose} style={styles.closeBtn}>×</button>
        </div>

        <div style={styles.rulesList}>
          {RANKS.map((rank) => (
            <div key={rank} style={styles.ruleRow}>
              <div style={{ ...styles.rankLabel, ...themeStyles?.textAccent }}>{rank}</div>
              <div style={styles.ruleInputs}>
                <input
                  type="text"
                  value={editedRules[rank].title}
                  onChange={(e) => updateRule(rank, 'title', e.target.value)}
                  style={{ ...themeStyles?.input, fontSize: 13, padding: '6px 10px', fontWeight: 600 }}
                  placeholder="Rule name"
                />
                <input
                  type="text"
                  value={editedRules[rank].desc}
                  onChange={(e) => updateRule(rank, 'desc', e.target.value)}
                  style={{ ...themeStyles?.input, fontSize: 12, padding: '6px 10px' }}
                  placeholder="Description"
                />
              </div>
            </div>
          ))}
        </div>

        <div style={styles.footer}>
          <button onClick={handleReset} style={{ ...btnBase, ...themeStyles?.buttonDanger }}>
            Reset Defaults
          </button>
          <button onClick={handleSave} style={{ ...btnBase, ...themeStyles?.buttonPrimary }}>
            Save Rules
          </button>
        </div>
      </div>
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
    maxWidth: 420,
    maxHeight: '80vh',
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
  rulesList: {
    flex: 1,
    overflowY: 'auto',
    padding: '0 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  ruleRow: {
    display: 'flex',
    gap: 10,
    alignItems: 'flex-start',
  },
  rankLabel: {
    width: 28,
    fontSize: 18,
    fontWeight: 'bold',
    paddingTop: 6,
    textAlign: 'center',
    flexShrink: 0,
  },
  ruleInputs: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    flex: 1,
  },
  footer: {
    display: 'flex',
    gap: 8,
    justifyContent: 'space-between',
    padding: '16px 20px',
  },
};
