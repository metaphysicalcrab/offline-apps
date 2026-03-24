import React, { useEffect, useState } from 'react';
import { getStrategyChartData } from '../game/blackjackStrategy.js';
import { BLACKJACK_ACTIONS } from '../constants.js';

const ACTION_COLORS = {
  [BLACKJACK_ACTIONS.HIT]: { bg: '#27ae60', label: 'H' },
  [BLACKJACK_ACTIONS.STAND]: { bg: '#e74c3c', label: 'S' },
  [BLACKJACK_ACTIONS.DOUBLE]: { bg: '#3498db', label: 'D' },
  [BLACKJACK_ACTIONS.SPLIT]: { bg: '#f39c12', label: 'P' },
  [BLACKJACK_ACTIONS.SURRENDER]: { bg: '#9b59b6', label: 'R' },
};

function StrategyTable({ title, data, rowLabels, dealerColumns, themeStyles }) {
  return (
    <div style={styles.tableSection}>
      <div style={{ ...themeStyles?.textAccent, fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
        {title}
      </div>
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{ ...styles.th, ...themeStyles?.text, minWidth: 32 }}></th>
              {dealerColumns.map(d => (
                <th key={d} style={{ ...styles.th, ...themeStyles?.text }}>{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rowLabels.map(row => {
              const rowData = data[row];
              if (!rowData) return null;
              return (
                <tr key={row}>
                  <td style={{ ...styles.td, ...themeStyles?.text, fontWeight: 600, fontSize: 11 }}>
                    {row}
                  </td>
                  {rowData.map((action, i) => {
                    const cfg = ACTION_COLORS[action];
                    return (
                      <td key={i} style={{
                        ...styles.td,
                        background: cfg?.bg || '#555',
                        color: '#fff',
                        fontWeight: 700,
                        fontSize: 10,
                      }}>
                        {cfg?.label || '?'}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function BlackjackStrategy({ onClose, themeStyles }) {
  const [activeTab, setActiveTab] = useState('hard');
  const chartData = getStrategyChartData();

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const hardRows = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
  const softRows = [13, 14, 15, 16, 17, 18, 19, 20];
  const pairRows = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

  return (
    <div style={{ ...styles.overlay, ...themeStyles?.overlay }} onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Basic Strategy Chart"
        style={{ ...styles.modal, ...themeStyles?.modal }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 22 }}>📊</span>
            <span style={{ ...themeStyles?.text, fontSize: 18, fontWeight: 'bold' }}>Basic Strategy</span>
          </div>
          <button onClick={onClose} style={styles.closeBtn} aria-label="Close strategy chart">×</button>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          {[
            { key: 'hard', label: 'Hard' },
            { key: 'soft', label: 'Soft' },
            { key: 'pairs', label: 'Pairs' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                ...styles.tabBtn,
                ...(activeTab === tab.key ? themeStyles?.modeButtonActive : themeStyles?.modeButton),
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={styles.content}>
          {/* Legend */}
          <div style={styles.legend}>
            {Object.entries(ACTION_COLORS).map(([action, cfg]) => (
              <div key={action} style={styles.legendItem}>
                <div style={{ ...styles.legendDot, background: cfg.bg }} />
                <span style={{ ...themeStyles?.text, fontSize: 11 }}>
                  {cfg.label} = {{
                    H: 'Hit', S: 'Stand', D: 'Double', P: 'Split', R: 'Surrender',
                  }[cfg.label]}
                </span>
              </div>
            ))}
          </div>

          <div style={{ ...themeStyles?.textMuted, fontSize: 11, textAlign: 'center' }}>
            Dealer upcard across top → Your hand down left side ↓
          </div>

          {activeTab === 'hard' && (
            <StrategyTable
              title="Hard Totals"
              data={chartData.hard}
              rowLabels={hardRows}
              dealerColumns={chartData.dealerColumns}
              themeStyles={themeStyles}
            />
          )}
          {activeTab === 'soft' && (
            <StrategyTable
              title="Soft Totals (Ace counted as 11)"
              data={chartData.soft}
              rowLabels={softRows}
              dealerColumns={chartData.dealerColumns}
              themeStyles={themeStyles}
            />
          )}
          {activeTab === 'pairs' && (
            <StrategyTable
              title="Pairs"
              data={chartData.pairs}
              rowLabels={pairRows}
              dealerColumns={chartData.dealerColumns}
              themeStyles={themeStyles}
            />
          )}
        </div>

        <div style={styles.footer}>
          <button
            onClick={onClose}
            style={{ ...styles.doneBtn, ...themeStyles?.buttonPrimary }}
          >
            Done
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
    maxWidth: 460,
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px 8px',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: 24,
    cursor: 'pointer',
    opacity: 0.5,
    color: 'inherit',
  },
  tabs: {
    display: 'flex',
    gap: 6,
    padding: '0 20px 8px',
  },
  tabBtn: {
    flex: 1,
    padding: '8px 12px',
    borderRadius: 10,
    border: 'none',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    transition: 'all 0.2s',
  },
  content: {
    padding: '0 12px 12px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  legend: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    padding: '4px 0',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  tableSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  tableWrapper: {
    overflowX: 'auto',
    width: '100%',
    WebkitOverflowScrolling: 'touch',
  },
  table: {
    borderCollapse: 'collapse',
    width: '100%',
    fontSize: 11,
  },
  th: {
    padding: '4px 2px',
    textAlign: 'center',
    fontSize: 10,
    fontWeight: 600,
    minWidth: 28,
  },
  td: {
    padding: '3px 2px',
    textAlign: 'center',
    border: '1px solid rgba(255,255,255,0.08)',
    minWidth: 28,
  },
  footer: {
    padding: '12px 20px',
  },
  doneBtn: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 12,
    border: 'none',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    textAlign: 'center',
  },
};
