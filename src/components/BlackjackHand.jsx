import React, { useRef, useEffect, useState } from 'react';
import { calculateHand, getHandDisplayTotal } from '../game/blackjack.js';
import { HAND_STATUS } from '../constants.js';

// Inject keyframes once
let stylesInjected = false;
function injectAnimationStyles() {
  if (stylesInjected || typeof document === 'undefined') return;
  stylesInjected = true;
  const style = document.createElement('style');
  style.textContent = `
    @keyframes bjCardDeal {
      from { opacity: 0; transform: translateY(-20px) scale(0.9); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    @keyframes bjCardFlip {
      0% { transform: rotateY(0deg); }
      50% { transform: rotateY(90deg); }
      100% { transform: rotateY(0deg); }
    }
    @media (prefers-reduced-motion: reduce) {
      .bj-card-animate { animation: none !important; }
    }
  `;
  document.head.appendChild(style);
}

function MiniCard({ card, faceDown, index, isFlipping, totalCards }) {
  useEffect(injectAnimationStyles, []);

  // Less overlap for 2-3 cards, more overlap for 4+ to keep hand compact
  const overlap = totalCards <= 3 ? -14 : -22;

  if (faceDown) {
    return (
      <div
        className="bj-card-animate"
        style={{
          ...cardStyles.card,
          ...cardStyles.cardBack,
          marginLeft: index > 0 ? overlap : 0,
          animation: `bjCardDeal 0.3s ease-out ${index * 0.1}s both`,
        }}
      >
        <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.3)' }}>?</span>
      </div>
    );
  }

  const isRed = card.suit === '♥' || card.suit === '♦';
  return (
    <div
      className="bj-card-animate"
      style={{
        ...cardStyles.card,
        ...cardStyles.cardFace,
        marginLeft: index > 0 ? overlap : 0,
        color: isRed ? '#c0392b' : '#1a1a2e',
        animation: isFlipping
          ? 'bjCardFlip 0.4s ease-in-out'
          : `bjCardDeal 0.3s ease-out ${index * 0.1}s both`,
      }}
    >
      <span style={cardStyles.cardRank}>{card.rank}</span>
      <span style={cardStyles.cardSuit}>{card.suit}</span>
    </div>
  );
}

export default function BlackjackHand({ hand, isActive, isDealer, hidden, themeStyles, label, handIndex }) {
  const cards = hand.cards || [];
  const showTotal = cards.length > 0 && (!isDealer || !hidden);
  const totalDisplay = showTotal ? getHandDisplayTotal(isDealer && hidden ? [cards[0]] : cards) : '';

  // Track hidden -> revealed transition for flip animation
  const prevHiddenRef = useRef(hidden);
  const [flippingIndex, setFlippingIndex] = useState(null);

  useEffect(() => {
    if (prevHiddenRef.current === true && hidden === false && isDealer) {
      // Dealer hole card just revealed — animate flip on card index 1
      setFlippingIndex(1);
      const timer = setTimeout(() => setFlippingIndex(null), 400);
      return () => clearTimeout(timer);
    }
    prevHiddenRef.current = hidden;
  }, [hidden, isDealer]);

  const statusLabel = {
    [HAND_STATUS.BUST]: 'BUST',
    [HAND_STATUS.BLACKJACK]: 'BJ!',
    [HAND_STATUS.SURRENDER]: 'FOLD',
  }[hand.status];

  const resultLabel = hand.result ? {
    win: 'WIN',
    loss: 'LOSS',
    push: 'PUSH',
    blackjack: 'BLACKJACK!',
    bust: 'BUST',
    surrender: 'SURRENDER',
  }[hand.result] : null;

  const resultColor = hand.result ? {
    win: '#27ae60',
    blackjack: '#f1c40f',
    push: '#95a5a6',
    loss: '#e74c3c',
    bust: '#e74c3c',
    surrender: '#e67e22',
  }[hand.result] : null;

  return (
    <div style={{
      ...styles.container,
      ...(isActive ? styles.active : {}),
    }}>
      <div style={styles.labelRow}>
        {label && <span style={{ ...themeStyles?.textMuted, fontSize: 11 }}>{label}</span>}
        {hand.bet > 0 && !isDealer && (
          <span style={{ ...themeStyles?.textAccent, fontSize: 11 }}>
            ${hand.isDoubled ? hand.bet * 2 : hand.bet}
          </span>
        )}
      </div>

      <div style={styles.cardsRow}>
        {cards.map((card, i) => (
          <MiniCard
            key={card.id ?? i}
            card={card}
            faceDown={isDealer && hidden && i === 1}
            index={i}
            totalCards={cards.length}
            isFlipping={i === flippingIndex}
          />
        ))}
        {cards.length === 0 && (
          <div style={{ ...cardStyles.card, ...cardStyles.cardEmpty }}>
            <span style={{ fontSize: 18, opacity: 0.2 }}>?</span>
          </div>
        )}
      </div>

      <div style={styles.infoRow}>
        {showTotal && (
          <span style={{
            ...themeStyles?.text,
            fontSize: 14,
            fontWeight: 700,
          }}>
            {totalDisplay}
          </span>
        )}
        {statusLabel && !resultLabel && (
          <span style={{
            ...styles.badge,
            background: hand.status === HAND_STATUS.BLACKJACK ? 'rgba(241,196,0,0.2)' : 'rgba(231,76,60,0.2)',
            color: hand.status === HAND_STATUS.BLACKJACK ? '#f1c40f' : '#e74c3c',
          }}>
            {statusLabel}
          </span>
        )}
        {resultLabel && (
          <span style={{
            ...styles.badge,
            background: `${resultColor}22`,
            color: resultColor,
          }}>
            {resultLabel}
            {hand.payout > 0 && ` +$${hand.payout}`}
          </span>
        )}
      </div>
    </div>
  );
}

const cardStyles = {
  card: {
    width: 56,
    height: 78,
    borderRadius: 8,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    position: 'relative',
    zIndex: 1,
  },
  cardFace: {
    background: '#fff',
    border: '1px solid rgba(0,0,0,0.1)',
  },
  cardBack: {
    background: 'linear-gradient(135deg, #1a472a, #0d2818)',
    border: '1px solid rgba(255,255,255,0.15)',
  },
  cardEmpty: {
    background: 'rgba(255,255,255,0.05)',
    border: '2px dashed rgba(255,255,255,0.1)',
  },
  cardRank: {
    fontSize: 20,
    fontWeight: 700,
    lineHeight: 1,
  },
  cardSuit: {
    fontSize: 16,
    lineHeight: 1,
    marginTop: 2,
  },
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    padding: '8px 4px',
    borderRadius: 12,
    transition: 'all 0.2s',
    minWidth: 80,
  },
  active: {
    background: 'rgba(241,196,0,0.08)',
    boxShadow: '0 0 0 2px rgba(241,196,0,0.3)',
  },
  labelRow: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
    fontSize: 11,
  },
  cardsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 78,
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    minHeight: 22,
  },
  badge: {
    fontSize: 10,
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: 6,
    letterSpacing: 0.5,
  },
};
