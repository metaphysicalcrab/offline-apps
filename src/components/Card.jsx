import React, { useState, useEffect } from 'react';

const CARD_WIDTH = 200;
const CARD_HEIGHT = 300;
const BORDER_RADIUS = 16;

function CardBack({ style }) {
  return (
    <div style={{
      ...styles.face,
      ...styles.back,
      ...style,
      backfaceVisibility: 'hidden',
      transform: 'rotateY(180deg)',
    }}>
      <div style={styles.backPattern}>
        <div style={styles.backInner}>
          <span style={styles.backSymbol}>&#9824;&#9829;</span>
          <span style={styles.backSymbol}>&#9830;&#9827;</span>
        </div>
      </div>
    </div>
  );
}

function CardFace({ card, style }) {
  const isRed = card.suit === '♥' || card.suit === '♦';
  const color = isRed ? '#c0392b' : '#1a1a2e';
  const isFaceCard = ['J', 'Q', 'K'].includes(card.rank);

  return (
    <div style={{
      ...styles.face,
      ...styles.front,
      ...style,
      backfaceVisibility: 'hidden',
    }}>
      <div style={{ ...styles.cornerTop, color }}>{card.rank}<br />{card.suit}</div>
      <div style={{ ...styles.center, color, fontSize: isFaceCard ? 56 : 72 }}>
        {isFaceCard ? card.rank : card.suit}
      </div>
      <div style={{ ...styles.cornerBottom, color }}>{card.rank}<br />{card.suit}</div>
    </div>
  );
}

export default function Card({ card, drawKey, themeStyles }) {
  const [phase, setPhase] = useState('idle'); // idle | flipping | visible | tossing

  useEffect(() => {
    if (!card) {
      setPhase('idle');
      return;
    }
    setPhase('flipping');
    const timer = setTimeout(() => setPhase('visible'), 600);
    return () => clearTimeout(timer);
  }, [drawKey]);

  if (!card) {
    return (
      <div style={{ ...styles.container, ...themeStyles?.cardArea }}>
        <div style={styles.placeholder}>
          <span style={{ fontSize: 48, opacity: 0.3 }}>🂠</span>
          <span style={{ opacity: 0.4, marginTop: 8, fontSize: 14 }}>Draw a card</span>
        </div>
      </div>
    );
  }

  const isFlipping = phase === 'flipping';
  const isTossing = phase === 'tossing';

  const cardStyle = {
    ...styles.cardWrapper,
    animation: isFlipping
      ? 'flipIn 0.6s ease-out forwards'
      : isTossing
        ? 'tossOut 0.4s ease-in forwards'
        : 'none',
  };

  return (
    <div style={{ ...styles.container, ...themeStyles?.cardArea }}>
      <div style={cardStyle}>
        <div style={styles.cardInner}>
          <CardFace card={card} />
          <CardBack />
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minHeight: CARD_HEIGHT + 40,
    perspective: 1000,
  },
  placeholder: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: BORDER_RADIUS,
    border: '3px dashed rgba(255,255,255,0.15)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardWrapper: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    position: 'relative',
    transformStyle: 'preserve-3d',
  },
  cardInner: {
    width: '100%',
    height: '100%',
    position: 'relative',
    transformStyle: 'preserve-3d',
  },
  face: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: BORDER_RADIUS,
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
  },
  front: {
    background: '#fff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: 12,
  },
  back: {
    background: 'linear-gradient(135deg, #1a472a, #0d3320)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '3px solid #2d6b45',
  },
  backPattern: {
    width: '85%',
    height: '85%',
    border: '2px solid rgba(255,255,255,0.2)',
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backInner: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  backSymbol: {
    fontSize: 28,
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 8,
  },
  cornerTop: {
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 1.1,
  },
  cornerBottom: {
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 1.1,
    alignSelf: 'flex-end',
    transform: 'rotate(180deg)',
  },
  center: {
    alignSelf: 'center',
    fontWeight: 'bold',
  },
};
