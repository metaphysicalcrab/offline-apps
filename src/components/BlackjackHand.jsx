import React from 'react';
import { calculateHand, getHandDisplayTotal } from '../game/blackjack.js';
import { HAND_STATUS } from '../constants.js';

function MiniCard({ card, faceDown, themeStyles, index }) {
  if (faceDown) {
    return (
      <div style={{ ...styles.card, ...styles.cardBack, marginLeft: index > 0 ? -28 : 0 }}>
        <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)' }}>?</span>
      </div>
    );
  }

  const isRed = card.suit === '♥' || card.suit === '♦';
  return (
    <div style={{
      ...styles.card,
      ...styles.cardFace,
      marginLeft: index > 0 ? -28 : 0,
      color: isRed ? '#c0392b' : '#1a1a2e',
    }}>
      <span style={styles.cardRank}>{card.rank}</span>
      <span style={styles.cardSuit}>{card.suit}</span>
    </div>
  );
}

export default function BlackjackHand({ hand, isActive, isDealer, hidden, themeStyles, label, handIndex }) {
  const cards = hand.cards || [];
  const showTotal = cards.length > 0 && (!isDealer || !hidden);
  const totalDisplay = showTotal ? getHandDisplayTotal(isDealer && hidden ? [cards[0]] : cards) : '';

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
            themeStyles={themeStyles}
            index={i}
          />
        ))}
        {cards.length === 0 && (
          <div style={{ ...styles.card, ...styles.cardEmpty }}>
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
    minHeight: 68,
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    minHeight: 22,
  },
  card: {
    width: 48,
    height: 68,
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
    fontSize: 16,
    fontWeight: 700,
    lineHeight: 1,
  },
  cardSuit: {
    fontSize: 14,
    lineHeight: 1,
  },
  badge: {
    fontSize: 10,
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: 6,
    letterSpacing: 0.5,
  },
};
