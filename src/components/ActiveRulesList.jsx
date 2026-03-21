import React, { useState } from 'react';

export default function ActiveRulesList({ rules, onRemove, themeStyles }) {
  const [expanded, setExpanded] = useState(false);

  if (!rules || rules.length === 0) return null;

  return (
    <div style={{ ...styles.container, ...themeStyles?.button }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={styles.header}
      >
        <span style={{ ...themeStyles?.textAccent, fontSize: 14, fontWeight: 600 }}>
          Active Rules ({rules.length})
        </span>
        <span style={{ ...themeStyles?.textMuted, fontSize: 12 }}>{expanded ? '▲' : '▼'}</span>
      </button>
      {expanded && (
        <div style={styles.list}>
          {rules.map((rule) => (
            <div key={rule.id} style={{ ...styles.ruleChip, ...themeStyles?.button }}>
              <div style={styles.ruleContent}>
                <span style={{ ...themeStyles?.text, fontSize: 13 }}>{rule.text}</span>
                {rule.createdBy && (
                  <span style={{ ...themeStyles?.textMuted, fontSize: 11, fontStyle: 'italic', marginLeft: 4 }}>
                    — {rule.createdBy}
                  </span>
                )}
              </div>
              {onRemove && (
                <button
                  onClick={() => onRemove(rule.id)}
                  style={styles.removeBtn}
                  title="Remove rule"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 14,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: '10px 20px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'inherit',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    padding: '0 14px 12px',
  },
  ruleChip: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    padding: '6px 10px',
    borderRadius: 8,
  },
  ruleContent: {
    flex: 1,
    minWidth: 0,
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    color: 'inherit',
    opacity: 0.5,
    cursor: 'pointer',
    fontSize: 16,
    padding: 0,
    lineHeight: 1,
    flexShrink: 0,
  },
};
