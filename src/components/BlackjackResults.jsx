import React from 'react';

export default function BlackjackResults({ results, onNewRound, onNewShoe, showNewShoe, themeStyles }) {
  if (!results) return null;

  return (
    <div style={styles.container}>
      {results.map((player, pi) => (
        <div key={pi} style={styles.playerResult}>
          <div style={{ ...themeStyles?.text, fontSize: 14, fontWeight: 600 }}>
            {player.name}
          </div>
          {player.hands.map((hand, hi) => {
            const color = {
              win: '#27ae60', blackjack: '#f1c40f', push: '#95a5a6',
              loss: '#e74c3c', bust: '#e74c3c', surrender: '#e67e22',
            }[hand.result] || '#95a5a6';

            const label = {
              win: 'Win', blackjack: 'Blackjack!', push: 'Push',
              loss: 'Loss', bust: 'Bust', surrender: 'Surrender',
            }[hand.result] || '';

            const net = hand.payout - (hand.bet || 0);

            return (
              <div key={hi} style={styles.handResult}>
                <span style={{ color, fontWeight: 700, fontSize: 14 }}>{label}</span>
                <span style={{
                  color: net > 0 ? '#27ae60' : net < 0 ? '#e74c3c' : '#95a5a6',
                  fontSize: 13,
                  fontWeight: 600,
                }}>
                  {net > 0 ? `+$${net}` : net < 0 ? `-$${Math.abs(net)}` : '$0'}
                </span>
              </div>
            );
          })}
          <div style={{ ...themeStyles?.textMuted, fontSize: 12 }}>
            Balance: ${player.chips}
          </div>
        </div>
      ))}

      <div style={styles.actions}>
        {onNewRound ? (
          <button
            onClick={onNewRound}
            style={{ ...styles.btn, ...themeStyles?.buttonPrimary }}
          >
            {showNewShoe ? 'New Shoe & Deal' : 'Next Hand'}
          </button>
        ) : (
          <div style={{ ...styles.btn, textAlign: 'center', opacity: 0.6, fontSize: 14 }}>
            Waiting for host...
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    padding: '12px 20px',
    width: '100%',
  },
  playerResult: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  handResult: {
    display: 'flex',
    gap: 12,
    alignItems: 'center',
  },
  actions: {
    display: 'flex',
    gap: 8,
    width: '100%',
    maxWidth: 320,
    marginTop: 4,
  },
  btn: {
    flex: 1,
    padding: '14px 20px',
    borderRadius: 12,
    border: 'none',
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    textAlign: 'center',
  },
};
