import React, { useState } from 'react';

export default function ActiveRulesList({ rules, onRemove, themeStyles }) {
  const [expanded, setExpanded] = useState(false);

  if (!rules || rules.length === 0) return null;

  return (
    <div style={{ ...styles.container, ...themeStyles?.modal }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{ ...styles.header, ...themeStyles?.textAccent }}
      >
        <span>Active Rules ({rules.length})</span>
        <span style={{ fontSize: 12 }}>{expanded ? '▲' : '▼'}</span>
      </button>
      {expanded && (
        <div style={styles.list}>
          {rules.map((rule) => (
            <div key={rule.id} style={{ ...styles.ruleItem, ...themeStyles?.text }}>
              <div style={styles.ruleContent}>
                <span style={styles.ruleText}>{rule.text}</span>
                {rule.createdBy && (
                  <span style={{ ...styles.createdBy, ...themeStyles?.textMuted }}>
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
                  ✕
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
    margin: '0 20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: '10px 16px',
    background: 'none',
    border: 'none',
    fontSize: 14,
    fontWeight: 'bold',
    cursor: 'pointer',
    color: 'inherit',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    padding: '0 12px 10px',
  },
  ruleItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    padding: '6px 8px',
    borderRadius: 8,
    fontSize: 13,
  },
  ruleContent: {
    flex: 1,
    minWidth: 0,
  },
  ruleText: {
    wordBreak: 'break-word',
  },
  createdBy: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    fontSize: 14,
    cursor: 'pointer',
    opacity: 0.5,
    padding: '2px 6px',
    borderRadius: 4,
    color: 'inherit',
    flexShrink: 0,
  },
};
