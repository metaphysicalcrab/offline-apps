import React from 'react';

export default function DrawnCardMini({ card, themeStyles }) {
  const isRed = card.suit === '♥' || card.suit === '♦';
  const color = isRed ? '#c0392b' : '#1a1a2e';

  return (
    <div style={{ ...styles.mini, ...themeStyles?.miniCard }}>
      <span style={{ color, fontSize: 13, fontWeight: 'bold' }}>{card.rank}</span>
      <span style={{ color, fontSize: 11 }}>{card.suit}</span>
    </div>
  );
}

const styles = {
  mini: {
    width: 36,
    height: 50,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    gap: 0,
  },
};
