import React, { useState, useEffect } from 'react';

const CARD_WIDTH = 200;
const CARD_HEIGHT = 300;
const BORDER_RADIUS = 16;

function darken(hex, amt = 40) {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (n >> 16) - amt);
  const g = Math.max(0, ((n >> 8) & 0xff) - amt);
  const b = Math.max(0, (n & 0xff) - amt);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

function lighten(hex, amt = 30) {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (n >> 16) + amt);
  const g = Math.min(255, ((n >> 8) & 0xff) + amt);
  const b = Math.min(255, (n & 0xff) + amt);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

function CardBackClassic({ color }) {
  return (
    <div style={{ ...styles.back, background: `linear-gradient(135deg, ${color}, ${darken(color)})`, border: `3px solid ${lighten(color)}` }}>
      <div style={styles.backPattern}>
        <div style={styles.backInner}>
          <span style={styles.backSymbol}>&#9824;&#9829;</span>
          <span style={styles.backSymbol}>&#9830;&#9827;</span>
        </div>
      </div>
    </div>
  );
}

function CardBackMinimal({ color }) {
  return (
    <div style={{ ...styles.back, background: color, border: `3px solid ${lighten(color, 20)}` }}>
      <div style={{ fontSize: 40, color: 'rgba(255,255,255,0.15)' }}>&#9824;</div>
    </div>
  );
}

function CardBackOrnate({ color }) {
  return (
    <div style={{ ...styles.back, background: `linear-gradient(135deg, ${color}, ${darken(color)})`, border: `3px solid ${lighten(color)}` }}>
      <div style={{ ...styles.backPattern, borderWidth: 3 }}>
        <div style={{
          width: '80%', height: '80%',
          border: `1px solid rgba(255,255,255,0.15)`,
          borderRadius: 6,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: 2,
        }}>
          <span style={{ fontSize: 20, color: 'rgba(255,255,255,0.25)', letterSpacing: 4 }}>&#9824;&#9829;&#9830;&#9827;</span>
          <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.2)', fontWeight: 'bold' }}>DRAW</span>
          <span style={{ fontSize: 20, color: 'rgba(255,255,255,0.25)', letterSpacing: 4 }}>&#9827;&#9830;&#9829;&#9824;</span>
        </div>
      </div>
    </div>
  );
}

const BACK_COMPONENTS = {
  classic: CardBackClassic,
  minimal: CardBackMinimal,
  ornate: CardBackOrnate,
};

function CardFace({ card }) {
  const isRed = card.suit === '♥' || card.suit === '♦';
  const color = isRed ? '#c0392b' : '#1a1a2e';
  const isFaceCard = ['J', 'Q', 'K'].includes(card.rank);

  return (
    <div style={styles.front}>
      <div style={{ ...styles.cornerTop, color }}>{card.rank}<br />{card.suit}</div>
      <div style={{ ...styles.center, color, fontSize: isFaceCard ? 56 : 72 }}>
        {isFaceCard ? card.rank : card.suit}
      </div>
      <div style={{ ...styles.cornerBottom, color }}>{card.rank}<br />{card.suit}</div>
    </div>
  );
}

export default function Card({ card, drawKey, themeStyles, cardBackColor, cardBackStyle }) {
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (!card) return;
    setAnimating(true);
    const timer = setTimeout(() => setAnimating(false), 600);
    return () => clearTimeout(timer);
  }, [drawKey]);

  if (!card) {
    const BackComp = BACK_COMPONENTS[cardBackStyle] || CardBackClassic;
    return (
      <div style={{ ...styles.container, ...themeStyles?.cardArea }}>
        <div style={{ opacity: 0.5, cursor: 'default' }}>
          <BackComp color={cardBackColor || '#1a472a'} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...styles.container, ...themeStyles?.cardArea }}>
      <div style={{
        ...styles.cardWrapper,
        animation: animating ? 'flipIn 0.6s ease-out forwards' : 'none',
      }}>
        <CardFace card={card} />
      </div>
    </div>
  );
}

// Export for preview in settings
export function CardBackPreview({ color, style }) {
  const BackComp = BACK_COMPONENTS[style] || CardBackClassic;
  return (
    <div style={{ transform: 'scale(0.35)', transformOrigin: 'top left', width: CARD_WIDTH, height: CARD_HEIGHT }}>
      <BackComp color={color || '#1a472a'} />
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
  },
  placeholder: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: BORDER_RADIUS,
    border: '3px dashed',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardWrapper: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    position: 'relative',
  },
  front: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: BORDER_RADIUS,
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    background: '#fff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: 12,
  },
  back: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: BORDER_RADIUS,
    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
